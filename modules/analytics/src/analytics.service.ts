import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import { AdmissionStatus, BedStatus, AppointmentStatus, LabOrderStatus, ImagingOrderStatus, InvoiceStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHospitalOverview(tenantId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      todayAdmissions,
      activeAdmissions,
      totalBeds,
      occupiedBeds,
      icuBeds,
      occupiedIcuBeds,
      todayAppointments,
      completedAppointments,
      pendingLabOrders,
      statLabOrders,
      pendingImagingOrders,
      urgentImagingOrders,
      issuedInvoices,
      totalRevenuePaid,
      pendingClaimAmount,
    ] = await Promise.all([
      // Patient Census
      this.prisma.patient.count({ where: { tenantId } }),
      this.prisma.admission.count({ where: { tenantId, admissionDate: { gte: todayStart } } }),
      this.prisma.admission.count({ where: { tenantId, status: AdmissionStatus.ADMITTED } }),

      // Bed Occupancy
      this.prisma.bed.count({ where: { tenantId } }),
      this.prisma.bed.count({ where: { tenantId, status: BedStatus.OCCUPIED } }),
      this.prisma.bed.count({ where: { tenantId, type: { in: ['PRIVATE_ICU', 'NEONATAL_ICU', 'PEDIATRIC_ICU'] } } }),
      this.prisma.bed.count({
        where: { tenantId, status: BedStatus.OCCUPIED, type: { in: ['PRIVATE_ICU', 'NEONATAL_ICU', 'PEDIATRIC_ICU'] } },
      }),

      // Appointments
      this.prisma.appointment.count({ where: { tenantId, startTime: { gte: todayStart } } }),
      this.prisma.appointment.count({ where: { tenantId, startTime: { gte: todayStart }, status: AppointmentStatus.COMPLETED } }),

      // Diagnostic Workload
      this.prisma.labOrder.count({ where: { tenantId, status: { in: [LabOrderStatus.ORDERED, LabOrderStatus.SAMPLE_COLLECTED, LabOrderStatus.IN_ANALYSIS] } } }),
      this.prisma.labOrder.count({ where: { tenantId, priority: 'STAT', status: { not: LabOrderStatus.COMPLETED } } }),
      this.prisma.imagingOrder.count({ where: { tenantId, status: { in: [ImagingOrderStatus.REQUESTED, ImagingOrderStatus.SCHEDULED, ImagingOrderStatus.SCAN_COMPLETED] } } }),
      this.prisma.imagingOrder.count({ where: { tenantId, isUrgent: true, status: { not: ImagingOrderStatus.FINALIZED } } }),

      // Financial Metrics
      this.prisma.invoice.count({ where: { tenantId, status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] } } }),
      this.prisma.payment.aggregate({ where: { invoice: { tenantId } }, _sum: { amount: true } }),
      this.prisma.insuranceClaim.aggregate({ where: { tenantId, status: 'SUBMITTED' }, _sum: { claimAmount: true } }),
    ]);

    const overallOccupancyRate = totalBeds > 0 ? parseFloat(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;
    const icuOccupancyRate = icuBeds > 0 ? parseFloat(((occupiedIcuBeds / icuBeds) * 100).toFixed(1)) : 0;

    return {
      timestamp: new Date().toISOString(),
      patientCensus: {
        totalRegisteredPatients: totalPatients,
        todayNewAdmissions: todayAdmissions,
        currentlyAdmittedInpatients: activeAdmissions,
      },
      bedOccupancy: {
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        overallOccupancyRate: `${overallOccupancyRate}%`,
        icuBeds,
        occupiedIcuBeds,
        icuOccupancyRate: `${icuOccupancyRate}%`,
      },
      outpatientVolume: {
        todayScheduledAppointments: todayAppointments,
        todayCompletedAppointments: completedAppointments,
      },
      diagnosticPipeline: {
        pendingLabOrders,
        statLabEmergencyOrders: statLabOrders,
        pendingImagingScans: pendingImagingOrders,
        urgentImagingScans: urgentImagingOrders,
      },
      financialSummary: {
        unpaidOrPartialInvoices: issuedInvoices,
        totalRevenueCollected: Number(totalRevenuePaid._sum.amount || 0),
        pendingInsuranceClaimsTotal: Number(pendingClaimAmount._sum.claimAmount || 0),
      },
    };
  }

  async getEmergencyTriageMetrics(tenantId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const triages = await this.prisma.emergencyTriage.groupBy({
      by: ['triageLevel'],
      where: { tenantId, triagedAt: { gte: todayStart } },
      _count: { _all: true },
    });

    const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    triages.forEach((t) => {
      levelCounts[t.triageLevel] = t._count._all;
    });

    return {
      timestamp: new Date().toISOString(),
      triageBreakdown: {
        level1Resuscitation: levelCounts[1],
        level2Emergent: levelCounts[2],
        level3Urgent: levelCounts[3],
        level4LessUrgent: levelCounts[4],
        level5NonUrgent: levelCounts[5],
      },
      totalTriagedToday: Object.values(levelCounts).reduce((a, b) => a + b, 0),
    };
  }
}
