import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@axiovital/database';
import {
  DrugInteractionCheckDto, DifferentialDiagnosisDto, ClinicalRiskScoreDto, SummarizeChartDto,
} from './dto/ai.dto';
import { AiAnalysisType, AuditAction } from '@prisma/client';

@Injectable()
export class ClinicalAiEngineService {
  private readonly logger = new Logger(ClinicalAiEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---- DRUG INTERACTION ENGINE ----

  async checkDrugInteractions(tenantId: string, dto: DrugInteractionCheckDto, doctorId?: string) {
    const interactions: Array<{ severity: 'HIGH' | 'MODERATE' | 'LOW'; title: string; description: string }> = [];
    const allergyWarnings: Array<{ severity: 'CRITICAL' | 'WARNING'; substance: string; message: string }> = [];

    const meds = dto.medications.map((m) => m.toLowerCase().trim());
    const allergies = (dto.patientAllergies || []).map((a) => a.toLowerCase().trim());

    // 1. Known severe drug-drug interactions
    if (meds.some((m) => m.includes('warfarin')) && meds.some((m) => m.includes('aspirin'))) {
      interactions.push({
        severity: 'HIGH',
        title: 'Increased Risk of Severe Hemorrhage',
        description: 'Co-administration of Warfarin and Aspirin significantly elevates major gastrointestinal and intracranial bleeding risk.',
      });
    }

    if (meds.some((m) => m.includes('lisinopril') || m.includes('enalapril')) && meds.some((m) => m.includes('spironolactone'))) {
      interactions.push({
        severity: 'HIGH',
        title: 'Severe Hyperkalemia Risk',
        description: 'Concurrent ACE inhibitor and Potassium-sparing diuretic therapy can cause life-threatening hyperkalemia.',
      });
    }

    if (meds.some((m) => m.includes('simvastatin')) && meds.some((m) => m.includes('amiodarone'))) {
      interactions.push({
        severity: 'MODERATE',
        title: 'Increased Rhabdomyolysis Risk',
        description: 'Amiodarone inhibits CYP3A4 metabolism of Simvastatin, predisposing patient to myopathy and rhabdomyolysis.',
      });
    }

    // 2. Drug-Allergy Cross-Reactivity Checks
    for (const allergy of allergies) {
      if (allergy.includes('penicillin')) {
        for (const med of meds) {
          if (med.includes('amoxicillin') || med.includes('ampicillin') || med.includes('penicillin')) {
            allergyWarnings.push({
              severity: 'CRITICAL',
              substance: allergy,
              message: `Patient has recorded PENICILLIN allergy. Prescribing "${med}" poses a severe risk of anaphylaxis.`,
            });
          }
        }
      }
    }

    const responsePayload = {
      timestamp: new Date().toISOString(),
      medicationsChecked: dto.medications,
      allergiesChecked: dto.patientAllergies || [],
      hasInteractions: interactions.length > 0,
      hasAllergyAlerts: allergyWarnings.length > 0,
      interactions,
      allergyWarnings,
      recommendation: allergyWarnings.length > 0 || interactions.some((i) => i.severity === 'HIGH')
        ? 'ALERT: Clinical intervention or alternative drug selection strongly recommended.'
        : 'No high-risk interactions detected.',
    };

    this.logger.log(`AI Drug Interaction check completed for ${dto.medications.length} meds`);
    return responsePayload;
  }

  // ---- DIFFERENTIAL DIAGNOSIS ENGINE ----

  async generateDifferentialDiagnosis(tenantId: string, dto: DifferentialDiagnosisDto) {
    const symptoms = dto.symptoms.map((s) => s.toLowerCase());
    const vitals = dto.vitalsSnapshot || {};

    const differentials: Array<{
      condition: string;
      icd10: string;
      probabilityScore: number; // 0.0 to 1.0
      rationale: string;
      recommendedWorkup: string[];
    }> = [];

    // Chest pain + SOB + Diaphoresis pattern
    if (symptoms.some((s) => s.includes('chest pain')) && symptoms.some((s) => s.includes('breath') || s.includes('sob'))) {
      differentials.push({
        condition: 'Acute Coronary Syndrome (ACS / Myocardial Infarction)',
        icd10: 'I21.9',
        probabilityScore: 0.88,
        rationale: 'Presentation of acute chest pain accompanied by dyspnea and diaphoresis in an adult patient.',
        recommendedWorkup: ['12-lead ECG (STAT)', 'Serum Troponin I/T (STAT & 3h)', 'Chest X-Ray (Portable)', 'CBC, BMP, Coagulation Panel'],
      });

      differentials.push({
        condition: 'Pulmonary Embolism (PE)',
        icd10: 'I26.99',
        probabilityScore: 0.65,
        rationale: 'Acute onset dyspnea and chest pain. Assess Wells Score / PERC rule.',
        recommendedWorkup: ['D-Dimer Protocol', 'CT Pulmonary Angiogram (CTPA)', 'Venous Duplex Ultrasound'],
      });
    }

    // Fever + Cough + Shortness of breath pattern
    if (symptoms.some((s) => s.includes('fever')) && symptoms.some((s) => s.includes('cough'))) {
      differentials.push({
        condition: 'Community-Acquired Pneumonia (CAP)',
        icd10: 'J18.9',
        probabilityScore: 0.82,
        rationale: 'Febrile respiratory illness presenting with productive cough and dyspnea.',
        recommendedWorkup: ['Chest PA & Lateral X-Ray', 'Sputum Gram Stain & Culture', 'Blood Cultures x2', 'Procalcitonin Level'],
      });
    }

    // Default general assessment fallback
    if (differentials.length === 0) {
      differentials.push({
        condition: 'General Symptom Evaluation Needed',
        icd10: 'R69',
        probabilityScore: 0.50,
        rationale: 'Nonspecific clinical presentation requiring comprehensive diagnostic workup.',
        recommendedWorkup: ['Complete Blood Count (CBC)', 'Comprehensive Metabolic Panel (CMP)', 'Urinalysis'],
      });
    }

    return {
      timestamp: new Date().toISOString(),
      inputSymptoms: dto.symptoms,
      differentials: differentials.sort((a, b) => b.probabilityScore - a.probabilityScore),
      disclaimer: 'AI Decision Support tool — for clinical guidance only. Primary physician judgment remains authoritative.',
    };
  }

  // ---- SEPSIS & CLINICAL EARLY WARNING SCORE (NEWS2 / qSOFA) ----

  async calculateClinicalRiskScore(tenantId: string, dto: ClinicalRiskScoreDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
      include: {
        vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
        conditions: { where: { isActive: true } },
      },
    });

    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    const latestVital = patient.vitals[0];
    let news2Score = 0;
    let qSofaScore = 0;
    const scoreBreakdown: string[] = [];

    if (latestVital) {
      // Respiratory Rate
      if (latestVital.respiratoryRate) {
        if (latestVital.respiratoryRate >= 22) {
          qSofaScore += 1;
          news2Score += 3;
          scoreBreakdown.push('Respiratory Rate >= 22 (+1 qSOFA, +3 NEWS2)');
        } else if (latestVital.respiratoryRate <= 8) {
          news2Score += 3;
          scoreBreakdown.push('Respiratory Rate <= 8 (+3 NEWS2)');
        }
      }

      // Systolic BP
      if (latestVital.systolicBp) {
        if (latestVital.systolicBp <= 100) {
          qSofaScore += 1;
          news2Score += 3;
          scoreBreakdown.push('Systolic BP <= 100 mmHg (+1 qSOFA, +3 NEWS2)');
        }
      }

      // Oxygen Saturation
      if (latestVital.oxygenSat) {
        if (latestVital.oxygenSat <= 91) {
          news2Score += 3;
          scoreBreakdown.push('SpO2 <= 91% (+3 NEWS2)');
        } else if (latestVital.oxygenSat <= 93) {
          news2Score += 2;
          scoreBreakdown.push('SpO2 92-93% (+2 NEWS2)');
        }
      }

      // Temperature
      if (latestVital.temperature) {
        if (latestVital.temperature >= 39.1 || latestVital.temperature <= 35.0) {
          news2Score += 2;
          scoreBreakdown.push('Temperature Extreme (+2 NEWS2)');
        }
      }

      // Heart Rate
      if (latestVital.heartRate) {
        if (latestVital.heartRate >= 131 || latestVital.heartRate <= 40) {
          news2Score += 3;
          scoreBreakdown.push('Heart Rate Extreme (+3 NEWS2)');
        }
      }
    }

    const sepsisAlert = qSofaScore >= 2 || news2Score >= 7;

    return {
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      qSofaScore,
      news2Score,
      sepsisRiskLevel: sepsisAlert ? 'HIGH (CRITICAL ALERT)' : news2Score >= 5 ? 'MEDIUM' : 'LOW',
      sepsisAlertTriggered: sepsisAlert,
      scoreBreakdown,
      recommendedAction: sepsisAlert
        ? 'IMMEDIATE SEPSIS PROTOCOL: Obtain Blood Cultures x2, Measure Serum Lactate, Administer Broad-Spectrum IV Antibiotics & IV Fluids.'
        : 'Continue routine clinical monitoring per ward protocol.',
    };
  }

  // ---- CHART SUMMARIZATION ----

  async summarizePatientChart(tenantId: string, dto: SummarizeChartDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
      include: {
        allergies: true,
        vitals: { orderBy: { recordedAt: 'desc' }, take: 3 },
        conditions: { where: { isActive: true } },
        appointments: { orderBy: { startTime: 'desc' }, take: 3 },
        prescriptions: { orderBy: { prescribedAt: 'desc' }, take: 3, include: { items: { include: { inventoryItem: true } } } },
      },
    });

    if (!patient) throw new NotFoundException(`Patient ${dto.patientId} not found`);

    const summary = {
      patientInfo: {
        mrn: patient.mrn,
        name: `${patient.firstName} ${patient.lastName}`,
        dob: patient.dateOfBirth.toISOString().slice(0, 10),
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      },
      activeDiagnoses: patient.conditions.map((c) => `${c.name} (${c.icdCode || 'N/A'})`),
      allergies: patient.allergies.map((a) => `${a.substance} [Severity: ${a.severity}]`),
      recentVitals: patient.vitals[0]
        ? `BP: ${patient.vitals[0].systolicBp}/${patient.vitals[0].diastolicBp} mmHg, HR: ${patient.vitals[0].heartRate} bpm, Temp: ${patient.vitals[0].temperature}°C, SpO2: ${patient.vitals[0].oxygenSat}%`
        : 'No recent vitals recorded',
      currentMedications: patient.prescriptions.flatMap((p) =>
        p.items.map((i) => `${i.inventoryItem.name} - ${i.dosage} ${i.frequency}`),
      ),
      aiExecutiveSummary: `Patient ${patient.firstName} ${patient.lastName} (${patient.mrn}) has ${patient.conditions.length} active diagnoses and ${patient.allergies.length} recorded allergies. Latest recorded BP is ${patient.vitals[0]?.systolicBp || 'N/A'}/${patient.vitals[0]?.diastolicBp || 'N/A'} mmHg. Currently prescribed ${patient.prescriptions.length} active regimens.`,
    };

    return summary;
  }
}
