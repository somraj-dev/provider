import {
  Controller, Post, Get, Body, Param, Query, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LaboratoryService } from './laboratory.service';
import {
  CreateLabTestCatalogDto, CreateLabOrderDto, RecordLabResultDto,
} from './dto/laboratory.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';
import { LabOrderStatus } from '@prisma/client';

@ApiTags('Laboratory & Diagnostics')
@Controller('laboratory')
@ApiBearerAuth('access-token')
export class LaboratoryController {
  constructor(private readonly labService: LaboratoryService) {}

  // ---- TEST CATALOG ENDPOINTS ----

  @Post('catalog')
  @Roles('TENANT_ADMIN', 'LAB_TECHNICIAN')
  @ApiOperation({ summary: 'Add a new lab test item to tenant catalog' })
  async createCatalogItem(
    @TenantId() tenantId: string,
    @Body() dto: CreateLabTestCatalogDto,
  ) {
    return this.labService.createCatalogItem(tenantId, dto);
  }

  @Get('catalog')
  @Roles('DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter lab test catalog items' })
  @ApiQuery({ name: 'category', required: false })
  async listCatalog(
    @TenantId() tenantId: string,
    @Query('category') category?: string,
  ) {
    return this.labService.listCatalog(tenantId, category);
  }

  // ---- LAB ORDER ENDPOINTS ----

  @Post('orders')
  @Roles('DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Order lab tests for a patient (STAT / URGENT / ROUTINE)' })
  async createLabOrder(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateLabOrderDto,
  ) {
    return this.labService.createLabOrder(tenantId, dto, user.sub);
  }

  @Get('orders')
  @Roles('DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter lab orders' })
  @ApiQuery({ name: 'status', required: false, enum: LabOrderStatus })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listOrders(
    @TenantId() tenantId: string,
    @Query('status') status?: LabOrderStatus,
    @Query('patientId') patientId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.labService.listOrders(tenantId, status, patientId, page || 1, limit || 20);
  }

  @Get('orders/:id')
  @Roles('DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get lab order details with recorded results' })
  @ApiParam({ name: 'id', description: 'LabOrder UUID' })
  async getOrderById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.labService.getOrderById(tenantId, id);
  }

  @Patch('orders/:id/sample-collected')
  @Roles('NURSE', 'LAB_TECHNICIAN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Mark lab sample collected timestamp' })
  @ApiParam({ name: 'id', description: 'LabOrder UUID' })
  async markSampleCollected(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.labService.markSampleCollected(tenantId, id, user.sub);
  }

  @Post('results')
  @Roles('LAB_TECHNICIAN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Record lab test result & flag abnormal values' })
  async recordResult(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecordLabResultDto,
  ) {
    return this.labService.recordResult(tenantId, dto, user.sub);
  }
}
