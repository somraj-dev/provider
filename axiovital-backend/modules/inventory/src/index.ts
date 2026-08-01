import { Module } from '@nestjs/common';
import { PharmacyModule, PharmacyService } from '@axiovital/module-pharmacy';

@Module({
  imports: [PharmacyModule],
  exports: [PharmacyModule],
})
export class InventoryModule {}

export { PharmacyService as InventoryService };
