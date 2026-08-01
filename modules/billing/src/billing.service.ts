import {
  Injectable, Logger, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  CreateInvoiceDto, RecordPaymentDto, SubmitInsuranceClaimDto, UpdateClaimStatusDto,
} from './dto/billing.dto';
import { InvoiceStatus, AuditAction } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const ymStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${ymStr}-${sequence}`;
  }

  async createInvoice(tenantId: string, dto: CreateInvoiceDto, actorId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    if (dto.items.length === 0) {
      throw new BadRequestException('Invoice must contain at least one line item');
    }

    let subtotal = 0;
    const itemsData = dto.items.map((item) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      };
    });

    const tax = dto.taxAmount || 0;
    const discount = dto.discountAmount || 0;
    const totalAmount = parseFloat((subtotal + tax - discount).toFixed(2));
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        patientId: dto.patientId,
        subtotal,
        taxAmount: tax,
        discountAmount: discount,
        totalAmount,
        dueDate: new Date(dto.dueDate),
        status: InvoiceStatus.ISSUED,
        items: { create: itemsData },
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        items: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'Invoice',
        resourceId: invoice.id,
        description: `Created invoice ${invoice.invoiceNumber} for patient ${patient.mrn} (Total: ${invoice.totalAmount})`,
      },
    });

    this.logger.log(`Invoice created: ${invoice.invoiceNumber} in tenant ${tenantId}`);
    return invoice;
  }

  async recordPayment(tenantId: string, dto: RecordPaymentDto, processedById: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
    const total = Number(invoice.totalAmount);
    const newStatus = newPaidAmount >= total ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    const payment = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId: dto.invoiceId,
          processedById,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          transactionReference: dto.transactionReference,
        },
      });

      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      return p;
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: processedById,
        action: AuditAction.CREATE,
        resourceType: 'Payment',
        resourceId: payment.id,
        description: `Recorded ${dto.paymentMethod} payment of ${dto.amount} for invoice ${invoice.invoiceNumber}`,
      },
    });

    return payment;
  }

  async submitInsuranceClaim(tenantId: string, dto: SubmitInsuranceClaimDto, actorId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);

    const claim = await this.prisma.insuranceClaim.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        invoiceId: dto.invoiceId,
        providerName: dto.providerName,
        policyNumber: dto.policyNumber,
        claimAmount: dto.claimAmount,
        status: 'SUBMITTED',
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        invoice: { select: { invoiceNumber: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.CREATE,
        resourceType: 'InsuranceClaim',
        resourceId: claim.id,
        description: `Submitted insurance claim to ${dto.providerName} for ${dto.claimAmount}`,
      },
    });

    return claim;
  }

  async updateClaimStatus(tenantId: string, claimId: string, dto: UpdateClaimStatusDto, actorId: string) {
    const claim = await this.prisma.insuranceClaim.findFirst({
      where: { id: claimId, tenantId },
    });
    if (!claim) throw new NotFoundException(`Insurance claim ${claimId} not found`);

    const updated = await this.prisma.insuranceClaim.update({
      where: { id: claimId },
      data: {
        status: dto.status,
        approvedAmount: dto.approvedAmount !== undefined ? dto.approvedAmount : claim.approvedAmount,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: AuditAction.UPDATE,
        resourceType: 'InsuranceClaim',
        resourceId: claimId,
        description: `Updated insurance claim status to ${dto.status} (Approved: ${dto.approvedAmount ?? 'N/A'})`,
      },
    });

    return updated;
  }

  async getInvoiceById(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true, phone: true, email: true } },
        items: true,
        payments: {
          include: { processedBy: { select: { firstName: true, lastName: true } } },
          orderBy: { paidAt: 'desc' },
        },
        claims: true,
      },
    });

    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    return invoice;
  }

  async listInvoices(tenantId: string, status?: InvoiceStatus, patientId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const whereClause = {
      tenantId,
      ...(status ? { status } : {}),
      ...(patientId ? { patientId } : {}),
    };

    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          items: true,
          payments: true,
        },
      }),
      this.prisma.invoice.count({ where: whereClause }),
    ]);

    return {
      data: invoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
