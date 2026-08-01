import { Module } from '@nestjs/common';
import { ClinicalAiEngineService } from './ai-engine.service';
import { ClinicalAiController } from './ai.controller';

@Module({
  controllers: [ClinicalAiController],
  providers: [ClinicalAiEngineService],
  exports: [ClinicalAiEngineService],
})
export class AiModule {}
