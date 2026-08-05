export interface TabItem {
  id: string;
  title: string;
  type: 'MessageCenter' | 'Analytics' | 'PatientList' | 'Notifications' | 'PatientProfile' | 'EditPatientProfile' | 'MedicalReport' | 'HelpCentre' | 'RescheduleRequests' | 'AdmitPatient' | 'ReferralTransfer' | 'DischargeList' | 'DeveloperTools' | 'Orders' | 'Home' | 'PatientNotes' | 'Labs' | 'BillingReceipt' | 'Customised' | 'ClinicalDecisionSupport' | 'ClinicalEventView' | 'ProtocolLibrary' | 'QualityMeasures' | 'PhysicianHandoff' | 'Reports' | 'LabReportDetail' | 'ProcessExplorer';
}

export interface PatientDemographic {
  mrn: string;
  axioId: string;
  gender: string;
  age: string;
  allergies: string;
  dob: string;
  weight: string;
  height: string;
  bloodType: string;
  healthLife: string;
}

export default function SharedTypesPage() {
  return null;
}
