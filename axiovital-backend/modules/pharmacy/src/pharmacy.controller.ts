import {
  Controller, Post, Get, Body, Param, Query, Patch, Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import {
  CreateInventoryItemDto, UpdateStockDto, CreatePrescriptionDto,
} from './dto/pharmacy.dto';
import { TenantId, CurrentUser, Roles, JwtPayload } from '@axiovital/common';
import { PrescriptionStatus } from '@prisma/client';

@ApiTags('Pharmacy & Inventory')
@Controller('pharmacy')
@ApiBearerAuth('access-token')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // ---- INVENTORY ENDPOINTS ----

  @Post('inventory')
  @Roles('PHARMACIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Add a new medication/supply item to inventory' })
  async createInventoryItem(
    @TenantId() tenantId: string,
    @Body() dto: CreateInventoryItemDto,
  ) {
    return this.pharmacyService.createInventoryItem(tenantId, dto);
  }

  @Get('inventory')
  @Roles('DOCTOR', 'NURSE', 'PHARMACIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List medication inventory with stock quantities & low-stock alerts' })
  @ApiQuery({ name: 'category', required: false })
  async listInventory(
    @TenantId() tenantId: string,
    @Query('category') category?: string,
  ) {
    return this.pharmacyService.listInventory(tenantId, false, category);
  }

  @Patch('inventory/:id/stock')
  @Roles('PHARMACIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Adjust stock levels for an inventory item (restock or audit)' })
  @ApiParam({ name: 'id', description: 'InventoryItem UUID' })
  async updateStock(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.pharmacyService.updateStock(tenantId, id, dto, user.sub);
  }

  // ---- PRESCRIPTION ENDPOINTS ----

  @Post('prescriptions')
  @Roles('DOCTOR', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new prescription for a patient' })
  async createPrescription(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.pharmacyService.createPrescription(tenantId, dto, user.sub);
  }

  @Get('prescriptions')
  @Roles('DOCTOR', 'NURSE', 'PHARMACIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'List and filter prescriptions' })
  @ApiQuery({ name: 'status', required: false, enum: PrescriptionStatus })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listPrescriptions(
    @TenantId() tenantId: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('patientId') patientId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pharmacyService.listPrescriptions(tenantId, status, patientId, page || 1, limit || 20);
  }

  @Get('prescriptions/:id')
  @Roles('DOCTOR', 'NURSE', 'PHARMACIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Get prescription details with medication items & dosage instructions' })
  @ApiParam({ name: 'id', description: 'Prescription UUID' })
  async getPrescriptionById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.pharmacyService.getPrescriptionById(tenantId, id);
  }

  @Post('prescriptions/:id/dispense')
  @Roles('PHARMACIST', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Dispense prescription & automatically deduct stock from inventory' })
  @ApiParam({ name: 'id', description: 'Prescription UUID' })
  async dispensePrescription(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.pharmacyService.dispensePrescription(tenantId, id, user.sub);
  }
}
