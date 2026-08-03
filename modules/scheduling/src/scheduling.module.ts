import { Module } from '@nestjs/common';
import { DatabaseModule } from '@axiovital/database';
import { AvailabilityService } from './availability.service';
import { HoldService } from './hold.service';
import { AppointmentRequestService } from './appointment-request.service';
import { PractitionerScheduleService } from './practitioner-schedule.service';
import { SchedulingController } from './scheduling.controller';
import { HoldController } from './hold.controller';
import { AppointmentRequestController } from './appointment-request.controller';
import { PractitionerScheduleController } from './practitioner-schedule.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [
    SchedulingController,
    HoldController,
    AppointmentRequestController,
    PractitionerScheduleController,
  ],
  providers: [
    AvailabilityService,
    HoldService,
    AppointmentRequestService,
    PractitionerScheduleService,
  ],
  exports: [
    AvailabilityService,
    HoldService,
    AppointmentRequestService,
    PractitionerScheduleService,
  ],
})
export class SchedulingModule {}
