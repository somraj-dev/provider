import { AvailabilityService } from '../availability.service';
import { HoldService } from '../hold.service';
import { AppointmentStatus, HoldStatus } from '@prisma/client';

describe('Scheduling Domain Engine', () => {
  let availabilityService: AvailabilityService;
  let holdService: HoldService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      doctor: { findFirst: jest.fn(), findMany: jest.fn() },
      tenant: { findUnique: jest.fn() },
      appointmentTypeConfig: { findFirst: jest.fn(), findMany: jest.fn() },
      schedulingPolicy: { findFirst: jest.fn() },
      scheduleTemplate: { findMany: jest.fn(), create: jest.fn() },
      scheduleOverride: { findMany: jest.fn(), create: jest.fn() },
      practitionerLeave: { findMany: jest.fn(), create: jest.fn() },
      appointment: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      appointmentHold: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      calendarException: { findMany: jest.fn() },
      appointmentRequest: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    availabilityService = new AvailabilityService(prismaMock);
    holdService = new HoldService(prismaMock);
  });

  describe('1. Availability Algorithm', () => {
    it('should generate slots for working days according to schedule templates', async () => {
      prismaMock.doctor.findFirst.mockResolvedValue({
        id: 'doc-123',
        user: { firstName: 'Herman', lastName: 'Stewart' },
      });
      prismaMock.tenant.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
      prismaMock.appointmentTypeConfig.findFirst.mockResolvedValue({
        durationMinutes: 30,
        preBufferMin: 0,
        postBufferMin: 0,
      });
      prismaMock.schedulingPolicy.findFirst.mockResolvedValue({ slotGranularityMin: 15 });

      prismaMock.scheduleTemplate.findMany.mockResolvedValue([
        {
          id: 'tmpl-1',
          rules: [
            { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '11:00' },
          ],
        },
      ]);
      prismaMock.scheduleOverride.findMany.mockResolvedValue([]);
      prismaMock.practitionerLeave.findMany.mockResolvedValue([]);
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointmentHold.findMany.mockResolvedValue([]);
      prismaMock.calendarException.findMany.mockResolvedValue([]);

      const result = await availabilityService.getAvailability('tenant-1', {
        practitionerId: 'doc-123',
        from: '2026-08-03', // MONDAY
        to: '2026-08-03',
      });

      expect(result.dates).toHaveLength(1);
      expect(result.dates[0].isWorkingDay).toBe(true);
      expect(result.dates[0].slots.length).toBeGreaterThan(0);
      expect(result.dates[0].slots[0].time).toBe('9:00 AM');
    });

    it('should exclude slots overlapping doctor breaks', async () => {
      prismaMock.doctor.findFirst.mockResolvedValue({
        id: 'doc-123',
        user: { firstName: 'Herman', lastName: 'Stewart' },
      });
      prismaMock.tenant.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
      prismaMock.scheduleTemplate.findMany.mockResolvedValue([
        {
          id: 'tmpl-1',
          rules: [{ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '12:00' }],
        },
      ]);
      prismaMock.scheduleOverride.findMany.mockResolvedValue([
        {
          date: new Date('2026-08-03T00:00:00Z'),
          startTime: '10:00',
          endTime: '11:00',
          type: 'BREAK',
        },
      ]);
      prismaMock.practitionerLeave.findMany.mockResolvedValue([]);
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointmentHold.findMany.mockResolvedValue([]);
      prismaMock.calendarException.findMany.mockResolvedValue([]);

      const result = await availabilityService.getAvailability('tenant-1', {
        practitionerId: 'doc-123',
        from: '2026-08-03',
        to: '2026-08-03',
      });

      const slotTimes = result.dates[0].slots.filter(s => s.status === 'AVAILABLE').map(s => s.time);
      expect(slotTimes).toContain('9:00 AM');
      expect(slotTimes).not.toContain('10:00 AM');
      expect(slotTimes).not.toContain('10:30 AM');
    });

    it('should mark existing appointments as BOOKED', async () => {
      prismaMock.doctor.findFirst.mockResolvedValue({
        id: 'doc-123',
        user: { firstName: 'Herman', lastName: 'Stewart' },
      });
      prismaMock.tenant.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
      prismaMock.scheduleTemplate.findMany.mockResolvedValue([
        {
          id: 'tmpl-1',
          rules: [{ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '11:00' }],
        },
      ]);
      prismaMock.scheduleOverride.findMany.mockResolvedValue([]);
      prismaMock.practitionerLeave.findMany.mockResolvedValue([]);
      prismaMock.appointment.findMany.mockResolvedValue([
        {
          startTime: new Date('2026-08-03T09:00:00Z'),
          endTime: new Date('2026-08-03T09:30:00Z'),
          status: AppointmentStatus.SCHEDULED,
        },
      ]);
      prismaMock.appointmentHold.findMany.mockResolvedValue([]);
      prismaMock.calendarException.findMany.mockResolvedValue([]);

      const result = await availabilityService.getAvailability('tenant-1', {
        practitionerId: 'doc-123',
        from: '2026-08-03',
        to: '2026-08-03',
      });

      const slot9am = result.dates[0].slots.find(s => s.time === '9:00 AM');
      expect(slot9am?.status).toBe('BOOKED');
    });
  });

  describe('2. Temporary Holds', () => {
    it('should create an active hold for an unbooked slot', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(null);
      prismaMock.appointmentHold.findFirst.mockResolvedValue(null);
      prismaMock.schedulingPolicy.findFirst.mockResolvedValue({ holdDurationSeconds: 300 });

      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 5400 * 1000).toISOString();

      prismaMock.appointmentHold.create.mockImplementation((args: any) => Promise.resolve({
        id: 'hold-1',
        token: args.data.token,
        status: HoldStatus.ACTIVE,
        expiresAt: args.data.expiresAt,
      }));

      const hold = await holdService.createHold('tenant-1', 'user-123', {
        doctorId: 'doc-123',
        startTime: futureStart,
        endTime: futureEnd,
      });

      expect(hold).toBeDefined();
      expect(hold.status).toBe(HoldStatus.ACTIVE);
    });

    it('should throw ConflictException if slot is already booked', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue({ id: 'appt-1' });

      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 5400 * 1000).toISOString();

      await expect(
        holdService.createHold('tenant-1', 'user-123', {
          doctorId: 'doc-123',
          startTime: futureStart,
          endTime: futureEnd,
        })
      ).rejects.toThrow('Slot is already booked');
    });
  });
});
