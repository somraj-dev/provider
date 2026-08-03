import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { GetAvailabilityQueryDto } from './dto/scheduling.dto';
import { AppointmentStatus, DayOfWeek, HoldStatus, LeaveStatus } from '@prisma/client';

export interface TimeSlot {
  time: string;           // e.g. "09:30 AM"
  startTime: string;      // ISO 8601 UTC
  endTime: string;        // ISO 8601 UTC
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'BOOKED' | 'HELD';
  durationMinutes: number;
}

export interface DayAvailability {
  date: string;           // YYYY-MM-DD
  dayOfWeek: string;
  isWorkingDay: boolean;
  slots: TimeSlot[];
}

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Authoritative backend availability calculation engine.
   * Subtracts appointments, leaves, breaks, overrides, holds, and facility closures.
   */
  async getAvailability(tenantId: string, query: GetAvailabilityQueryDto) {
    const { practitionerId, facilityId, departmentId, appointmentTypeId, from, to, excludeAppointmentId } = query;

    // 1. Resolve Doctor
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: practitionerId, tenantId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${practitionerId} not found`);
    }

    // 2. Resolve Tenant Timezone
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const timezone = tenant?.timezone || 'Asia/Kolkata';

    // 3. Resolve Appointment Type (duration & buffers)
    let durationMinutes = 30;
    let preBuffer = 0;
    let postBuffer = 5;
    if (appointmentTypeId) {
      const typeConfig = await this.prisma.appointmentTypeConfig.findFirst({
        where: {
          tenantId,
          OR: [{ id: appointmentTypeId }, { code: appointmentTypeId }],
        },
      });
      if (typeConfig) {
        durationMinutes = typeConfig.durationMinutes;
        preBuffer = typeConfig.preBufferMin;
        postBuffer = typeConfig.postBufferMin;
      }
    }
    const totalOccupiedMinutes = durationMinutes + preBuffer + postBuffer;

    // 4. Resolve Scheduling Policy (granularity)
    const policy = await this.prisma.schedulingPolicy.findFirst({
      where: { tenantId },
    });
    const granularityMin = policy?.slotGranularityMin || 15;

    // 5. Load Active Schedule Templates & Rules
    const fromDateObj = new Date(`${from}T00:00:00Z`);
    const toDateObj = new Date(`${to}T23:59:59Z`);

    const templates = await this.prisma.scheduleTemplate.findMany({
      where: {
        tenantId,
        doctorId: practitionerId,
        isActive: true,
        effectiveFrom: { lte: toDateObj },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: fromDateObj } },
        ],
      },
      include: { rules: true },
    });

    // 6. Load Overrides (Breaks, Blocks, Extra hours)
    const overrides = await this.prisma.scheduleOverride.findMany({
      where: {
        tenantId,
        doctorId: practitionerId,
        date: { gte: fromDateObj, lte: toDateObj },
      },
    });

    // 7. Load Approved Doctor Leaves
    const leaves = await this.prisma.practitionerLeave.findMany({
      where: {
        tenantId,
        doctorId: practitionerId,
        status: LeaveStatus.APPROVED,
        startDate: { lte: toDateObj },
        endDate: { gte: fromDateObj },
      },
    });

    // 8. Load Existing Appointments (excluding cancelled & no-show, excluding excludeAppointmentId)
    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        doctorId: practitionerId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
        startTime: { lte: toDateObj },
        endTime: { gte: fromDateObj },
      },
    });

    // 9. Load Active Holds
    const now = new Date();
    const holds = await this.prisma.appointmentHold.findMany({
      where: {
        tenantId,
        doctorId: practitionerId,
        status: HoldStatus.ACTIVE,
        expiresAt: { gt: now },
        startTime: { lte: toDateObj },
        endTime: { gte: fromDateObj },
      },
    });

    // 10. Load Calendar Exceptions (Facility/Department holidays)
    const exceptions = await this.prisma.calendarException.findMany({
      where: {
        tenantId,
        date: { gte: fromDateObj, lte: toDateObj },
      },
    });

    // Iterate day-by-day to generate slots
    const dayAvailabilities: DayAvailability[] = [];
    const curr = new Date(fromDateObj);

    while (curr <= toDateObj) {
      const dateStr = curr.toISOString().split('T')[0];
      const dayOfWeekName = this.getDayOfWeekName(curr);

      // Check if full-day exception (holiday) exists
      const isHoliday = exceptions.some(e => e.date.toISOString().split('T')[0] === dateStr && e.isFullDay);
      if (isHoliday) {
        dayAvailabilities.push({
          date: dateStr,
          dayOfWeek: dayOfWeekName,
          isWorkingDay: false,
          slots: [],
        });
        curr.setUTCDate(curr.getUTCDate() + 1);
        continue;
      }

      // Check if doctor is on full-day leave
      const isOnLeave = leaves.some(l => {
        const start = l.startDate.toISOString().split('T')[0];
        const end = l.endDate.toISOString().split('T')[0];
        return dateStr >= start && dateStr <= end && !l.startTime;
      });
      if (isOnLeave) {
        dayAvailabilities.push({
          date: dateStr,
          dayOfWeek: dayOfWeekName,
          isWorkingDay: false,
          slots: [],
        });
        curr.setUTCDate(curr.getUTCDate() + 1);
        continue;
      }

      // Collect working windows from active template rules for this day of week
      const matchingRules = templates.flatMap(t => t.rules.filter(r => r.dayOfWeek === dayOfWeekName as DayOfWeek));

      if (matchingRules.length === 0) {
        dayAvailabilities.push({
          date: dateStr,
          dayOfWeek: dayOfWeekName,
          isWorkingDay: false,
          slots: [],
        });
        curr.setUTCDate(curr.getUTCDate() + 1);
        continue;
      }

      const daySlots: TimeSlot[] = [];

      for (const rule of matchingRules) {
        const windowStart = this.parseTimeToUtcDate(dateStr, rule.startTime);
        const windowEnd = this.parseTimeToUtcDate(dateStr, rule.endTime);

        let slotCursor = new Date(windowStart);

        while (new Date(slotCursor.getTime() + totalOccupiedMinutes * 60 * 1000) <= windowEnd) {
          const slotStart = new Date(slotCursor);
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
          const occupiedEnd = new Date(slotStart.getTime() + totalOccupiedMinutes * 60 * 1000);

          // Conflict checks:
          // A. Overrides (breaks/blocks)
          const hasBreak = overrides.some(o => {
            if (o.date.toISOString().split('T')[0] !== dateStr) return false;
            const oStart = this.parseTimeToUtcDate(dateStr, o.startTime);
            const oEnd = this.parseTimeToUtcDate(dateStr, o.endTime);
            return (slotStart < oEnd && occupiedEnd > oStart);
          });

          // B. Partial day leave
          const hasLeaveConflict = leaves.some(l => {
            if (!l.startTime || !l.endTime) return false;
            const lStart = this.parseTimeToUtcDate(dateStr, l.startTime);
            const lEnd = this.parseTimeToUtcDate(dateStr, l.endTime);
            return (slotStart < lEnd && occupiedEnd > lStart);
          });

          // C. Appointments
          const hasApptConflict = appointments.some(a => {
            return (slotStart < a.endTime && occupiedEnd > a.startTime);
          });

          // D. Holds
          const hasHoldConflict = holds.some(h => {
            return (slotStart < h.endTime && occupiedEnd > h.startTime);
          });

          const isAvailable = !hasBreak && !hasLeaveConflict && !hasApptConflict && !hasHoldConflict && (slotStart > now);

          let status: TimeSlot['status'] = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';
          if (hasApptConflict) status = 'BOOKED';
          if (hasHoldConflict) status = 'HELD';

          daySlots.push({
            time: this.formatTime12Hour(slotStart),
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            status,
            durationMinutes,
          });

          slotCursor = new Date(slotCursor.getTime() + granularityMin * 60 * 1000);
        }
      }

      dayAvailabilities.push({
        date: dateStr,
        dayOfWeek: dayOfWeekName,
        isWorkingDay: true,
        slots: daySlots,
      });

      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    return {
      practitionerId,
      practitionerName: `Dr. ${doctor.user.lastName}`,
      timeZone: timezone,
      granularityMin,
      durationMinutes,
      dates: dayAvailabilities,
    };
  }

  private getDayOfWeekName(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getUTCDay()];
  }

  private parseTimeToUtcDate(dateStr: string, timeStr: string): Date {
    const [hh, mm] = timeStr.split(':').map(Number);
    const d = new Date(`${dateStr}T00:00:00Z`);
    d.setUTCHours(hh, mm, 0, 0);
    return d;
  }

  private formatTime12Hour(date: Date): string {
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }
}
