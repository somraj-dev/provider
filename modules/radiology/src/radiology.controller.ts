import {
  Controller, Post, Get, Body, Param, Query, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RadiologyService } from './radiology.service';
import {
  CreateImagingOrderDto, AttachImagingStudyDto, UpdateImagingStatusDto,
} from './dto/radiology.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';
import { ImagingModality, ImagingOrderStatus } from '@prisma/client';

@ApiTags('Radiology & Imaging')
@Controller('radiology')
@ApiBearerAuth('access-token')
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) {}

  @Post('orders')
  @Roles('DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Order a radiology scan (X-Ray, CT, MRI, Ultrasound, etc.)' })
  async createImagingOrder(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateImagingOrderDto,
  ) {
    return this.radiologyService.createImagingOrder(tenantId, dto, user.sub);
  }

  @Get('orders')
  @Roles('DOCTOR', 'NURSE', 'RADIOLOGIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter imaging orders (Urgent scans listed first)' })
  @ApiQuery({ name: 'modality', required: false, enum: ImagingModality })
  @ApiQuery({ name: 'status', required: false, enum: ImagingOrderStatus })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listImagingOrders(
    @TenantId() tenantId: string,
    @Query('modality') modality?: ImagingModality,
    @Query('status') status?: ImagingOrderStatus,
    @Query('patientId') patientId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.radiologyService.listImagingOrders(
      tenantId, modality, status, patientId, page || 1, limit || 20,
    );
  }

  @Get('orders/:id')
  @Roles('DOCTOR', 'NURSE', 'RADIOLOGIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get imaging order details with DICOM studies and report' })
  @ApiParam({ name: 'id', description: 'ImagingOrder UUID' })
  async getImagingOrderById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.radiologyService.getImagingOrderById(tenantId, id);
  }

  @Post('studies')
  @Roles('RADIOLOGIST', 'DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Attach DICOM study instance UID, MinIO file reference, and radiologist report' })
  async attachImagingStudy(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AttachImagingStudyDto,
  ) {
    return this.radiologyService.attachImagingStudy(tenantId, dto, user.sub);
  }

  @Patch('orders/:id/status')
  @Roles('RADIOLOGIST', 'DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Update imaging order status (Scheduled, Scan Completed, Finalized)' })
  @ApiParam({ name: 'id', description: 'ImagingOrder UUID' })
  async updateStatus(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateImagingStatusDto,
  ) {
    return this.radiologyService.updateStatus(tenantId, id, dto, user.sub);
  }
}
