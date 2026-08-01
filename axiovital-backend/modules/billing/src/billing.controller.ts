import {
  Controller, Post, Get, Body, Param, Query, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import {
  CreateInvoiceDto, RecordPaymentDto, SubmitInsuranceClaimDto, UpdateClaimStatusDto,
} from './dto/billing.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';
import { InvoiceStatus } from '@prisma/client';

@ApiTags('Billing & Insurance')
@Controller('billing')
@ApiBearerAuth('access-token')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ---- INVOICE ENDPOINTS ----

  @Post('invoices')
  @Roles('BILLING_CLERK', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Generate a new invoice for patient services' })
  async createInvoice(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.billingService.createInvoice(tenantId, dto, user.sub);
  }

  @Get('invoices')
  @Roles('BILLING_CLERK', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter invoices' })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listInvoices(
    @TenantId() tenantId: string,
    @Query('status') status?: InvoiceStatus,
    @Query('patientId') patientId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.listInvoices(tenantId, status, patientId, page || 1, limit || 20);
  }

  @Get('invoices/:id')
  @Roles('BILLING_CLERK', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get invoice details with item breakdown & payment history' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  async getInvoiceById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.billingService.getInvoiceById(tenantId, id);
  }

  // ---- PAYMENT ENDPOINTS ----

  @Post('payments')
  @Roles('BILLING_CLERK', 'RECEPTIONIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Record payment against an invoice (Cash, Credit Card, Bank Transfer, UPI)' })
  async recordPayment(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.billingService.recordPayment(tenantId, dto, user.sub);
  }

  // ---- INSURANCE CLAIM ENDPOINTS ----

  @Post('claims')
  @Roles('INSURANCE_AGENT', 'BILLING_CLERK', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Submit an insurance claim for an invoice' })
  async submitInsuranceClaim(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitInsuranceClaimDto,
  ) {
    return this.billingService.submitInsuranceClaim(tenantId, dto, user.sub);
  }

  @Patch('claims/:id/status')
  @Roles('INSURANCE_AGENT', 'BILLING_CLERK', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Update insurance claim status & approved settlement amount' })
  @ApiParam({ name: 'id', description: 'InsuranceClaim UUID' })
  async updateClaimStatus(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    return this.billingService.updateClaimStatus(tenantId, id, dto, user.sub);
  }
}
