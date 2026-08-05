import React from 'react';
import { PatientDemographic } from './types';

export const CHART_OPTIONS = [
  "All Results",
  "Advance Care Planning View",
  "Activities of Daily Living",
  "Ambulatory View",
  "Anesthesiology View",
  "Anti-Coagulation",
  "Assessments View",
  "Delivery Record",
  "Diabetic Flowsheet",
  "Diagnostics View",
  "Dialysis View",
  "Early Warning Alerts Flowsheet",
  "Education View",
  "Forms View",
  "Infection Control View",
  "Lab View",
  "LinesTubesDrains",
  "Mental Health View",
  "Microbiology Other View",
  "Obstetrics View",
  "Orthopedic View",
  "Pain View",
  "Respiratory View",
  "Quick View",
  "Transfusion View",
  "Trauma View",
  "Vitals View"
];

export const formatEhrDate = (dateStr: string) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parts[2];
    if (month >= 1 && month <= 12) {
      return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
    }
  }
  return dateStr;
};

export const formatEhrTime = (timeStr: string) => {
  if (timeStr.length === 4) {
    return timeStr.substring(0, 2) + ':' + timeStr.substring(2);
  }
  return timeStr;
};

export const getChartDataForSelection = (baseData: any[], selection: string, chartKey: string) => {
  if (!selection || selection === 'Quick View' || selection === 'All Results') {
    return baseData;
  }
  
  let hash = 0;
  for (let i = 0; i < selection.length; i++) {
    hash = selection.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return (baseData || []).map((d, index) => {
    const val = d[chartKey];
    if (typeof val !== 'number') return d;
    
    const factor = 0.2 + Math.abs((Math.sin(index + hash) * 1.3));
    let newVal = val * factor;
    
    if (chartKey === 'success') {
      newVal = Math.min(100, Math.max(0, newVal));
    } else if (chartKey === 'status') {
      newVal = Math.max(1, Math.round(newVal));
    } else if (chartKey === 'resp') {
      newVal = parseFloat(newVal.toFixed(2));
    } else {
      newVal = Math.round(newVal);
    }
    
    return {
      ...d,
      [chartKey]: newVal
    };
  });
};

export const patientDemographics: Record<string, PatientDemographic> = {
  'TEST, PATIENT ONE': {
    mrn: '1000245699',
    axioId: 'AVX-000123',
    gender: 'Male',
    age: '45Y 2M',
    allergies: 'No Known Allergies',
    dob: '05/12/1981 (45Y)',
    weight: '75.2 kg (05/20/2026)',
    height: '178 cm',
    bloodType: 'O+',
    healthLife: 'Yes'
  },
  'JAMES, WILLIAM': {
    mrn: '1000245601',
    axioId: 'AXSL06-WJ281',
    gender: 'Male',
    age: '52Y 3M',
    allergies: 'Penicillin, Sulfa',
    dob: '04/12/1974 (52Y)',
    weight: '78.4 kg (05/20/2026)',
    height: '180 cm',
    bloodType: 'A+',
    healthLife: 'Yes'
  },
  'PATEL, RAHUL': {
    mrn: '1000245679',
    axioId: 'AXSL06-RP915',
    gender: 'Male',
    age: '38Y 5M',
    allergies: 'No Known Allergies',
    dob: '11/14/1987 (38Y)',
    weight: '72.1 kg (04/10/2026)',
    height: '172 cm',
    bloodType: 'B+',
    healthLife: 'Yes'
  },
  'JOHNSON, MARIA': {
    mrn: '1000245680',
    axioId: 'AXSL06-MJ100',
    gender: 'Female',
    age: '41Y 2M',
    allergies: 'Aspirin',
    dob: '08/22/1984 (41Y)',
    weight: '64.8 kg (03/15/2026)',
    height: '165 cm',
    bloodType: 'O-',
    healthLife: 'Yes'
  },
  'LEE, DAVID': {
    mrn: '1000245681',
    axioId: 'AXSL06-DL103',
    gender: 'Male',
    age: '56Y 10M',
    allergies: 'No Known Allergies',
    dob: '07/22/1969 (56Y)',
    weight: '82.3 kg (02/28/2026)',
    height: '178 cm',
    bloodType: 'AB+',
    healthLife: 'Yes'
  },
  'GARCIA, LUCIA': {
    mrn: '1000245682',
    axioId: 'AXSL06-LG110',
    gender: 'Female',
    age: '29Y 8M',
    allergies: 'Latex',
    dob: '09/25/1996 (29Y)',
    weight: '58.2 kg (05/01/2026)',
    height: '162 cm',
    bloodType: 'A-',
    healthLife: 'Yes'
  },
  'KIM, JAMES': {
    mrn: '1000245684',
    axioId: 'AXSL06-JK113',
    gender: 'Male',
    age: '49Y 4M',
    allergies: 'Penicillin',
    dob: '02/19/1977 (49Y)',
    weight: '85.6 kg (04/22/2026)',
    height: '176 cm',
    bloodType: 'O+',
    healthLife: 'Yes'
  },
  'BROWN, ELIZABETH': {
    mrn: '1000245685',
    axioId: 'AXSL06-EB120',
    gender: 'Female',
    age: '62Y 11M',
    allergies: 'Codeine',
    dob: '07/06/1963 (62Y)',
    weight: '69.4 kg (01/18/2026)',
    height: '168 cm',
    bloodType: 'B-',
    healthLife: 'Yes'
  },
  'THOMAS, MICHAEL': {
    mrn: '1000245683',
    axioId: 'AXSL06-MT123',
    gender: 'Male',
    age: '45Y 6M',
    allergies: 'No Known Allergies',
    dob: '01/10/1981 (45Y)',
    weight: '80.0 kg (03/30/2026)',
    height: '182 cm',
    bloodType: 'A+',
    healthLife: 'Yes'
  },
  'ANDERSON, SUSAN': {
    mrn: '1000245688',
    axioId: 'AXSL06-SA130',
    gender: 'Female',
    age: '50Y 1M',
    allergies: 'Sulfa Drugs',
    dob: '05/16/1976 (50Y)',
    weight: '66.2 kg (05/10/2026)',
    height: '164 cm',
    bloodType: 'O+',
    healthLife: 'Yes'
  },
  'MILLER, ROBERT': {
    mrn: '1000245689',
    axioId: 'AXSL06-RM133',
    gender: 'Male',
    age: '68Y 7M',
    allergies: 'Penicillin',
    dob: '12/03/1957 (68Y)',
    weight: '88.1 kg (04/05/2026)',
    height: '175 cm',
    bloodType: 'A-',
    healthLife: 'Yes'
  },
  'DAVIS, PATRICIA': {
    mrn: '1000245690',
    axioId: 'AXSL06-PD140',
    gender: 'Female',
    age: '72Y 3M',
    allergies: 'No Known Allergies',
    dob: '03/28/1954 (72Y)',
    weight: '61.5 kg (02/14/2026)',
    height: '160 cm',
    bloodType: 'AB-',
    healthLife: 'Yes'
  }
};

export const extensionApps = [
  { name: 'AccessHIM P115 UMCTX', key: 'AccessHIM' },
  { name: 'Anesthesia P115 UMCTX', key: 'Anesthesia' },
  { name: 'AppBar P115 UMCTX', key: 'AppBar' },
  { name: 'CPDI Validation P115 UMCTX', key: 'CPDI' },
  { name: 'FirstNet P115 UMCTX', key: 'FirstNet' },
  { name: 'NEXT Bar P115 UMCTX', key: 'NEXTBar' },
  { name: 'PowerChart P115 UMCTX', key: 'PowerChart' },
  { name: 'Registration Access Management', key: 'Registration' },
  { name: 'Report Request P115 UMCTX', key: 'ReportRequest' },
  { name: 'RevCycle P115 UMCTX', key: 'RevCycle' },
  { name: 'SkyVue P115 UMCTX', key: 'SkyVue' },
  { name: 'Stafflink P115 UMCTX', key: 'Stafflink' },
  { name: 'Surginet P115 UMCTX', key: 'Surginet' },
  { name: 'User Folder P115 UMCTX', key: 'UserFolder' },
  { name: 'zIssueCollector P115 UMCTX', key: 'zIssueCollector' },
  { name: 'zMTA P115 UMCTX', key: 'zMTA' }
];

export const getAppIcon = (key: string) => {
  switch (key) {
    case 'AccessHIM':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#2980b9] rounded-md shadow-md border border-[#1f5f8b]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      );
    case 'Anesthesia':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#27ae60] rounded-md shadow-md border border-[#1e8449]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      );
    case 'AppBar':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#2980b9] rounded-md shadow-md text-white font-black text-xl border border-[#1f5f8b]">
          A
        </div>
      );
    case 'CPDI':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#34495e] rounded-md shadow-md border border-[#2c3e50]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
      );
    case 'FirstNet':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#c0392b] rounded-md shadow-md border border-[#962d22]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
      );
    case 'NEXTBar':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#8e44ad] rounded-md shadow-md border border-[#732d91]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
      );
    case 'PowerChart':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#1abc9c] rounded-md shadow-md text-white font-black text-xl border border-[#16a085]">
          P
        </div>
      );
    case 'Registration':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#16a085] rounded-md shadow-md border border-[#117a65]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    case 'ReportRequest':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#2980b9] rounded-md shadow-md border border-[#1f5f8b]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
      );
    case 'RevCycle':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#27ae60] rounded-md shadow-md text-white font-black text-xl border border-[#1e8449]">
          R
        </div>
      );
    case 'SkyVue':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#2c3e50] rounded-md shadow-md border border-[#1a252f]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
      );
    case 'Stafflink':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#2980b9] rounded-md shadow-md text-white font-black text-lg border border-[#1f5f8b]">
          CA
        </div>
      );
    case 'Surginet':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#27ae60] rounded-md shadow-md text-white font-black text-xl border border-[#1e8449]">
          S
        </div>
      );
    case 'UserFolder':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#f39c12] rounded-md shadow-md border border-[#c27d0e]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      );
    case 'zIssueCollector':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#2980b9] rounded-md shadow-md border border-[#1f5f8b]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      );
    case 'zMTA':
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#7f8c8d] rounded-md shadow-md border border-[#626e6f]">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md text-xl">
          📦
        </div>
      );
  }
};


export default function SharedConstantsPage() {
  return null;
}

export const mockOrdersData = [
  { patientName: 'JAMES, WILLIAM', orderPlanName: 'CBC with Differential', action: 'Plan', detailsDate: '05/28/17 08:30', detailsDesc: 'Routine blood count', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 08:30', stopDate: '05/28/2017 08:30', stopType: 'Physician Stop', status: 'Completed' },
  { patientName: 'JAMES, WILLIAM', orderPlanName: 'Comprehensive Metabolic Panel', action: 'Plan', detailsDate: '05/28/17 08:30', detailsDesc: 'Kidney & liver function', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 08:30', stopDate: '05/28/2017 08:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'PATEL, RAHUL', orderPlanName: 'MRI Brain W/O Contrast', action: 'Plan', detailsDate: '05/28/17 09:15', detailsDesc: 'Headache evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 09:15', stopDate: '05/28/2017 09:15', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'PATEL, RAHUL', orderPlanName: 'Referral to City Neuro Hospital', action: 'Referral', detailsDate: '05/28/17 09:15', detailsDesc: 'Transfer for advanced neuro care', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 09:15', stopDate: '05/28/2017 09:15', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'JOHNSON, MARIA', orderPlanName: 'PT Evaluation', action: 'Plan', detailsDate: '05/28/17 10:00', detailsDesc: 'Post-op rehab', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:00', stopDate: '05/28/2017 10:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'JOHNSON, MARIA', orderPlanName: 'Referral to St. Mary Regional Medical', action: 'Referral', detailsDate: '05/28/17 10:00', detailsDesc: 'Transfer for specialty pain mgmt', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:00', stopDate: '05/28/2017 10:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'LEE, DAVID', orderPlanName: 'Chest X-Ray', action: 'Plan', detailsDate: '05/28/17 10:30', detailsDesc: 'Cough and fever', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:30', stopDate: '05/28/2017 10:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'LEE, DAVID', orderPlanName: 'Sputum Culture', action: 'Plan', detailsDate: '05/28/17 10:30', detailsDesc: 'Infection workup', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:30', stopDate: '05/28/2017 10:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'GARCIA, LUCIA', orderPlanName: 'Echocardiogram', action: 'Plan', detailsDate: '05/28/17 11:00', detailsDesc: 'Cardiac evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:00', stopDate: '05/28/2017 11:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'GARCIA, LUCIA', orderPlanName: 'Referral to Metro Heart Institute', action: 'Referral', detailsDate: '05/28/17 11:00', detailsDesc: 'Transfer for cardiac surgery eval', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:00', stopDate: '05/28/2017 11:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'KIM, JAMES', orderPlanName: 'Hemoglobin A1C', action: 'Plan', detailsDate: '05/28/17 11:30', detailsDesc: 'Diabetes monitoring', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:30', stopDate: '05/28/2017 11:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'KIM, JAMES', orderPlanName: 'Diabetes Education', action: 'Plan', detailsDate: '05/28/17 11:30', detailsDesc: 'Patient education', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:30', stopDate: '05/28/2017 11:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'BROWN, ELIZABETH', orderPlanName: 'Urinalysis', action: 'Plan', detailsDate: '05/28/17 12:00', detailsDesc: 'UTI symptoms', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:00', stopDate: '05/28/2017 12:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'BROWN, ELIZABETH', orderPlanName: 'Urine Culture', action: 'Plan', detailsDate: '05/28/17 12:00', detailsDesc: 'Confirm infection', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:00', stopDate: '05/28/2017 12:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'THOMAS, MICHAEL', orderPlanName: 'CT Abdomen & Pelvis', action: 'Plan', detailsDate: '05/28/17 12:30', detailsDesc: 'Abdominal pain', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:30', stopDate: '05/28/2017 12:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'THOMAS, MICHAEL', orderPlanName: 'Referral to General Surgical Center', action: 'Referral', detailsDate: '05/28/17 12:30', detailsDesc: 'Transfer for emergency surgery', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:30', stopDate: '05/28/2017 12:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'ANDERSON, SUSAN', orderPlanName: 'Lipid Panel', action: 'Plan', detailsDate: '05/28/17 13:00', detailsDesc: 'Cholesterol check', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:00', stopDate: '05/28/2017 13:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'ANDERSON, SUSAN', orderPlanName: 'Nutrition Consult', action: 'Plan', detailsDate: '05/28/17 13:00', detailsDesc: 'Dietary counseling', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:00', stopDate: '05/28/2017 13:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'MILLER, ROBERT', orderPlanName: 'Pulmonary Function Test', action: 'Plan', detailsDate: '05/28/17 13:30', detailsDesc: 'COPD evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:30', stopDate: '05/28/2017 13:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'MILLER, ROBERT', orderPlanName: 'Referral to Pulmonary Care Hospital', action: 'Referral', detailsDate: '05/28/17 13:30', detailsDesc: 'Transfer for advanced COPD care', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:30', stopDate: '05/28/2017 13:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'DAVIS, PATRICIA', orderPlanName: 'DEXA Scan', action: 'Plan', detailsDate: '05/28/17 14:00', detailsDesc: 'Bone density', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:00', stopDate: '05/28/2017 14:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'DAVIS, PATRICIA', orderPlanName: 'Vitamin D Level', action: 'Plan', detailsDate: '05/28/17 14:00', detailsDesc: 'Bone health', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:00', stopDate: '05/28/2017 14:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'WHITE, CHARLES', orderPlanName: 'Sleep Study', action: 'Plan', detailsDate: '05/28/17 14:30', detailsDesc: 'Sleep apnea evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:30', stopDate: '05/28/2017 14:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'WHITE, CHARLES', orderPlanName: 'Referral to Sleep Disorders Clinic', action: 'Referral', detailsDate: '05/28/17 14:30', detailsDesc: 'Transfer for sleep study & ENT eval', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:30', stopDate: '05/28/2017 14:30', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'WILSON, BETTY', orderPlanName: 'Mammogram Screening', action: 'Plan', detailsDate: '05/28/17 15:00', detailsDesc: 'Breast cancer screening', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 15:00', stopDate: '05/28/2017 15:00', stopType: 'Physician Stop', status: 'Open' },
  { patientName: 'WILSON, BETTY', orderPlanName: 'Ob/Gyn Annual Exam', action: 'Plan', detailsDate: '05/28/17 15:00', detailsDesc: 'Routine exam', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 15:00', stopDate: '05/28/2017 15:00', stopType: 'Physician Stop', status: 'Open' }
];

export const patientDirectoryData = [
  { name: 'TEST, NEWMERGE ONE', lengthOfStay: '46.7 Days', mrn: '64802090', finReqId: '64802090', age: '56 years', dob: '01/01/61', admittedRequested: '05/29/17 20:00 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'TESTING MERGE ACCOUNTS', primaryCare: 'Sanders MD, Michael Lawrence' },
  { name: 'PHARMDRC, EIGHTMONTH', lengthOfStay: '43.0 Days', mrn: '64802042', finReqId: '64802042', age: '9 months', dob: '09/22/16', admittedRequested: '05/22/17 17:00 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'pain', primaryCare: '' },
  { name: 'UCTEST, CPABBLINGCOMB', lengthOfStay: '120.0 Days', mrn: '64801201', finReqId: '64801201', age: '8 years', dob: '03/14/09', admittedRequested: '03/06/17 15:00 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'headache', primaryCare: '' },
  { name: 'PHARMDRC, EIGHTYEAR', lengthOfStay: '43.0 Days', mrn: '64802043', finReqId: '64802043', age: '8 years', dob: '05/22/09', admittedRequested: '05/22/17 17:12 CDT', admittingPhysician: '', visitReason: 'pain', primaryCare: 'Dr. A. Verma (Cardiology)' },
  { name: 'PHARMDRC, EIGHTYEARCP', lengthOfStay: '43.0 Days', mrn: '64802044', finReqId: '64802044', age: '8 years', dob: '05/22/09', admittedRequested: '05/22/17 17:17 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: '', primaryCare: 'Dr. M. Roy (Oncology)' },
  { name: 'TESTRODNEY, INPATIENT', lengthOfStay: '18.2 Days', mrn: '64802647', finReqId: '64802647', age: '39 years', dob: '05/25/78', admittedRequested: '05/24/17 08:30 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'hkj / Transfer Req', primaryCare: 'Dr. S. Nair (Neurology)' },
  { name: 'MEDTEST, JR', lengthOfStay: '16.1 Days', mrn: '64801906', finReqId: '64801906', age: '41 years', dob: '09/24/75', admittedRequested: '06/19/17 09:15 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'chest pain', primaryCare: 'Moulder MD, Rebekah Wilbourn' },
  { name: 'UCTEST, CPADEFECTTVVO', lengthOfStay: '117.9 Days', mrn: '64801227', finReqId: '64801227', age: '25 years', dob: '10/14/91', admittedRequested: '03/09/17 13:16 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'headache', primaryCare: 'Sanders MD, Michael Lawrence' },
  { name: 'ZZZTEST, BRADADMISSIONTWO', lengthOfStay: '173.9 Days', mrn: '64802066', finReqId: '64802066', age: '26 years', dob: '11/11/90', admittedRequested: '01/12/17 14:10 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'chest pain', primaryCare: 'Shekoni MD, Nurudeen Arellku' },
  { name: 'AWESOMEDUDEONE, MEME', lengthOfStay: '42.9 Days', mrn: '64802086', finReqId: '64802086', age: '54 years', dob: '12/23/62', admittedRequested: '05/23/17 16:20 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'CHEST PAIN', primaryCare: 'LayneTEST MD, Scott Christopher' },
  { name: 'QUALITYCONNECT, AMY', lengthOfStay: '225.0 Days', mrn: '64800472', finReqId: '64800472', age: '29 years', dob: '02/10/88', admittedRequested: '11/22/16 10:54 CST', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'abnormal lab', primaryCare: 'Sanders MD, Michael Lawrence' },
  { name: 'NURSING, RENAL', lengthOfStay: '49.9 Days', mrn: '64801954', finReqId: '64801954', age: '65 years', dob: '02/02/52', admittedRequested: '05/16/17 14:04 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'UTI', primaryCare: 'Dr. P. Das (ENT)' },
  { name: 'PHARMDRC, THIRTEEN', lengthOfStay: '43.9 Days', mrn: '64802029', finReqId: '64802029', age: '13 years', dob: '05/21/04', admittedRequested: '05/22/17 14:53 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'NAUSEA/VOMITING', primaryCare: 'City Hospital Referral' },
  { name: 'QUALITYCONNECT, OMNICELL ONE', lengthOfStay: '217.9 Days', mrn: '64800575', finReqId: '64800575', age: '43 years', dob: '06/23/74', admittedRequested: '11/28/16 13:33 CST', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'back pain', primaryCare: 'Apex Clinic Referral' },
  { name: 'QUALITYCONNECT, SENTRE SEVEN', lengthOfStay: '217.9 Days', mrn: '64800576', finReqId: '64800576', age: '71 years', dob: '05/33/46', admittedRequested: '11/28/16 13:46 CST', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'surgery', primaryCare: 'Dr. D. Patel (Oncology)' },
  { name: 'PHARMDRC, ONEMONTH', lengthOfStay: '43.9 Days', mrn: '64802036', finReqId: '64802036', age: '2 months', dob: '04/22/17', admittedRequested: '05/22/17 15:35 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'HIGH FEVER', primaryCare: 'Torrey MD, Brian Scott' },
  { name: 'NURSING, ICUWEST', lengthOfStay: '49.8 Days', mrn: '64801364', finReqId: '64801364', age: '65 years', dob: '02/02/52', admittedRequested: '05/16/17 18:00 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'trouble breathing', primaryCare: 'ICU Transfer Bed Req' },
  { name: 'TESTANGY, DONOTDISCHARGE', lengthOfStay: '132.0 Days', mrn: '64800761', finReqId: '64800761', age: '25 years', dob: '01/04/92', admittedRequested: '01/04/17 11:23 CST', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'Chest Pain', primaryCare: 'LayneTEST MD, Scott Christopher' },
  { name: 'TEST, ALLERGY', lengthOfStay: '47.9 Days', mrn: '64801995', finReqId: '64801995', age: '22 years', dob: '06/04/95', admittedRequested: '05/18/17 15:47 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'testing', primaryCare: 'Dr. G. Jones' },
  { name: 'QUALITYCONNECT, SUSAN', lengthOfStay: '29.9 Days', mrn: '64800983', finReqId: '64800983', age: '38 years', dob: '10/08/78', admittedRequested: '06/05/17 08:14 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'test / Second Opinion', primaryCare: 'Torrey MD, Brian Scott' }
];

export const mockChartData = [
  { time: '08:00', dns: 50, conn: 330, secure: 220, req: 1500, resp: 0.1, total: 1800, status: 1, success: 100 },
  { time: '08:05', dns: 10, conn: 330, secure: 225, req: 180, resp: 1.0, total: 600, status: 1, success: 100 },
  { time: '08:10', dns: 40, conn: 330, secure: 220, req: 180, resp: 0.1, total: 600, status: 1, success: 100 },
  { time: '08:15', dns: 15, conn: 330, secure: 225, req: 1400, resp: 0.1, total: 1700, status: 1, success: 100 },
  { time: '08:20', dns: 45, conn: 360, secure: 250, req: 180, resp: 0.1, total: 600, status: 1, success: 100 },
  { time: '08:25', dns: 20, conn: 360, secure: 250, req: 1700, resp: 0.1, total: 2100, status: 1, success: 100 },
  { time: '08:30', dns: 55, conn: 360, secure: 250, req: 180, resp: 1.0, total: 600, status: 1, success: 100 },
  { time: '08:35', dns: 25, conn: 330, secure: 220, req: 1500, resp: 0.1, total: 1800, status: 1, success: 100 },
  { time: '08:40', dns: 50, conn: 330, secure: 225, req: 180, resp: 0.1, total: 600, status: 1, success: 100 },
  { time: '08:45', dns: 30, conn: 360, secure: 250, req: 1800, resp: 1.0, total: 2100, status: 1, success: 100 }
];
