'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, Maximize2, Printer, RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TabItem {
  id: string;
  title: string;
  type: 'MessageCenter' | 'Analytics' | 'PatientList' | 'Notifications' | 'PatientProfile' | 'EditPatientProfile' | 'MedicalReport' | 'HelpCentre' | 'RescheduleRequests' | 'AdmitPatient' | 'ReferralTransfer' | 'DischargeList' | 'DeveloperTools' | 'Orders' | 'Home' | 'PatientNotes' | 'Labs' | 'BillingReceipt' | 'Customised' | 'ClinicalDecisionSupport';
}

const CHART_OPTIONS = [
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

const getChartDataForSelection = (baseData: any[], selection: string, chartKey: string) => {
  if (!selection || selection === 'Quick View' || selection === 'All Results') {
    return baseData;
  }
  
  let hash = 0;
  for (let i = 0; i < selection.length; i++) {
    hash = selection.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return baseData.map((d, index) => {
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

const patientDemographics: Record<string, {
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
}> = {
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [messageCenterView, setMessageCenterView] = useState<'list' | 'detail'>('list');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  // Draggable popup cards for message center / notifications
  const [openMessagePopups, setOpenMessagePopups] = useState<Array<{
    id: string;
    x: number;
    y: number;
    zIndex: number;
    patientName: string;
    mrn: string;
    axioId: string;
    gender: string;
    dob: string;
    weight: string;
    height: string;
    bloodType: string;
    healthLife: string;
    allergies: string;
    subject: string;
    date: string;
    content: string;
  }>>([]);
  const [maxZIndex, setMaxZIndex] = useState(200);
  const [draggingPopupId, setDraggingPopupId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartCoord, setDragStartCoord] = useState({ x: 0, y: 0 });

  const handleStartDrag = (id: string, e: React.MouseEvent) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setOpenMessagePopups(prev => prev.map(p => p.id === id ? { ...p, zIndex: newZ } : p));
    setDraggingPopupId(id);
    const popup = openMessagePopups.find(p => p.id === id);
    if (popup) {
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setDragStartCoord({ x: popup.x, y: popup.y });
    }
    e.preventDefault();
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingPopupId) return;
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    setOpenMessagePopups(prev => prev.map(p => p.id === draggingPopupId ? {
      ...p,
      x: dragStartCoord.x + dx,
      y: dragStartCoord.y + dy
    } : p));
  };

  const handleEndDrag = () => {
    setDraggingPopupId(null);
  };

  const openMessagePopupCard = (row: any) => {
    const id = Math.random().toString();
    const offset = (openMessagePopups.length % 8) * 28;
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    
    // Determine details
    const patientName = row.patientName ? row.patientName.toUpperCase() : (row.patient && row.patient !== '—' ? row.patient.toUpperCase() : 'SYSTEM ALERT');
    const mrn = row.mrn && row.mrn !== '—' ? row.mrn : '1000245601';
    const allergies = patientName.includes('JAMES') ? 'Penicillin, Sulfa' : 'No Known Allergies';
    const gender = patientName.includes('JAMES') || patientName.includes('LEE') || patientName.includes('THOMAS') || patientName.includes('PATEL') ? 'Male' : 'Female';
    const dob = patientName.includes('JAMES') ? '04/12/1974 (52Y)' : '10/10/1980 (45Y)';
    const weight = patientName.includes('JAMES') ? '78.4 kg (05/20/2026)' : '72.0 kg (05/20/2026)';
    const height = patientName.includes('JAMES') ? '180 cm' : '172 cm';
    const bloodType = patientName.includes('JAMES') ? 'A+' : 'O+';
    
    const subject = `Clinical Note Ready for Review - ${row.orderPlanName || row.name || 'CBC with Differential'}`;
    const content = `The clinical note for patient ${patientName} (MRN: ${mrn}) is ready to review and sign in AxioNote. Please click the link below or use the Clinical menu > AxioNote - Edge Platform from the top toolbar to launch the platform.`;

    const newPopup = {
      id,
      x: 180 + offset,
      y: 140 + offset,
      zIndex: newZ,
      patientName,
      mrn,
      axioId: patientName.includes('JAMES') ? 'AXSL06-WJ281' : 'AXSL06-MOCK',
      gender,
      dob,
      weight,
      height,
      bloodType,
      healthLife: 'Yes',
      allergies,
      subject,
      date: row.createDate || row.dateTime || '05/28/2025 03:42 PM',
      content
    };

    setOpenMessagePopups(prev => [...prev, newPopup]);
  };

  // Context menu for multi-patient selection
  const [selectedPatientMrns, setSelectedPatientMrns] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean } | null>(null);

  // Patient notes state map
  const [patientNotesMap, setPatientNotesMap] = useState<Record<string, string>>({
    '1000245678': `Assessment/Plan
1. ST elevation (STEMI) myocardial infarction involving right coronary artery
   
2. Acute diverticulitis

Orders:
temazepam, 15 mg, = 1 cap, Oral, Cap, HS, PRN sleep, First Dose: 10/22/17 15:54:00 CDT

Subjective

Review of Systems

Physical Exam
Vitals & Measurements

Intake and Output
No qualifying data available.`
  });

  // Structured note components for active editing
  const [assessmentItems, setAssessmentItems] = useState<string[]>([
    '1. ST elevation (STEMI) myocardial infarction involving right coronary artery',
    '2. Acute diverticulitis'
  ]);
  const [ordersItems, setOrdersItems] = useState<string[]>([
    'temazepam, 15 mg, = 1 cap, Oral, Cap, HS, PRN sleep, First Dose: 10/22/17 15:54:00 CDT'
  ]);
  const [noteSubjective, setNoteSubjective] = useState<string>('');
  const [noteRos, setNoteRos] = useState<string>('Review of Systems');
  const [notePe, setNotePe] = useState<string>(`Physical Exam\nVitals & Measurements`);
  const [noteIo, setNoteIo] = useState<string>(`Intake and Output\nNo qualifying data available.`);

  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [newAssessmentInput, setNewAssessmentInput] = useState<string>('');
  const [newOrderInput, setNewOrderInput] = useState<string>('');

  // Note details panel states
  const [showNoteDetailsPanel, setShowNoteDetailsPanel] = useState<boolean>(true);
  const [selectedNoteTemplate, setSelectedNoteTemplate] = useState<string>('Office Visit Note');

  // Context menu state for right-clicking patient names
  const [patientContextMenu, setPatientContextMenu] = useState<{
    x: number;
    y: number;
    patientName: string;
    patientMrn: string;
  } | null>(null);

  // Sign / Submit modal states
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [signType1, setSignType1] = useState<string>('Office/Clinic Note-Physician');
  const [signType2, setSignType2] = useState<string>('Personal Note Type List');
  const [signTitleVal, setSignTitleVal] = useState<string>('Office Visit Note');
  const [signDateVal, setSignDateVal] = useState<string>('18-Feb-2015');
  const [signTimeVal, setSignTimeVal] = useState<string>('11:11');
  const [signTimezoneVal, setSignTimezoneVal] = useState<string>('PST');
  const [signAuthorVal, setSignAuthorVal] = useState<string>('Patterson, Stanley C');

  const syncToTextMap = (
    assess: string[],
    orders: string[],
    subj: string,
    rosVal: string,
    peVal: string,
    ioVal: string
  ) => {
    const formatted = `Assessment/Plan
${assess.map(x => x).join('\n')}

Orders:
${orders.map(x => x).join('\n')}

Subjective
${subj}

${rosVal}

${peVal}

${ioVal}`;
    setPatientNotesMap(prev => ({
      ...prev,
      '1000245678': formatted
    }));
  };

  React.useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      setPatientContextMenu(null);
      if (selectedPatientMrns.length > 1) {
        e.preventDefault();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          visible: true
        });
      }
    };

    const handleGlobalClick = () => {
      setContextMenu(null);
      setPatientContextMenu(null);
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [selectedPatientMrns]);
  
  const [chartSelections, setChartSelections] = useState<Record<string, string>>({
    dns: 'Quick View',
    conn: 'Quick View',
    secure: 'Quick View',
    req: 'Quick View',
    resp: 'Quick View',
    total: 'Quick View',
    status: 'Quick View',
    success: 'Quick View',
  });
  const [openDropdownChart, setOpenDropdownChart] = useState<string | null>(null);
  
  // Chrome browser style tabs state
  const [openTabs, setOpenTabs] = useState<TabItem[]>([
    { id: 'patient-doe', title: 'Patient Profile: JOHN DOE', type: 'PatientProfile' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('patient-doe');

  // Sidebar navigation paths for Analytics
  const [analyticsMenu, setAnalyticsMenu] = useState('Overview');
  const [expandedAnalyticsSections, setExpandedAnalyticsSections] = useState<Record<string, boolean>>({
    Dashboards: true,
    Clinical: true,
    Operational: true,
    Financial: true,
    CustomReports: true,
    DataManagement: true,
  });

  // Patient Directory Search State
  const [pdSearchBy, setPdSearchBy] = useState('Name');
  const [pdSearchText, setPdSearchText] = useState('');
  const [pdMrn, setPdMrn] = useState('');
  const [pdUhid, setPdUhid] = useState('');
  const [oracleComponents, setOracleComponents] = useState<Record<string, boolean>>({
    Imaging: true,
    IpmRepository: false,
    LinkManager: true,
    MSOfficeHtmlConverterSupport: false,
    OracleDocumentsFolders: false,
    PDFWatermark: false,
    PortalVCRHelper: true,
    RedwoodUI: true,
    SESCrawlerExport: true,
    SharedLinks: true,
    SiebelEcmIntegration: false,
    SiebelFilter: false
  });
  const [pdDob, setPdDob] = useState('');
  const [pdPhone, setPdPhone] = useState('');

  // Clinical Decision Support states
  const [cdsDrugDrug, setCdsDrugDrug] = useState(true);
  const [cdsDrugAllergy, setCdsDrugAllergy] = useState(true);
  const [cdsDuplicateTherapy, setCdsDuplicateTherapy] = useState(true);
  const [cdsRenalDosing, setCdsRenalDosing] = useState(true);
  const [cdsGeriatric, setCdsGeriatric] = useState(false);
  const [cdsSeverityThreshold, setCdsSeverityThreshold] = useState('Medium & Critical');
  const [cdsSepsisRule, setCdsSepsisRule] = useState(true);
  const [cdsRetinopathyRule, setCdsRetinopathyRule] = useState(true);
  const [cdsFluVaccineRule, setCdsFluVaccineRule] = useState(false);
  const [cdsInterruptiveAlerts, setCdsInterruptiveAlerts] = useState(true);
  const [cdsBannerAlerts, setCdsBannerAlerts] = useState(true);
  const [cdsSidebarAlerts, setCdsSidebarAlerts] = useState(false);
  const [cdsAuditLogs, setCdsAuditLogs] = useState([
    { id: 1, timestamp: '2026-07-24 10:14:02', ruleName: 'Drug-Drug Interaction', patientName: 'JAMES, WILLIAM', severity: 'Critical', alertText: 'Interaction detected between Warfarin and Aspirin (High Bleeding Risk)', action: 'Overridden', clinician: 'Dr. Sarah Connor', reason: 'Patient on strict coagulation monitoring; benefit outweighs risk.' },
    { id: 2, timestamp: '2026-07-24 09:30:15', ruleName: 'Sepsis Early Detection', patientName: 'PATEL, RAHUL', severity: 'Critical', alertText: 'SIRS criteria met: Temp > 38.3C, HR > 90 bpm, WBC > 12k', action: 'Accepted', clinician: 'Dr. Sarah Connor', reason: 'Lactate ordered and broad-spectrum antibiotics initiated.' },
    { id: 3, timestamp: '2026-07-23 15:45:30', ruleName: 'Drug-Allergy Alert', patientName: 'JOHNSON, MARIA', severity: 'Critical', alertText: 'Patient allergic to Penicillin. Ordered: Amoxicillin', action: 'Cancelled / Order Changed', clinician: 'Dr. David Lee', reason: 'Order cancelled, changed to Azithromycin.' },
    { id: 4, timestamp: '2026-07-23 14:10:08', ruleName: 'Renal Dosage Adjustment', patientName: 'LEE, DAVID', severity: 'Warning', alertText: 'Creatinine Clearance < 30 mL/min. Ceftriaxone dosage adjustment recommended.', action: 'Overridden', clinician: 'Dr. Sarah Connor', reason: 'Standard loading dose required; maintenance dose will be adjusted.' },
    { id: 5, timestamp: '2026-07-23 11:22:50', ruleName: 'Duplicate Therapy Alert', patientName: 'PATEL, RAHUL', severity: 'Warning', alertText: 'Duplicate therapy warning: Acetaminophen ordered while patient has active Tylenol PRN.', action: 'Accepted', clinician: 'Dr. David Lee', reason: 'Cancelled duplicate order.' }
  ]);

  // Notifications Filter State
  const [notifType, setNotifType] = useState('All');
  const [notifPriority, setNotifPriority] = useState('All');
  const [notifStatus, setNotifStatus] = useState('All');
  const [notifFromDate, setNotifFromDate] = useState('28/04/2025');
  const [notifToDate, setNotifToDate] = useState('28/05/2025');
  const [notifSearch, setNotifSearch] = useState('');

  // Patient Profile Section State
  const [profileTab, setProfileTab] = useState('Demographics');
  const [profileSidebarOption, setProfileSidebarOption] = useState('Op Note - Prod - Edge');
  const [selectedDocIndex, setSelectedDocIndex] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reconciliation Popup State
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isDetailedOrderActive, setIsDetailedOrderActive] = useState(false);
  const [reconcilePos, setReconcilePos] = useState({ x: 100, y: 80 });
  const [isDraggingReconcile, setIsDraggingReconcile] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Sub-detail Popup State
  const [isSubPopupOpen, setIsSubPopupOpen] = useState(false);
  const [subPopupPos, setSubPopupPos] = useState({ x: 250, y: 150 });
  const [isDraggingSub, setIsDraggingSub] = useState(false);
  const [dragOffsetSub, setDragOffsetSub] = useState({ x: 0, y: 0 });
  const [selectedMedReconcile, setSelectedMedReconcile] = useState<any>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dragging handlers for Reconciliation and Sub-detail popups
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingReconcile) {
        setReconcilePos({
          x: Math.max(0, e.clientX - dragOffset.x),
          y: Math.max(0, e.clientY - dragOffset.y),
        });
      }
      if (isDraggingSub) {
        setSubPopupPos({
          x: Math.max(0, e.clientX - dragOffsetSub.x),
          y: Math.max(0, e.clientY - dragOffsetSub.y),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingReconcile) setIsDraggingReconcile(false);
      if (isDraggingSub) setIsDraggingSub(false);
    };

    if (isDraggingReconcile || isDraggingSub) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingReconcile, dragOffset, isDraggingSub, dragOffsetSub]);

  const [showConversationLauncher, setShowConversationLauncher] = React.useState(false);

  // Edit Patient Form State matching John Doe credentials
  const [editLastName, setEditLastName] = useState('Doe');
  const [editFirstName, setEditFirstName] = useState('John');
  const [editMiddleInitial, setEditMiddleInitial] = useState('A');
  const [editMrn, setEditMrn] = useState('1000245678');
  const [editSsn, setEditSsn] = useState('237-84-5988');
  const [editDob, setEditDob] = useState('03/12/1979');
  const [editAge, setEditAge] = useState('45 Yrs');
  const [editSex, setEditSex] = useState('Male');
  const [editMaritalStatus, setEditMaritalStatus] = useState('Married');
  const [editOccupation, setEditOccupation] = useState('Teacher');
  const [editEthnicity, setEditEthnicity] = useState('Not Hispanic or Latino');
  const [editLanguage, setEditLanguage] = useState('English');
  const [editNationality, setEditNationality] = useState('American');
  const [editPrimaryInsurance, setEditPrimaryInsurance] = useState('Blue Cross / Blue Shield');
  const [editInsuranceId, setEditInsuranceId] = useState('47815879');
  const [editAddress, setEditAddress] = useState('7235 SW 48th St');
  const [editCity, setEditCity] = useState('Miami');
  const [editState, setEditState] = useState('FL');
  const [editZip, setEditZip] = useState('33155');
  const [editCountry, setEditCountry] = useState('USA');
  const [editPhone, setEditPhone] = useState('(305) 666-5599');
  const [editMobile, setEditMobile] = useState('(305) 666-5015');
  const [editFax, setEditFax] = useState('(305) 666-5560');
  const [editEmail, setEditEmail] = useState('jenwatts@aol.net');
  const [editAlternateEmail, setEditAlternateEmail] = useState('');
  const [editReferringPhysician, setEditReferringPhysician] = useState('Dr. W. Garland');
  const [editAttendingPhysician, setEditAttendingPhysician] = useState('Dr. Herman Stewart');
  const [editFirstVisit, setEditFirstVisit] = useState('07/15/2004');
  const [editStatus, setEditStatus] = useState('Active');

  // Reschedule appointments filter states
  const [rsSearchBy, setRsSearchBy] = useState('Patient Name');
  const [rsSearchText, setRsSearchText] = useState('');
  const [rsRequestId, setRsRequestId] = useState('');
  const [rsProvider, setRsProvider] = useState('All');
  const [rsStatus, setRsStatus] = useState('All');
  const [rsFromDate, setRsFromDate] = useState('');
  const [rsToDate, setRsToDate] = useState('');

  // Reschedule requests state table rows matching mockup exactly
  const [rescheduleRequests, setRescheduleRequests] = useState([
    { id: 'REQ-2025-001245', name: 'Rahul Patel', mrn: '1000245679', current: '28/05/2025, 10:30 AM', dept: 'Dr. P. Singh (Neurology)', requested: '30/05/2025, 11:00 AM', reason: 'Reschedule: Patient Request', requestedOn: '28/05/2025, 09:15 AM by Rahul Patel (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001246', name: 'Maria Johnson', mrn: '1000245680', current: '28/05/2025, 11:00 AM', dept: 'Dr. S. Reddy (Cardiology)', requested: '31/05/2025, 09:30 AM', reason: 'Reschedule: Work Conflict', requestedOn: '28/05/2025, 09:20 AM by Maria Johnson (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001247', name: 'David Lee', mrn: '1000245681', current: '28/05/2025, 03:00 PM', dept: 'Dr. K. Iyer (Pulmonology)', requested: '29/05/2025, 04:00 PM', reason: 'Reschedule: Personal Emergency', requestedOn: '28/05/2025, 09:35 AM by David Lee (Patient)', priority: 'High', status: 'Reviewing', priorityColor: 'bg-red-50 text-red-800 border-red-200', statusColor: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'REQ-2025-001248', name: 'Lucia Garcia', mrn: '1000245682', current: '29/05/2025, 09:00 AM', dept: 'Dr. M. Desai (Oncology)', requested: '29/05/2025, 01:00 PM', reason: 'Reschedule: Travel', requestedOn: '28/05/2025, 10:05 AM by Lucia Garcia (Patient)', priority: 'Normal', status: 'Approved', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'REQ-2025-001249', name: 'Michael Thomas', mrn: '1000245683', current: '29/05/2025, 11:30 AM', dept: 'Dr. N. Verma (Dermatology)', requested: '30/05/2025, 10:00 AM', reason: 'Reschedule: Schedule Conflict', requestedOn: '28/05/2025, 10:12 AM by Michael Thomas (Patient)', priority: 'Normal', status: 'Declined', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'REQ-2025-001250', name: 'James Kim', mrn: '1000245684', current: '30/05/2025, 02:00 PM', dept: 'Dr. P. Nair (Diabetology)', requested: '02/06/2025, 11:00 AM', reason: 'Reschedule: Not Available', requestedOn: '28/05/2025, 10:25 AM by James Kim (Patient)', priority: 'Low', status: 'Pending', priorityColor: 'bg-green-50 text-green-800 border-green-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001251', name: 'Elizabeth Brown', mrn: '1000245685', current: '30/05/2025, 04:00 PM', dept: 'Dr. R. Menon (Nephrology)', requested: '31/05/2025, 04:30 PM', reason: 'Reschedule: Family Function', requestedOn: '28/05/2025, 10:45 AM by Elizabeth Brown (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001252', name: 'Charles White', mrn: '1000245686', current: '31/05/2025, 10:00 AM', dept: 'Dr. S. Malhotra (ENT)', requested: '02/06/2025, 09:00 AM', reason: 'Reschedule: Patient Request', requestedOn: '28/05/2025, 11:00 AM by Charles White (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
  ]);

  // Admit New Patient Form States matching exactly fields in mockup
  const [admitSearchBy, setAdmitSearchBy] = useState('Name');
  const [admitSearchFirst, setAdmitSearchFirst] = useState('');
  const [admitSearchLast, setAdmitSearchLast] = useState('');
  const [admitSearchAadhaar, setAdmitSearchAadhaar] = useState('');
  const [admitSearchDob, setAdmitSearchDob] = useState('');

  const [admitTitle, setAdmitTitle] = useState('Select');
  const [admitFirst, setAdmitFirst] = useState('');
  const [admitMiddle, setAdmitMiddle] = useState('');
  const [admitLast, setAdmitLast] = useState('');
  const [admitDobVal, setAdmitDobVal] = useState('');
  const [admitAgeVal, setAdmitAgeVal] = useState('');
  const [admitGender, setAdmitGender] = useState('Select');
  const [admitMarital, setAdmitMarital] = useState('Select');
  const [admitAadhaarVal, setAdmitAadhaarVal] = useState('');
  const [admitMobileVal, setAdmitMobileVal] = useState('');
  const [admitEmailVal, setAdmitEmailVal] = useState('');
  const [admitAltMobile, setAdmitAltMobile] = useState('');
  const [admitBlood, setAdmitBlood] = useState('Select');
  const [admitNation, setAdmitNation] = useState('Select');
  const [admitReligion, setAdmitReligion] = useState('Select');
  const [admitLang, setAdmitLang] = useState('Select');

  const [admitAddr1, setAdmitAddr1] = useState('');
  const [admitAddr2, setAdmitAddr2] = useState('');
  const [admitLandmark, setAdmitLandmark] = useState('');
  const [admitCityVal, setAdmitCityVal] = useState('');
  const [admitStateVal, setAdmitStateVal] = useState('Select');
  const [admitZipVal, setAdmitZipVal] = useState('');
  const [admitCountryVal, setAdmitCountryVal] = useState('India');

  const [admitTypeVal, setAdmitTypeVal] = useState('Select');
  const [admitVisitVal, setAdmitVisitVal] = useState('Select');
  const [admitDateVal, setAdmitDateVal] = useState('28/05/2025');
  const [admitTimeVal, setAdmitTimeVal] = useState('03:45 PM');
  const [admitReferredBy, setAdmitReferredBy] = useState('');
  const [admitRefDoctor, setAdmitRefDoctor] = useState('');
  const [admitDeptVal, setAdmitDeptVal] = useState('Select');
  const [admitBedRoom, setAdmitBedRoom] = useState('');
  const [admitInsPrimary, setAdmitInsPrimary] = useState('Select');
  const [admitInsIdVal, setAdmitInsIdVal] = useState('');
  const [admitPolicyId, setAdmitPolicyId] = useState('');

  // Reschedule popup modal state variables
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRescheduleReq, setSelectedRescheduleReq] = useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginError('');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setOpenTabs([{ id: 'patient-doe', title: 'Patient Profile: JOHN DOE', type: 'PatientProfile' }]);
    setActiveTabId('patient-doe');
  };

  const selectOrOpenTab = (type: TabItem['type'], title: string, id: string) => {
    if (type === 'MessageCenter') {
      setMessageCenterView('list');
      setSelectedMessage(null);
    }
    if (type === 'AdmitPatient') {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      setAdmitDateVal(`${dd}/${mm}/${yyyy}`);
      
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const strTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      setAdmitTimeVal(strTime);
    }
    setOpenTabs(prev => {
      const exists = prev.find(t => t.id === id);
      if (!exists) {
        return [...prev, { id, title, type }];
      }
      return prev;
    });
    setActiveTabId(id);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openTabs.length === 1) return;

    const targetIndex = openTabs.findIndex(t => t.id === id);
    const newTabs = openTabs.filter(t => t.id !== id);
    setOpenTabs(newTabs);

    if (activeTabId === id) {
      const nextActiveIndex = targetIndex > 0 ? targetIndex - 1 : 0;
      setActiveTabId(newTabs[nextActiveIndex].id);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        
        let activePatientName = 'JOHN DOE';
        let activePatientMrn = '1000245678';
        
        const currentActiveTab = openTabs.find(t => t.id === activeTabId);
        if (currentActiveTab && currentActiveTab.type === 'PatientProfile') {
          const prefix = 'Patient Profile: ';
          if (currentActiveTab.title.startsWith(prefix)) {
            activePatientName = currentActiveTab.title.substring(prefix.length);
          }
          if (currentActiveTab.id.startsWith('patient-')) {
            activePatientMrn = currentActiveTab.id.replace('patient-', '');
          }
        }
        
        const tabTitle = `Patient Notes: ${activePatientName}`;
        const tabId = `patient-notes-${activePatientMrn}`;
        selectOrOpenTab('PatientNotes', tabTitle, tabId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openTabs, activeTabId]);

  const activeTab = openTabs.find(t => t.id === activeTabId) || openTabs[0];

  // Save edit form modifications back to active state
  const handleSaveProfile = () => {
    // Switch view back to Patient Profile
    selectOrOpenTab('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe');
  };

  // Recharts mock data matching image trend analysis chart exactly
  const trendData = [
    { name: 'Apr 28', Actual: 14, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'May 5', Actual: 15.8, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'May 12', Actual: 13.2, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'May 19', Actual: 13, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'May 26', Actual: 12, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'Jun 2', Actual: 14, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'Jun 9', Actual: 12.8, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'Jun 16', Actual: 12.4, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
    { name: 'Jun 23', Actual: 10.2, Target: 12, Benchmark: 10, TopPerformer: 7.5 }
  ];

  // Mock table data for Performance by Department
  const departmentData = [
    { name: 'Cardiology', count: '2,842', pct: '15.2%', los: '3.6', readmit: '10.2%', mortality: '0.8%', sat: '92.1%', trend: 'up' },
    { name: 'Orthopedics', count: '2,156', pct: '11.5%', los: '2.9', readmit: '8.7%', mortality: '0.5%', sat: '93.4%', trend: 'stable' },
    { name: 'Pulmonology', count: '1,842', pct: '9.8%', los: '4.8', readmit: '12.4%', mortality: '1.1%', sat: '90.2%', trend: 'down' },
    { name: 'Neurology', count: '1,624', pct: '8.7%', los: '5.2', readmit: '13.6%', mortality: '1.3%', sat: '89.7%', trend: 'up' },
    { name: 'General Medicine', count: '3,645', pct: '19.5%', los: '4.1', readmit: '11.8%', mortality: '1.0%', sat: '91.3%', trend: 'stable' },
    { name: 'Emergency Medicine', count: '3,920', pct: '21.0%', los: '2.3', readmit: '9.6%', mortality: '0.7%', sat: '88.4%', trend: 'stable' },
    { name: 'Critical Care', count: '1,663', pct: '8.9%', los: '6.7', readmit: '15.2%', mortality: '2.1%', sat: '87.1%', trend: 'down' }
  ];

  // Mock Patient Directory rows data matching Cerner-style layout
  const patientDirectoryData = [
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
    { name: 'QUALITYCONNECT, SUSAN', lengthOfStay: '29.9 Days', mrn: '64800983', finReqId: '64800983', age: '38 years', dob: '10/08/78', admittedRequested: '06/05/17 08:14 CDT', admittingPhysician: 'Sanders MD, Michael Lawrence', visitReason: 'test / Second Opinion', primaryCare: 'Torrey MD, Brian Scott' },
  ];

  // Mock Notifications rows matching image 1:1 exactly
  const notificationRows = [
    { priority: 'High', priorityColor: 'text-red-600', icon: '🚨', name: 'Critical Lab Result', patient: 'James, William', mrn: '1000245678', category: 'Results', message: 'Critical Potassium level 2.8 mmol/L', dateTime: '28/05/2025 10:15 AM', status: 'Unread', statusColor: 'text-red-600 font-bold' },
    { priority: 'Medium', priorityColor: 'text-orange-600', icon: '✉️', name: 'New Order Received', patient: 'Patel, Rahul', mrn: '1000245679', category: 'Orders', message: 'MRI Brain WO Contrast', dateTime: '28/05/2025 09:48 AM', status: 'Unread', statusColor: 'text-red-600 font-bold' },
    { priority: 'Low', priorityColor: 'text-blue-600', icon: '⚙️', name: 'System Alert', patient: '—', mrn: '—', category: 'System', message: 'Scheduled system maintenance on 31/05/2025', dateTime: '28/05/2025 09:30 AM', status: 'Read', statusColor: 'text-gray-500' },
    { priority: 'Low', priorityColor: 'text-blue-600', icon: '🔔', name: 'Appointment Reminder', patient: 'Johnson, Maria', mrn: '1000245680', category: 'Reminders', message: 'Follow-up appointment on 30/05/2025 11:00 AM', dateTime: '28/05/2025 09:00 AM', status: 'Unread', statusColor: 'text-red-600 font-bold' },
    { priority: 'Medium', priorityColor: 'text-orange-600', icon: '📄', name: 'Document Pending', patient: 'Lee, David', mrn: '1000245681', category: 'Documents', message: 'Consent form pending signature', dateTime: '28/05/2025 08:45 AM', status: 'Unread', statusColor: 'text-red-600 font-bold' },
    { priority: 'Informational', priorityColor: 'text-green-600', icon: '📢', name: 'Update Available', patient: '—', mrn: '—', category: 'Updates', message: 'New features available in AxioVital', dateTime: '28/05/2025 08:30 AM', status: 'Read', statusColor: 'text-gray-500' },
    { priority: 'High', priorityColor: 'text-red-600', icon: '🚨', name: 'High Priority Message', patient: 'Garcia, Lucia', mrn: '1000245682', category: 'Messages', message: 'High Priority: Review patient allergies', dateTime: '27/05/2025 07:15 PM', status: 'Read', statusColor: 'text-gray-500' },
    { priority: 'Medium', priorityColor: 'text-orange-600', icon: '🧪', name: 'Lab Result Available', patient: 'Thomas, Michael', mrn: '1000245683', category: 'Results', message: 'HbA1c result is now available', dateTime: '27/05/2025 06:20 PM', status: 'Read', statusColor: 'text-gray-500' },
    { priority: 'Low', priorityColor: 'text-blue-600', icon: '🛡️', name: 'Protocol Update', patient: '—', mrn: '—', category: 'Updates', message: 'Diabetes Management Protocol updated', dateTime: '27/05/2025 05:45 PM', status: 'Read', statusColor: 'text-gray-500' },
    { priority: 'Medium', priorityColor: 'text-orange-600', icon: '📅', name: 'Schedule Change', patient: 'Brown, Elizabeth', mrn: '1000245685', category: 'Reminders', message: 'Appointment rescheduled to 01/06/2025 10:00 AM', dateTime: '27/05/2025 05:00 PM', status: 'Unread', statusColor: 'text-red-600 font-bold' }
  ];

  // Mock Orders Data matching the Orders tab mockup exactly
  const mockOrdersData = [
    { patientName: 'JAMES, WILLIAM', orderPlanName: 'CBC with Differential', action: 'Order', detailsDate: '05/28/17 08:30', detailsDesc: 'Routine blood test', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 08:30', stopDate: '05/28/2017 08:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'JAMES, WILLIAM', orderPlanName: 'Comprehensive Metabolic Panel', action: 'Order', detailsDate: '05/28/17 08:30', detailsDesc: 'Kidney & liver function', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 08:30', stopDate: '05/28/2017 08:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'PATEL, RAHUL', orderPlanName: 'MRI Brain W/O Contrast', action: 'Order', detailsDate: '05/28/17 09:15', detailsDesc: 'Headache evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 09:15', stopDate: '05/28/2017 09:15', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'PATEL, RAHUL', orderPlanName: 'Neurology Consult', action: 'Order', detailsDate: '05/28/17 09:15', detailsDesc: 'Neuro assessment', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 09:15', stopDate: '05/28/2017 09:15', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'JOHNSON, MARIA', orderPlanName: 'PT Evaluation', action: 'Order', detailsDate: '05/28/17 10:00', detailsDesc: 'Post-op rehab', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:00', stopDate: '05/28/2017 10:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'JOHNSON, MARIA', orderPlanName: 'Pain Management Consult', action: 'Order', detailsDate: '05/28/17 10:00', detailsDesc: 'Pain control', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:00', stopDate: '05/28/2017 10:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'LEE, DAVID', orderPlanName: 'Chest X-Ray', action: 'Order', detailsDate: '05/28/17 10:30', detailsDesc: 'Cough and fever', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:30', stopDate: '05/28/2017 10:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'LEE, DAVID', orderPlanName: 'Sputum Culture', action: 'Order', detailsDate: '05/28/17 10:30', detailsDesc: 'Infection workup', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 10:30', stopDate: '05/28/2017 10:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'GARCIA, LUCIA', orderPlanName: 'Echocardiogram', action: 'Order', detailsDate: '05/28/17 11:00', detailsDesc: 'Cardiac evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:00', stopDate: '05/28/2017 11:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'GARCIA, LUCIA', orderPlanName: 'Cardiology Consult', action: 'Order', detailsDate: '05/28/17 11:00', detailsDesc: 'Heart failure eval', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:00', stopDate: '05/28/2017 11:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'KIM, JAMES', orderPlanName: 'Hemoglobin A1C', action: 'Order', detailsDate: '05/28/17 11:30', detailsDesc: 'Diabetes monitoring', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:30', stopDate: '05/28/2017 11:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'KIM, JAMES', orderPlanName: 'Diabetes Education', action: 'Order', detailsDate: '05/28/17 11:30', detailsDesc: 'Patient education', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 11:30', stopDate: '05/28/2017 11:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'BROWN, ELIZABETH', orderPlanName: 'Urinalysis', action: 'Order', detailsDate: '05/28/17 12:00', detailsDesc: 'UTI symptoms', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:00', stopDate: '05/28/2017 12:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'BROWN, ELIZABETH', orderPlanName: 'Urine Culture', action: 'Order', detailsDate: '05/28/17 12:00', detailsDesc: 'Confirm infection', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:00', stopDate: '05/28/2017 12:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'THOMAS, MICHAEL', orderPlanName: 'CT Abdomen & Pelvis', action: 'Order', detailsDate: '05/28/17 12:30', detailsDesc: 'Abdominal pain', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:30', stopDate: '05/28/2017 12:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'THOMAS, MICHAEL', orderPlanName: 'Surgery Consult', action: 'Order', detailsDate: '05/28/17 12:30', detailsDesc: 'Surgical evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 12:30', stopDate: '05/28/2017 12:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'ANDERSON, SUSAN', orderPlanName: 'Lipid Panel', action: 'Order', detailsDate: '05/28/17 13:00', detailsDesc: 'Cholesterol check', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:00', stopDate: '05/28/2017 13:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'ANDERSON, SUSAN', orderPlanName: 'Nutrition Consult', action: 'Order', detailsDate: '05/28/17 13:00', detailsDesc: 'Dietary counseling', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:00', stopDate: '05/28/2017 13:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'MILLER, ROBERT', orderPlanName: 'Pulmonary Function Test', action: 'Order', detailsDate: '05/28/17 13:30', detailsDesc: 'COPD evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:30', stopDate: '05/28/2017 13:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'MILLER, ROBERT', orderPlanName: 'Respiratory Therapy Eval', action: 'Order', detailsDate: '05/28/17 13:30', detailsDesc: 'Breathing assessment', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 13:30', stopDate: '05/28/2017 13:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'DAVIS, PATRICIA', orderPlanName: 'DEXA Scan', action: 'Order', detailsDate: '05/28/17 14:00', detailsDesc: 'Bone density', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:00', stopDate: '05/28/2017 14:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'DAVIS, PATRICIA', orderPlanName: 'Vitamin D Level', action: 'Order', detailsDate: '05/28/17 14:00', detailsDesc: 'Bone health', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:00', stopDate: '05/28/2017 14:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'WHITE, CHARLES', orderPlanName: 'Sleep Study', action: 'Order', detailsDate: '05/28/17 14:30', detailsDesc: 'Sleep apnea evaluation', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:30', stopDate: '05/28/2017 14:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'WHITE, CHARLES', orderPlanName: 'ENT Consult', action: 'Order', detailsDate: '05/28/17 14:30', detailsDesc: 'Snoring and fatigue', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 14:30', stopDate: '05/28/2017 14:30', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'WILSON, BETTY', orderPlanName: 'Mammogram Screening', action: 'Order', detailsDate: '05/28/17 15:00', detailsDesc: 'Breast cancer screening', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 15:00', stopDate: '05/28/2017 15:00', stopType: 'Physician Stop', status: 'Open' },
    { patientName: 'WILSON, BETTY', orderPlanName: 'Ob/Gyn Annual Exam', action: 'Order', detailsDate: '05/28/17 15:00', detailsDesc: 'Routine exam', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 15:00', stopDate: '05/28/2017 15:00', stopType: 'Physician Stop', status: 'Open' }
  ];

  // Mock charts data for Home tab metric line graphs
  const mockChartData = [
    { time: '08:00', dns: 50, conn: 330, secure: 220, req: 1500, resp: 0.1, total: 1800, status: 1, success: 100 },
    { time: '08:05', dns: 10, conn: 330, secure: 225, req: 180, resp: 1.0, total: 600, status: 1, success: 100 },
    { time: '08:10', dns: 40, conn: 330, secure: 220, req: 180, resp: 0.1, total: 600, status: 1, success: 100 },
    { time: '08:15', dns: 15, conn: 330, secure: 225, req: 1400, resp: 0.1, total: 1700, status: 1, success: 100 },
    { time: '08:20', dns: 45, conn: 360, secure: 250, req: 180, resp: 0.1, total: 600, status: 1, success: 100 },
    { time: '08:25', dns: 20, conn: 360, secure: 250, req: 1700, resp: 0.1, total: 2100, status: 1, success: 100 },
    { time: '08:30', dns: 55, conn: 360, secure: 250, req: 180, resp: 1.0, total: 600, status: 1, success: 100 },
    { time: '08:35', dns: 25, conn: 330, secure: 220, req: 1500, resp: 0.1, total: 1800, status: 1, success: 100 },
    { time: '08:40', dns: 50, conn: 330, secure: 225, req: 180, resp: 0.1, total: 600, status: 1, success: 100 },
    { time: '08:45', dns: 30, conn: 360, secure: 250, req: 1800, resp: 1.0, total: 2100, status: 1, success: 100 },
    { time: '08:50', dns: 45, conn: 360, secure: 250, req: 180, resp: 0.1, total: 600, status: 1, success: 100 },
    { time: '08:55', dns: 35, conn: 360, secure: 250, req: 1400, resp: 0.1, total: 1700, status: 1, success: 100 }
  ];

  // F10 Person Search and Treatment popup states
  const [showTreatmentPopup, setShowTreatmentPopup] = useState(false);
  const [treatmentTopTab, setTreatmentTopTab] = useState<'Pt. Info' | 'Encounter' | 'Physical' | 'Hub'>('Hub');
  const [treatmentSubTab, setTreatmentSubTab] = useState<'Gonococcal' | 'Others'>('Gonococcal');
  const [treatmentPopUpChecked, setTreatmentPopUpChecked] = useState(true);
  const [treatmentGenerateHxBy, setTreatmentGenerateHxBy] = useState<'Id' | 'Code' | 'Group'>('Id');
  const [showPersonSearch, setShowPersonSearch] = useState(false);
  const [showPrescriptionRenewal, setShowPrescriptionRenewal] = useState(false);
  const [prescriptionSearchTo, setPrescriptionSearchTo] = useState('');
  const [prescriptions, setPrescriptions] = useState<Array<{ medication: string, dose: string, frequency: string, reason: string, quantity: string }>>([
    { medication: '', dose: '', frequency: '', reason: '', quantity: '' }
  ]);

  const addPrescriptionRow = () => {
    setPrescriptions(prev => [...prev, { medication: '', dose: '', frequency: '', reason: '', quantity: '' }]);
  };

  const updatePrescriptionRow = (index: number, field: string, value: string) => {
    setPrescriptions(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handlePrescriptionSubmit = () => {
    setShowPrescriptionRenewal(false);
    if (psSelectedPersonIndex !== null && psResults[psSelectedPersonIndex]) {
      const p = psResults[psSelectedPersonIndex];
      const tabTitle = `Patient Profile: ${p.name.toUpperCase()}`;
      const tabId = `patient-${p.mrn}`;
      selectOrOpenTab('PatientProfile', tabTitle, tabId);

      // Create temporary container for print layout
      const printFrame = document.createElement('div');
      printFrame.id = 'print-slip-frame';

      printFrame.innerHTML = `
        <div style="width: 700px; margin: 0 auto; padding: 30px; font-family: 'Arial', sans-serif; color: #1c2833; background: white; font-size: 12px; line-height: 1.4;">
          <!-- Top Link / Header Info -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="font-family: 'Georgia', serif; font-size: 11px; color: #555;">
              <span style="font-size: 20px; font-weight: bold; color: black; display: block; margin-bottom: 2px;">AIIMS, New Delhi</span>
              <span style="font-size: 13px; display: block; margin-bottom: 10px;">Ansari Nagar, New Delhi</span>
              <span style="font-size: 18px; font-weight: bold; color: black; display: block;">Appointment Slip</span>
            </div>
            <div style="font-size: 9px; color: #555; text-align: right; max-width: 320px; word-break: break-all;">
              https://ors.gov.in/copp/print.jsp?orskey=HZMI-4X2F-LHVH-3CI7-CFZ...
            </div>
          </div>

          <!-- Appointment No / Barcode & QR Code Section -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px;">
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #555; margin-bottom: 4px;">Appointment No.</div>
              <div style="font-size: 18px; font-weight: bold; color: black; margin-bottom: 6px;">2019112602369</div>
              <!-- Barcode SVG -->
              <svg width="220" height="40" viewBox="0 0 220 40">
                <rect x="0" y="0" width="4" height="40" fill="black"/>
                <rect x="6" y="0" width="2" height="40" fill="black"/>
                <rect x="10" y="0" width="6" height="40" fill="black"/>
                <rect x="18" y="0" width="2" height="40" fill="black"/>
                <rect x="22" y="0" width="4" height="40" fill="black"/>
                <rect x="28" y="0" width="8" height="40" fill="black"/>
                <rect x="38" y="0" width="2" height="40" fill="black"/>
                <rect x="42" y="0" width="4" height="40" fill="black"/>
                <rect x="48" y="0" width="6" height="40" fill="black"/>
                <rect x="56" y="0" width="2" height="40" fill="black"/>
                <rect x="60" y="0" width="8" height="40" fill="black"/>
                <rect x="70" y="0" width="4" height="40" fill="black"/>
                <rect x="76" y="0" width="2" height="40" fill="black"/>
                <rect x="80" y="0" width="6" height="40" fill="black"/>
                <rect x="88" y="0" width="4" height="40" fill="black"/>
                <rect x="94" y="0" width="8" height="40" fill="black"/>
                <rect x="104" y="0" width="2" height="40" fill="black"/>
                <rect x="108" y="0" width="6" height="40" fill="black"/>
                <rect x="116" y="0" width="4" height="40" fill="black"/>
                <rect x="122" y="0" width="2" height="40" fill="black"/>
                <rect x="126" y="0" width="8" height="40" fill="black"/>
                <rect x="136" y="0" width="4" height="40" fill="black"/>
                <rect x="142" y="0" width="6" height="40" fill="black"/>
                <rect x="150" y="0" width="2" height="40" fill="black"/>
                <rect x="154" y="0" width="8" height="40" fill="black"/>
                <rect x="164" y="0" width="4" height="40" fill="black"/>
                <rect x="170" y="0" width="2" height="40" fill="black"/>
                <rect x="174" y="0" width="6" height="40" fill="black"/>
                <rect x="182" y="0" width="4" height="40" fill="black"/>
                <rect x="188" y="0" width="8" height="40" fill="black"/>
                <rect x="198" y="0" width="2" height="40" fill="black"/>
                <rect x="202" y="0" width="4" height="40" fill="black"/>
                <rect x="208" y="0" width="6" height="40" fill="black"/>
                <rect x="216" y="0" width="4" height="40" fill="black"/>
              </svg>
            </div>
            <div>
              <!-- Custom High-Quality QR Code Grid -->
              <svg width="85" height="85" viewBox="0 0 29 29" style="shape-rendering: crispEdges;">
                <rect width="29" height="29" fill="white"/>
                <!-- Top-left finder pattern -->
                <rect x="0" y="0" width="7" height="7" fill="black"/>
                <rect x="1" y="1" width="5" height="5" fill="white"/>
                <rect x="2" y="2" width="3" height="3" fill="black"/>
                <!-- Top-right finder pattern -->
                <rect x="22" y="0" width="7" height="7" fill="black"/>
                <rect x="23" y="1" width="5" height="5" fill="white"/>
                <rect x="24" y="2" width="3" height="3" fill="black"/>
                <!-- Bottom-left finder pattern -->
                <rect x="0" y="22" width="7" height="7" fill="black"/>
                <rect x="1" y="23" width="5" height="5" fill="white"/>
                <rect x="2" y="24" width="3" height="3" fill="black"/>
                <!-- Alignment pattern -->
                <rect x="20" y="20" width="5" height="5" fill="black"/>
                <rect x="21" y="21" width="3" height="3" fill="white"/>
                <rect x="22" y="22" width="1" height="1" fill="black"/>
                <!-- Mock QR data modules -->
                <rect x="8" y="1" width="1" height="2" fill="black"/>
                <rect x="10" y="0" width="2" height="1" fill="black"/>
                <rect x="13" y="1" width="2" height="2" fill="black"/>
                <rect x="17" y="0" width="1" height="3" fill="black"/>
                <rect x="19" y="1" width="2" height="1" fill="black"/>
                <rect x="8" y="4" width="3" height="1" fill="black"/>
                <rect x="12" y="3" width="1" height="3" fill="black"/>
                <rect x="15" y="4" width="2" height="1" fill="black"/>
                <rect x="18" y="3" width="1" height="2" fill="black"/>
                <rect x="20" y="5" width="1" height="1" fill="black"/>
                <rect x="9" y="8" width="1" height="3" fill="black"/>
                <rect x="11" y="9" width="2" height="1" fill="black"/>
                <rect x="14" y="7" width="1" height="2" fill="black"/>
                <rect x="16" y="8" width="3" height="1" fill="black"/>
                <rect x="20" y="7" width="2" height="2" fill="black"/>
                <rect x="23" y="8" width="1" height="3" fill="black"/>
                <rect x="25" y="9" width="3" height="1" fill="black"/>
                <rect x="0" y="10" width="2" height="1" fill="black"/>
                <rect x="3" y="9" width="1" height="2" fill="black"/>
                <rect x="5" y="11" width="3" height="1" fill="black"/>
                <rect x="10" y="12" width="2" height="2" fill="black"/>
                <rect x="13" y="11" width="1" height="1" fill="black"/>
                <rect x="15" y="10" width="2" height="3" fill="black"/>
                <rect x="18" y="11" width="1" height="2" fill="black"/>
                <rect x="20" y="10" width="1" height="1" fill="black"/>
                <rect x="26" y="11" width="2" height="2" fill="black"/>
                <rect x="1" y="13" width="3" height="1" fill="black"/>
                <rect x="5" y="14" width="1" height="2" fill="black"/>
                <rect x="8" y="13" width="2" height="1" fill="black"/>
                <rect x="11" y="15" width="3" height="1" fill="black"/>
                <rect x="15" y="14" width="1" height="1" fill="black"/>
                <rect x="17" y="13" width="2" height="2" fill="black"/>
                <rect x="20" y="14" width="3" height="1" fill="black"/>
                <rect x="24" y="13" width="1" height="3" fill="black"/>
                <rect x="0" y="17" width="1" height="3" fill="black"/>
                <rect x="2" y="16" width="3" height="1" fill="black"/>
                <rect x="6" y="17" width="2" height="2" fill="black"/>
                <rect x="9" y="16" width="1" height="1" fill="black"/>
                <rect x="11" y="18" width="2" height="1" fill="black"/>
                <rect x="14" y="17" width="1" height="3" fill="black"/>
                <rect x="16" y="16" width="3" height="1" fill="black"/>
                <rect x="20" y="17" width="2" height="1" fill="black"/>
                <rect x="23" y="18" width="1" height="2" fill="black"/>
                <rect x="26" y="16" width="3" height="1" fill="black"/>
                <rect x="8" y="20" width="2" height="2" fill="black"/>
                <rect x="11" y="21" width="1" height="3" fill="black"/>
                <rect x="13" y="20" width="3" height="1" fill="black"/>
                <rect x="17" y="21" width="1" height="1" fill="black"/>
                <rect x="19" y="20" width="2" height="3" fill="black"/>
                <rect x="9" y="24" width="1" height="2" fill="black"/>
                <rect x="12" y="25" width="3" height="1" fill="black"/>
                <rect x="16" y="24" width="1" height="3" fill="black"/>
                <rect x="18" y="26" width="2" height="1" fill="black"/>
                <rect x="8" y="28" width="3" height="1" fill="black"/>
                <rect x="12" y="27" width="1" height="2" fill="black"/>
                <rect x="14" y="28" width="2" height="1" fill="black"/>
                <rect x="17" y="27" width="1" height="2" fill="black"/>
                <rect x="19" y="28" width="2" height="1" fill="black"/>
              </svg>
            </div>
          </div>

          <hr style="border: none; border-top: 2px solid #333; margin: 15px 0 20px 0;"/>

          <!-- Department Box with Avatar -->
          <div style="display: flex; border: 2px solid #b91c1c; padding: 0; margin-bottom: 25px; min-height: 120px; align-items: stretch;">
            <div style="flex: 1; padding: 25px 20px; display: flex; align-items: center; justify-content: flex-start;">
              <span style="font-size: 22px; font-weight: bold; color: #0ea5e9; font-family: 'Arial Black', sans-serif;">DEPARTMENT NAME : ORTHOPEDICS</span>
            </div>
            <div style="width: 140px; border-left: 2px solid #b91c1c; display: flex; align-items: center; justify-content: center; background-color: #fafafa; overflow: hidden; padding: 5px;">
              <img src="/sharda_devi.png" alt="Patient Avatar" style="max-width: 100%; max-height: 100%; object-fit: contain;"/>
            </div>
          </div>

          <hr style="border: none; border-top: 2px solid #333; margin: 20px 0 20px 0;"/>

          <!-- Details Grid Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1.5px solid #d1d5db;">
            <tr>
              <td style="width: 25%; padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">APPOINTMENT NO.</td>
              <td style="width: 25%; padding: 10px; border: 1px solid #d1d5db; font-weight: bold; color: black;">2019112602369</td>
              <td style="width: 25%; padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">APPOINTMENT DATE</td>
              <td style="width: 25%; padding: 10px; border: 1px solid #d1d5db; font-weight: bold; color: black;">26/12/2019 (8:00 AM-9:00 AM)</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">PATIENT'S NAME</td>
              <td colspan="3" style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold; color: black;">Miss. Sharda Devi</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">GENDER</td>
              <td style="padding: 10px; border: 1px solid #d1d5db; color: black;">Female</td>
              <td style="padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">AGE</td>
              <td style="padding: 10px; border: 1px solid #d1d5db; color: black;">52 years</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">CONTACT DETAILS</td>
              <td style="padding: 10px; border: 1px solid #d1d5db; color: black; line-height: 1.5;">
                Mobile No. : XXXXXXXX698<br/>
                E-Mail Id : <span style="color: #0ea5e9; cursor: pointer; text-decoration: underline;">NA@</span>
              </td>
              <td style="padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">REQUEST MODE (REQUEST DATE)</td>
              <td style="padding: 10px; border: 1px solid #d1d5db; color: black;">WEB (26/11/2019 09:28 AM)</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; color: #374151;">UHID</td>
              <td colspan="3" style="padding: 10px; border: 1px solid #d1d5db; color: black;">104917098</td>
            </tr>
          </table>

          <!-- Bottom Footer -->
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 8px;">
            <span>1 of 2</span>
            <span>26-11-2019, 09:42</span>
          </div>
        </div>
      `;

      // Preload image to ensure it is rendered on paper/pdf before printing dialog triggers
      const img = document.createElement('img');
      img.src = '/sharda_devi.png';

      const executePrint = () => {
        const printStyle = document.createElement('style');
        printStyle.id = 'print-slip-style';
        printStyle.innerHTML = `
          @media print {
            body > * { display: none !important; }
            html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
            #print-slip-frame { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
          }
          @media screen {
            #print-slip-frame { display: none !important; }
          }
        `;

        document.body.appendChild(printStyle);
        document.body.appendChild(printFrame);
        
        window.print();

        // Cleanup
        document.body.removeChild(printFrame);
        const styleNode = document.getElementById('print-slip-style');
        if (styleNode) styleNode.parentNode?.removeChild(styleNode);
      };

      img.onload = executePrint;
      img.onerror = executePrint; // Print anyway if loading fails
    }
  };
  const [devSidebarExpanded, setDevSidebarExpanded] = useState<Record<string, boolean>>({
    MyContentServer: false,
    BrowseContent: false,
    Search: false,
    ContentManagement: false,
    Administration: true,
    LogFiles: true,
    RefineryAdministration: false,
    ScheduledJobsAdministration: false,
    AdminServer: false,
    FrameworkFolders: false,
    ImagingMigration: false,
    FoldersRetention: false,
    SmartContent: false,
    SiteStudio: false
  });
  const [devActiveSubPage, setDevActiveSubPage] = useState<string>('ComponentManager');
  const [selectedAutomationTool, setSelectedAutomationTool] = useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<string>('details');
  const [toolEnabledState, setToolEnabledState] = useState<Record<string, boolean>>({});
  const [psActiveTab, setPsActiveTab] = useState<'Person' | 'Guarantor'>('Person');
  const [psLastName, setPsLastName] = useState('');
  const [psFirstName, setPsFirstName] = useState('');
  const [psBirthDate, setPsBirthDate] = useState('');
  const [psPhoneNumber, setPsPhoneNumber] = useState('');
  const [psPersonIdentifier, setPsPersonIdentifier] = useState('');
  const [psEncounterIdentifier, setPsEncounterIdentifier] = useState('');
  const [psAssumeWildcards, setPsAssumeWildcards] = useState(true);
  const [psAxioId, setPsAxioId] = useState('');
  const [psTokenNumber, setPsTokenNumber] = useState('');
  const [psSearchMethod, setPsSearchMethod] = useState<'Name' | 'AxioID' | 'TokenNumber' | 'MRN'>('Name');
  const [psShowSettings, setPsShowSettings] = useState(false);
  // Settings customization options
  const [psSettingsAutoWildcard, setPsSettingsAutoWildcard] = useState(true);
  const [psSettingsMaxResults, setPsSettingsMaxResults] = useState<'25' | '50' | '100' | 'All'>('50');
  const [psSettingsShowInactive, setPsSettingsShowInactive] = useState(false);
  const [psSettingsSearchOnType, setPsSettingsSearchOnType] = useState(false);
  const [psSettingsDefaultMethod, setPsSettingsDefaultMethod] = useState<'Name' | 'AxioID' | 'TokenNumber' | 'MRN'>('Name');
  
  // Results states
  const [psResults, setPsResults] = useState<any[]>([]);
  const [psSelectedPersonIndex, setPsSelectedPersonIndex] = useState<number | null>(null);
  const [psContextMenu, setPsContextMenu] = useState<{ x: number, y: number, visible: boolean, personIndex: number | null }>({ x: 0, y: 0, visible: false, personIndex: null });
  
  // Draggable Person Search modal state
  const [psModalPos, setPsModalPos] = useState<{ x: number, y: number }>({ x: -1, y: -1 });
  const psDragRef = React.useRef<{ isDragging: boolean, startX: number, startY: number, origX: number, origY: number }>({ isDragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const handlePsDragStart = (e: React.MouseEvent) => {
    const pos = psModalPos.x === -1 ? { x: (window.innerWidth - 1050) / 2, y: (window.innerHeight - 650) / 2 } : psModalPos;
    psDragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    
    const handleMouseMove = (ev: MouseEvent) => {
      if (!psDragRef.current.isDragging) return;
      const dx = ev.clientX - psDragRef.current.startX;
      const dy = ev.clientY - psDragRef.current.startY;
      setPsModalPos({ x: psDragRef.current.origX + dx, y: psDragRef.current.origY + dy });
    };
    const handleMouseUp = () => {
      psDragRef.current.isDragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Ref to always capture the latest selectOrOpenTab function without re-registering event listener
  const selectOrOpenTabRef = React.useRef(selectOrOpenTab);
  React.useEffect(() => {
    selectOrOpenTabRef.current = selectOrOpenTab;
  }, [selectOrOpenTab]);

  // Keyboard shortcut listener for function keys and global shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 → Home
      if (e.key === 'F1') {
        e.preventDefault();
        selectOrOpenTabRef.current('Home', 'Home', 'home-tab');
      }
      // F2 → Appointment Reschedule page
      if (e.key === 'F2') {
        e.preventDefault();
        selectOrOpenTabRef.current('RescheduleRequests', 'Appointment Reschedule Requests', 'reschedule-requests-tab');
      }
      // F3 → Orders List page
      if (e.key === 'F3') {
        e.preventDefault();
        selectOrOpenTabRef.current('Orders', 'Orders', 'orders-tab');
      }
      // F9 → New Patient (Admit Patient) page
      if (e.key === 'F9') {
        e.preventDefault();
        selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab');
      }
      // F10 → Toggle Person Search modal
      if (e.key === 'F10') {
        e.preventDefault();
        setShowPersonSearch(prev => !prev);
      }
      // F12 → Toggle Developer Tools page
      if (e.key === 'F12') {
        e.preventDefault();
        selectOrOpenTabRef.current('DeveloperTools', 'Developer Tools & System Settings', 'dev-tools-tab');
      }
      // Ctrl+Q -> Toggle Conversation Launcher
      if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        setShowConversationLauncher(prev => !prev);
      }
      // ESC → Cancel / Close the topmost open modal or context menu
      if (e.key === 'Escape') {
        e.preventDefault();
        // Close Conversation Launcher
        if (showConversationLauncher) {
          setShowConversationLauncher(false);
          return;
        }
        // Close context menu first
        setPsContextMenu(prev => ({ ...prev, visible: false }));
        // Close Person Search modal
        if (showPersonSearch) {
          setShowPersonSearch(false);
          setPsModalPos({ x: -1, y: -1 });
          return;
        }
        // Close Reschedule modal
        if (showRescheduleModal) {
          setShowRescheduleModal(false);
          setSelectedRescheduleReq(null);
          return;
        }
        // Close Prescription Renewal modal
        if (showPrescriptionRenewal) {
          setShowPrescriptionRenewal(false);
          return;
        }
      }
      // Ctrl+S → save shortcut (override browser default)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        selectOrOpenTabRef.current('RescheduleRequests', 'Appointment Reschedule Requests', 'reschedule-requests-tab');
      }
    };
    const handleCloseMenu = () => {
      setPsContextMenu(prev => ({ ...prev, visible: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleCloseMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleCloseMenu);
    };
  }, [showPersonSearch, showRescheduleModal, showPrescriptionRenewal]);

  const handlePsSearch = () => {
    let filtered = [...patientDirectoryData];
    
    // Search by method
    if (psSearchMethod === 'AxioID' && psAxioId) {
      filtered = filtered.filter(p => ((p as any).uhid || '').toLowerCase().includes(psAxioId.toLowerCase()));
    } else if (psSearchMethod === 'TokenNumber' && psTokenNumber) {
      // Token number maps to MRN in this context
      filtered = filtered.filter(p => p.mrn.includes(psTokenNumber));
    } else if (psSearchMethod === 'MRN' && psPersonIdentifier) {
      filtered = filtered.filter(p => p.mrn.includes(psPersonIdentifier) || ((p as any).uhid || '').includes(psPersonIdentifier));
    } else {
      // Default Name-based search
      if (psLastName) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(psLastName.toLowerCase()));
      }
      if (psFirstName) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(psFirstName.toLowerCase()));
      }
      if (psBirthDate) {
        filtered = filtered.filter(p => p.dob.includes(psBirthDate));
      }
      if (psPhoneNumber) {
        filtered = filtered.filter(p => ((p as any).phone || '').includes(psPhoneNumber));
      }
      if (psPersonIdentifier) {
        filtered = filtered.filter(p => p.mrn.includes(psPersonIdentifier) || ((p as any).uhid || '').includes(psPersonIdentifier));
      }
    }
    
    // Apply max results setting
    if (psSettingsMaxResults !== 'All') {
      filtered = filtered.slice(0, parseInt(psSettingsMaxResults));
    }
    
    setPsResults(filtered);
    setPsSelectedPersonIndex(filtered.length > 0 ? 0 : null);
  };

  const handlePsContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setPsSelectedPersonIndex(index);
    setPsContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
      personIndex: index
    });
  };

  const handlePsClear = () => {
    setPsLastName('');
    setPsFirstName('');
    setPsBirthDate('');
    setPsPhoneNumber('');
    setPsPersonIdentifier('');
    setPsEncounterIdentifier('');
    setPsAxioId('');
    setPsTokenNumber('');
    setPsResults([]);
    setPsSelectedPersonIndex(null);
  };

  const psMockEncounters: Record<string, any[]> = {
    '1000245678': [
      { encounter: 'ENC-40291', facility: 'AxioVital Main Campus', type: 'Inpatient', dateOfService: '28/05/2025', resource: 'Dr. R. Sharma (Cardiology)', guarantor: 'Self Pay', dischargeDate: '—' },
      { encounter: 'ENC-39810', facility: 'AxioVital Main Campus', type: 'Outpatient', dateOfService: '12/04/2025', resource: 'Dr. R. Sharma (Cardiology)', guarantor: 'Blue Cross / Blue Shield', dischargeDate: '12/04/2025' }
    ],
    '1000245679': [
      { encounter: 'ENC-40302', facility: 'AxioVital North Clinic', type: 'Inpatient', dateOfService: '28/05/2025', resource: 'Dr. P. Singh (Neurology)', guarantor: 'Medicare', dischargeDate: '—' }
    ],
    '1000245680': [
      { encounter: 'ENC-40315', facility: 'AxioVital Main Campus', type: 'Outpatient', dateOfService: '28/05/2025', resource: 'Dr. K. Iyer (General Medicine)', guarantor: 'Aetna', dischargeDate: '28/05/2025' }
    ]
  };

  const getSelectedPersonEncounters = () => {
    if (psSelectedPersonIndex === null || !psResults[psSelectedPersonIndex]) return [];
    const person = psResults[psSelectedPersonIndex];
    return psMockEncounters[person.mrn] || [
      { encounter: 'ENC-40112', facility: 'AxioVital Main Campus', type: person.visit || 'Outpatient', dateOfService: person.admitted?.split(' ')[0] || '28/05/2025', resource: person.physician || 'Dr. Herman Stewart', guarantor: 'Blue Cross / Blue Shield', dischargeDate: '—' }
    ];
  };

  const handlePsSelect = () => {
    if (psSelectedPersonIndex !== null && psResults[psSelectedPersonIndex]) {
      setShowPersonSearch(false);
      setShowPrescriptionRenewal(true);
    }
  };

  if ((activeTab.type as string) === 'Home') {
    return (
      <div className="w-screen h-screen bg-[#f4f7f6] text-[#333333] text-[10.5px] font-sans flex flex-col select-none overflow-hidden">
        {/* Header Banner */}
        <div 
          className="h-[36px] bg-gradient-to-r from-[#003366] via-[#005599] to-[#003366] text-white flex justify-between items-center px-3 select-none border-b border-[#002244]"
          style={{ backgroundImage: 'linear-gradient(to right, #00305a 0%, #005aa7 50%, #00305a 100%)' }}
        >
          <span className="font-extrabold text-[13px] tracking-tight text-white flex items-center">
            AxioVital Home Portal
          </span>
          <button 
            onClick={() => selectOrOpenTab('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-3 py-1 rounded-sm text-[10px] transition-colors"
          >
            ❮ Return to AxioVital
          </button>
        </div>

        {/* Content Pane showing charts */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 select-text">
          <div className="grid grid-cols-2 gap-4 max-w-[1400px] mx-auto w-full">
            {[
              { title: 'HTTP(S) DNS Lookup Time', key: 'dns', unit: 'ms', color: '#1070ca', fill: 'url(#colorDns)' },
              { title: 'HTTP(S) Connection Duration', key: 'conn', unit: 'ms', color: '#005a9c', fill: 'url(#colorConn)' },
              { title: 'HTTP(S) Secure Connection Duration', key: 'secure', unit: 'ms', color: '#0d7a86', fill: 'url(#colorSecure)' },
              { title: 'HTTP(S) Request Duration', key: 'req', unit: 'ms', color: '#d14343', fill: 'url(#colorReq)' },
              { title: 'HTTP(S) Response Duration', key: 'resp', unit: 'ms', color: '#e69800', fill: 'url(#colorResp)' },
              { title: 'HTTP(S) Total Duration', key: 'total', unit: 'ms', color: '#6845a7', fill: 'url(#colorTotal)' },
              { title: 'HTTP(S) Response Status Code', key: 'status', unit: 'count', color: '#32805b', fill: 'url(#colorStatus)' },
              { title: 'HTTP(S) Success Rate', key: 'success', unit: '%', color: '#1d8c00', fill: 'url(#colorSuccess)' }
            ].map((chart) => (
              <div key={chart.key} className="bg-white border border-[#bdcddc] rounded-sm p-3 shadow-sm flex flex-col h-[280px]">
                <div className="flex justify-between items-center border-b border-gray-150 pb-2 mb-2 select-none relative">
                  <span className="font-bold text-[11px] text-[#2c3e50] flex items-center gap-1">
                    {chart.title} <span className="text-gray-400 text-[10px] cursor-help">ⓘ</span>
                  </span>
                  <div>
                    <button 
                      onClick={() => setOpenDropdownChart(openDropdownChart === chart.key ? null : chart.key)}
                      className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-[10px] text-gray-700 px-2 py-0.5 rounded-sm flex items-center gap-1 font-semibold"
                    >
                      {chartSelections[chart.key] || 'Quick View'} <span className="text-[8px] text-gray-400">▼</span>
                    </button>
                    {openDropdownChart === chart.key && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownChart(null)} />
                        <div className="absolute right-0 mt-1 bg-white border border-[#b0b0b0] text-[#333333] text-[11px] p-0 w-[200px] shadow-md rounded-none select-none z-50 max-h-[220px] overflow-y-auto">
                          <div className="py-0.5">
                            {CHART_OPTIONS.map((option) => (
                              <div
                                key={option}
                                onClick={() => {
                                  setChartSelections(prev => ({ ...prev, [chart.key]: option }));
                                  setOpenDropdownChart(null);
                                }}
                                className={`px-3 py-1 cursor-pointer outline-none ${
                                  (chartSelections[chart.key] || 'Quick View') === option 
                                    ? 'bg-[#0f4471] text-white font-semibold' 
                                    : 'hover:bg-[#0f4471] hover:text-white text-[#333333]'
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[9.5px] text-gray-500 mb-2 select-none">
                  <div>
                    Interval: <span className="font-bold text-gray-700">1 minute ▾</span>
                  </div>
                  <div>
                    Statistic: <span className="font-bold text-gray-700">Mean ▾</span>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartDataForSelection(mockChartData, chartSelections[chart.key] || 'Quick View', chart.key)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`color${chart.key.charAt(0).toUpperCase() + chart.key.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chart.color} stopOpacity={0.15}/>
                          <stop offset="95%" stopColor={chart.color} stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f2" />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#7f8c8d' }} stroke="#bdc3c7" tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#7f8c8d' }} stroke="#bdc3c7" tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px' }} />
                      <Area type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={1.5} fill={chart.fill} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab.type === 'DeveloperTools') {
    return (
      <div className="w-screen h-screen bg-[#fafbfc] text-[#333333] text-[10.5px] font-sans flex flex-col select-none overflow-hidden h-full">
        {/* Banner Header with Logo and Search */}
        <div 
          className="h-[36px] bg-gradient-to-r from-[#003366] via-[#005599] to-[#003366] text-white flex justify-between items-center px-2 select-none border-b border-[#002244]"
          style={{ backgroundImage: 'linear-gradient(to right, #00305a 0%, #005aa7 50%, #00305a 100%)' }}
        >
          <div className="flex items-center gap-2">
            {/* AxioVital Developer Panel Logo text styling */}
            <span className="font-extrabold text-[13px] tracking-tight text-white flex items-center">
              AxioVital Developer Panel
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="cursor-pointer hover:underline">Logout</span>
            <span>|</span>
            <span 
              onClick={() => window.open('https://support.trackcodex.com/', '_blank')} 
              className="cursor-pointer hover:underline"
            >
              Help
            </span>
            <span>|</span>
            <span className="cursor-pointer hover:underline">Refresh Page</span>
          </div>
        </div>

        {/* Top Tab Bar Row */}
        <div className="bg-[#cbd8e3] border-b border-[#bdcddc] px-2 py-0.5 flex gap-1 text-[#002a46] font-bold text-[10px] select-none h-[22px] items-center">
          <button 
            onClick={() => selectOrOpenTab('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')}
            className="hover:bg-blue-100/50 px-2 py-0.5 rounded text-[#0f4471] font-semibold flex items-center gap-1"
          >
            ❮ Return to AxioVital
          </button>
          <div className="h-3 w-[1px] bg-gray-400 mx-1" />
          <button className="bg-white border-t border-x border-[#bdcddc] px-3 py-0.5 rounded-t-sm">Search</button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar navigation panel */}
          <div className="w-[220px] bg-[#f0f4f8] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              
                {/* My Content Server */}
                <div 
                  onClick={() => setDevSidebarExpanded(prev => ({ ...prev, MyContentServer: !prev.MyContentServer }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.MyContentServer ? '➖' : '➕'}</span> <span>My Content Server</span>
                </div>
                {devSidebarExpanded.MyContentServer && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under My Content Server</div>
                )}

                {/* Browse Content */}
                <div 
                  onClick={() => setDevSidebarExpanded(prev => ({ ...prev, BrowseContent: !prev.BrowseContent }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.BrowseContent ? '➖' : '➕'}</span> <span>Browse Content</span>
                </div>
                {devSidebarExpanded.BrowseContent && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Browse Content</div>
                )}

                {/* Search */}
                <div 
                  onClick={() => setDevSidebarExpanded(prev => ({ ...prev, Search: !prev.Search }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.Search ? '➖' : '➕'}</span> <span>Search</span>
                </div>
                {devSidebarExpanded.Search && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Search</div>
                )}

                {/* Content Management */}
                <div 
                  onClick={() => setDevSidebarExpanded(prev => ({ ...prev, ContentManagement: !prev.ContentManagement }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.ContentManagement ? '➖' : '➕'}</span> <span>Content Management</span>
                </div>
                {devSidebarExpanded.ContentManagement && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Content Management</div>
                )}

                {/* Administration */}
                <div className="pt-1">
                  <div 
                    onClick={() => setDevSidebarExpanded(prev => {
                      const isClosing = prev.Administration;
                      if (isClosing) {
                        return {
                          ...prev,
                          Administration: false,
                          LogFiles: false,
                          RefineryAdministration: false,
                          ScheduledJobsAdministration: false,
                          AdminServer: false,
                          FrameworkFolders: false,
                          ImagingMigration: false,
                          FoldersRetention: false,
                          SmartContent: false,
                          SiteStudio: false
                        };
                      }
                      return {
                        ...prev,
                        Administration: true
                      };
                    })}
                    className="flex items-center gap-1 p-1 font-bold text-[#003366] hover:bg-[#cbd8e3] rounded cursor-pointer"
                  >
                    <span>{devSidebarExpanded.Administration ? '➖' : '➕'}</span> <span>Administration</span>
                  </div>
                  
                  {devSidebarExpanded.Administration && (
                    <div className="pl-3 space-y-0.5 text-[#333333]">
                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, LogFiles: !prev.LogFiles }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.LogFiles ? '➖' : '➕'}</span> <span>Log Files</span>
                      </div>

                      {devSidebarExpanded.LogFiles && (
                        <div className="pl-4 space-y-0.5 border-l border-gray-300">
                          <div 
                            onClick={() => {
                              setDevActiveSubPage('ComponentManager');
                              setSelectedAutomationTool(null);
                            }}
                            className={`p-1 cursor-pointer hover:text-blue-900 ${devActiveSubPage === 'ComponentManager' ? 'text-blue-900 font-bold bg-[#cbd8e3]/50 border-y border-[#bdcddc]/50' : 'text-[#333333]'}`}
                          >
                            📄 Component Manager
                          </div>
                          <div className="p-1 hover:text-blue-900 cursor-pointer">📄 General Configuration</div>
                          <div className="p-1 hover:text-blue-900 cursor-pointer">📄 Content Security</div>
                          <div className="p-1 hover:text-blue-900 cursor-pointer">📄 Internet Configuration</div>
                        </div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, RefineryAdministration: !prev.RefineryAdministration }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.RefineryAdministration ? '➖' : '➕'}</span> <span>Refinery Administration</span>
                      </div>
                      {devSidebarExpanded.RefineryAdministration && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Refinery Administration</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, ScheduledJobsAdministration: !prev.ScheduledJobsAdministration }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.ScheduledJobsAdministration ? '➖' : '➕'}</span> <span>Scheduled Jobs Administration</span>
                      </div>
                      {devSidebarExpanded.ScheduledJobsAdministration && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Scheduled Jobs</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, AdminServer: !prev.AdminServer }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.AdminServer ? '➖' : '➕'}</span> <span>Admin Server</span>
                      </div>
                      {devSidebarExpanded.AdminServer && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Admin Server</div>
                      )}

                      <div className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">
                        <span>📄</span> <span>Environment Packager</span>
                      </div>

                      <div className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">
                        <span>📄</span> <span>Localization</span>
                      </div>

                      <div className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">
                        <span>📄</span> <span>DataStoreDesign SQL Generation</span>
                      </div>

                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, FrameworkFolders: !prev.FrameworkFolders }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.FrameworkFolders ? '➖' : '➕'}</span> <span>FrameworkFolders Configuration</span>
                      </div>
                      {devSidebarExpanded.FrameworkFolders && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under FrameworkFolders</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, ImagingMigration: !prev.ImagingMigration }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.ImagingMigration ? '➖' : '➕'}</span> <span>Imaging Migration Administration</span>
                      </div>
                      {devSidebarExpanded.ImagingMigration && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Imaging Migration</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, FoldersRetention: !prev.FoldersRetention }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.FoldersRetention ? '➖' : '➕'}</span> <span>Folders Retention Administration</span>
                      </div>
                      {devSidebarExpanded.FoldersRetention && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Folders Retention</div>
                      )}

                      <div 
                        onClick={() => {
                          setDevSidebarExpanded(prev => ({ ...prev, SmartContent: !prev.SmartContent }));
                          setDevActiveSubPage('SmartContent');
                          setSelectedAutomationTool(null);
                        }}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                      >
                        <span>{devSidebarExpanded.SmartContent ? '➖' : '➕'}</span> <span>SmartContent</span>
                      </div>
                      {devSidebarExpanded.SmartContent && (
                        <div className="pl-4 space-y-0.5 border-l border-gray-300">
                          <div 
                            onClick={() => {
                              setDevActiveSubPage('SmartContent');
                              setSelectedAutomationTool(null);
                            }}
                            className={`p-1 cursor-pointer hover:text-blue-900 ${devActiveSubPage === 'SmartContent' && !selectedAutomationTool ? 'text-blue-900 font-bold bg-[#cbd8e3]/50 border-y border-[#bdcddc]/50' : 'text-[#333333]'}`}
                          >
                            📄 Application Portal
                          </div>
                        </div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded(prev => ({ ...prev, SiteStudio: !prev.SiteStudio }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.SiteStudio ? '➖' : '➕'}</span> <span>Site Studio Administration</span>
                      </div>
                      {devSidebarExpanded.SiteStudio && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Site Studio</div>
                      )}
                    </div>
                  )}
                </div>

              
            </div>
          </div>

          {/* Right Content Panel - Component list form */}
          <div className="flex-1 overflow-y-auto p-4 bg-white select-text">
            <div className="max-w-[1100px] mx-auto space-y-4">
              {devActiveSubPage === 'SmartContent' ? (
                <>
                                      <div className="space-y-4">
                      {/* SmartContent Portal Header */}
                      <div className="bg-[#cbd8e3]/30 p-3.5 border border-[#bdcddc] rounded-none text-[#002a46] select-none">
                        <div className="font-bold text-xs">SmartContent - Automation Platform Integration</div>
                        <div className="text-gray-600 text-[10px] mt-1 leading-relaxed">
                          Launch active mock services and system extensions. Below are the available automation integrations for the Axiovital platform. Click any application card to connect or configure its API extensions.
                        </div>
                      </div>

                      {/* App Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                        {[
                          { 
                            id: 'appbar-mock', 
                            name: 'Appbar - MOCK_', 
                            type: 'Cerner Appbar', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isCerner: true,
                            identifier: 'axiovital.cerner.appbar.mock',
                            version: '2.4.1',
                            lastUpdated: '2 days ago',
                            size: '1.84MB',
                            description: 'Provides the mock execution environment for Cerner Application Bar services inside the Axiovital orchestration layer. Allows developers to test automated token rotation and patient context synchronization APIs without deploying to active staging systems.',
                            features: '• Full JWT token validation\n• Session persistence hooks\n• Axiovital desktop bridging',
                            changelog: 'v2.4.1:\n- Fixed token expiry notification delay\n- Added support for India ABHA schema header translation'
                          },
                          { 
                            id: 'appbar-readonly', 
                            name: 'Appbar - READONLY', 
                            type: 'Cerner Appbar', 
                            iconBg: 'bg-[#d32f2f]', 
                            isRed: true, 
                            isCerner: true,
                            identifier: 'axiovital.cerner.appbar.readonly',
                            version: '1.2.0',
                            lastUpdated: '3 months ago',
                            size: '1.12MB',
                            description: 'A read-only mode wrapper for the Cerner Appbar. It ensures automation pipelines can monitor active workspaces, active users, and status flags without the permissions required to modify state or inject tokens.',
                            features: '• Zero-write permissions enforcement\n• Workstation status broadcast\n• Resource usage logging',
                            changelog: 'v1.2.0:\n- Implemented security hardening audit logging\n- Optimized frame refresh overhead'
                          },
                          { 
                            id: 'appbar-reg', 
                            name: 'AppBar_', 
                            type: 'Cerner Appbar', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isCerner: true,
                            identifier: 'axiovital.cerner.appbar.production',
                            version: '3.1.2',
                            lastUpdated: '1 week ago',
                            size: '2.45MB',
                            description: 'Production integration client for Cerner AppBar. Connects directly to local hospital workstations to synchronise patient context and launch clinical workflows with native ActiveX/Java adapters.',
                            features: '• Native OS API bridging\n• Active Directory credentials auto-link\n• Multi-workstation broadcast support',
                            changelog: 'v3.1.2:\n- Improved connection stability with legacy Citrix storefront environments'
                          },
                          { 
                            id: 'citrix', 
                            name: 'Citrix Storefront', 
                            type: 'Citrix Systems', 
                            iconBg: 'bg-white border-gray-200', 
                            isCitrix: true,
                            identifier: 'axiovital.citrix.storefront',
                            version: '4.8.0',
                            lastUpdated: '2 weeks ago',
                            size: '15.42MB',
                            description: 'Allows Axiovital smart extensions to communicate directly with Citrix Storefront virtual desktops. Handles automated application launching, credentials handoff, and virtual workspace session monitoring.',
                            features: '• Workspace App auto-detection\n• Active desktop resolution detection\n• Session failover automation client',
                            changelog: 'v4.8.0:\n- Added HDX protocol acceleration wrapper\n- Upgraded Citrix Receiver SDK'
                          },
                          { 
                            id: 'dragon', 
                            name: 'Dragon-DMO_', 
                            type: 'Nuance Dragon', 
                            iconBg: 'bg-[#0a2f5c]', 
                            isDragon: true,
                            identifier: 'axiovital.nuance.dragon.dmo',
                            version: '5.1.0',
                            lastUpdated: '5 days ago',
                            size: '8.90MB',
                            description: 'Integrates Nuance Dragon Medical One speech recognition dictation services with the Axiovital progress notes editor. Allows clinicians to dictate notes directly using automatic medical terminology vocabulary.',
                            features: '• Direct audio channel mapping\n• Auto-correction vocabulary sync\n• Voice command shortcut parser',
                            changelog: 'v5.1.0:\n- Enhanced voice command shortcuts mapping inside note editing grid'
                          },
                          { 
                            id: 'esm', 
                            name: 'ESM Scheduling_', 
                            type: 'Cerner Scheduling', 
                            iconBg: 'bg-white border-gray-200', 
                            isEsm: true,
                            identifier: 'axiovital.cerner.esm.scheduling',
                            version: '2.9.4',
                            lastUpdated: '1 month ago',
                            size: '4.20MB',
                            description: 'Cerner Enterprise Scheduling Management integration tool. Automatically pulls rescheduled appointments, pending requests, and assigns room queues for incoming patient check-ins.',
                            features: '• Real-time queue monitoring\n• Automatic reschedule push notifications\n• Doctor roster matching database',
                            changelog: 'v2.9.4:\n- Added check-in queue priority tags configuration panel'
                          },
                          { 
                            id: 'icare', 
                            name: 'iCare', 
                            type: 'iCare Platform', 
                            iconBg: 'bg-white border-gray-200', 
                            isIcare: true,
                            identifier: 'axiovital.icare.ehr',
                            version: '3.6.0',
                            lastUpdated: '12 days ago',
                            size: '6.75MB',
                            description: 'Electronic Health Record connector for iCare systems. Imports patient demographics, encounter timelines, and medication histories directly into Axiovital workspace pages.',
                            features: '• HL7 FHIR query parser\n• Allergy list cross-checking engine\n• Offline cache and sync database',
                            changelog: 'v3.6.0:\n- Migrated database connector to modern FHIR R4 schema interfaces'
                          },
                          { 
                            id: 'ipac', 
                            name: 'IPAC - MGH Cleaning Guidelines', 
                            type: 'Adobe Acrobat', 
                            iconBg: 'bg-[#f40f0f]', 
                            isPdf: true,
                            identifier: 'axiovital.pdf.mgh.cleaning',
                            version: '1.0.4',
                            lastUpdated: '6 months ago',
                            size: '2.58MB',
                            description: 'Interactive PDF guidelines manual for MGH cleaning and disinfection protocols. Fully searchable with hyperlinked chapters, quick reference cards, and index links.',
                            features: '• High-performance PDF renderer\n• Highlight and notes tool\n• Quick keyword index search bar',
                            changelog: 'v1.0.4:\n- Updated sanitization compound references lists'
                          },
                          { 
                            id: 'notepad', 
                            name: 'Notepad', 
                            type: 'System Tool', 
                            iconBg: 'bg-white border-gray-200', 
                            isNotepad: true,
                            identifier: 'axiovital.system.notepad',
                            version: '1.0.0',
                            lastUpdated: '8 months ago',
                            size: '340KB',
                            description: 'Standard notepad utility helper for copying text, cleaning formatting, and draft tracking. Supports auto-save to local workspace memory.',
                            features: '• Text cleanup filters\n• Temporary clipboard registers\n• Markdown draft preview option',
                            changelog: 'v1.0.0:\n- First stable release'
                          },
                          { 
                            id: 'powerchart-mock', 
                            name: 'Powerchart - MOCK_', 
                            type: 'Cerner Powerchart', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isPowerchart: true,
                            identifier: 'axiovital.cerner.powerchart.mock',
                            version: '5.2.0',
                            lastUpdated: '3 days ago',
                            size: '8.50MB',
                            description: 'Simulates the Oracle Cerner PowerChart runtime environment. Supports patient chart automation, progress note injection, and direct smart extension messaging protocols.',
                            features: '• Clinical notes injection emulator\n• Labs and vitals mock query service\n• Patient context listener interface',
                            changelog: 'v5.2.0:\n- Added mock laboratory result generator module'
                          },
                          { 
                            id: 'powerchart-readonly', 
                            name: 'Powerchart - READONLY', 
                            type: 'Cerner Powerchart', 
                            iconBg: 'bg-[#d32f2f]', 
                            isRed: true, 
                            isPowerchart: true,
                            identifier: 'axiovital.cerner.powerchart.readonly',
                            version: '2.1.0',
                            lastUpdated: '2 months ago',
                            size: '5.80MB',
                            description: 'A read-only mode wrapper for the PowerChart environment simulator. Allows automation tools to verify chart items, diagnostics, and patient summaries without modifying live records.',
                            features: '• Zero-write permissions security lock\n• Document export listener\n• XML reports parsing console',
                            changelog: 'v2.1.0:\n- Added automated chart contents export parser module'
                          },
                          { 
                            id: 'powerchart-reg', 
                            name: 'Powerchart_', 
                            type: 'Cerner Powerchart', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isPowerchart: true,
                            identifier: 'axiovital.cerner.powerchart.production',
                            version: '6.3.4',
                            lastUpdated: '4 days ago',
                            size: '14.85MB',
                            description: 'Production integration client for Oracle Cerner PowerChart. Automatically links current patient encounters to active hospital workstation records.',
                            features: '• Native windows shell integration\n• High-performance SOAP/REST client\n• Patient safety context validation checks',
                            changelog: 'v6.3.4:\n- Enhanced support for high-DPI desktop scale factors'
                          },
                          { 
                            id: 'tech-remote', 
                            name: 'TECH Remote Support', 
                            type: 'TeamViewer Support', 
                            iconBg: 'bg-[#0080ff]', 
                            isTech: true,
                            identifier: 'axiovital.remote.support',
                            version: '12.0.4',
                            lastUpdated: '10 days ago',
                            size: '8.12MB',
                            description: 'Integrated TeamViewer Remote Support launcher. Allows system administrators to quickly connect to this workstation for diagnostic monitoring or configuration fixes.',
                            features: '• One-click support request trigger\n• Diagnostic logs export helper\n• Active connection status panel',
                            changelog: 'v12.0.4:\n- Upgraded TeamViewer client SDK version'
                          }
                        ].map((app) => (
                          <div 
                            key={app.id} 
                            onClick={() => {
                              setSelectedAutomationTool(app);
                              setActiveDetailTab('details');
                            }}
                            className="bg-white border border-[#bdcddc] hover:border-blue-500 hover:shadow-md transition-all p-3.5 flex flex-col items-center justify-between text-center cursor-pointer min-h-[140px] rounded-none group select-none relative"
                          >
                            {/* Application Icon */}
                            <div className="flex-1 flex items-center justify-center mb-2">
                              <div className={`w-[44px] h-[44px] rounded-sm flex items-center justify-center text-white font-extrabold shadow-sm ${app.iconBg}`}>
                                {app.isCerner && (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${app.isRed ? 'bg-red-650' : 'bg-blue-650'}`}>
                                    A
                                  </div>
                                )}
                                {app.isCitrix && (
                                  <div className="flex flex-wrap w-6 h-6 items-center justify-center gap-0.5">
                                    {[...Array(9)].map((_, i) => (
                                      <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    ))}
                                  </div>
                                )}
                                {app.isDragon && (
                                  <span className="text-[20px]">🐉</span>
                                )}
                                {app.isEsm && (
                                  <div className="w-7 h-7 bg-green-600 rounded-sm flex items-center justify-center text-[16px] text-white font-bold">
                                    S
                                  </div>
                                )}
                                {app.isIcare && (
                                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-[18px] font-serif text-white italic">
                                    i
                                  </div>
                                )}
                                {app.isPdf && (
                                  <span className="text-[14px] font-sans font-extrabold text-white">PDF</span>
                                )}
                                {app.isNotepad && (
                                  <span className="text-[24px]">📝</span>
                                )}
                                {app.isPowerchart && (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${app.isRed ? 'bg-red-750' : 'bg-blue-750'}`}>
                                    P
                                  </div>
                                )}
                                {app.isTech && (
                                  <span className="text-[22px]">🔄</span>
                                )}
                              </div>
                            </div>

                            {/* Text details */}
                            <div className="space-y-0.5 w-full">
                              <div className="font-bold text-[9px] text-gray-800 group-hover:text-blue-900 leading-snug w-full select-text" title={app.name}>
                                {app.name}
                              </div>
                            </div>

                            {/* Chevron at bottom */}
                            <div className="text-[8px] text-gray-300 mt-1 select-none">
                              ▼
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  {/* Tool Popup Modal */}
                  {selectedAutomationTool && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ zIndex: 99999 }}>
                      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col overflow-hidden font-sans text-gray-800" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                           <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded flex items-center justify-center text-white font-extrabold shadow-sm ${selectedAutomationTool.iconBg}`}>
                               {selectedAutomationTool.isCerner && <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${selectedAutomationTool.isRed ? 'bg-red-650' : 'bg-blue-650'}`}>A</div>}
                               {selectedAutomationTool.isCitrix && <div className="flex flex-wrap w-6 h-6 items-center justify-center gap-0.5">{[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full" />)}</div>}
                               {selectedAutomationTool.isDragon && <span className="text-[20px]">🐉</span>}
                               {selectedAutomationTool.isEsm && <div className="w-7 h-7 bg-green-600 rounded-sm flex items-center justify-center text-[16px] text-white font-bold">S</div>}
                               {selectedAutomationTool.isIcare && <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-[18px] font-serif text-white italic">i</div>}
                               {selectedAutomationTool.isPdf && <span className="text-[14px] font-sans font-extrabold text-white">PDF</span>}
                               {selectedAutomationTool.isNotepad && <span className="text-[24px]">📝</span>}
                               {selectedAutomationTool.isPowerchart && <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${selectedAutomationTool.isRed ? 'bg-red-750' : 'bg-blue-750'}`}>P</div>}
                               {selectedAutomationTool.isTech && <span className="text-[22px]">🔄</span>}
                             </div>
                             <div>
                               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                 {selectedAutomationTool.name}
                               </h2>
                               <p className="text-sm text-gray-500">{selectedAutomationTool.description.length > 80 ? selectedAutomationTool.description.substring(0, 80) + '...' : selectedAutomationTool.description}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-3">
                             <button className="bg-[#1a1a1a] hover:bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
                               <span className="text-lg leading-none">+</span> Add connector
                             </button>
                             <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); setSelectedAutomationTool(null); }}
                               className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
                             >
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                             </button>
                           </div>
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 overflow-hidden">
                          {/* Left Column - Overview */}
                          <div className="w-[300px] border-r border-gray-100 p-6 overflow-y-auto flex flex-col gap-8 bg-gray-50/30">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-4">Overview</h3>
                              <ul className="space-y-4">
                                {selectedAutomationTool.features.split('\n').map((feature: string, idx: number) => (
                                  <li key={idx} className="flex gap-3 text-sm text-gray-600 leading-snug">
                                    <div className="mt-0.5 text-gray-400 bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px]">➔</div>
                                    <span>{feature.replace('• ', '')}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mt-auto pt-6">
                              <div>
                                <h3 className="text-xs font-semibold text-gray-900 mb-3">Links</h3>
                                <ul className="space-y-3">
                                  <li><a href="#" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Website</a></li>
                                  <li><a href="#" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> Documentation</a></li>
                                  <li><a href="#" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Support</a></li>
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold text-gray-900 mb-3">Developed by</h3>
                                <div className="text-gray-500">Axiovital</div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Tools */}
                          <div className="flex-1 p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-sm font-semibold text-gray-900">Tools</h3>
                              <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input type="text" placeholder="Search tools" className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-[240px]" />
                              </div>
                            </div>

                            {/* Section 1 */}
                            <div className="mb-6">
                              <div className="bg-gray-50 px-3 py-2 rounded-md flex justify-between items-center text-sm mb-2 border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                  Read-only tools
                                </div>
                                <button className="text-xs font-medium bg-white border border-gray-200 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-gray-50 text-gray-700 cursor-pointer">
                                  Allow <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between items-start py-3 px-2 border-b border-gray-50 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Read Configuration</h4>
                                    <p className="text-sm text-gray-500">Read system configuration for {selectedAutomationTool.name}.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-start py-3 px-2 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Search Logs</h4>
                                    <p className="text-sm text-gray-500">Search and read operational logs.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Section 2 */}
                            <div>
                              <div className="bg-gray-50 px-3 py-2 rounded-md flex justify-between items-center text-sm mb-2 border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                  Write / delete tools
                                </div>
                                <button className="text-xs font-medium bg-white border border-gray-200 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-gray-50 text-gray-700 cursor-pointer">
                                  Allow <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between items-start py-3 px-2 border-b border-gray-50 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Execute Workflows</h4>
                                    <p className="text-sm text-gray-500">Trigger automation workflows via this connector.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-start py-3 px-2 border-b border-gray-50 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Update Data</h4>
                                    <p className="text-sm text-gray-500">Modify external state via write API operations.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="border border-blue-900/30 rounded-sm overflow-hidden bg-white shadow-sm">
                  {/* Header Title Section */}
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] p-2 font-bold text-xs text-[#002a46] flex justify-between items-center select-none">
                    <span>Component Manager - Core Application Settings</span>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[10px] text-gray-700">Refresh Settings</button>
                  </div>
                  
                  <div className="p-4 space-y-4 text-[11px] text-[#333333]">
                    {/* Informational description */}
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-sm text-blue-900 leading-relaxed select-none">
                      Select or deselect the options below to activate or deactivate the respective configuration elements across this environment. After making changes, click the "Save Changes" button to apply settings.
                    </div>

                    <div className="space-y-4 mt-2">
                      {[
                        { key: 'Imaging', name: 'Imaging', desc: 'This Component acts as the interface for any IPM Documents checked into Content Server and tools such as ADF Viewer use functionality and services provided by this component.' },
                        { key: 'IpmRepository', name: 'IpmRepository', desc: 'The IpmRepository component adds functionality to the content server to allow Oracle WebCenter Content: Imaging to store documents and metadata in the content server.' },
                        { key: 'LinkManager', name: 'LinkManager', desc: 'This component extracts URL links of indexed documents, evaluates, filters and parses the URLs according to a pattern engine and then stores the results in a database table. Since the link extraction happens during the indexing cycle, only the links of released documents are managed.' },
                        { key: 'MSOfficeHtmlConverterSupport', name: 'MSOfficeHtmlConverterSupport', desc: 'The MSOfficeHTMLConverter component requires the IBR be running on MS Windows and MS Office installed with IBR. This component allows the Inbound Refinery to convert native MS Office formats (Word, Excel, Powerpoint and Visio) to HTML using the Office application.' },
                        { key: 'OracleDocumentsFolders', name: 'OracleDocumentsFolders', desc: 'This component enables Content Server to seamlessly integrate with Oracle Content and Experience Cloud. It allows user to store and retrieve documents stored in Oracle Content and Experience Cloud. It also provides the ability to copy content stored in the Content Server to Oracle Content and Experience Cloud.' },
                        { key: 'PDFWatermark', name: 'PDFWatermark', desc: 'PDFWatermark enables watermarks to be applied to PDF files generated by the Inbound Refinery\'s PDFConverter component and returned to the Content Server. Existing PDF files, already residing on the Content Server can also be watermarked. Dynamic watermarks are generated on-the-fly and can contain variable information.' },
                        { key: 'PortalVCRHelper', name: 'PortalVCRHelper', desc: 'PortalVCRHelper is used to integrate SiteStudio into WebCenter Portal\'s Content Presenter component. PortalVCRHelper should be enabled in order to surface SiteStudio content within WebCenter Portal.' },
                        { key: 'RedwoodUI', name: 'RedwoodUI', desc: 'This component offers a modern, configurable user interface built with Oracle Redwood design principles. RedwoodUI requires that FrameworkFolders be installed and enabled.' },
                        { key: 'SESCrawlerExport', name: 'SESCrawlerExport', desc: 'The SESCrawlerExport component adds functionality to the content server to allow it to be searched via the Oracle SES.' },
                        { key: 'SharedLinks', name: 'SharedLinks', desc: 'This component supports sharing and managing public links on folders and files. Guest users can use public links to access folders and files without authentication.' },
                        { key: 'SiebelEcmIntegration', name: 'SiebelEcmIntegration', desc: 'This component is a required part of the Siebel Adapter for Oracle WebCenter Content. It allows Siebel CRM users to store and retrieve Siebel business entity attached documents managed in the Content Server repository. The SiebelIntegrationSearchDisplay component also needs to be enabled for this component to function correctly.' },
                        { key: 'SiebelFilter', name: 'SiebelFilter', desc: '[OPTIONAL] This component is an optional part of the Siebel Adapter for Oracle WebCenter Content. It enables filtering of attachments based on criteria before indexing.' }
                      ].map((comp) => (
                        <div key={comp.key} className="flex gap-2.5 items-start hover:bg-gray-50 p-2 rounded-sm border-b border-gray-100 pb-3 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={oracleComponents[comp.key] || false}
                            onChange={(e) => {
                              setOracleComponents(prev => ({
                                ...prev,
                                [comp.key]: e.target.checked
                              }));
                            }}
                            className="mt-0.5 rounded-sm w-3.5 h-3.5 border-gray-300 text-blue-900 focus:ring-blue-900 cursor-pointer" 
                            id={`ora-comp-${comp.key}`} 
                          />
                          <div className="space-y-1">
                            <label htmlFor={`ora-comp-${comp.key}`} className="font-bold text-blue-900 cursor-pointer hover:underline text-[11px] block">{comp.name}</label>
                            <p className="text-gray-600 text-[10px] leading-relaxed">{comp.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 select-none border-t border-gray-100">
                      <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 text-gray-700 font-bold px-4 py-1.5 rounded-sm text-[10px] transition-all">
                        Reset Configuration
                      </button>
                      <button className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-1.5 rounded-sm text-[10px] shadow-sm transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (!isLoggedIn) {
    return (
      <div className="w-screen h-screen bg-[#04608c] flex flex-col justify-between text-white font-sans overflow-hidden select-none relative p-8">
        
        {/* Top-Left Branding Header */}
        <div className="flex items-center gap-2 select-none">
          <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-white font-sans">AxioVital</span>
        </div>

        {/* Center Auth Panel */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-8">
          {/* Millennium Beveled Title */}
          <div className="mb-8 select-none text-center">
            <span 
              className="text-[38px] font-bold tracking-normal font-sans"
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.5px'
              }}
            >
              AxioVital Environment<span className="text-[18px] align-super ml-1">™</span>
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 w-[280px]">
            {loginError && (
              <div className="bg-red-950/40 border border-red-800 text-red-300 p-2 text-center text-[10px] mb-2 font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-medium tracking-wide block">User Name :</label>
              <select 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[24px] border border-gray-400 bg-white text-black px-1.5 text-[11.5px] focus:outline-none rounded-none appearance-none"
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")', 
                  backgroundPosition: 'right 4px center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '16px' 
                }}
              >
                <option value="">Select User...</option>
                <option value="administrator">Administrator</option>
                <option value="dr_stewart">Dr. Herman Stewart</option>
                <option value="dr_sharma">Dr. R. Sharma</option>
                <option value="dr_iyer">Dr. K. Iyer</option>
                <option value="nurse_jenkins">Nurse Jenkins</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium tracking-wide block">Password :</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[24px] border border-gray-400 bg-white text-black px-2 text-[11.5px] focus:outline-none rounded-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium tracking-wide block">Domain :</label>
              <select 
                defaultValue="PRODX"
                className="w-full h-[24px] border border-gray-400 bg-white text-black px-1.5 text-[11.5px] focus:outline-none rounded-none appearance-none"
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")', 
                  backgroundPosition: 'right 4px center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '16px' 
                }}
              >
                <option value="PROD">PROD</option>
                <option value="PRODX">PRODX</option>
                <option value="TEST">TEST</option>
              </select>
            </div>

            {/* Buttons Row */}
            <div className="flex justify-center gap-4 pt-3 select-none">
              <button 
                type="submit"
                className="w-[100px] h-[25px] border border-[#7f7f7f] bg-[#cccccc] hover:bg-[#d8d8d8] text-black font-medium shadow-sm active:bg-[#b8b8b8] focus:outline-none text-[11px] transition-all"
                style={{
                  borderWidth: '1.5px',
                  borderStyle: 'outset',
                  borderColor: '#eeeeee #555555 #555555 #eeeeee'
                }}
              >
                OK
              </button>
              <button 
                type="button"
                onClick={() => { setEmail(''); setPassword(''); setLoginError(''); }}
                className="w-[100px] h-[25px] border border-[#7f7f7f] bg-[#cccccc] hover:bg-[#d8d8d8] text-black font-medium shadow-sm active:bg-[#b8b8b8] focus:outline-none text-[11px] transition-all"
                style={{
                  borderWidth: '1.5px',
                  borderStyle: 'outset',
                  borderColor: '#eeeeee #555555 #555555 #eeeeee'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Footer Area */}
        <div className="w-full shrink-0 flex flex-col justify-end text-left select-none">
          <div className="text-base font-bold text-white tracking-wide mb-1">Operating Environment</div>
          <div className="text-[9.5px] text-gray-300/80 leading-relaxed font-sans">
            <div>© 2026 AxioVital Corporation. All rights reserved.</div>
            <div className="mt-0.5">Access and use of this solution system (including components thereof) require, and are governed by, license(s) from AxioVital Corporation.</div>
            <div className="mt-0.5">Unauthorized use, access, reproduction, display or distribution of any portion of this solution or the data contained therein may result in severe civil damages and criminal penalties. Further information may be found in Help About.</div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div onMouseMove={handleDrag} onMouseUp={handleEndDrag} className="flex flex-col h-screen bg-[#f0f4f8] text-[#1c2833] text-[11px] font-sans overflow-hidden select-none">
      
      {!isFullscreen && (
        <>
          {/* Title Bar */}
          <div className="bg-[#002a46] text-white px-3 py-1.5 flex justify-between items-center border-b border-[#001729]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-wide">AxioVital Operating Environment</span>
            </div>
          </div>

      {/* Classic Menu Bar */}
      <div className="bg-[#f0f4f8] border-b border-[#bdcddc] px-3 py-0.5 flex gap-3 text-[#2c3e50] text-[10.5px] items-center relative z-50">
        {isHomeDropdownOpen && (
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsHomeDropdownOpen(false)}
          />
        )}
        <div className="relative z-50">
          <button 
            onClick={() => {
              setIsHomeDropdownOpen(!isHomeDropdownOpen);
            }}
            className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold"
          >
            Home
          </button>
          
          {isHomeDropdownOpen && (
            <div className="absolute left-0 top-full mt-0.5 bg-white border border-[#b0b0b0] text-[#333333] text-[11px] p-0 w-[180px] shadow-lg rounded-none z-50 py-1 font-sans">
              {[
                { name: 'Home', type: 'Home' },
                { name: 'Message Centre', type: 'MessageCenter' },
                { name: 'Patient Overview', type: 'PatientProfile' },
                { name: 'Tracking Shell', type: 'TrackingShell' },
                { name: 'Perioperative Tracking', disabled: true },
                { name: 'Ambulatory Organizer', disabled: true },
                { name: 'Referral Management', type: 'ReferralTransfer' },
                { name: 'Customised', disabled: true },
                { name: 'Patient List', type: 'PatientList' },
                { name: 'Therapeutic Note', disabled: true },
                { name: 'Dynamic Worklist', disabled: true },
                { name: 'Reports', disabled: true },
                { name: 'Auto Text Copy', disabled: true },
                { name: 'Requisition Manager', disabled: true },
                { name: 'Preferences', type: 'HelpCentre' },
                { divider: true },
                { name: 'Toolbar', hasSubmenu: true },
                { name: 'Customize...', isCustomize: true }
              ].map((item, idx) => {
                if (item.divider) {
                  return <div key={idx} className="border-t border-gray-250 my-1" />;
                }
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (item.disabled) return;
                      if (item.type) {
                        selectOrOpenTab(item.type as any, item.name, item.type.toLowerCase() + '-tab');
                      } else if (item.isCustomize) {
                        alert('Customize selected');
                      }
                      setIsHomeDropdownOpen(false);
                    }}
                    className="px-4 py-1 flex justify-between items-center text-[11.5px] cursor-pointer text-[#333333] hover:bg-[#0f4471] hover:text-white"
                  >
                    <span>{item.name}</span>
                    {item.hasSubmenu && <span className="text-[9px]">▶</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors">
          Ledger
        </button>

        {/* Patient Dropdown Trigger */}
        <div className="relative group">
          <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#002a46]">
            ambulatory
          </button>
          <div className="absolute left-0 top-full -mt-0.5 hidden group-hover:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[180px] shadow-md rounded-none select-none z-50">
            <div className="py-0.5">
              <div 
                onClick={() => selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab')} 
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]"
              >
                New Patient
              </div>
              <div 
                onClick={() => selectOrOpenTab('RescheduleRequests', 'Appointment Reschedule Requests', 'reschedule-requests-tab')}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]"
              >
                Appointment Request
              </div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div 
                onClick={() => selectOrOpenTab('ReferralTransfer', 'Referrals & Transfers', 'referrals-transfers-tab')}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]"
              >
                Referrals & Transfer
              </div>
              <div 
                onClick={() => selectOrOpenTab('DischargeList', 'Discharge List', 'discharge-list-tab')}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]"
              >
                Discharge List
              </div>
            </div>
          </div>
        </div>

        {/* Simple clinical menu trigger */}
        <div className="relative group">
          <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#002a46]">
            Clinical
          </button>
          <div className="absolute left-0 top-full -mt-0.5 hidden group-hover:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[180px] shadow-md rounded-none select-none overflow-y-auto max-h-[85vh] scrollbar-none z-50">
            <style dangerouslySetInnerHTML={{__html: `
              .scrollbar-none::-webkit-scrollbar { display: none; }
            `}} />
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Provider View</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Results Review</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Orders</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Documentation</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Outside Records</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Allergies</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Clinical Media</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Diagnoses and Problems</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Form Browser</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Growth Chart</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Histories</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Interactive View and I/O</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">MAR Summary</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Medication List</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Patient Information</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Recommendations</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Smart App Validator</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">AxioNote - Clinical Note</div>
              <div className="px-4 py-1 bg-[#0f4471] text-white rounded-none cursor-pointer outline-none">AxioNote - Edge Platform</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">AxioNote - Enterprise</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">WorkflowView Edge</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">AxioNote Dev - Edge</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">AxioNote Debug EDGE</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Clinical Calculator</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Ad Hoc Charting</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">View Charges</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none">Patient Pharmacy</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none flex justify-between items-center">
                <span>Chart Accessed By</span>
                <span className="text-[8px] text-gray-500">▶</span>
              </div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 text-gray-400 rounded-none cursor-not-allowed select-none bg-white">Close Charts</div>
            </div>
          </div>
        </div>


        {/* Top Notifications Trigger */}
        <button 
          onClick={() => selectOrOpenTab('Notifications', 'Notifications', 'notifications-tab')}
          className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors"
        >
          Notifications
        </button>

        {/* Admin Dropdown Trigger */}
        <div className="relative group">
          <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#002a46]">
            Admin
          </button>
          <div className="absolute left-0 top-full -mt-0.5 hidden group-hover:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[180px] shadow-md rounded-none select-none z-50">
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Command Center</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Organization</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">User Management</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Workforce</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Operations</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Finance</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Security</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Compliance</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">AI Administration</div>
            </div>
          </div>
        </div>
        
        {/* Help Dropdown Trigger */}
        {isHelpDropdownOpen && (
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsHelpDropdownOpen(false)}
          />
        )}
        <div className="relative z-50">
          <button 
            onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
            className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#002a46]"
          >
            Help
          </button>
          {isHelpDropdownOpen && (
            <div className="absolute right-0 top-full mt-0.5 bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[180px] shadow-md rounded-none select-none z-50">
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Welcome</div>
              <div 
                onClick={() => { selectOrOpenTab('HelpCentre', 'Help Center', 'help-center-tab'); setIsHelpDropdownOpen(false); }}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] font-semibold"
              >
                Show All Commands
              </div>
              {/* Editor Playground Dropdown Option with submenus */}
              <div className="relative group/playground px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] flex justify-between items-center">
                <span>Editor Playground</span>
                <span className="text-[9px] text-gray-500 group-hover/playground:text-white ml-2">▶</span>
                
                {/* Submenu A: Editor options card - opens to the RIGHT */}
                <div className="absolute left-full top-0 ml-0.5 hidden group-hover/playground:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[240px] shadow-md rounded-none select-none z-[100] text-left">
                  <div className="py-0.5">
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Command Palette...</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+P</span>
                    </div>
                    <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                      Open View...
                    </div>
                  </div>
                  
                  <div className="border-t border-[#e2e2e2] my-0.5"></div>
                  
                  <div className="py-0.5">
                    {/* Appearance Submenu */}
                    <div className="relative group/appearance flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                      <span>Appearance</span>
                      <span className="text-[9px] text-gray-500 group-hover/appearance:text-white ml-2">▶</span>
                      
                      {/* Appearance Options - opens to the RIGHT */}
                      <div className="absolute left-full top-0 ml-0.5 hidden group-hover/appearance:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[200px] shadow-md rounded-none select-none z-[110] text-left">
                        <div className="py-0.5">
                          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/app-item">
                            <span>Toggle Side Bar</span>
                            <span className="text-[10px] text-gray-400 group-hover/app-item:text-blue-100">Ctrl+B</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/app-item">
                            <span>Toggle Panel</span>
                            <span className="text-[10px] text-gray-400 group-hover/app-item:text-blue-100">Ctrl+J</span>
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Toggle Status Bar
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Toggle Menu Bar
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Toggle Activity Bar
                          </div>
                          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/app-item">
                            <span>Toggle Zen Mode</span>
                            <span className="text-[10px] text-gray-400 group-hover/app-item:text-blue-100">Ctrl+K Z</span>
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Centered Layout
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Editor Layout Submenu */}
                    <div className="relative group/layout flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                      <span>Editor Layout</span>
                      <span className="text-[9px] text-gray-500 group-hover/layout:text-white ml-2">▶</span>
                      
                      {/* Submenu B: Split editor options - opens to the RIGHT */}
                      <div className="absolute left-full top-0 ml-0.5 hidden group-hover/layout:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[240px] shadow-md rounded-none select-none z-[110] text-left">
                        <div className="py-0.5">
                          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/layout-item">
                            <span>Split Up</span>
                            <span className="text-[10px] text-gray-400 group-hover/layout-item:text-blue-100">Ctrl+K Ctrl+\</span>
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Split Down
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Split Left
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Split Right
                          </div>
                        </div>
                        
                        <div className="border-t border-[#e2e2e2] my-0.5"></div>
                        
                        <div className="py-0.5">
                          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/layout-item">
                            <span>Split in Group</span>
                            <span className="text-[10px] text-gray-400 group-hover/layout-item:text-blue-100">Ctrl+K Ctrl+Shift+\</span>
                          </div>
                        </div>
                        
                        <div className="border-t border-[#e2e2e2] my-0.5"></div>
                        
                        <div className="py-0.5">
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Move Editor into New Window
                          </div>
                          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/layout-item">
                            <span>Copy Editor into New Window</span>
                            <span className="text-[10px] text-gray-400 group-hover/layout-item:text-blue-100">Ctrl+K O</span>
                          </div>
                        </div>
                        
                        <div className="border-t border-[#e2e2e2] my-0.5"></div>
                        
                        <div className="py-0.5">
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Single
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Two Columns
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Three Columns
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Two Rows
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Three Rows
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Grid (2x2)
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Two Rows Right
                          </div>
                          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                            Two Columns Bottom
                          </div>
                        </div>
                        
                        <div className="border-t border-[#e2e2e2] my-0.5"></div>
                        
                        <div className="py-0.5">
                          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/layout-item">
                            <span>Flip Layout</span>
                            <span className="text-[10px] text-gray-400 group-hover/layout-item:text-blue-100">Shift+Alt+0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#e2e2e2] my-0.5"></div>
                  
                  <div className="py-0.5">
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Explorer</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+E</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Search</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+F</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Source Control</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+G G</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Run</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+D</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Extensions</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+X</span>
                    </div>
                    <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">
                      Testing
                    </div>
                  </div>
                  
                  <div className="border-t border-[#e2e2e2] my-0.5"></div>
                  
                  <div className="py-0.5">
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Problems</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+M</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Output</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+U</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Debug Console</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+Shift+Y</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Terminal</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Ctrl+`</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#e2e2e2] my-0.5"></div>
                  
                  <div className="py-0.5">
                    <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] group/item">
                      <span>Word Wrap</span>
                      <span className="text-[10px] text-gray-400 group-hover/item:text-blue-100">Alt+Z</span>
                    </div>
                  </div>
                </div>
              </div>
              <div onClick={() => setIsHelpDropdownOpen(false)} className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Open Walkthrough...</div>
              <div onClick={() => setIsHelpDropdownOpen(false)} className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Provide Feedback</div>
              <div onClick={() => setIsHelpDropdownOpen(false)} className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Download Diagnostics</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div onClick={() => setIsHelpDropdownOpen(false)} className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">View License</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div 
                onClick={() => { selectOrOpenTab('DeveloperTools', 'Developer Tools & System Settings', 'dev-tools-tab'); setIsHelpDropdownOpen(false); }}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]"
              >
                Toggle Developer Tools
              </div>
              <div onClick={() => setIsHelpDropdownOpen(false)} className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Open Process Explorer</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div onClick={() => setIsHelpDropdownOpen(false)} className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Check for Updates...</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div onClick={() => setIsHelpDropdownOpen(false)} className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">About</div>
            </div>
          </div>
          )}
        </div>
        
        {/* Modifying 3-dots (Right Side) */}
        <div className="ml-auto flex items-center pr-1">
          <div className="flex flex-col gap-[2px] cursor-pointer hover:bg-[#dbe6ef] p-1.5 rounded transition-colors" title="Customize Menu Bar">
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  )}

  {!isFullscreen && (
    <>
      {/* Classic Toolbar Buttons (Ribbon 1) */}
      <div className="bg-white border-b border-[#bdcddc] px-2 py-1 flex items-center gap-1.5 flex-wrap">
        <button 
          onClick={() => selectOrOpenTab('MessageCenter', 'General Messages: JOHN DOE', 'msg-doe')}
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold"
        >
          Message Center
        </button>
        <button 
          onClick={() => selectOrOpenTab('PatientList', 'Patient List', 'patient-list-tab')}
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold text-[#0d7a86]"
        >
          Patient List
        </button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Physician Handoff</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Care Workflow</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Quality Measures</button>
        <button onClick={() => selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab')} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Customised</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Reports</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">UpToDate</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">AxioCard</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Protocol Library</button>

        {/* Modifying 3-dots (Right Side) */}
        <div className="ml-auto flex items-center pr-1">
          <div className="flex flex-col gap-[2px] cursor-pointer hover:bg-gray-200 p-1.5 rounded transition-colors" title="Customize Toolbar">
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcut Row (Ribbon 2) */}
      <div className="bg-[#eef2f5] border-b border-[#bdcddc] px-3 py-1 flex gap-3 text-[#4f5f6f] items-center text-[10.5px]">
        <button 
          onClick={() => selectOrOpenTab('Home', 'Home', 'home-tab')}
          className={`flex items-center gap-1 hover:text-black ${activeTab.type === 'Home' ? 'font-semibold text-[#002a46]' : ''}`}
        >
          Dashboard
        </button>
        
        {/* Scheduler Shortcut Tab Trigger */}
        <button 
          onClick={() => selectOrOpenTab('RescheduleRequests', 'Appointment Reschedule Requests', 'reschedule-requests-tab')}
          className="flex items-center gap-1 hover:text-black font-semibold text-[#002a46]"
        >
          Scheduler
        </button>
        
        <button 
          onClick={() => selectOrOpenTab('ClinicalDecisionSupport', 'Clinical Decision Support', 'cds-tab')}
          className={`flex items-center gap-1 hover:text-black ${activeTab.type === 'ClinicalDecisionSupport' ? 'font-semibold text-[#002a46]' : ''}`}
        >
          Clinical Decision Support
        </button>
        <button 
          onClick={() => selectOrOpenTab('Orders', 'Orders', 'orders-tab')}
          className="flex items-center gap-1 hover:text-black font-semibold text-[#002a46]"
        >
          Order Sets
        </button>
        <button className="flex items-center gap-1 hover:text-black">Care Pathways</button>
        <button 
          onClick={() => selectOrOpenTab('Labs', 'Labs', 'labs-tab')}
          className={`flex items-center gap-1 hover:text-black ${activeTab.type === 'Labs' ? 'font-semibold text-[#002a46]' : ''}`}
        >
          Labs
        </button>
        <button 
          onClick={() => selectOrOpenTab('Analytics', 'Analytics Overview', 'analytics-overview')}
          className="flex items-center gap-1 hover:text-black font-semibold"
        >
          Analytics
        </button>

        {/* Modifying 3-dots (Right Side) */}
        <div className="ml-auto flex items-center pr-1">
          <div className="flex flex-col gap-[2px] cursor-pointer hover:bg-gray-200 p-1.5 rounded transition-colors" title="Customize Shortcut Row">
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  )}

      {/* Blue Header Banner */}
      {!isFullscreen && (
        <div className="bg-gradient-to-r from-[#0b4c76] to-[#136090] text-white px-3 py-1.5 flex justify-between items-center border-b border-[#001729]">
        <span className="font-bold text-xs">
          {activeTab.type === 'MessageCenter' && 'Message Center'}
          {activeTab.type === 'Analytics' && 'Analytics'}
          {activeTab.type === 'PatientList' && 'Patient Directory'}
          {activeTab.type === 'Notifications' && 'Notification Center'}
          {activeTab.type === 'PatientProfile' && 'Patient Profile'}
          {activeTab.type === 'EditPatientProfile' && 'Edit Patient Profile'}
          {activeTab.type === 'MedicalReport' && 'Medical Report Form'}
          {activeTab.type === 'HelpCentre' && 'Help Center'}
          {activeTab.type === 'RescheduleRequests' && 'Appointment Reschedule Requests'}
          {activeTab.type === 'AdmitPatient' && 'Admit Patient'}
          {activeTab.type === 'ReferralTransfer' && 'Referral & Transfer Management'}
          {activeTab.type === 'DischargeList' && 'Patient Discharge List'}
          {activeTab.type === 'Orders' && 'Orders'}
          {activeTab.type === 'ClinicalDecisionSupport' && 'Clinical Decision Support System (CDSS) Control Panel'}
          {activeTab.type === 'Labs' && 'Labs'}
          {(activeTab.type as string) === 'Home' && 'Home'}
          {(activeTab.type as string) === 'DeveloperTools' && 'Developer Configuration & System Administration'}
          {activeTab.type === 'BillingReceipt' && 'Billing & Payments Receipt'}
        </span>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#00223b] border border-[#0d3455] rounded px-1.5 py-0.5">
            <span className="text-[10px] text-gray-400 mr-1.5">🔍</span>
            <input
              type="text"
              placeholder="Search by Patient or Order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-[10px] placeholder-gray-400 focus:outline-none w-[160px]"
            />
          </div>
          
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-[#c1d6e5] hover:text-white text-[10.5px] flex items-center gap-1 transition-colors font-semibold bg-transparent border-none py-0.5 px-1.5 focus:outline-none cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-[#c1d6e5] hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" strokeLinecap="square" />
              <rect x="9.5" y="9.5" width="5" height="5" fill="none" />
            </svg>
            {isFullscreen ? 'Exit Full Screen' : 'Full screen'}
          </button>
          
          {/* Printer Icon prints / saves Medical Report directly to PDF */}
          <button 
            onClick={() => {
              // Create temporary container for print layout
              const printFrame = document.createElement('div');
              printFrame.id = 'print-report-frame';
              printFrame.innerHTML = `
                <div style="width: 800px; padding: 40px; font-family: serif; color: #333; line-height: 1.6; font-size: 13px; background: white;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 28px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 10px; font-family: sans-serif; text-transform: uppercase;">Medical Report</h1>
                  </div>

                  <div style="display: grid; grid-template-columns: 80px 1fr 60px 180px; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 15px;">
                    <span style="font-weight: bold;">Name:</span>
                    <span style="border-bottom: 1px solid #666; font-weight: bold;">${editFirstName} ${editMiddleInitial} ${editLastName}</span>
                    <span style="font-weight: bold; padding-left: 10px;">Date:</span>
                    <span style="border-bottom: 1px solid #666;">05/28/2025</span>

                    <span style="font-weight: bold; grid-column: span 2;">When did your problem start?:</span>
                    <span style="border-bottom: 1px solid #666; grid-column: span 2;">11/25/2004</span>

                    <span style="font-weight: bold; grid-column: span 2;">Describe Problem:</span>
                    <span style="border-bottom: 1px solid #666; grid-column: span 2;">Nasal polyps, Allergic rhinitis, Acute sinusitis</span>
                  </div>

                  <div style="margin-bottom: 20px;">
                    <div style="font-weight: bold; margin-bottom: 8px;">Cause of Current Problem:</div>
                    <div style="display: flex; gap: 20px;">
                      <label><input type="checkbox" disabled /> Car Accident</label>
                      <label><input type="checkbox" disabled /> Work injury</label>
                      <label><input type="checkbox" checked disabled /> Gradual onset</label>
                      <label><input type="checkbox" disabled /> Other</label>
                    </div>
                  </div>

                  <div style="margin-bottom: 20px;">
                    <div style="font-weight: bold; margin-bottom: 8px;">Did this Problem require Surgery:</div>
                    <div style="display: flex; gap: 20px;">
                      <label><input type="checkbox" checked disabled /> No</label>
                      <label><input type="checkbox" disabled /> Yes</label>
                      <span style="color: #666;">Yes Date of Surgery: ______________________</span>
                    </div>
                  </div>

                  <div style="border: 1px solid #666; padding: 15px; margin-bottom: 20px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 12px;">Past Medical History (Do you have a history of the following problems?)</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                      <label><input type="checkbox" checked disabled /> Breathing Problems</label>
                      <label><input type="checkbox" disabled /> Stroke</label>
                      <label><input type="checkbox" disabled /> Depression</label>
                      <label><input type="checkbox" disabled /> Pregnant</label>
                      <label><input type="checkbox" disabled /> Bone/joint Problems</label>
                      <label><input type="checkbox" disabled /> Bowel/Bladder</label>
                      <label><input type="checkbox" disabled /> Heart Problems</label>
                      <label><input type="checkbox" disabled /> Kidney Problems</label>
                      <label><input type="checkbox" disabled /> History of heavy alcohol use</label>
                      <label><input type="checkbox" disabled /> Current Wound/Skin Problems</label>
                      <label><input type="checkbox" disabled /> Gallbladder/Liver</label>
                      <label><input type="checkbox" disabled /> Drug use</label>
                      <label><input type="checkbox" disabled /> Pacemaker</label>
                      <label><input type="checkbox" disabled /> Electrical implants</label>
                      <label><input type="checkbox" disabled /> Smoking</label>
                      <label><input type="checkbox" disabled /> Tumor/Cancer</label>
                      <label><input type="checkbox" disabled /> Anxiety attacks</label>
                      <label><input type="checkbox" disabled /> Headaches</label>
                      <label><input type="checkbox" disabled /> Diabetes</label>
                      <label><input type="checkbox" disabled /> Sleep Apnea</label>
                    </div>
                  </div>

                  <div style="border: 1px solid #666; padding: 15px; margin-bottom: 20px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between;">
                      <span>Surgeries/Hospitalizations</span>
                      <label style="font-weight: normal;"><input type="checkbox" checked disabled /> No Surgeries</label>
                    </div>
                    <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 8px; border-bottom: 1px solid #ccc; font-weight: bold; text-align: center; padding-bottom: 4px; margin-bottom: 8px;">
                      <span>Surgeries/Hospitalizations</span>
                      <span>Year</span>
                      <span>Complications</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 8px; text-align: center;">
                      <span>—</span>
                      <span>—</span>
                      <span>—</span>
                    </div>
                  </div>

                  <div style="border: 1px solid #666; padding: 15px; margin-bottom: 20px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between;">
                      <span>Medications</span>
                      <label style="font-weight: normal;"><input type="checkbox" checked disabled /> No Medication</label>
                    </div>
                    <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 8px; border-bottom: 1px solid #ccc; font-weight: bold; text-align: center; padding-bottom: 4px; margin-bottom: 8px;">
                      <span>Medication(s)</span>
                      <span>Dose</span>
                      <span>Reason for Medication</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 8px; text-align: center;">
                      <span>—</span>
                      <span>—</span>
                      <span>—</span>
                    </div>
                  </div>

                  <div style="border: 1px solid #666; padding: 15px; margin-bottom: 20px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between;">
                      <span>Allergies</span>
                      <label style="font-weight: normal;"><input type="checkbox" disabled /> No Known allergies</label>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 10px;">
                      <div style="display: flex; gap: 5px;"><span style="font-weight: bold;">Latex</span><label><input type="radio" disabled /> Yes</label><label><input type="radio" checked disabled /> No</label></div>
                      <div style="display: flex; gap: 5px;"><span style="font-weight: bold; color: #b91c1c;">Iodine</span><label><input type="radio" checked disabled /> Yes</label><label><input type="radio" disabled /> No</label></div>
                      <div style="display: flex; gap: 5px;"><span style="font-weight: bold;">Bromine</span><label><input type="radio" disabled /> Yes</label><label><input type="radio" checked disabled /> No</label></div>
                    </div>
                    <div style="display: flex; gap: 8px; border-top: 1px solid #eee; pt: 8px;">
                      <span style="font-weight: bold;">Other:</span>
                      <span style="border-bottom: 1px solid #666; flex: 1;">Penicillin (Severe Hives)</span>
                    </div>
                  </div>

                  <div style="margin-top: 20px; font-size: 12px;">
                    <div style="margin-bottom: 10px;">
                      <span style="font-weight: bold;">Do you have any religious/cultural views that will affect your treatment?</span>
                      <label style="margin-left: 10px;"><input type="checkbox" checked disabled /> No</label>
                      <label style="margin-left: 10px;"><input type="checkbox" disabled /> Yes</label>
                    </div>
                    <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                      <span style="font-weight: bold;">Additional comment (Reading or Memory Problem):</span>
                      <span style="border-bottom: 1px solid #666; flex: 1;"></span>
                    </div>
                    <div style="display: grid; grid-template-columns: 80px 1fr 60px 200px; gap: 15px; margin-top: 30px;">
                      <span style="font-weight: bold;">Signature:</span>
                      <span style="border-bottom: 1px solid #666;"></span>
                      <span style="font-weight: bold; padding-left: 10px;">Date:</span>
                      <span style="border-bottom: 1px solid #666;"></span>
                    </div>
                  </div>
                </div>
              `;

              // Apply custom print styles temporarily
              const printStyle = document.createElement('style');
              printStyle.id = 'print-report-style';
              printStyle.innerHTML = `
                @media print {
                  body > * { display: none !important; }
                  html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
                  #print-report-frame { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
                }
                @media screen {
                  #print-report-frame { display: none !important; }
                }
              `;

              document.body.appendChild(printStyle);
              document.body.appendChild(printFrame);
              
              window.print();

              // Cleanup after printing
              document.body.removeChild(printFrame);
              document.body.removeChild(printStyle);
            }}
            className="text-[#c1d6e5] hover:text-white text-[10.5px] flex items-center gap-1 transition-colors font-semibold bg-transparent border-none py-0.5 px-1.5 focus:outline-none cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-[#c1d6e5] hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="7" fill="none" />
              <line x1="9" y1="17.5" x2="15" y2="17.5" />
            </svg>
            Print
          </button>
          
          <span className="text-[10.5px] text-[#c1d6e5] flex items-center gap-1 font-semibold ml-1 select-none">
            <svg className="w-3.5 h-3.5 text-[#c1d6e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            0 minutes ago
          </span>
        </div>
      </div>
      )}

      {/* Main split view container with Multi-tab Chrome structure */}
      <div className="flex flex-1 overflow-hidden flex-col">
        
        {/* Chrome-Style Tab bar */}
        {!isFullscreen && (
          <div 
            className="bg-[#cbd8e3] border-b border-[#bdcddc] flex items-end px-2 pt-1.5 gap-1 overflow-x-auto select-none whitespace-nowrap [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {openTabs.map((t, idx) => {
            const isActive = t.id === activeTabId;
            return (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', idx.toString());
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (isNaN(fromIdx) || fromIdx === idx) return;
                  const updatedTabs = [...openTabs];
                  const [removed] = updatedTabs.splice(fromIdx, 1);
                  updatedTabs.splice(idx, 0, removed);
                  setOpenTabs(updatedTabs);
                }}
                onClick={() => setActiveTabId(t.id)}
                className={`group relative flex items-center h-7 px-3 text-[10.5px] cursor-pointer rounded-t-md border-t border-x transition-all duration-150 flex-shrink-0 ${
                  isActive 
                    ? 'bg-white border-[#bdcddc] font-bold text-gray-800 z-10' 
                    : 'bg-[#b6c7d6] hover:bg-[#c2d1dd] border-transparent text-gray-600'
                }`}
                style={{ width: '220px' }}
              >
                <span className="truncate pr-4 flex-1 pointer-events-none">
                  {t.type === 'MessageCenter' && selectedMessage 
                    ? `General Messages: ${selectedMessage.patientName}` 
                    : t.title}
                </span>
                {openTabs.length > 1 && (
                  <button 
                    onClick={(e) => closeTab(t.id, e)}
                    className="absolute right-2 top-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-red-600 transition-colors text-[9px]"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Workspace content matching the active Chrome tab type */}
        <div className="flex flex-1 overflow-hidden bg-[#fafbfc]">

          {activeTab.type === 'MessageCenter' && (
            <div className="flex flex-1 overflow-hidden">
              {messageCenterView === 'list' ? (
                <div className="flex-1 bg-white flex flex-col overflow-hidden text-[11px]">
                  {/* Toolbar matching the second image's icons perfectly */}
                  <div className="bg-[#fafbfc] border-b border-[#bdcddc] px-3 py-1 flex items-center gap-5 text-[#333333] text-[11px] select-none font-sans">
                    <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 text-gray-700 font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#d1154f" className="inline mr-0.5">
                        <path d="M14 3.25c-.41 0-.75.34-.75.75v16c0 .41.34.75.75.75s.75-.34.75-.75V4c0-.41-.34-.75-.75-.75zM3 9v6h3l5 5V4L6 9H3zm17.5 3c0-1.8-1.04-3.36-2.5-4.13v8.26c1.46-.77 2.5-2.33 2.5-4.13z"/>
                      </svg>
                      <span className="text-[#333333]">Communicate</span>
                      <span className="text-[8px] text-gray-400">▼</span>
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                    <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffb300" className="inline">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      </svg>
                      <span className="text-[#333333]">Open</span>
                    </button>
                    <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#1e88e5" className="inline">
                        <path d="M21 5c-1.11-.9-2.45-1-4-1-1.48 0-2.75.1-4 1-1.25-.9-2.52-1-4-1-1.55 0-2.89.1-4 1v14.5c1.11-.9 2.45-1 4-1 1.48 0 2.75.1 4 1 1.25-.9 2.52-1 4-1 1.55 0 2.89.1 4 1V5zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-3.4.25-5 1V6.5c1.6-.75 3.3-1 5-1 1.2 0 2.4.15 3.5.5v13z"/>
                      </svg>
                      <span className="text-[#333333]">Message Journal</span>
                    </button>
                    <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" className="inline">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#cbd8e3"/>
                        <path d="M11 16v-3H8v-2h3V8l5 4-5 4z" fill="#d32f2f"/>
                      </svg>
                      <span className="text-[#333333]">Forward Only</span>
                    </button>
                    <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#311b92" className="inline">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span className="text-[#333333]">Select Patient</span>
                    </button>
                    <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#37474f" className="inline">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-[#333333]">Select All</span>
                    </button>
                  </div>

                  {/* Table with custom font, high contrast text and border styles */}
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-[#f0f4f8] text-[#333333] select-none sticky top-0 z-10 text-[11px]">
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Patient Name</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order/Plan Name</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order Action</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order Comment</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Originator Name</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Create Date</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Date</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Type</th>
                          <th className="p-1 px-2 border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockOrdersData.map((row, idx) => (
                          <tr
                            key={idx}
                            onClick={() => {
                              openMessagePopupCard(row);
                            }}
                            className={`hover:bg-[#eaf4fc] cursor-pointer transition-colors ${
                              idx % 2 === 1 ? 'bg-[#f4f8fb]' : 'bg-white'
                            }`}
                          >
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] font-bold text-black uppercase whitespace-nowrap text-[11px]">
                              {row.patientName}
                            </td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-[#004b87] hover:underline whitespace-nowrap text-[11px]">
                              {row.orderPlanName}
                            </td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] whitespace-nowrap text-gray-800 text-[11px]">{row.action}</td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">
                              {row.detailsDate}...
                            </td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-700 whitespace-nowrap text-[11px]">
                              {row.detailsDesc}
                            </td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-600 whitespace-nowrap text-[11px]">{row.comment}</td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-600 whitespace-nowrap text-[11px]">{row.originator}</td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">{row.createDate}</td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">{row.stopDate}</td>
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-700 whitespace-nowrap text-[11px]">{row.stopType}</td>
                            <td className="p-1 px-2 border-b border-[#e5edf5] font-bold text-[#008000] whitespace-nowrap text-[11px]">{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  {/* Left pane: Navigation menu */}
                  <div className="w-[200px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
                    <div className="bg-[#789cbb] text-white font-bold p-1.5 flex justify-between items-center">
                      <span>Inbox Summary</span>
                      <Badge className="bg-[#002a46] hover:bg-[#002a46] text-white text-[9px] px-1 py-0 rounded-none h-4">1</Badge>
                    </div>
                    
                    <div className="bg-[#cbd8e3] p-0.5 flex gap-0.5 border-b border-[#bdcddc] text-[10px]">
                      <button 
                        onClick={() => {
                          setMessageCenterView('list');
                          setSelectedMessage(null);
                        }}
                        className="flex-1 bg-white border border-[#bdcddc] py-0.5 font-bold text-center"
                      >
                        Inbox
                      </button>
                      <button className="flex-1 py-0.5 text-center hover:bg-white/40">Proxies</button>
                      <button className="flex-1 py-0.5 text-center hover:bg-white/40">Pools</button>
                    </div>

                    <div className="p-1.5 border-b border-[#bdcddc] flex items-center gap-1.5 bg-[#e6edf3]">
                      <span className="text-gray-600">Display:</span>
                      <select className="bg-white border border-[#bdcddc] rounded-sm px-1 py-0.5 flex-1 focus:outline-none text-[9.5px]">
                        <option>Last 30 Days</option>
                        <option>Last 15 Days</option>
                        <option>All History</option>
                      </select>
                      <button className="border border-[#bdcddc] px-1 bg-white hover:bg-gray-50 rounded-sm">...</button>
                    </div>

                    <ScrollArea className="flex-1 text-gray-700">
                      <div className="p-1 space-y-2">
                        <div>
                          <div className="font-bold flex items-center gap-1 p-0.5 bg-[#cbd8e3]/30 border-b border-[#bdcddc]/50">
                            <span>➖ Priority Items (0)</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 p-0.5">
                            <span>➖ Messages (0/1)</span>
                          </div>
                          <div className="pl-3.5 mt-0.5">
                            <div 
                              onClick={() => {
                                setMessageCenterView('list');
                                setSelectedMessage(null);
                              }}
                              className="p-0.5 text-red-700 hover:bg-blue-100/30 rounded-sm cursor-pointer"
                            >
                              General Messages (0/1)
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 p-0.5 bg-[#cbd8e3]/30 border-b border-[#bdcddc]/50">
                            <span>➖ Inbox Items (0)</span>
                          </div>
                          <div className="pl-2 space-y-0.5 mt-1 text-[10px]">
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Results FYI</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Orders</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Documents</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 p-0.5">
                            <span>➖ Messages (0/1)</span>
                          </div>
                          <div className="pl-3.5 mt-0.5">
                            <div className="p-0.5 bg-[#007cc0] text-white font-bold rounded-sm px-1.5 py-0.5 shadow-sm cursor-pointer">
                              General Messages (0/1)
                            </div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer mt-0.5">Results</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 p-0.5 bg-[#cbd8e3]/30 border-b border-[#bdcddc]/50">
                            <span>➖ Work Items (0)</span>
                          </div>
                          <div className="pl-2 space-y-0.5 mt-1 text-[10px]">
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Saved Documents</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Paper Based Documents</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Deficient Documents (0)</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Reminders</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Anticipated Documents</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 p-0.5 bg-[#cbd8e3]/30 border-b border-[#bdcddc]/50">
                            <span>➖ Notifications</span>
                          </div>
                          <div className="pl-2 space-y-0.5 mt-1 text-[10px] text-gray-600">
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Sent Items</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Trash</div>
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Notify Receipts</div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Right pane: Document Workspace */}
                  <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-hidden text-[11px] p-2 space-y-2">
                    <div className="bg-[#cbd8e3] border-b border-[#bdcddc] flex justify-between items-center px-1">
                      <button className="bg-white border-t border-x border-[#bdcddc] px-3.5 py-1 font-bold text-[10.5px] flex items-center gap-2 rounded-t-sm">
                        General Messages: {selectedMessage?.patientName || 'JOHN DOE'}
                      </button>
                      <button 
                        onClick={() => {
                          setMessageCenterView('list');
                          setSelectedMessage(null);
                        }}
                        className="text-[10px] text-[#002a46] hover:text-[#0f4471] font-bold px-2 py-0.5 hover:underline"
                      >
                        ❮ Back to Messages List
                      </button>
                    </div>
                    
                    <div className="bg-[#fafbfc] border border-[#bdcddc] px-3 py-1 flex items-center gap-4 text-[#2c3e50] text-[10.5px] rounded-sm">
                      <button className="hover:text-black flex items-center gap-1">✉️ Forward</button>
                      <button className="hover:text-black flex items-center gap-1 text-red-600 font-semibold">❌ Delete</button>
                      <button className="hover:text-black flex items-center gap-1">🖨️ Print</button>
                      <span className="text-gray-300">|</span>
                      <button className="hover:text-black flex items-center gap-1">⬆️ Previous</button>
                      <button className="hover:text-black flex items-center gap-1">⬇️ Next</button>
                      <span className="text-gray-300">|</span>
                      <button className="hover:text-black flex items-center gap-1">✉️ Mark Unread</button>
                      <button className="hover:text-black flex items-center gap-1 font-semibold">💬 Communicate <ChevronDown className="w-2.5 h-2.5 inline" /></button>
                      <span className="text-gray-300">|</span>
                      <button className="hover:text-black flex items-center gap-1 font-semibold text-[#0d7a86]">➕ Add</button>
                    </div>

                    <div 
                      onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${selectedMessage?.patientName || 'JOHN DOE'}`, `patient-${selectedMessage ? (patientDemographics[selectedMessage.patientName]?.mrn || '1000245678') : '1000245678'}`)}
                      className="bg-[#0f4471] text-white p-3 rounded-sm flex justify-between items-center shadow-md relative overflow-hidden cursor-pointer hover:bg-[#0c395f] transition-all"
                    >
                      {(() => {
                        const currentDemo = selectedMessage ? (patientDemographics[selectedMessage.patientName] || {
                          mrn: '1000245678',
                          axioId: 'AXSL06-S1L2V3',
                          gender: 'Male',
                          age: '45Y 8M',
                          allergies: 'Penicillin, Iodine',
                          dob: '03/12/1979 (45Y)',
                          weight: '80.2 kg (04/25/2024)',
                          height: '175 cm',
                          bloodType: 'O+',
                          healthLife: 'Yes'
                        }) : {
                          mrn: '1000245678',
                          axioId: 'AXSL06-S1L2V3',
                          gender: 'Male',
                          age: '45Y 8M',
                          allergies: 'Penicillin, Iodine',
                          dob: '03/12/1979 (45Y)',
                          weight: '80.2 kg (04/25/2024)',
                          height: '175 cm',
                          bloodType: 'O+',
                          healthLife: 'Yes'
                        };
                        return (
                          <>
                            <div className="space-y-1 z-10">
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-wide">{selectedMessage?.patientName || 'JOHN DOE'}</h2>
                                <span className="text-[9px] bg-[#0d7a86] px-1 py-0.2 rounded font-bold uppercase">View Profile</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5 text-[11px] text-gray-200">
                                <div><span className="text-gray-400 font-medium">MRN:</span> {currentDemo.mrn}</div>
                                <div><span className="text-gray-400 font-medium">Axio-ID:</span> {currentDemo.axioId}</div>
                                <div><span className="text-gray-400 font-medium">Gender:</span> {currentDemo.gender}</div>
                                <div><span className="text-gray-400 font-medium">Age:</span> {currentDemo.age}</div>
                                <div className="col-span-2"><span className="text-gray-400 font-medium">Allergies:</span> {currentDemo.allergies}</div>
                              </div>
                            </div>
                            <div className="space-y-1 text-right text-[11px] z-10">
                              <div><span className="text-gray-400 font-medium">DOB:</span> {currentDemo.dob}</div>
                              <div><span className="text-gray-400 font-medium">Weight:</span> {currentDemo.weight}</div>
                              <div><span className="text-gray-400 font-medium">Height:</span> {currentDemo.height}</div>
                              <div><span className="text-gray-400 font-medium">Blood Type:</span> {currentDemo.bloodType}</div>
                              <div><span className="text-gray-400 font-medium">HealthLife:</span> {currentDemo.healthLife}</div>
                            </div>
                          </>
                        );
                      })()}
                      <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center border border-white/20 select-none">
                        <span className="text-3xl">👤</span>
                      </div>
                    </div>

                    <div className="flex-1 bg-white border border-[#bdcddc] rounded-sm p-4 flex flex-col space-y-4 overflow-auto shadow-sm">
                      <div className="border-b border-[#bdcddc] pb-3 space-y-1">
                        <h3 className="font-bold text-xs text-gray-800">Message Details</h3>
                        <div className="grid grid-cols-[80px_1fr] gap-y-1">
                          <span className="text-gray-500 font-semibold">From:</span>
                          <span className="font-semibold">System</span>
                          <span className="text-gray-500 font-semibold">To:</span>
                          <span>Axiovital Admin</span>
                          <span className="text-gray-500 font-semibold">Subject:</span>
                          <span className="font-semibold text-[#0f719b]">
                            {selectedMessage 
                              ? `Clinical Note Ready for Review - ${selectedMessage.orderPlanName}` 
                              : 'Clinical Note Ready for Review'}
                          </span>
                          <span className="text-gray-500 font-semibold">Date/Time:</span>
                          <span>{selectedMessage ? `${selectedMessage.createDate} PM` : '05/28/2025 03:42 PM'}</span>
                        </div>
                      </div>
                      <div className="space-y-3 leading-relaxed text-gray-800">
                        <div className="font-semibold border-b border-gray-100 pb-1">Message Content</div>
                        <p>
                          The clinical note for patient {selectedMessage?.patientName || 'JOHN DOE'} (MRN:{' '}
                          {selectedMessage ? (patientDemographics[selectedMessage.patientName]?.mrn || '1000245678') : '1000245678'}) is ready to review and sign in AxioNote.
                        </p>
                        <p>Please click the link below or use the Clinical menu &gt; AxioNote - Edge Platform from the top toolbar to launch the platform.</p>
                        <div className="py-2">
                          <button className="text-[#0f719b] font-semibold underline hover:text-[#0b5475]">Launch AxioNote - Edge Platform</button>
                        </div>
                        <p className="text-gray-500 text-[10.5px]">Thank you,<br />AxioVital Clinical System</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab.type === 'Customised' && (
            <div className="flex-1 flex flex-col h-full bg-white font-sans text-black overflow-hidden" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }}>
              {/* Tertiary Icon Toolbar */}
              <div className="h-[28px] bg-white border-b border-[#e0e0e0] flex items-center px-2 gap-2 text-[11px] text-gray-700">
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">🔍</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">📑</span>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">↖</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">🔍</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">100% ▾</span>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm text-gray-400">●</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm text-orange-500">🏠</span>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-1 bg-white overflow-hidden m-2 border border-[#828790]">
                {/* Left Pane */}
                <div className="w-[280px] border-r border-[#828790] flex flex-col bg-white">
                  <div className="p-4">
                    <h3 className="font-bold text-[13px] text-[#003366] mb-4 font-sans tracking-wide">My Default Organizer View</h3>
                    <div className="flex flex-col gap-1.5 pl-2">
                      {['Message Centre', 'Patient Overview', 'Ambulatory Organizer', 'MyExperience', 'Patient List', 'Dynamic Worklist', 'LearningLIVE'].map((item, i) => (
                        <label key={i} className="flex items-center gap-1.5 cursor-pointer text-[12px] text-black">
                          <input type="radio" name="default_organizer" defaultChecked={item === 'Message Centre'} className="w-3.5 h-3.5 m-0 p-0 accent-blue-600" />
                          <span className="leading-none pt-px">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Right Pane */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                  <div className="p-4 flex flex-col h-full">
                    <h3 className="font-bold text-[13px] text-[#003366] mb-3 font-sans tracking-wide">My MPages Selection</h3>
                    <div className="mb-3 text-[12px] text-black space-y-1">
                      <div>For Tab: Provider View</div>
                      <div>For Role: Provider</div>
                    </div>
                    <div className="flex flex-col gap-1.5 pl-2 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      {[
                        'Anesthesiologist Workflow', 'Cardiology Workflow', 'Critical Care Workflow',
                        'Dermatology Workflow', 'Endocrinology Workflow', 'Gastroenterology Workflow',
                        'General Medicine Workflow', 'General Surgery Workflow', 'Gerontology Workflow',
                        'Infectious Disease Workflow', 'Laboratory Medicine Workflow', 'Medical Microbiologist Workflow',
                        'Mental Health Workflow', 'Nephrology Workflow', 'Neurology Workflow',
                        'Neurosurgery Workflow', 'Oncology Workflow', 'Ophthalmology Workflow',
                        'Oral and Maxillofacial Surgery Workflow'
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-1.5 cursor-pointer text-[12px] text-black">
                          <input type="radio" name="mpages_selection" defaultChecked={item === 'General Medicine Workflow'} className="w-3.5 h-3.5 m-0 p-0 accent-blue-600" />
                          <span className="leading-none pt-px">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Action Bar */}
              <div className="flex justify-between items-center px-4 pb-3 pt-1">
                {/* Info Icon */}
                <div className="w-[20px] h-[20px] bg-[#0055d4] rounded-full flex items-center justify-center text-white font-serif font-bold italic text-[13px] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)] cursor-help border border-[#003366]" title="Information">
                  i
                </div>
                {/* Buttons */}
                <div className="flex gap-2">
                  <button className="bg-gradient-to-b from-[#f5f5f5] to-[#e1e1e1] hover:from-[#e5f1fb] hover:to-[#cce4f7] border border-[#adadad] hover:border-[#0078d7] px-6 min-w-[85px] h-[26px] flex items-center justify-center text-[12px] text-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] active:bg-[#cce4f7] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] outline-none focus:border-[#0078d7] rounded-[2px]">
                    Reset
                  </button>
                  <button className="bg-gradient-to-b from-[#f5f5f5] to-[#e1e1e1] hover:from-[#e5f1fb] hover:to-[#cce4f7] border border-[#adadad] hover:border-[#0078d7] px-6 min-w-[85px] h-[26px] flex items-center justify-center text-[12px] text-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] active:bg-[#cce4f7] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] outline-none focus:border-[#0078d7] rounded-[2px]">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'Analytics' && (
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar: Analytics Categories */}
              <div className="w-[200px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
                <div className="bg-[#789cbb] text-white font-bold p-1.5">
                  Analytics
                </div>

                <div 
                  className="flex-1 overflow-y-auto text-gray-700 [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="p-1 space-y-2">
                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Dashboards: !prev.Dashboards }))}
                        className="font-bold p-1 bg-[#cbd8e3]/40 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Dashboards</span>
                        <span>{expandedAnalyticsSections.Dashboards ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Dashboards && (
                        <div className="mt-0.5 space-y-0.5">
                          <button 
                            onClick={() => setAnalyticsMenu('Overview')}
                            className={`w-full text-left p-1 rounded-sm px-2 ${analyticsMenu === 'Overview' ? 'bg-[#007cc0] text-white font-bold' : 'hover:bg-blue-100/30'}`}
                          >
                            Overview
                          </button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Patient Population</button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Quality Measures</button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Operational Metrics</button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Financial Performance</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Clinical: !prev.Clinical }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Clinical Analytics</span>
                        <span>{expandedAnalyticsSections.Clinical ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Clinical && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Quality Measures</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Chronic Conditions</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Utilization</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Patient Outcomes</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Operational: !prev.Operational }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Operational Analytics</span>
                        <span>{expandedAnalyticsSections.Operational ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Operational && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Provider Productivity</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Scheduling</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Care Workflow</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Resource Utilization</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Financial: !prev.Financial }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Financial Analytics</span>
                        <span>{expandedAnalyticsSections.Financial ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Financial && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Payer Mix</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Revenue Cycle</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Cost Analysis</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, CustomReports: !prev.CustomReports }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Custom Reports</span>
                        <span>{expandedAnalyticsSections.CustomReports ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.CustomReports && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Saved Reports</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Report Builder</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Scheduled Reports</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, DataManagement: !prev.DataManagement }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Data Management</span>
                        <span>{expandedAnalyticsSections.DataManagement ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.DataManagement && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Data Extracts</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Data Quality</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Definitions</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane: Analytics Dashboard Overview */}
              <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-auto text-[11px] p-4 space-y-4">
                <div className="bg-[#cbd8e3] border-b border-[#bdcddc] flex items-center px-1">
                  <button className="bg-white border-t border-x border-[#bdcddc] px-3.5 py-1 font-bold text-[10.5px] flex items-center gap-2 rounded-t-sm">
                    Analytics Overview
                  </button>
                </div>

                <div className="bg-[#fafbfc] border border-[#bdcddc] p-2 flex flex-wrap gap-4 items-center text-[10.5px] rounded-sm shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Date Range:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>Last 30 Days</option>
                      <option>Last 15 Days</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Facility:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>All Facilities</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Department:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>All Departments</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Provider:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>All Providers</option>
                    </select>
                  </div>
                  <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 rounded shadow-sm">Apply</button>
                  <div className="flex-1"></div>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2.5 py-1 rounded text-[10px]">Export ▼</button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: 'Total Patients', value: '12,842', change: '▲ 8.4%', changeColor: 'text-green-600', sub: 'vs. Prior 30 Days', icon: '👥' },
                    { label: 'Encounters', value: '18,729', change: '▲ 6.7%', changeColor: 'text-green-600', sub: 'vs. Prior 30 Days', icon: '📈' },
                    { label: 'Average LOS (Days)', value: '4.6', change: '▼ 5.2%', changeColor: 'text-red-600', sub: 'vs. Prior 30 Days', icon: '📅' },
                    { label: 'Readmission Rate', value: '11.3%', change: '▼ 1.4%', changeColor: 'text-green-600', sub: 'vs. Prior 30 Days', icon: '🔄' },
                    { label: 'Mortality Rate', value: '1.2%', change: '▲ 0.3%', changeColor: 'text-red-600', sub: 'vs. Prior 30 Days', icon: '📉' }
                  ].map((card, i) => (
                    <div key={i} className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col justify-between h-[100px]">
                      <div className="flex justify-between items-center text-gray-500 font-bold text-[10px]">
                        <span>{card.label}</span>
                        <span className="text-sm">{card.icon}</span>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">{card.value}</div>
                        <div className="flex items-center gap-1 mt-1 text-[9.5px]">
                          <span className={`font-bold ${card.changeColor}`}>{card.change}</span>
                          <span className="text-gray-400">{card.sub}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[280px_1fr] gap-4">
                  <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col justify-between text-[10.5px]">
                    <div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5 mb-2">
                        <span className="font-bold">Customize</span>
                        <span className="text-xs text-gray-400">ℹ️</span>
                      </div>
                      <div className="flex gap-1 mb-3 text-[10px]">
                        <button className="flex-1 bg-[#eef2f5] border border-[#bdcddc] py-0.5 text-center font-bold">Target</button>
                        <button className="flex-1 py-0.5 text-center hover:bg-gray-50">Metric</button>
                        <button className="flex-1 py-0.5 text-center hover:bg-gray-50">Outcome</button>
                      </div>
                      <p className="text-gray-500 mb-3 text-[9.5px]">Select a metric and set targets to monitor performance.</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-gray-500 font-bold">Metric</label>
                          <select className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px]">
                            <option>30-Day Readmission Rate</option>
                          </select>
                        </div>
                        <div className="space-y-1 bg-gray-50 p-2 rounded border border-[#bdcddc]/50">
                          <div className="flex justify-between"><span>Target</span><span className="font-bold">&lt;= 12.0%</span></div>
                          <div className="flex justify-between mt-1"><span>Predicted</span><span className="font-bold text-blue-900">10.8%</span></div>
                          <div className="flex justify-between mt-1"><span>Current</span><span className="font-bold">11.3%</span></div>
                        </div>
                        <div className="space-y-0.5 text-[9.5px] border-t border-gray-100 pt-2 text-gray-600">
                          <div className="flex justify-between"><span>Benchmark</span><span>9.6%</span></div>
                          <div className="flex justify-between"><span>Top Performer</span><span>7.2%</span></div>
                        </div>
                      </div>
                    </div>
                    <button className="w-full border border-[#bdcddc] hover:bg-gray-50 py-1 font-bold rounded mt-3">✏️ Edit Target</button>
                  </div>

                  <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col h-[280px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">Trend Analysis</span>
                      <div className="flex gap-2 text-[10px] items-center text-gray-600">
                        <div>Metric: <select className="bg-white border border-[#bdcddc] px-1 py-0.5"><option>30-Day Readmission Rate</option></select></div>
                        <div>View: <select className="bg-white border border-[#bdcddc] px-1 py-0.5"><option>Weekly</option></select></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full text-[9px] -ml-6 mt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#a0a0a0" />
                          <YAxis stroke="#a0a0a0" domain={[0, 25]} tickCount={6} />
                          <Tooltip />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                          <Line type="monotone" dataKey="Actual" stroke="#007cc0" strokeWidth={2} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Target" stroke="#27ae60" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="Benchmark" stroke="#7f8c8d" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="TopPerformer" stroke="#8e44ad" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] p-2 font-bold text-xs">
                    Performance by Department
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#bdcddc]">
                          <th className="p-2 border-r border-[#bdcddc]">Department</th>
                          <th className="p-2 border-r border-[#bdcddc]">Encounters</th>
                          <th className="p-2 border-r border-[#bdcddc]">% of Total</th>
                          <th className="p-2 border-r border-[#bdcddc]">Avg LOS (Days)</th>
                          <th className="p-2 border-r border-[#bdcddc]">Readmission Rate (%)</th>
                          <th className="p-2 border-r border-[#bdcddc]">Mortality Rate (%)</th>
                          <th className="p-2 border-r border-[#bdcddc]">Patient Satisfaction (%)</th>
                          <th className="p-2 font-bold text-center">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentData.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="p-2 border-r border-gray-200 font-bold text-[#0d7a86]">{row.name}</td>
                            <td className="p-2 border-r border-gray-200">{row.count}</td>
                            <td className="p-2 border-r border-gray-200">{row.pct}</td>
                            <td className="p-2 border-r border-gray-200">{row.los}</td>
                            <td className="p-2 border-r border-gray-200 font-semibold">{row.readmit}</td>
                            <td className="p-2 border-r border-gray-200">{row.mortality}</td>
                            <td className="p-2 border-r border-gray-200 font-bold text-blue-900">{row.sat}</td>
                            <td className="p-2 font-bold text-center">
                              {row.trend === 'up' && <span className="text-green-600">📈</span>}
                              {row.trend === 'down' && <span className="text-red-600">📉</span>}
                              {row.trend === 'stable' && <span className="text-gray-500">➡️</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'PatientList' && (
            <div className="flex flex-1 flex-col overflow-auto p-4 space-y-4 bg-[#f8f9fa] text-[11px]">

              {/* Patient Directory Data Table */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden flex flex-col">
                <div className="bg-[#cbd8e3]/30 p-2 font-bold border-b border-[#bdcddc] text-xs text-[#0f4471]">
                  Total Patients: <span className="text-gray-900">1,248</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#bdcddc] select-none">
                        <th className="p-2.5 border-r border-[#bdcddc]">MRN</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">UHID / Axio ID</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Patient Name</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Age / Gender</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">DOB</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Phone</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Visit Type</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Department</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Attending Physician</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Status</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Location / Unit</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Admitted On</th>
                      </tr>
                    </thead>
                    <tbody>
                       {patientDirectoryData.filter(row => {
                         if (!searchQuery) return true;
                         const query = searchQuery.toLowerCase();
                         return (
                           (row as any).name?.toLowerCase().includes(query) ||
                           (row as any).mrn?.toLowerCase().includes(query) ||
                           ((row as any).uhid || '').toLowerCase().includes(query) ||
                           (row as any).physician?.toLowerCase().includes(query) ||
                           (row as any).visit?.toLowerCase().includes(query) ||
                           (row as any).dept?.toLowerCase().includes(query)
                         );
                       }).map((row, index) => (
                        <tr 
                          key={index} 
                          onClick={(e) => {
                            setSelectedPatientMrns(prev => {
                              if (prev.includes(row.mrn)) {
                                return prev.filter(m => m !== row.mrn);
                              } else {
                                return [...prev, row.mrn];
                              }
                            });
                          }}
                          className={`border-b border-gray-100 select-none cursor-pointer transition-colors ${
                            selectedPatientMrns.includes(row.mrn) 
                              ? 'bg-[#2a76f2] text-white hover:bg-[#1a66e2]' 
                              : 'hover:bg-gray-50/50'
                          }`}
                        >
                          <td className="p-2.5 border-r border-gray-200">{row.mrn}</td>
                          <td className={`p-2.5 border-r border-gray-200 font-medium ${selectedPatientMrns.includes(row.mrn) ? 'text-blue-150' : 'text-gray-500'}`}>{(row as any).uhid}</td>
                          <td 
                            className={`p-2.5 border-r border-gray-200 font-bold cursor-pointer hover:underline ${selectedPatientMrns.includes(row.mrn) ? 'text-white' : 'text-[#0d7a86]'}`} 
                            onClick={(e) => {
                              e.stopPropagation();
                              selectOrOpenTab('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe');
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPatientContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                patientName: row.name,
                                patientMrn: row.mrn
                              });
                            }}
                          >
                            {row.name}
                          </td>
                          <td className="p-2.5 border-r border-gray-200">{(row as any).ageGender}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dob}</td>
                          <td className="p-2.5 border-r border-gray-200">{(row as any).phone}</td>
                          <td className="p-2.5 border-r border-gray-200">{(row as any).visit}</td>
                          <td className="p-2.5 border-r border-gray-200">{(row as any).dept}</td>
                          <td className="p-2.5 border-r border-gray-200">{(row as any).physician}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2 py-0.5 rounded-sm font-semibold text-[9px] ${
                              selectedPatientMrns.includes(row.mrn) 
                                ? 'bg-white/20 text-white' 
                                : (row as any).statusBg
                            }`}>
                              {(row as any).status}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-gray-200">{(row as any).location}</td>
                          <td className={`p-2.5 border-r border-gray-200 ${selectedPatientMrns.includes(row.mrn) ? 'text-blue-150' : 'text-gray-500'}`}>{(row as any).admitted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#fafbfc] border-t border-[#bdcddc] p-2 flex justify-between items-center text-[10px] select-none text-gray-600 font-sans">
                  <div className="flex gap-4">
                    <span>Sort Order: Location, ascending</span>
                    <span>Filter: Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Showing 28 of 28 records</span>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[9.5px] font-semibold text-gray-700">Refresh List</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'Notifications' && (
            <div className="flex flex-1 flex-col overflow-auto p-4 space-y-4 bg-[#f8f9fa] text-[11px]">
              
              {/* Notification Center Title Bar */}
              <div className="flex justify-between items-center bg-white border border-[#bdcddc] p-2 rounded-sm shadow-sm">
                <span className="font-bold text-xs text-[#002a46]">Notification Center</span>
                <div className="flex gap-2 items-center">
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2.5 py-1 rounded text-[10px] flex items-center gap-1 font-semibold text-gray-700">
                    ✉️ Mark All as Read
                  </button>
                  <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                    <option>Notification Settings</option>
                  </select>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">🔄</button>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">•••</button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="bg-[#fafbfc] border border-[#bdcddc] p-3 rounded-sm shadow-sm grid grid-cols-7 gap-3 text-[10.5px]">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Notification Type</label>
                  <select 
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>All</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Priority</label>
                  <select 
                    value={notifPriority}
                    onChange={(e) => setNotifPriority(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>All</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Status</label>
                  <select 
                    value={notifStatus}
                    onChange={(e) => setNotifStatus(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>All</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">From Date</label>
                  <input
                    type="text"
                    value={notifFromDate}
                    onChange={(e) => setNotifFromDate(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">To Date</label>
                  <input
                    type="text"
                    value={notifToDate}
                    onChange={(e) => setNotifToDate(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 col-span-2 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter keyword, patient or MRN"
                      value={notifSearch}
                      onChange={(e) => setNotifSearch(e.target.value)}
                      className="flex-1 bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                    />
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-1 text-[10px] font-semibold rounded">
                      More Filters
                    </button>
                    <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white px-3 py-1 text-[10px] font-bold rounded">
                      🔍 Search
                    </button>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2.5 py-1 text-[10px] font-semibold rounded">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden flex flex-col">
                <div className="bg-[#cbd8e3]/30 p-2 font-bold border-b border-[#bdcddc] text-xs text-[#0f4471] flex gap-4">
                  <div>Total Notifications: <span className="text-gray-900">48</span></div>
                  <div>Unread: <span className="text-red-600 font-bold">8</span></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#bdcddc] select-none">
                        <th className="p-2.5 border-r border-[#bdcddc] w-[30px] text-center">
                          <input type="checkbox" className="rounded-sm" />
                        </th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Priority</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Notification</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Patient Name</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">MRN</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Category</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Message</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Date / Time</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Status</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationRows.map((row, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => openMessagePopupCard(row)}
                          className="border-b border-gray-100 hover:bg-[#eaf4fc] cursor-pointer transition-colors"
                        >
                          <td className="p-2.5 border-r border-gray-200 text-center" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="rounded-sm" />
                          </td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className="flex items-center gap-1">
                              <span className="text-xs">{row.icon}</span>
                              <span className={`font-semibold ${row.priorityColor}`}>{row.priority}</span>
                            </span>
                          </td>
                          <td 
                            className="p-2.5 border-r border-gray-200 font-bold text-[#0d7a86] cursor-pointer hover:underline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              selectOrOpenTab('PatientProfile', `Patient Profile: ${row.patient.toUpperCase()}`, 'patient-doe');
                            }}
                          >
                            {row.patient}
                          </td>
                          <td className="p-2.5 border-r border-gray-200">{row.patient}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.mrn}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.category}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.message}</td>
                          <td className="p-2.5 border-r border-gray-200 text-gray-500">{row.dateTime}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={row.statusColor}>{row.status}</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">•••</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#fafbfc] border-t border-[#bdcddc] p-2 flex justify-between items-center text-[10px] select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Show</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5">
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-1.5 py-0.5 hover:bg-gray-100 rounded text-gray-400">❮</button>
                    <button className="px-2 py-0.5 bg-[#0f4471] text-white font-bold rounded">1</button>
                    <button className="px-2 py-0.5 hover:bg-gray-100 rounded">2</button>
                    <button className="px-1.5 py-0.5 hover:bg-gray-100 rounded">❯</button>
                  </div>
                  <div className="text-gray-500">
                    Showing 1 to 10 of 48 entries
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab.type === 'PatientProfile' && (() => {
            const displayName = activeTab.title.includes('Patient Profile:') 
              ? activeTab.title.replace('Patient Profile:', '').trim() 
              : 'JOHN DOE';

            return (
              <div className="flex-1 flex flex-col overflow-hidden text-[11px] font-sans bg-white select-none">
                {/* Classic Demographic Bar Header */}
                <div 
                  className="bg-[#005a94] text-white px-3 py-1 flex items-center select-none border-b border-[#003c63]"
                  style={{ minHeight: '52px' }}
                >
                  {/* Blue avatar icon container */}
                  <div className="flex items-center gap-2 border-r border-white/20 pr-4">
                    <div className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center border border-gray-400 overflow-hidden">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#80a0c0">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-extrabold text-[12px] uppercase text-white tracking-wide">{displayName}</div>
                      <div className="text-[9.5px] text-gray-300">Allergies: shellfish</div>
                      <div className="text-[9.5px] text-[#80c0ff] hover:underline cursor-pointer">Care Team: View Details</div>
                    </div>
                  </div>

                  {/* Demographic columns */}
                  <div className="flex-1 grid grid-cols-4 gap-4 px-4 text-[9.5px] leading-tight text-white/90">
                    <div className="space-y-0.5">
                      <div><span className="text-gray-300">DOB:</span> 3/22/1984</div>
                      <div><span className="text-gray-300">Dose Wt:</span> 80.000 kg (04/25/2021)</div>
                      <div><span className="text-gray-300">HealtheLife:</span> No</div>
                    </div>
                    <div className="space-y-0.5">
                      <div><span className="text-gray-300">Age:</span> 39 years</div>
                      <div><span className="text-gray-300">Advance Directive:</span></div>
                      <div><span className="text-gray-300">Clinical Trial:</span> &lt;No Data Available&gt;</div>
                    </div>
                    <div className="space-y-0.5">
                      <div><span className="text-gray-300">Sex:</span> Female</div>
                      <div><span className="text-gray-300">Code Status:</span> &lt;No Data Available&gt;</div>
                      <div><span className="text-gray-300">Loc:</span> NU02</div>
                    </div>
                    <div className="space-y-0.5">
                      <div><span className="text-gray-300">MRN:</span> 00490248563</div>
                      <div><span className="text-gray-300">Isolation:</span> &lt;No Data Available&gt;</div>
                      <div className="truncate"><span className="text-gray-300">Inpatient FIN:</span> 00096526415 [Admit Dt: 10/6/2020 3:14:12 PM CDT]</div>
                    </div>
                  </div>

                  {/* Hamburger Actions Menu Area */}
                  <div className="flex items-center pl-4 border-l border-white/20">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="relative cursor-pointer hover:bg-white/10 p-1.5 rounded flex items-center justify-center outline-none border-none bg-transparent text-left transition-colors">
                        <svg className="w-5 h-4 text-white drop-shadow-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={6} className="w-[220px] bg-white border border-[#b0b0b0] text-[#333333] text-[11.5px] p-0 shadow-xl rounded-none select-none z-[9999] py-1 font-sans">
                        {[
                          'Bed Transfer',
                          'Cancel Discharge',
                          'Cancel Pending Discharge',
                          'Cancel Pending Transfer',
                          'Cancel Transfer',
                          'Clozapine Registry',
                          'Discharge Encounter',
                          'Facility Transfer',
                          'Leave of Absence',
                          'Modify Discharge',
                          'Pending Discharge',
                          'Pending Facility Transfer',
                          'Pending Transfer',
                          'Print Labels',
                          'Process Alert',
                          'Update Patient Information',
                          'View Encounter',
                          'View Person'
                        ].map((item) => (
                          <DropdownMenuItem
                            key={item}
                            onClick={() => {
                              if (item === 'Process Alert') {
                                setTimeout(() => alert('Process Alert initiated for ' + displayName), 10);
                              } else if (item === 'Update Patient Information') {
                                selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: ' + displayName, 'edit-patient-doe');
                              } else {
                                setTimeout(() => alert(`${item} selected`), 10);
                              }
                            }}
                            className="px-4 py-1 rounded-none hover:bg-[#0f4471] hover:text-white cursor-pointer transition-colors text-[11.5px] text-[#333333] focus:bg-[#0f4471] focus:text-white data-[highlighted]:bg-[#0f4471] data-[highlighted]:text-white flex items-center justify-between"
                          >
                            <span>{item}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Main Split Layout Workspace */}
                <div className="flex-1 flex overflow-hidden">
                  
                  {/* Left Sidebar Navigation Panel */}
                  {isSidebarCollapsed ? (
                    <div 
                      onClick={() => setIsSidebarCollapsed(false)}
                      className="w-[24px] bg-[#164d6e] text-white flex flex-col items-center pt-2 cursor-pointer select-none border-r border-[#0f3a55] hover:bg-[#1e5d84] transition-all h-full"
                    >
                      <div className="text-[9px] text-gray-300 hover:text-white font-bold mb-1">
                        ▶
                      </div>
                      <div 
                        className="text-[9px] font-bold py-3 bg-[#0d344d] rounded-xs shadow-xs flex items-center justify-center border border-[#0f3a55] text-white cursor-pointer select-none w-[16px] h-[50px]"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        Menu
                      </div>
                    </div>
                  ) : (
                    <div className="w-[190px] bg-[#164d6e] text-white flex flex-col border-r border-[#0f3a55] select-none h-full transition-all duration-150">
                      <div className="bg-[#0d344d] border-b border-[#0f3a55] px-3 py-1.5 flex justify-between items-center text-[10px] font-bold">
                        <span>Menu</span>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="cursor-pointer hover:text-white">📌</span>
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSidebarCollapsed(true);
                            }}
                            className="cursor-pointer hover:text-white font-bold"
                          >
                            ❮
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto text-[10px] py-1">
                        {[
                          { name: 'Provider View' },
                          { name: 'Results Review' },
                          { name: 'Orders' },
                          { name: 'Documentation' },
                          { name: 'Outside Records' },
                          { divider: true },
                          { name: 'Allergies' },
                          { name: 'Clinical Media' },
                          { name: 'Diagnoses and Problems' },
                          { name: 'Form Browser' },
                          { name: 'Growth Chart' },
                          { name: 'Insurance' },
                          { name: 'Histories' },
                          { name: 'Interactive View and I&O' },
                          { name: 'MAR Summary' },
                          { name: 'Medication List' },
                          { name: 'Recommendations' },
                          { name: 'Smart App Validator' },
                          { name: 'mTuitive - OpNote Test - IE' },
                          { name: 'mTuitive - OpNote Test - Edge' },
                          { name: 'Op Note - Prod - Edge' },
                          { name: 'WorkflowView Edge' },
                          { name: 'mTuitive Dev - Edge' },
                          { name: 'OpNote Debug EDGE' }
                        ].map((item, idx) => {
                          if (item.divider) {
                            return <div key={idx} className="border-t border-white/10 my-1" />;
                          }
                          const isActive = profileSidebarOption === item.name;
                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                if (item.name === 'Provider View' || item.name === 'Op Note - Prod - Edge' || item.name === 'Orders' || item.name === 'Documentation' || item.name === 'Histories' || item.name === 'Insurance') {
                                  setProfileSidebarOption(item.name);
                                  if (item.name === 'Orders') {
                                    setIsDetailedOrderActive(false);
                                  }
                                }
                                if (item.name === 'Medication List') {
                                  setIsReconcileOpen(true);
                                }
                              }}
                              className={`px-3 py-1.5 flex justify-between items-center cursor-pointer hover:bg-white/10 ${
                                isActive ? 'bg-[#123c56] border-l-4 border-sky-400 font-semibold' : ''
                              }`}
                            >
                              <span>{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Right Document Workspace Area */}
                  {profileSidebarOption === 'Provider View' ? (
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                      {/* Demographics upper tab selector */}
                      <div className="bg-[#f0f4f8] border-b border-[#bdcddc] px-3 py-1 flex justify-between items-center h-[32px]">
                        <div className="flex border-b border-transparent gap-1 text-[10.5px]">
                          {['Demographics', 'Contacts', 'Clinical', 'Visit History', 'Notes'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setProfileTab(t)}
                              className={`px-3 py-1 font-semibold border-t border-x rounded-t transition-all ${
                                profileTab === t 
                                  ? 'bg-white border-[#bdcddc] text-blue-900 border-b-transparent relative z-10 font-bold border-t-2 border-t-blue-600' 
                                  : 'bg-gray-100/70 border-transparent text-gray-600 hover:bg-gray-200/50'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-1 overflow-hidden">
                        {/* Left Column: Demographics Cards Workspace */}
                        <div className="flex-1 flex flex-col overflow-auto text-[10.5px] bg-white p-4 space-y-4">
                          {profileTab === 'Demographics' && (
                            <div className="grid grid-cols-2 gap-4">
                              {/* Panel 1: Personal Information */}
                              <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col">
                                <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                                  <span className="text-[11px]">Personal Information</span>
                                </div>
                                <div className="p-3 grid grid-cols-[150px_1fr_120px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                                  <span className="text-gray-500 font-medium">Last Name</span>
                                  <span className="font-semibold text-gray-900">{editLastName}</span>
                                  
                                  <span className="text-gray-500 font-medium">Occupation</span>
                                  <span className="font-semibold text-gray-900">{editOccupation}</span>
                                  
                                  <span className="text-gray-500 font-medium">First Name</span>
                                  <span className="font-semibold text-gray-900">{editFirstName}</span>

                                  <span className="text-gray-500 font-medium">Ethnicity</span>
                                  <span className="font-semibold text-gray-900">{editEthnicity}</span>
                                  
                                  <span className="text-gray-500 font-medium">Middle Initial</span>
                                  <span className="text-gray-900">{editMiddleInitial}</span>

                                  <span className="text-gray-500 font-medium">Language</span>
                                  <span className="font-semibold text-gray-900">{editLanguage}</span>
                                  
                                  <span className="text-gray-500 font-medium">ABHA-ID</span>
                                  <span className="font-bold text-gray-900">{editMrn}</span>

                                  <span className="text-gray-500 font-medium">Nationality</span>
                                  <span className="font-semibold text-gray-900">{editNationality}</span>
                                  
                                  <span className="text-gray-500 font-medium">Axio-ID</span>
                                  <span className="text-gray-900">{editSsn}</span>

                                  <span className="text-gray-500 font-medium">Blood Type</span>
                                  <span className="font-bold text-red-700">O+</span>
                                  
                                  <span className="text-gray-500 font-medium">Date of Birth</span>
                                  <span className="text-gray-900">{editDob}</span>

                                  <span className="text-gray-500 font-medium">HealthLife</span>
                                  <span className="font-semibold text-green-700">Yes</span>
                                  
                                  <span className="text-gray-500 font-medium">Age</span>
                                  <span className="text-gray-900">45 Years</span>

                                  <span className="text-gray-500 font-medium"></span>
                                  <span className="text-gray-900"></span>
                                  
                                  <span className="text-gray-500 font-medium">Gender</span>
                                  <span className="text-gray-900">{editSex}</span>

                                  <span className="text-gray-500 font-medium"></span>
                                  <span className="text-gray-900"></span>
                                  
                                  <span className="text-gray-500 font-medium">Marital Status</span>
                                  <span className="text-gray-900">{editMaritalStatus}</span>
                                </div>
                              </div>

                              {/* Panel 2: Address Information */}
                              <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col h-fit">
                                <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                                  <span className="text-[11px]">Address Information</span>
                                </div>
                                <div className="p-3 grid grid-cols-[100px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                                  <span className="text-gray-500 font-medium">Address</span>
                                  <span className="text-gray-900">{editAddress}</span>
                                  
                                  <span className="text-gray-500 font-medium">City</span>
                                  <span className="font-semibold text-gray-900">{editCity}</span>
                                  
                                  <span className="text-gray-500 font-medium">State / Province</span>
                                  <span className="font-semibold text-gray-900">{editState}</span>
                                  
                                  <span className="text-gray-500 font-medium">ZIP / Postal Code</span>
                                  <span className="text-gray-900">{editZip}</span>
                                  
                                  <span className="text-gray-500 font-medium">Country</span>
                                  <span className="font-semibold text-gray-900">USA</span>
                                </div>
                              </div>

                              {/* Panel 3: Contact Information */}
                              <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col">
                                <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                                  <span className="text-[11px]">Contact Information</span>
                                </div>
                                <div className="p-3 grid grid-cols-[100px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                                  <span className="text-gray-500 font-medium">Phone</span>
                                  <span className="text-gray-900">{editPhone}</span>
                                  
                                  <span className="text-gray-500 font-medium">Mobile / Pager</span>
                                  <span className="text-gray-900">{editMobile}</span>
                                  
                                  <span className="text-gray-500 font-medium">Fax</span>
                                  <span className="text-gray-900">{editFax}</span>
                                  
                                  <span className="text-gray-500 font-medium">Email</span>
                                  <span className="text-blue-600 hover:underline cursor-pointer">{editEmail}</span>
                                  
                                  <span className="text-gray-500 font-medium">Alternate Email</span>
                                  <span className="text-gray-900">—</span>
                                </div>
                              </div>

                              {/* Panel 4: Physician Information */}
                              <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col h-fit">
                                <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                                  <span className="text-[11px]">Physician Information</span>
                                </div>
                                <div className="p-3 grid grid-cols-[140px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                                  <span className="text-gray-500 font-medium">Referring Physician</span>
                                  <span className="font-semibold text-gray-900">{editReferringPhysician}</span>
                                  
                                  <span className="text-gray-500 font-medium">Attending Physician</span>
                                  <span className="font-semibold text-gray-900">{editAttendingPhysician}</span>
                                  
                                  <span className="text-gray-500 font-medium">Date of First Visit</span>
                                  <span className="text-gray-900">{editFirstVisit}</span>
                                  
                                  <span className="text-gray-500 font-medium">Patient Status</span>
                                  <span className="font-semibold text-green-700">Active</span>
                                </div>
                              </div>

                              {/* Panel 5: Additional Information */}
                              <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col h-fit col-span-2">
                                <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                                  <span className="text-[11px]">Additional Information</span>
                                </div>
                                <div className="p-3 grid grid-cols-[150px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                                </div>
                              </div>
                            </div>
                          )}



                          {profileTab === 'Contacts' && (
                            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm text-gray-700 space-y-4">
                              <div className="border-b border-gray-100 pb-2">
                                <h3 className="font-bold text-sm text-[#0f4471]">Emergency Contacts</h3>
                              </div>
                              <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                  <div className="font-bold text-gray-900">Mary Doe</div>
                                  <div className="text-[10px] text-gray-500">Spouse • Primary Emergency Contact</div>
                                  <div className="mt-1 text-gray-700">📞 (305) 555-0199 • 📍 Same as patient address</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {profileTab === 'Clinical' && (
                            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm text-gray-700 space-y-4">
                              <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-sm text-[#0f4471]">Clinical Overview</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-[#0f4471] border-b border-gray-100 pb-1 text-[11px]">Active Diagnoses</h4>
                                  <ul className="list-disc pl-4 space-y-1">
                                    <li>Essential Hypertension (I10)</li>
                                    <li>Type 2 Diabetes Mellitus (E11.9)</li>
                                    <li>Hyperlipidemia (E78.5)</li>
                                  </ul>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-bold text-[#0f4471] border-b border-gray-100 pb-1 text-[11px]">Allergies</h4>
                                  <ul className="list-disc pl-4 space-y-1 text-red-700 font-semibold">
                                    <li>Penicillin G (Severe - Anaphylaxis)</li>
                                    <li>Shellfish (Moderate - Hives)</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {profileTab === 'Visit History' && (
                            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm text-gray-700 space-y-4">
                              <div className="border-b border-gray-100 pb-2">
                                <h3 className="font-bold text-sm text-[#0f4471]">Recent Visit Log</h3>
                              </div>
                              <table className="w-full text-left border-collapse text-[10.5px]">
                                <thead>
                                  <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Provider</th>
                                    <th className="p-2">Department / Location</th>
                                    <th className="p-2">Visit Reason</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-gray-100">
                                    <td className="p-2">12/04/2024</td>
                                    <td className="p-2 font-medium">Dr. Herman Stewart</td>
                                    <td className="p-2">Family Practice Center</td>
                                    <td className="p-2">Quarterly Diabetes Follow-up</td>
                                  </tr>
                                  <tr className="border-b border-gray-100">
                                    <td className="p-2">09/10/2024</td>
                                    <td className="p-2 font-medium">Dr. Herman Stewart</td>
                                    <td className="p-2">Family Practice Center</td>
                                    <td className="p-2">Routine Wellness Exam</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                          {profileTab === 'Notes' && (
                            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm text-gray-700 flex flex-col space-y-3">
                              <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-sm text-[#0f4471]">Clinical Progress Notes</h3>
                              </div>
                              <div className="space-y-3">
                                <div className="border border-gray-200 rounded p-3 bg-[#fafbfc]">
                                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                                    <span>Progress Note • 12/04/2024 10:15 AM</span>
                                    <span className="font-semibold text-gray-700">Dr. Herman Stewart, MD</span>
                                  </div>
                                  <p className="mt-2 text-gray-800 leading-relaxed text-[10.5px]">
                                    Patient reports good compliance with metformin 500mg BID. BP is controlled at 128/78. Lungs clear, heart regular rhythm. Will monitor HbA1c in 3 months.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}





                        </div>
                      </div>
                    </div>
                  ) : profileSidebarOption === 'Orders' ? (
                    isDetailedOrderActive ? (
                      <div className="flex-1 bg-[#cbd8e3] flex flex-col font-sans text-gray-800 overflow-hidden text-[10.5px] border-l border-gray-300">
                        {/* Sub-toolbar */}
                        <div className="bg-white border-b border-gray-300 px-3 py-1 flex justify-between items-center text-[10px] h-[34px] font-sans">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <button className="flex items-center hover:bg-gray-100 px-1 py-0.5 rounded transition-colors text-gray-800">
                              <span className="text-[#005a94] font-bold text-xs mr-1">➕</span> Add
                            </button>
                            <span className="text-gray-300 text-[9px]">|</span>
                            <button className="flex items-center hover:bg-gray-100 px-1 py-0.5 rounded transition-colors text-gray-800">
                              <span className="mr-1">✍️</span> Document Medication by Hx
                            </button>
                            <span className="text-gray-300 text-[9px]">|</span>
                            <button className="flex items-center hover:bg-gray-100 px-1 py-0.5 rounded transition-colors text-gray-800">
                              Reconciliation <span className="text-[8px] ml-1">▼</span>
                            </button>
                            <span className="text-gray-300 text-[9px]">|</span>
                            <button className="flex items-center hover:bg-gray-100 px-1 py-0.5 rounded transition-colors text-gray-800">
                              <span className="mr-1">💊</span> Check Interactions
                            </button>
                            <span className="text-gray-300 text-[9px]">|</span>
                            <button className="flex items-center hover:bg-gray-100 px-1 py-0.5 rounded transition-colors text-gray-800">
                              <span className="mr-1">🧴</span> External Rx History <span className="text-[8px] ml-1">▼</span>
                            </button>
                            <span className="text-gray-300 text-[9px]">|</span>
                            <button className="flex items-center hover:bg-gray-100 px-1 py-0.5 rounded transition-colors text-gray-800">
                              No Check <span className="text-[8px] ml-1">▼</span>
                            </button>
                          </div>
                          
                          {/* Reconciliation Status Container */}
                          <div className="relative border border-[#bdcddc] bg-white px-2 py-0.5 rounded-sm flex flex-col items-start min-w-[200px] h-[28px] justify-center">
                            <span className="absolute -top-1.5 left-2 bg-white px-1 text-[8px] text-gray-500 scale-95 origin-left font-semibold">
                              Reconciliation Status
                            </span>
                            <div className="flex items-center gap-3 text-[8.5px] mt-1 font-semibold text-gray-700">
                              <span className="flex items-center gap-0.5 text-sky-700">
                                <span className="text-[9px] bg-sky-100 text-sky-700 rounded-full w-3 h-3 inline-flex items-center justify-center font-bold">i</span> Meds History
                              </span>
                              <span className="flex items-center gap-0.5 text-sky-700">
                                <span className="text-[9px] bg-sky-100 text-sky-700 rounded-full w-3 h-3 inline-flex items-center justify-center font-bold">i</span> Admission
                              </span>
                              <span className="flex items-center gap-0.5 text-sky-700">
                                <span className="text-[9px] bg-sky-100 text-sky-700 rounded-full w-3 h-3 inline-flex items-center justify-center font-bold">i</span> Discharge
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sub-tabs row */}
                        <div className="bg-white border-b border-gray-200 px-3 py-1 flex items-center h-[28px]">
                          <div className="flex gap-1 text-[10px]">
                            <button className="px-2 py-0.5 font-bold border border-gray-400 bg-white text-gray-900 shadow-2xs">Orders</button>
                            <button className="px-2 py-0.5 font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-2xs">Medication List</button>
                            <button className="px-2 py-0.5 font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-2xs">Document In Plan</button>
                          </div>
                        </div>

                        {/* Main Panel Content Area */}
                        <div className="flex-1 flex overflow-hidden bg-white">
                          
                          {/* Left Panel: Diagnoses & Problems */}
                          <div className="w-[320px] border-r border-gray-300 flex flex-col bg-gray-50 p-2 overflow-y-auto space-y-4">
                            <div className="bg-[#005a94] text-white text-center font-bold py-0.5 text-[10.5px]">
                              Diagnoses & Problems
                            </div>

                            {/* Section 1: Diagnosis addressed */}
                            <div className="bg-white border border-gray-300 p-1.5 space-y-1.5 shadow-2xs">
                              <div className="font-bold text-[10px] text-gray-700">Diagnosis (Problem) being Addressed this Visit</div>
                              <div className="flex gap-1.5">
                                <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-0.5"><span className="text-blue-600">+</span> Add</button>
                                <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold">🔄 Convert</button>
                                <select className="bg-white border border-gray-300 rounded-sm text-gray-700 px-1 py-0.5 focus:outline-none"><option>Display: Active</option></select>
                              </div>
                              <table className="w-full text-left border border-gray-200 text-[9.5px]">
                                <thead>
                                  <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                                    <th className="p-1 border-r border-gray-200 w-[20px] text-center"><input type="checkbox" defaultChecked /></th>
                                    <th className="p-1 border-r border-gray-200 w-[20px] text-center">❌</th>
                                    <th className="p-1 border-r border-gray-200">Annotated Display</th>
                                    <th className="p-1 border-r border-gray-200">Code</th>
                                    <th className="p-1">Clinical...</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="bg-white border-b border-gray-100 text-gray-800">
                                    <td className="p-1 border-r border-gray-200 text-center"><input type="checkbox" defaultChecked /></td>
                                    <td className="p-1 border-r border-gray-200 text-center text-red-500">❌</td>
                                    <td className="p-1 border-r border-gray-200 font-semibold truncate max-w-[120px]" title="Nondisplaced fracture of ...">Nondisplaced fracture of ...</td>
                                    <td className="p-1 border-r border-gray-200">S72.115A</td>
                                    <td className="p-1 truncate max-w-[60px]">Nondi...</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Section 2: Problems */}
                            <div className="bg-white border border-gray-300 p-1.5 space-y-1.5 shadow-2xs">
                              <div className="font-bold text-[10px] text-gray-700">Problems</div>
                              <div className="flex gap-1.5 flex-wrap">
                                <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-0.5"><span className="text-blue-600">+</span> Add</button>
                                <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold">🔄 Convert</button>
                                <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold">No Chronic Problems</button>
                              </div>
                              <select className="bg-white border border-gray-300 rounded-sm text-gray-700 px-1 py-0.5 focus:outline-none w-fit"><option>Display: Active</option></select>
                              <table className="w-full text-left border border-gray-200 text-[9.5px]">
                                <thead>
                                  <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                                    <th className="p-1 border-r border-gray-200 w-[20px] text-center"><input type="checkbox" defaultChecked /></th>
                                    <th className="p-1 border-r border-gray-200">Annotated Display</th>
                                    <th className="p-1 border-r border-gray-200">Name of Problem</th>
                                    <th className="p-1">Code</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="bg-white border-b border-gray-100 text-gray-800">
                                    <td className="p-1 border-r border-gray-200 text-center"><input type="checkbox" defaultChecked /></td>
                                    <td className="p-1 border-r border-gray-200 font-semibold text-blue-800 underline truncate max-w-[100px]" title="At risk of venous thromb...">At risk of venous thromb...</td>
                                    <td className="p-1 border-r border-gray-200 font-semibold text-blue-800 underline truncate max-w-[100px]" title="At risk of venous thromb...">At risk of venous thromb...</td>
                                    <td className="p-1 font-mono">2674624018</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Related Results / Formulary Details */}
                            <div className="bg-[#cbd8e3]/50 border border-gray-300 text-center font-semibold text-[10px] text-gray-700 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors">
                              Related Results
                            </div>
                            <div className="bg-[#cbd8e3]/50 border border-gray-300 text-center font-semibold text-[10px] text-gray-700 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors">
                              Formulary Details
                            </div>
                          </div>

                          {/* Right Panel: Search & Order folders */}
                          <div className="flex-1 flex flex-col bg-white overflow-hidden p-3 space-y-3">
                            {/* Search controls */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 p-2 bg-gray-50 rounded-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Search:</span>
                                <div className="relative bg-white text-black px-2 py-0.5 rounded-sm flex items-center border border-gray-300 w-[240px]">
                                  <input 
                                    type="text" 
                                    className="w-full text-[10.5px] focus:outline-none bg-transparent" 
                                    placeholder="" 
                                    value={ordersSearchQuery}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setOrdersSearchQuery(val);
                                      setIsOrdersDropdownOpen(val.length > 0);
                                    }}
                                    onFocus={() => {
                                      if (ordersSearchQuery.length > 0) {
                                        setIsOrdersDropdownOpen(true);
                                      }
                                    }}
                                  />
                                  <span className="text-gray-400 cursor-pointer" onClick={() => setIsOrdersDropdownOpen(true)}>🔍</span>
                                  
                                  {/* Autocomplete dropdown */}
                                  {isOrdersDropdownOpen && (
                                    <>
                                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOrdersDropdownOpen(false)} />
                                      <div className="absolute top-full left-0 w-[600px] bg-white border border-gray-400 shadow-lg rounded-sm z-50 mt-0.5 text-left text-gray-800 flex flex-col font-sans select-none max-h-[300px] overflow-y-auto">
                                        {[
                                          { name: 'warfarin' },
                                          { name: 'warfarin (1 mg, Oral, Tab, Daily)' },
                                          { name: 'warfarin (2 mg, Oral, Tab, Daily)' },
                                          { name: 'warfarin (5 mg, Oral, Tab, Daily)' },
                                          { name: 'Warfarin reversal, Severely Bleeding Pt 4 factor PCC (Kcentra) or factor IX Complex (Profilnine)', icon: '🛡️' },
                                          { name: 'warfarin (2.5 mg, Oral, Tab, Daily)' },
                                          { name: 'warfarin (3 mg, Oral, Tab, Daily)' },
                                          { name: 'warfarin (4 mg, Oral, Tab, Daily)' },
                                          { name: 'warfarin (6 mg, Oral, Tab, Daily)' },
                                          { name: 'warfarin (7.5 mg, Oral, Tab, Daily)' },
                                          { name: 'warfarin (10 mg, Oral, Tab, Daily)' },
                                          { name: 'Coumadin (warfarin) Orders', icon: '💊' },
                                          { name: 'Pharmacy consult- warfarin' },
                                          { name: 'Pharmacy consult- warfarin (Anticoagulation service, Comment: Please assess, dose, and monitor warfarin therapy)' },
                                          { name: 'Rapid Reversal of Supratherapeutic INR r/t warfarin', icon: '⚡' }
                                        ].filter(item => {
                                          if (!ordersSearchQuery) return true;
                                          return item.name.toLowerCase().includes(ordersSearchQuery.toLowerCase());
                                        }).map((item, idx) => (
                                          <div 
                                            key={idx}
                                            onClick={() => {
                                              setOrdersSearchQuery(item.name);
                                              setIsOrdersDropdownOpen(false);
                                            }}
                                            className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-[10.5px] border-b border-gray-100 flex items-center gap-1.5"
                                          >
                                            {item.icon && <span className="text-[11px]">{item.icon}</span>}
                                            <span className={item.icon ? 'font-bold text-[#005a94]' : 'text-gray-800'}>
                                              {item.name}
                                            </span>
                                          </div>
                                        ))}
                                        
                                        <div className="bg-gray-100 text-gray-500 font-bold px-3 py-1 text-[9px] border-t border-gray-300">
                                          "Enter" to Search
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                                <button className="text-blue-700 font-semibold text-[10px] hover:underline flex items-center gap-0.5">Advanced Options ▾</button>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-600 font-semibold">Type:</span>
                                  <select className="bg-white border border-gray-300 text-[10.5px] py-0.5 px-1.5 focus:outline-none rounded-sm">
                                    <option>Inpatient</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Sub-ribbon navigation */}
                            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 text-[10.5px]">
                              <div className="flex items-center gap-3">
                                <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                                  <span>⬆️</span> Up
                                </button>
                                <button className="flex items-center gap-0.5 text-[#005a94] hover:text-blue-900 font-semibold">
                                  <span>🏠</span> Home
                                </button>
                                <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                                  <span>⭐</span> Favorites ▾
                                </button>
                                <span className="text-gray-300">|</span>
                                <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                                  <span>📁</span> Folders
                                </button>
                                <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                                  <span>📄</span> Copy
                                </button>
                                <span className="text-gray-600 font-bold ml-2">Folder: Hospitalist Orders</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Search within:</span>
                                <select className="bg-white border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none">
                                  <option>All</option>
                                </select>
                              </div>
                            </div>

                            {/* Folder List tree view */}
                            <div className="flex-1 border border-gray-200 bg-white rounded-sm p-4 overflow-y-auto space-y-3 shadow-inner">
                              {[
                                { name: 'Admit/Transfer Orders' },
                                { name: 'Discharge Orders' },
                                { name: 'Laboratory' },
                                { name: 'Imaging' }
                              ].filter(folder => {
                                if (!ordersSearchQuery) return true;
                                return folder.name.toLowerCase().includes(ordersSearchQuery.toLowerCase());
                              }).map((folder, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                                  <span className="text-yellow-600 text-sm">📁</span>
                                  <span className="font-semibold text-gray-800 text-[11.5px]">{folder.name}</span>
                                </div>
                              ))}
                              {ordersSearchQuery && ![
                                'Admit/Transfer Orders', 'Discharge Orders', 'Laboratory', 'Imaging'
                              ].some(n => n.toLowerCase().includes(ordersSearchQuery.toLowerCase())) && (
                                <div className="text-gray-400 italic text-[11px] text-center pt-4">No matching folders found</div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Bottom Grayed status sections */}
                        <div className="bg-gray-100 border-t border-gray-300 px-3 py-1 flex items-center text-gray-500 font-semibold select-none h-[22px]">
                          <span>Orders for Signature</span>
                        </div>
                        <div className="bg-white border-t border-gray-300 px-3 py-1 flex items-center text-gray-500 font-semibold select-none h-[22px] border-b">
                          <span>Details</span>
                        </div>

                        {/* Footer row */}
                        <div className="bg-[#cbd8e3] p-2 flex justify-between items-center border-t border-gray-300">
                          <div className="flex gap-2">
                            <button className="bg-white border border-gray-400 text-gray-600 font-bold px-3 py-1 text-[10px] rounded-xs shadow-sm hover:bg-gray-150">
                              0 Missing Required Details
                            </button>
                            <button className="bg-white border border-gray-400 text-gray-600 font-bold px-4 py-1 text-[10px] rounded-xs shadow-sm hover:bg-gray-150">
                              Dx Table
                            </button>
                            <button className="bg-white border border-gray-400 text-gray-600 font-bold px-4 py-1 text-[10px] rounded-xs shadow-sm hover:bg-gray-150">
                              Orders For Cosignature
                            </button>
                          </div>
                          <button onClick={() => setIsDetailedOrderActive(false)} className="bg-white border border-[#0a4c7a] hover:bg-[#eef4f8] text-[#0a4c7a] font-extrabold px-6 py-1 text-[10px] rounded-xs shadow-sm transition-colors">
                            Sign
                          </button>
                        </div>

                        {/* Status bar */}
                        <div className="bg-[#002a46] text-white px-3 py-0.5 flex justify-end text-[9px] font-mono select-none h-[18px]">
                          <span>P248 | 26217 | July 07, 2017 12:48 CDT</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 bg-white flex flex-col overflow-hidden font-sans text-gray-800">
                        {/* New Order Entry View */}
                        <div className="border-b border-[#bdcddc] px-3 py-1 flex justify-between items-center text-[11px] h-[34px] bg-[#f0f4f8]">
                          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs">
                            <span>New Order Entry</span>
                            <span onClick={() => setIsDetailedOrderActive(true)} className="text-[#005a94] text-sm cursor-pointer font-extrabold">+</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Refresh">
                              🔄
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Settings">
                              ⚙️
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {/* Alert Box */}
                          <div className="bg-[#e6f0fa] border border-[#a2c8ec] text-[#004080] px-3 py-2 flex justify-between items-start text-[11px]">
                            <div className="flex gap-2 items-center">
                              <span className="text-sky-600 font-bold text-sm">ℹ️</span>
                              <span>This facility doesn't display formulary information for inpatient encounters. Eligibility checking was not performed.</span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 font-semibold text-xs leading-none">×</button>
                          </div>

                          {/* Inpatient Selector */}
                          <div className="flex items-center gap-1">
                            <select className="bg-transparent hover:bg-gray-100 text-gray-800 text-[11.5px] font-semibold border-none focus:outline-none cursor-pointer py-0.5 px-1 rounded">
                              <option>Inpatient</option>
                            </select>
                          </div>

                          {/* Sub-header Bar: Mine, Public, Shared tabs and search input */}
                          <div className="flex items-center justify-between gap-4 border border-gray-300 bg-gray-50 p-1.5 rounded-sm">
                            <div className="flex items-center border border-gray-300 rounded overflow-hidden select-none bg-white">
                              <div className="bg-gray-100 border-r border-gray-300 px-3 py-1 flex items-center justify-center cursor-pointer hover:bg-gray-200 text-xs">
                                🏠
                              </div>
                              <button className="px-5 py-1 text-[11px] font-semibold border-r border-gray-300 bg-white hover:bg-gray-50 text-gray-700">Mine</button>
                              <button className="px-5 py-1 text-[11px] font-semibold border-r border-gray-300 bg-white hover:bg-gray-50 text-gray-700">Public</button>
                              <button className="px-5 py-1 text-[11px] font-semibold bg-white hover:bg-gray-50 text-gray-700">Shared</button>
                            </div>

                            <div className="flex items-center gap-2 flex-1 max-w-[460px] justify-end">
                              <span className="text-gray-700 text-[11.5px] font-semibold select-none">Search:</span>
                              <div className="relative flex-1 flex items-center border border-[#c5d6e6] rounded-md bg-white px-3 py-1 shadow-2xs hover:border-[#a0c0e0] focus-within:border-[#005a94] focus-within:ring-1 focus-within:ring-[#005a94] transition-all">
                                <input 
                                  type="text" 
                                  placeholder="" 
                                  className="w-full text-[11.5px] focus:outline-none bg-transparent pr-6 text-gray-800"
                                  value={ordersSearchQuery}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOrdersSearchQuery(val);
                                    setIsOrdersDropdownOpen(val.length > 0);
                                  }}
                                  onFocus={() => {
                                    if (ordersSearchQuery.length > 0) {
                                      setIsOrdersDropdownOpen(true);
                                    }
                                  }}
                                />
                                <span className="text-sky-500 hover:text-sky-700 cursor-pointer absolute right-2.5 flex items-center">
                                  <svg className="w-3.5 h-3.5 fill-cyan-400 stroke-indigo-600 stroke-[2.5]" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                  </svg>
                                </span>
                                
                                {ordersSearchQuery && (
                                  <button 
                                    onClick={() => {
                                      setOrdersSearchQuery('');
                                      setIsOrdersDropdownOpen(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-650 font-semibold text-xs leading-none mr-5"
                                  >
                                    ×
                                  </button>
                                )}
                                
                                {/* Autocomplete dropdown */}
                                {isOrdersDropdownOpen && (
                                  <>
                                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOrdersDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 w-[550px] bg-white border border-gray-400 shadow-lg rounded-sm z-50 mt-1 text-left text-gray-800 flex flex-col font-sans select-none max-h-[250px] overflow-y-auto">
                                      {[
                                        { name: 'warfarin' },
                                        { name: 'warfarin (1 mg, Oral, Tab, Daily)' },
                                        { name: 'warfarin (2 mg, Oral, Tab, Daily)' },
                                        { name: 'warfarin (5 mg, Oral, Tab, Daily)' },
                                        { name: 'Warfarin reversal, Severely Bleeding Pt 4 factor PCC (Kcentra) or factor IX Complex (Profilnine)', icon: '🛡️' },
                                        { name: 'warfarin (2.5 mg, Oral, Tab, Daily)' },
                                        { name: 'warfarin (3 mg, Oral, Tab, Daily)' },
                                        { name: 'warfarin (4 mg, Oral, Tab, Daily)' },
                                        { name: 'warfarin (6 mg, Oral, Tab, Daily)' },
                                        { name: 'warfarin (7.5 mg, Oral, Tab, Daily)' },
                                        { name: 'warfarin (10 mg, Oral, Tab, Daily)' },
                                        { name: 'Coumadin (warfarin) Orders', icon: '💊' },
                                        { name: 'Pharmacy consult- warfarin' },
                                        { name: 'Pharmacy consult- warfarin (Anticoagulation service, Comment: Please assess, dose, and monitor warfarin therapy)' },
                                        { name: 'Rapid Reversal of Supratherapeutic INR r/t warfarin', icon: '⚡' }
                                      ].filter(item => {
                                        if (!ordersSearchQuery) return true;
                                        return item.name.toLowerCase().includes(ordersSearchQuery.toLowerCase());
                                      }).map((item, idx) => (
                                        <div 
                                          key={idx}
                                          onClick={() => {
                                            setOrdersSearchQuery(item.name);
                                            setIsOrdersDropdownOpen(false);
                                          }}
                                          className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-[10.5px] border-b border-gray-100 flex items-center gap-1.5"
                                        >
                                          {item.icon && <span className="text-[11px]">{item.icon}</span>}
                                          <span className={item.icon ? 'font-bold text-[#005a94]' : 'text-gray-800'}>
                                            {item.name}
                                          </span>
                                        </div>
                                      ))}
                                      
                                      <div className="bg-gray-100 text-gray-500 font-bold px-3 py-1 text-[9px] border-t border-gray-300">
                                        "Enter" to Search
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Hospitalist Orders Folders list */}
                          <div className="border border-gray-200 bg-white rounded-sm shadow-2xs">
                            <div className="flex items-center gap-2 p-2 bg-gray-50/50 border-b border-gray-200">
                              <span className="text-yellow-600 text-xs">📁</span>
                              <span className="font-bold text-[11.5px] text-[#0f4471]">Hospitalist Orders</span>
                            </div>
                            <div className="p-2 pl-6 space-y-2 text-[11px]">
                              {[
                                { name: 'Admit/Transfer Orders' },
                                { name: 'Discharge Orders' },
                                { name: 'Laboratory' },
                                { name: 'Imaging' }
                              ].filter(folder => {
                                if (!ordersSearchQuery) return true;
                                return folder.name.toLowerCase().includes(ordersSearchQuery.toLowerCase());
                              }).map((folder, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-0.5 px-1.5 rounded transition-all">
                                  <span className="text-yellow-600">📁</span>
                                  <span className="font-semibold text-gray-800">{folder.name}</span>
                                </div>
                              ))}
                              {ordersSearchQuery && ![
                                'Admit/Transfer Orders', 'Discharge Orders', 'Laboratory', 'Imaging'
                              ].some(n => n.toLowerCase().includes(ordersSearchQuery.toLowerCase())) && (
                                <div className="text-gray-400 italic text-[11px] text-center pt-2">No matching folders found</div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    )
                  ) : profileSidebarOption === 'Histories' ? (
                    <div className="flex-1 bg-[#f0f4f8] flex flex-col overflow-hidden text-[10.5px]">
                      {/* Header Ribbon */}
                      <div className="bg-white border-b border-gray-300 px-4 py-2 flex justify-between items-center h-[34px]">
                        <span className="font-bold text-[#002a46] text-xs">Histories - Clinical Visits</span>
                        <div className="flex items-center gap-2">
                          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-2 py-0.5 font-semibold text-gray-700">🖨️ Print History</button>
                        </div>
                      </div>

                      {/* Main Table Content */}
                      <div className="flex-1 p-4 overflow-auto">
                        <div className="bg-white border border-gray-300 rounded shadow-2xs">
                          <div className="bg-[#005a94] text-white font-bold px-3 py-1.5 text-[11px]">
                            Patient Clinical Visit History
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 font-bold">
                                <th className="p-2 border-r border-gray-200">Date & Time</th>
                                <th className="p-2 border-r border-gray-200">Department / Location</th>
                                <th className="p-2 border-r border-gray-200">Clinician / Provider</th>
                                <th className="p-2 border-r border-gray-200">Reason for Visit</th>
                                <th className="p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-900">05/28/2026 10:15 AM</td>
                                <td className="p-2 border-r border-gray-200 text-gray-800">Orthopedic Surgery Center</td>
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-800">Dr. Herman Stewart</td>
                                <td className="p-2 border-r border-gray-200 text-gray-600">Left shoulder fracture evaluation</td>
                                <td className="p-2"><span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-sm font-bold text-[9px]">Completed</span></td>
                              </tr>
                              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-900">03/12/2026 02:30 PM</td>
                                <td className="p-2 border-r border-gray-200 text-gray-800">Cardiology Specialist Clinic</td>
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-800">Dr. K. Iyer</td>
                                <td className="p-2 border-r border-gray-200 text-gray-600">Routine follow-up post ECG</td>
                                <td className="p-2"><span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-sm font-bold text-[9px]">Completed</span></td>
                              </tr>
                              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-900">11/05/2025 09:00 AM</td>
                                <td className="p-2 border-r border-gray-200 text-gray-800">General Family Medicine</td>
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-800">Dr. R. Sharma</td>
                                <td className="p-2 border-r border-gray-200 text-gray-600">Annual wellness exam & labs</td>
                                <td className="p-2"><span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-sm font-bold text-[9px]">Completed</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : profileSidebarOption === 'Insurance' ? (
                    <div className="flex-1 bg-[#f0f4f8] flex flex-col overflow-hidden text-[10.5px]">
                      {/* Main content area */}
                      <div className="flex-1 p-4 overflow-auto">
                        {/* Insurances list table matching image */}
                        <div className="bg-white border border-gray-300 rounded shadow-2xs">
                          <div className="bg-[#005a94] text-white font-bold px-3 py-1.5 text-[11px]">
                            Insurance Coverage details
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 font-bold">
                                <th className="p-2 border-r border-gray-200">Plan Name</th>
                                <th className="p-2 border-r border-gray-200">Policy Number</th>
                                <th className="p-2 border-r border-gray-200">Group ID</th>
                                <th className="p-2 border-r border-gray-200">Coverage Window</th>
                                <th className="p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-900">Blue Cross Blue Shield (BCBS) PPO</td>
                                <td className="p-2 border-r border-gray-200 font-mono text-gray-800">BCB-9988221A</td>
                                <td className="p-2 border-r border-gray-200 font-mono text-gray-800">TX-GRP-89</td>
                                <td className="p-2 border-r border-gray-200 text-gray-600">01/01/2026 - 12/31/2026</td>
                                <td className="p-2"><span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-sm font-bold text-[9px]">Active</span></td>
                              </tr>
                              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-900">Aetna Choice POS II</td>
                                <td className="p-2 border-r border-gray-200 font-mono text-gray-800">AET-7711202B</td>
                                <td className="p-2 border-r border-gray-200 font-mono text-gray-800">AE-POS-04</td>
                                <td className="p-2 border-r border-gray-200 text-gray-600">06/01/2026 - 05/31/2027</td>
                                <td className="p-2"><span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-sm font-bold text-[9px]">Active</span></td>
                              </tr>
                              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-200 font-medium text-gray-900">UnitedHealthcare (UHC) Choice</td>
                                <td className="p-2 border-r border-gray-200 font-mono text-gray-800">UHC-1009945F</td>
                                <td className="p-2 border-r border-gray-200 font-mono text-gray-800">UH-CORP-01</td>
                                <td className="p-2 border-r border-gray-200 text-gray-600">01/01/2025 - 12/31/2025</td>
                                <td className="p-2"><span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded-sm font-bold text-[9px]">Expired</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : profileSidebarOption === 'Documentation' ? (
                    <div className="flex-1 bg-white flex flex-col overflow-hidden text-[10.5px]">
                      {/* Action Toolbar */}
                      <div className="bg-[#f0f4f8] border-b border-[#bdcddc] px-3 py-1 flex items-center justify-between h-[30px]">
                        <div className="flex items-center gap-3 font-semibold text-gray-700">
                          <button className="flex items-center gap-1 text-blue-800 hover:text-blue-900 font-bold">
                            <span className="text-blue-600 font-extrabold text-xs">+</span> Add
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed" disabled>
                            <span>✓</span> Sign
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed" disabled>
                            <span>✉</span> Forward
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed" disabled>
                            <span>📄</span> Provider Letter
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed" disabled>
                            <span>✏</span> Modify
                          </button>
                          <span className="text-gray-300">|</span>
                          
                          {/* Small action icons */}
                          <div className="flex items-center gap-2 text-gray-400">
                            <span className="cursor-not-allowed">📝</span>
                            <span className="cursor-not-allowed">📁</span>
                            <span className="cursor-not-allowed">⚠️</span>
                            <span className="cursor-not-allowed">🗑️</span>
                          </div>

                          <span className="text-gray-300">|</span>

                          {/* Preview button */}
                          <button className="bg-white border border-[#bdcddc] px-2 py-0.5 rounded-sm font-semibold text-gray-800 hover:bg-gray-50 flex items-center gap-1 shadow-2xs">
                            <span>👁</span> Preview
                          </button>

                          <span className="text-gray-300">|</span>

                          {/* Tag icon */}
                          <button className="text-gray-500 hover:text-gray-700">
                            <span>🏷️</span>
                          </button>
                        </div>
                      </div>

                      {/* Tab Row */}
                      <div className="bg-[#e4ebf2] px-2 pt-1 flex justify-between items-center border-b border-[#bdcddc]">
                        <div className="flex">
                          <button className="bg-white border-t border-x border-[#bdcddc] px-4 py-1 font-bold text-blue-900 rounded-t-sm relative -mb-[1px] z-10">
                            List
                          </button>
                        </div>
                        <div className="text-gray-500 text-[10px] pb-1 flex gap-1 font-bold">
                          <span>◀</span>
                          <span>▶</span>
                        </div>
                      </div>

                      {/* Filter Row */}
                      <div className="bg-[#f0f4f8] px-3 py-1 flex justify-between items-center border-b border-[#bdcddc] h-[28px]">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 font-medium">Display:</span>
                          <select className="bg-white border border-gray-300 rounded px-1 py-0.5 text-[10.5px] outline-none">
                            <option>All</option>
                          </select>
                          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-2.5 py-0.5 text-gray-700 font-semibold shadow-3xs">
                            Advanced Filters
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-1 text-blue-800 hover:text-blue-950 font-bold">
                            <span className="text-blue-500 text-[11px]">▲</span> Previous Note
                          </button>
                          <button className="flex items-center gap-1 text-blue-800 hover:text-blue-950 font-bold">
                            <span className="text-blue-500 text-[11px]">▼</span> Next Note
                          </button>
                        </div>
                      </div>

                      {/* Main Split Layout Panel */}
                      <div className="flex-1 flex overflow-hidden">
                        {/* Left Column: Notes Table */}
                        <div className="w-[58%] border-r border-[#bdcddc] overflow-y-auto bg-white">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#f0f4f8] text-gray-700 border-b border-[#bdcddc] font-bold sticky top-0 z-10 select-none">
                                <th className="p-2 border-r border-[#bdcddc] font-bold">Service Date/Time</th>
                                <th className="p-2 border-r border-[#bdcddc] font-bold">Subject</th>
                                <th className="p-2 font-bold">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { date: '23-Apr-2024 14:41:56 PDT', subject: 'Therapeutic Intervention/Group Progress Note', type: 'Therapeutic/Intervention Note' },
                                { date: '23-Feb-2024 11:11:28 PST', subject: 'Consult Note', type: 'Addiction Medicine Consult' },
                                { date: '07-Nov-2023 11:13:00 PST', subject: 'Patient Preferred Info', type: 'Patient Preferred Info - Text' },
                                { date: '14-Jun-2023 11:01:00 PDT', subject: 'Home Ventilation Prescription', type: 'Home Ventilation Prescription - Text' },
                                { date: '14-Jun-2023 10:54:00 PDT', subject: 'Cardiac Surgery AFIB Risk Stratification', type: 'Card Surg AFIB Risk Stratification-Tex' },
                                { date: '29-May-2023 12:48:49 P...', subject: 'Fallls', type: 'Nursing Narrative Note' },
                                { date: '24-Apr-2023 10:26:00 PDT', subject: 'PSSCAN-R Psychological Screen', type: 'PSSCAN-R Psychological Screen - Te' },
                                { date: '06-Apr-2023 09:29:20 PDT', subject: 'Free Text Note', type: 'Genetic Counsellor Note' },
                                { date: '03-Apr-2023 15:40:00 PDT', subject: 'PSSCAN-R Psychological Screen', type: 'PSSCAN-R Psychological Screen - Te' },
                                { date: '03-Apr-2023 15:31:00 PDT', subject: 'PSSCAN-R Psychological Screen', type: 'PSSCAN-R Psychological Screen - Te' },
                                { date: '03-Apr-2023 15:24:00 PDT', subject: 'PSSCAN-R Psychological Screen', type: 'PSSCAN-R Psychological Screen - Te' },
                                { date: '03-Apr-2023 15:14:00 PDT', subject: 'PSSCAN-R Psychological Screen', type: 'PSSCAN-R Psychological Screen - Te' },
                                { date: '29-Mar-2023 13:44:21 PDT', subject: 'Allied Health Global Assessment Note', type: 'Occupational Therapy Note' },
                                { date: '14-Mar-2023 09:24:50 PDT', subject: 'Social Work Assessment', type: 'Social Work Note' },
                                { date: '10-Mar-2023 11:53:54 PST', subject: 'PT Note', type: 'Physical Therapy Note' }
                              ].map((row, idx) => {
                                const isSelected = selectedDocIndex === idx;
                                return (
                                  <tr 
                                    key={idx} 
                                    onClick={() => setSelectedDocIndex(idx)}
                                    className={`border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer select-none ${
                                      isSelected ? 'bg-[#0f4471] text-white font-medium hover:bg-[#0f4471]' : 'text-gray-800'
                                    }`}
                                  >
                                    <td className={`p-1.5 border-r border-[#bdcddc] font-sans ${isSelected ? 'border-r-white/20' : ''}`}>{row.date}</td>
                                    <td className={`p-1.5 border-r border-[#bdcddc] font-sans truncate max-w-[200px] ${isSelected ? 'border-r-white/20' : ''}`}>{row.subject}</td>
                                    <td className="p-1.5 font-sans truncate max-w-[180px]">{row.type}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Right Column: Note Preview */}
                        <div className="flex-1 bg-white p-3 overflow-y-auto flex flex-col">
                          <div className="border border-[#bdcddc] rounded-xs p-4 flex-1 font-sans bg-white text-gray-900 shadow-2xs overflow-y-auto">
                            {selectedDocIndex === 1 ? (
                              <div className="space-y-4 text-xs leading-relaxed max-w-[450px] mx-auto">
                                <h3 className="text-center font-bold text-sm tracking-wide my-2">* Final Report *</h3>
                                
                                <div className="space-y-1">
                                  <h4 className="font-bold underline text-gray-950">Reason for Consultation</h4>
                                  <p className="pl-1">Testing testing testing</p>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="font-bold underline text-gray-950">Medications</h4>
                                  <div className="pl-1 space-y-1">
                                    <p className="underline font-medium text-gray-900">Home Medications</p>
                                    <p className="text-gray-700">No Best Possible Medication History obtained on this encounter.</p>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="font-bold underline text-gray-950">Allergies</h4>
                                  <div className="pl-1 space-y-0.5 font-sans text-gray-800">
                                    <p>Latex</p>
                                    <p>penicillin (Reaction: Rash)</p>
                                    <p>Peanuts</p>
                                    <p>Banana</p>
                                    <p>Bee Stings</p>
                                    <p>morphine</p>
                                    <p>other contrast (Reaction: Pain, Vomiting)</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                                <span className="text-3xl mb-2">📄</span>
                                <p className="font-bold text-[11px]">No preview available for this document</p>
                                <p className="text-[10px] text-gray-400 mt-1">Select the "Consult Note" row to view its details.</p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                      {/* Top document toolbar row */}
                      <div className="bg-[#cbd8e3] border-b border-[#bdcddc] px-3 py-1 flex justify-between items-center text-[10.5px] h-[28px]">
                        <div className="flex gap-2 font-bold text-[#0f4471]"></div>
                        <div className="flex items-center gap-2"></div>
                      </div>

                      {/* Interactive Form Content Area */}
                      <div className="flex-1 overflow-auto bg-white p-6 text-[11px] text-gray-800 space-y-5">
                        
                        {/* Form Row 1: Implant Lot */}
                        <div className="grid grid-cols-[200px_400px] items-start gap-4">
                          <span className="text-gray-500 font-semibold pt-1">Implant Lot #: <span className="text-gray-400 font-normal italic">(optional)</span></span>
                          <textarea 
                            rows={3} 
                            className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#005a94] font-mono text-[11px]" 
                            placeholder=""
                          />
                        </div>

                        {/* Form Row 2: Was dermal matrix used */}
                        <div className="grid grid-cols-[200px_400px] items-start gap-4">
                          <span className="text-gray-500 font-semibold pt-0.5">Was dermal matrix used?: <span className="text-gray-400 font-normal italic">(optional)</span></span>
                          <div className="space-y-1.5">
                            {['Yes', 'No', 'Unknown'].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="dermal_matrix" className="accent-[#005a94]" />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Form Row 3: Operative Description */}
                        <div className="grid grid-cols-[200px_400px] items-center gap-4">
                          <span className="text-gray-500 font-semibold">Operative Description: <span className="text-gray-400 font-normal italic">(optional)</span></span>
                          <div className="flex items-center gap-3">
                            <select className="border border-gray-300 rounded p-1 w-full bg-white focus:outline-none">
                              <option>Choose an option</option>
                            </select>
                            <span className="text-[#005a94] hover:underline cursor-pointer whitespace-nowrap font-bold">Other...</span>
                          </div>
                        </div>

                        {/* Form Row 4: Comments */}
                        <div className="grid grid-cols-[200px_400px] items-start gap-4">
                          <span className="text-gray-500 font-semibold pt-1">Comments: <span className="text-gray-400 font-normal italic">(optional)</span></span>
                          <textarea 
                            rows={3} 
                            className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#005a94] text-[11px]" 
                            placeholder=""
                          />
                        </div>

                        {/* Section: Other Comments */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          {/* Bright yellow header bar */}
                          <div className="bg-[#fff200] font-extrabold text-[12px] px-3 py-1 text-black select-none w-fit tracking-wide shadow-sm">
                            Other Comments
                          </div>

                          {/* Yellow highlighted label and text display */}
                          <div className="grid grid-cols-[200px_400px] items-start gap-4">
                            <div className="bg-[#fff200] font-bold px-2 py-0.5 text-black w-fit text-[11px]">
                              Other Comments:
                            </div>
                            <textarea 
                              rows={3} 
                              defaultValue="I am signing this report at the direction of administration, in the absence of Cerner Surgeon 1."
                              className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#005a94] text-[11px] text-gray-800 font-sans" 
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })()}

          {activeTab.type === 'EditPatientProfile' && (
            <div className="flex flex-1 overflow-hidden select-none">
              
              {/* Left Sidebar: Edit Patient Options */}
              <div className="w-[180px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
                <div className="bg-[#789cbb] text-white font-bold p-1.5 flex justify-between items-center">
                  <span>Clinical Options</span>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-3 py-1.5 bg-[#007cc0] text-white font-bold">Demographics</button>
                  {['Contacts', 'Clinical Chart', 'Allergies', 'Medications', 'Problems', 'Documents', 'Images', 'Lab Results', 'Immunizations', 'Vitals', 'Care Plans', 'Notes', 'Export Data', 'Backup', 'Audit Trail', 'Exit'].map((opt) => (
                    <button key={opt} className="w-full text-left px-3 py-1.5 hover:bg-[#cbd8e3]/50 text-gray-700 transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Panel Form container */}
              <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-auto text-[10px]">
                
                {/* Form Title & Top Sub-ribbon (Ribbon 3) */}
                <div className="bg-white border-b border-[#bdcddc] px-3 py-1 flex items-center gap-3 text-[#2c3e50] font-semibold">
                  <button className="flex items-center gap-1 hover:text-black">👤 New Patient</button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 hover:text-black">💾 Save</button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 hover:text-black">💾 Save & Close</button>
                  <button className="flex items-center gap-1 hover:text-black">🖨️ Print</button>
                  <button className="flex items-center gap-1 hover:text-red-600">❌ Delete</button>
                  <button className="flex items-center gap-1 hover:text-black">↩️ Undo</button>
                  <button className="flex items-center gap-1 hover:text-black">🔄 Refresh</button>
                  <span className="text-gray-300">|</span>
                  <button className="flex items-center gap-1 hover:text-black">📅 Appointments</button>
                  <button className="flex items-center gap-1 hover:text-black">📄 Documents</button>
                  <button onClick={() => selectOrOpenTab('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')} className="flex items-center gap-1 hover:text-black">❌ Close</button>
                </div>

                <div className="p-4 flex gap-4 overflow-auto">
                  
                  {/* Fields Block */}
                  <div className="flex-1 bg-white border border-[#bdcddc] p-4 rounded shadow-sm space-y-4">
                    <h3 className="font-bold text-xs text-[#0f4471] border-b border-[#bdcddc] pb-1.5">Edit Patient Profile</h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Last Name *</label>
                        <input 
                          type="text" 
                          value={editLastName} 
                          onChange={(e) => setEditLastName(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0f4471]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">First Name *</label>
                        <input 
                          type="text" 
                          value={editFirstName} 
                          onChange={(e) => setEditFirstName(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0f4471]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Middle Initial</label>
                        <input 
                          type="text" 
                          value={editMiddleInitial} 
                          onChange={(e) => setEditMiddleInitial(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">ABHA-ID *</label>
                        <input 
                          type="text" 
                          value={editMrn} 
                          onChange={(e) => setEditMrn(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                       <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Axio-ID</label>
                        <input 
                          type="text" 
                          value={editSsn} 
                          onChange={(e) => setEditSsn(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Date of Birth *</label>
                        <input 
                          type="text" 
                          value={editDob} 
                          onChange={(e) => setEditDob(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Age</label>
                        <input 
                          type="text" 
                          value={editAge} 
                          onChange={(e) => setEditAge(e.target.value)} 
                          className="w-full bg-[#f1f5f9] border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none" 
                          disabled
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Sex *</label>
                        <select 
                          value={editSex} 
                          onChange={(e) => setEditSex(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Marital Status</label>
                        <select 
                          value={editMaritalStatus} 
                          onChange={(e) => setEditMaritalStatus(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Married</option>
                          <option>Single</option>
                          <option>Divorced</option>
                        </select>
                      </div>

                      <div className="space-y-1 col-span-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Occupation</label>
                            <input 
                              type="text" 
                              value={editOccupation} 
                              onChange={(e) => setEditOccupation(e.target.value)} 
                              className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Ethnicity</label>
                            <select 
                              value={editEthnicity} 
                              onChange={(e) => setEditEthnicity(e.target.value)} 
                              className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                            >
                              <option>Not Hispanic or Latino</option>
                              <option>Hispanic or Latino</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Language</label>
                            <select 
                              value={editLanguage} 
                              onChange={(e) => setEditLanguage(e.target.value)} 
                              className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                            >
                              <option>English</option>
                              <option>Spanish</option>
                              <option>French</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Nationality</label>
                        <select 
                          value={editNationality} 
                          onChange={(e) => setEditNationality(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>American</option>
                          <option>Indian</option>
                          <option>British</option>
                        </select>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-gray-500 font-bold">Address</label>
                        <input 
                          type="text" 
                          value={editAddress} 
                          onChange={(e) => setEditAddress(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">City</label>
                        <input 
                          type="text" 
                          value={editCity} 
                          onChange={(e) => setEditCity(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">State / Province</label>
                        <input 
                          type="text" 
                          value={editState} 
                          onChange={(e) => setEditState(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">ZIP / Postal Code</label>
                        <input 
                          type="text" 
                          value={editZip} 
                          onChange={(e) => setEditZip(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Country</label>
                        <select 
                          value={editCountry} 
                          onChange={(e) => setEditCountry(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>USA</option>
                          <option>India</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Phone</label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Mobile / Pager</label>
                        <input 
                          type="text" 
                          value={editMobile} 
                          onChange={(e) => setEditMobile(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Fax</label>
                        <input 
                          type="text" 
                          value={editFax} 
                          onChange={(e) => setEditFax(e.target.value)} 
                          className="w-full bg-[#f1f5f9] border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-gray-500 font-bold">Email</label>
                        <input 
                          type="text" 
                          value={editEmail} 
                          onChange={(e) => setEditEmail(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Alternate Email</label>
                        <input 
                          type="text" 
                          value={editAlternateEmail} 
                          onChange={(e) => setEditAlternateEmail(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-gray-500 font-bold">Referring Physician</label>
                        <select 
                          value={editReferringPhysician} 
                          onChange={(e) => setEditReferringPhysician(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Dr. W. Garland</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Attending Physician</label>
                        <select 
                          value={editAttendingPhysician} 
                          onChange={(e) => setEditAttendingPhysician(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Dr. Herman Stewart</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Date of First Visit</label>
                        <input 
                          type="text" 
                          value={editFirstVisit} 
                          onChange={(e) => setEditFirstVisit(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Patient Status</label>
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 text-[10.5px]">
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-red-600 font-semibold">Remove Patient</button>
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-gray-700">Print</button>
                      <button onClick={handleSaveProfile} className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1 rounded shadow-sm">Save</button>
                      <button onClick={() => selectOrOpenTab('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')} className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-gray-700">Cancel</button>
                    </div>
                  </div>

                  {/* Photo area + Diagnoses Codes Right Column */}
                  <div className="w-[260px] space-y-3">
                    
                    {/* Photo Box */}
                    <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col items-center">
                      <div className="w-[140px] h-[140px] relative bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 rounded mb-2">
                        <img 
                          src="/avatar.png" 
                          alt="Edit Patient Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-full grid grid-cols-1 gap-1 text-[9.5px]">
                        <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 font-semibold rounded text-center text-gray-700">📷 Add Photo</button>
                        <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 font-semibold rounded text-center text-gray-700">❌ Delete Photo</button>
                        <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 font-semibold rounded text-center text-gray-700">🔄 Change Photo</button>
                      </div>
                    </div>

                    {/* Diagnoses Panel */}
                    <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm space-y-2">
                      <span className="font-bold text-[#0f4471]">Diagnoses (ICD Codes)</span>
                      <div className="flex gap-1.5 text-[9.5px]">
                        <button className="bg-white border border-gray-300 px-2 py-0.5 rounded">ICD-10</button>
                        <button className="bg-white border border-gray-300 px-2 py-0.5 rounded">ICD-9-CM</button>
                        <button className="bg-white border border-gray-300 px-2 py-0.5 rounded">Paste</button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2 text-[9.5px] text-gray-700 space-y-1">
                        <div className="font-semibold">11/25/2004: Allergic rhinitis</div>
                        <div>J30.9 | Nasal polyps</div>
                        <div>J33.9 | Acute sinusitis</div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {activeTab.type === 'MedicalReport' && (
            <div className="flex flex-1 flex-col overflow-auto p-6 bg-gray-100 items-center select-text">
              
              {/* Paper Document Wrapper */}
              <div id="medical-report-sheet" className="w-[800px] bg-white border border-gray-300 shadow-lg p-10 font-serif text-gray-800 text-[12px] leading-relaxed relative">
                
                {/* Print/Download floating controls */}
                <div className="absolute right-4 top-4 flex gap-2 select-none no-print">
                  <button 
                    onClick={() => window.print()}
                    className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-sans font-bold px-4 py-1.5 rounded shadow flex items-center gap-1 text-[11px]"
                  >
                    🖨️ Print Report
                  </button>
                </div>

                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body * { visibility: hidden; }
                    #medical-report-sheet, #medical-report-sheet * { visibility: visible; }
                    #medical-report-sheet { position: absolute; left: 0; top: 0; width: 100%; border: none; shadow: none; padding: 0; }
                    .no-print { display: none !important; }
                  }
                `}} />

                <div className="text-center space-y-1 mb-8">
                  <h1 className="text-3xl font-bold tracking-wide uppercase font-sans border-b-2 border-gray-900 pb-2">Medical Report</h1>
                </div>

                {/* Demographics Block */}
                <div className="grid grid-cols-[80px_1fr_60px_180px] gap-y-3 mb-6 border-b pb-4">
                  <span className="font-bold">Name:</span>
                  <span className="border-b border-gray-400 font-bold px-1 text-[13px]">{editFirstName} ${editMiddleInitial} ${editLastName}</span>
                  <span className="font-bold pl-3">Date:</span>
                  <span className="border-b border-gray-400 px-1 text-[13px]">05/28/2025</span>

                  <span className="font-bold col-span-2">When did your problem start?:</span>
                  <span className="border-b border-gray-400 col-span-2 px-1">11/25/2004</span>

                  <span className="font-bold col-span-2">Describe Problem:</span>
                  <span className="border-b border-gray-400 col-span-2 px-1">Nasal polyps, Allergic rhinitis, Acute sinusitis</span>
                </div>

                {/* Problem Causes */}
                <div className="mb-6 space-y-2">
                  <div className="font-bold">Cause of Current Problem:</div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Car Accident</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Work injury</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> Gradual onset</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Other</label>
                  </div>
                </div>

                {/* Surgery Requirements */}
                <div className="mb-6 space-y-2">
                  <div className="font-bold">Did this Problem require Surgery:</div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> No</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Yes</label>
                    <span className="text-gray-400">Yes Date of Surgery: ______________________</span>
                  </div>
                </div>

                {/* Medical History Grid */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="font-bold border-b border-gray-300 pb-1.5 mb-3">Past Medical History <span className="font-normal text-gray-500 text-[11px]">(Do you have a history of the following problems?)</span></div>
                  <div className="grid grid-cols-3 gap-y-2.5">
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked disabled /> Breathing Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Stroke</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Depression</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Pregnant</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Bone/joint Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Bowel/Bladder</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Heart Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Kidney Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> History of heavy alcohol use</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Current Wound/Skin Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Gallbladder/Liver</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Drug use</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Pacemaker</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Electrical implants</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Smoking</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Tumor/Cancer</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Anxiety attacks</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Headaches</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Diabetes</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Sleep Apnea</label>
                  </div>
                </div>

                {/* Surgeries / Hospitalizations */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-1.5 mb-2 font-bold">
                    <span>Surgeries/Hospitalizations</span>
                    <label className="flex items-center gap-1.5 font-normal"><input type="checkbox" defaultChecked disabled /> No Surgeries</label>
                  </div>
                  <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 text-center text-gray-500 font-bold border-b pb-1 mb-2">
                    <span>Surgeries/Hospitalizations</span>
                    <span>Year</span>
                    <span>Complications</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 border-b border-gray-100 pb-1 text-center">
                      <span>—</span>
                      <span>—</span>
                      <span>—</span>
                    </div>
                  </div>
                </div>

                {/* Medications List */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-1.5 mb-2 font-bold">
                    <span>Medications <span className="font-normal text-gray-500 text-[11px]">(Please list Medications that you are taking)</span></span>
                    <label className="flex items-center gap-1.5 font-normal"><input type="checkbox" defaultChecked disabled /> No Medication</label>
                  </div>
                  <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 text-center text-gray-500 font-bold border-b pb-1 mb-2">
                    <span>Medication(s)</span>
                    <span>Dose</span>
                    <span>Reason for Medication</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 border-b border-gray-100 pb-1 text-center">
                      <span>—</span>
                      <span>—</span>
                      <span>—</span>
                    </div>
                  </div>
                </div>

                {/* Allergies Block */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-1.5 mb-2 font-bold">
                    <span>Allergies</span>
                    <label className="flex items-center gap-1.5 font-normal"><input type="checkbox" disabled /> No Known allergies</label>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Latex</span>
                      <label className="flex items-center gap-1"><input type="radio" name="latex" disabled /> Yes</label>
                      <label className="flex items-center gap-1"><input type="radio" name="latex" defaultChecked disabled /> No</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-700">Iodine</span>
                      <label className="flex items-center gap-1"><input type="radio" name="iodine" defaultChecked disabled /> Yes</label>
                      <label className="flex items-center gap-1"><input type="radio" name="iodine" disabled /> No</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Bromine</span>
                      <label className="flex items-center gap-1"><input type="radio" name="bromine" disabled /> Yes</label>
                      <label className="flex items-center gap-1"><input type="radio" name="bromine" defaultChecked disabled /> No</label>
                    </div>
                    <div className="col-span-3 flex gap-2 items-center mt-1">
                      <span className="font-bold">Other:</span>
                      <span className="border-b border-gray-400 flex-1 px-1 font-semibold">Penicillin (Severe Hives)</span>
                    </div>
                  </div>
                </div>

                {/* Footer and Signatures */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-4">
                    <span className="font-bold">Do you have any religious/cultural views that will affect your treatment?</span>
                    <label className="flex items-center gap-1"><input type="checkbox" defaultChecked disabled /> No</label>
                    <label className="flex items-center gap-1"><input type="checkbox" disabled /> Yes</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold">Additional comment(Reading or Memory Problem):</span>
                    <span className="border-b border-gray-400 flex-1"></span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr_60px_200px] gap-x-4 pt-6">
                    <span className="font-bold">Signature:</span>
                    <span className="border-b border-gray-400"></span>
                    <span className="font-bold pl-4">Date:</span>
                    <span className="border-b border-gray-400"></span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab.type === 'PatientNotes' && (() => {
            const mrn = activeTab.id.replace('patient-notes-', '');
            const patient = patientDirectoryData.find(p => p.mrn === mrn) || {
              name: 'JOHN DOE',
              mrn: '1000245678',
              dob: '03/12/1979',
              ageGender: '45 Y / Male',
              visit: 'Inpatient',
              admitted: '28/05/2025 08:30 AM',
              location: '101 / A',
              physician: 'Dr. Herman Stewart'
            };

            const noteText = patientNotesMap[patient.mrn] || `Assessment/Plan
1. ST elevation (STEMI) myocardial infarction involving right coronary artery
   
2. Acute diverticulitis

Orders:
temazepam, 15 mg, = 1 cap, Oral, Cap, HS, PRN sleep, First Dose: 10/22/17 15:54:00 CDT

Subjective

Review of Systems

Physical Exam
Vitals & Measurements

Intake and Output
No qualifying data available.`;

            return (
              <div className="flex flex-1 flex-col overflow-hidden bg-[#eef2f5] text-[11px] select-text">
                
                {/* clinical patient banner header */}
                <div className="bg-[#0b4369] text-white px-3 py-1 flex flex-col font-sans select-none shrink-0 text-[10px]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <span className="font-bold text-sm tracking-wide">{patient.name.toUpperCase()}</span>
                      <span>DOB: {patient.dob}</span>
                      <span>Age: {((patient as any).ageGender || (patient as any).age || '').split(' / ')[0]}</span>
                      <span>Dose Wt: 80.200 kg (07/24/2017)</span>
                      <span>Sex: {((patient as any).ageGender || '').split(' / ')[1] || (patient as any).gender || 'Male'}</span>
                      <span>MRN: {patient.mrn}</span>
                      <span>Attending: {(patient as any).physician || (patient as any).admittingPhysician}</span>
                    </div>
                    <div className="flex items-center gap-3">
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#115b8d] mt-1 pt-1 text-[9.5px] text-[#bde0f5]">
                    <div className="flex items-center gap-4">
                      <span>FIN: 1200290664</span>
                      <span>Admit: {(patient as any).admitted || (patient as any).admittedRequested}</span>
                      <span>Disch: &lt;None&gt;</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Workspace Grid */}
                <div className="flex-1 flex overflow-hidden">

                  {/* Middle Column - Editor workspace */}
                  <div className="flex-1 bg-white flex flex-col overflow-hidden">
                    
                    {/* Tabs row */}
                    <div className="bg-[#eef2f5] border-b border-[#cbd8e3] flex text-[10px] select-none shrink-0">
                      <div className="bg-white border-r border-t border-[#cbd8e3] px-3 py-1 font-bold text-gray-800 flex items-center gap-2">
                        <span>Progress Note</span>
                        <span className="text-gray-400 hover:text-red-600 cursor-pointer">×</span>
                      </div>
                      <div className="px-3 py-1 text-gray-500 hover:bg-gray-200/50 flex items-center cursor-pointer">
                        List
                      </div>
                    </div>

                    {/* Editor Toolbar */}
                    <div className="bg-[#fafbfc] border-b border-[#cbd8e3] p-1 flex flex-wrap items-center gap-1 select-none shrink-0">
                      <select className="bg-white border border-[#cbd8e3] rounded px-1.5 py-0.5 text-[9.5px]">
                        <option>Tahoma</option>
                        <option>Arial</option>
                        <option>Courier New</option>
                      </select>
                      <select className="bg-white border border-[#cbd8e3] rounded px-1.5 py-0.5 text-[9.5px] w-[50px]">
                        <option>Size</option>
                        <option>10</option>
                        <option>12</option>
                        <option>14</option>
                      </select>
                      <span className="text-gray-300 mx-0.5">|</span>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded font-bold">B</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded italic font-serif">I</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded underline">U</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded line-through">abc</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded text-amber-500 font-bold">A</button>
                      <span className="text-gray-300 mx-0.5">|</span>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded">📄 Align Left</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded">📄 Align Center</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded">📄 Align Right</button>
                    </div>

                    {/* Text Editor area */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans select-none text-[11px]">
                      
                      {/* Section Header with edit (pencil) and clear (dustbin) actions */}
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-1.5 select-none">
                        <span className="font-bold text-[#0f4471] text-xs">Assessment/Plan</span>
                        <button 
                          onClick={() => setIsEditingNote(prev => !prev)}
                          className={`p-1 rounded hover:bg-gray-150 transition-colors text-[11.5px] ${isEditingNote ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500'}`}
                          title="Edit Sections"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Delete the complete note to start a new note?")) {
                              setAssessmentItems([]);
                              setOrdersItems([]);
                              setNoteSubjective('');
                              setNoteRos('Review of Systems');
                              setNotePe('Physical Exam\nVitals & Measurements');
                              setNoteIo('Intake and Output\nNo qualifying data available.');
                              syncToTextMap([], [], '', 'Review of Systems', 'Physical Exam\nVitals & Measurements', 'Intake and Output\nNo qualifying data available.');
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors text-[11.5px]"
                          title="Delete Note"
                        >
                          🗑️ Clear Note
                        </button>
                      </div>

                      {/* Editing View */}
                      {isEditingNote ? (
                        <div className="space-y-4">
                          
                          {/* Hide/Show Note Details collapsible options pallet */}
                          <div className="p-1 select-none mb-4 text-[11px] font-sans">
                            <div 
                              className="flex items-center gap-1 font-semibold text-gray-900 cursor-pointer text-[11px]"
                              onClick={() => setShowNoteDetailsPanel(prev => !prev)}
                            >
                              <span className="text-[9px]">{showNoteDetailsPanel ? '▲' : '▼'}</span>
                              <span className="hover:underline">{showNoteDetailsPanel ? 'Hide Note Details' : 'Show Note Details'}</span>
                            </div>

                            {showNoteDetailsPanel && (
                              <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                                
                                {/* *Type Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">*Type:</span>
                                  <div className="flex gap-2">
                                    <select 
                                      value={signType1}
                                      onChange={(e) => setSignType1(e.target.value)}
                                      className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] w-[280px] h-[22px] focus:outline-none focus:border-blue-500"
                                    >
                                      <option>Office/Clinic Note-Physician</option>
                                      <option>Progress Note-Generic</option>
                                    </select>
                                    <select 
                                      value={signType2}
                                      onChange={(e) => setSignType2(e.target.value)}
                                      className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] w-[280px] h-[22px] focus:outline-none focus:border-blue-500"
                                    >
                                      <option>Personal Note Type List</option>
                                      <option>System Note Type List</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Title Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">Title:</span>
                                  <input 
                                    type="text" 
                                    value={signTitleVal}
                                    onChange={(e) => setSignTitleVal(e.target.value)}
                                    className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] w-[568px] h-[22px] focus:outline-none focus:border-blue-500"
                                  />
                                </div>

                                {/* *Date Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">*Date:</span>
                                  <div className="flex gap-2 items-center">
                                    <div className="flex items-center border border-gray-400 rounded-none bg-white overflow-hidden h-[22px] w-[140px]">
                                      <input 
                                        type="text" 
                                        value={signDateVal}
                                        onChange={(e) => setSignDateVal(e.target.value)}
                                        className="px-1.5 py-0.5 text-[11px] focus:outline-none flex-1 border-none rounded-none"
                                      />
                                      <button className="bg-gray-150 hover:bg-gray-200 border-l border-gray-400 px-1 py-0.5 text-[9px] h-full rounded-none">📅</button>
                                    </div>
                                    <input 
                                      type="text" 
                                      value={signTimeVal}
                                      onChange={(e) => setSignTimeVal(e.target.value)}
                                      className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] text-center w-[120px] h-[22px] focus:outline-none focus:border-blue-500"
                                    />
                                    <span className="font-bold text-gray-700 text-[10px] ml-1">{signTimezoneVal}</span>
                                  </div>
                                </div>

                                {/* *Author Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">*Author:</span>
                                  <input 
                                    type="text" 
                                    value={signAuthorVal}
                                    disabled
                                    className="bg-gray-100 border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] text-gray-500 focus:outline-none cursor-not-allowed w-[568px] h-[22px]"
                                  />
                                </div>

                                {/* Note Templates Section */}
                                <div className="space-y-1 pt-2 w-[800px]">
                                  <div className="font-bold text-gray-700 text-[11px]">*Note Templates</div>
                                  <div className="border border-gray-300 rounded-none bg-white max-h-[160px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                      <thead>
                                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300 select-none">
                                          <th className="p-1 px-2.5 w-[200px] border-r border-gray-200">Name</th>
                                          <th className="p-1 px-2.5">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {[
                                          { name: 'Admission H & P', desc: 'Admission History & Physical Note Template' },
                                          { name: 'Consult Note', desc: 'Consultation Note Template' },
                                          { name: 'Discharge Note', desc: 'Discharge Note Template' },
                                          { name: 'ED Note', desc: 'Emergency Department Note Template' },
                                          { name: 'Free Text Note', desc: 'Free Text Note Template' },
                                          { name: 'Inpatient Progress Note', desc: 'Inpatient Progress Note Template' },
                                          { name: 'Letter', desc: 'Letter Template' },
                                          { name: 'Office Visit Note', desc: 'Outpatient Office Visit Note Template' },
                                          { name: 'Op Note', desc: 'Operative Note Template' },
                                          { name: 'Peds Office Physical', desc: 'Pediatric Office Physical Note Template' },
                                          { name: 'Procedure Note', desc: 'Procedure Note Template' },
                                          { name: 'Progress/SOAP Note', desc: 'Daily Progress Note Template' },
                                          { name: 'Tertiary Trauma Survey (TTS)', desc: 'Tertiary Trauma Survey (TTS) Template' }
                                        ].map((tmpl, idx) => (
                                          <tr 
                                            key={idx} 
                                            onClick={() => {
                                              setSelectedNoteTemplate(tmpl.name);
                                              setSignTitleVal(tmpl.name);
                                            }}
                                            className={`border-b border-gray-200 cursor-pointer select-none transition-all ${
                                              selectedNoteTemplate === tmpl.name 
                                                ? 'bg-[#1e90ff] text-white hover:bg-[#1a80e5] font-semibold' 
                                                : 'hover:bg-gray-50 text-gray-800'
                                            }`}
                                          >
                                            <td className="p-1 px-2.5 font-sans border-r border-gray-150">{tmpl.name}</td>
                                            <td className={`p-1 px-2.5 font-sans ${selectedNoteTemplate === tmpl.name ? 'text-blue-100' : 'text-gray-500'}`}>{tmpl.desc}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                              </div>
                            )}
                          </div>
                          
                          {/* Assessment Items Badges */}
                          <div className="space-y-1.5">
                            <span className="text-gray-500 font-bold block">Assessment Items:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {assessmentItems.length === 0 ? (
                                <span className="text-gray-400 italic text-[10px]">No assessment items.</span>
                              ) : (
                                assessmentItems.map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#f0f7ff] border border-[#d2e4ff] rounded text-blue-800 text-[10.5px]">
                                    <span>{item}</span>
                                    <span 
                                      onClick={() => {
                                        const updated = assessmentItems.filter((_, i) => i !== idx);
                                        setAssessmentItems(updated);
                                        syncToTextMap(updated, ordersItems, noteSubjective, noteRos, notePe, noteIo);
                                      }}
                                      className="text-red-500 hover:text-red-700 cursor-pointer font-bold ml-1 text-xs"
                                    >
                                      ×
                                    </span>
                                  </span>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <input 
                                type="text"
                                placeholder="Type a new assessment line and press Enter..."
                                value={newAssessmentInput}
                                onChange={(e) => setNewAssessmentInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newAssessmentInput.trim()) {
                                    const updated = [...assessmentItems, newAssessmentInput.trim()];
                                    setAssessmentItems(updated);
                                    setNewAssessmentInput('');
                                    syncToTextMap(updated, ordersItems, noteSubjective, noteRos, notePe, noteIo);
                                  }
                                }}
                                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Orders Badges */}
                          <div className="space-y-1.5">
                            <span className="text-gray-500 font-bold block">Orders:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {ordersItems.length === 0 ? (
                                <span className="text-gray-400 italic text-[10px]">No orders.</span>
                              ) : (
                                ordersItems.map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#f0f7ff] border border-[#d2e4ff] rounded text-blue-800 text-[10.5px]">
                                    <span>{item}</span>
                                    <span 
                                      onClick={() => {
                                        const updated = ordersItems.filter((_, i) => i !== idx);
                                        setOrdersItems(updated);
                                        syncToTextMap(assessmentItems, updated, noteSubjective, noteRos, notePe, noteIo);
                                      }}
                                      className="text-red-500 hover:text-red-700 cursor-pointer font-bold ml-1 text-xs"
                                    >
                                      ×
                                    </span>
                                  </span>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <input 
                                type="text"
                                placeholder="Type a new order line and press Enter..."
                                value={newOrderInput}
                                onChange={(e) => setNewOrderInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newOrderInput.trim()) {
                                    const updated = [...ordersItems, newOrderInput.trim()];
                                    setOrdersItems(updated);
                                    setNewOrderInput('');
                                    syncToTextMap(assessmentItems, updated, noteSubjective, noteRos, notePe, noteIo);
                                  }
                                }}
                                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Subjective */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Subjective:</span>
                            <textarea
                              value={noteSubjective}
                              onChange={(e) => {
                                setNoteSubjective(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, e.target.value, noteRos, notePe, noteIo);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[50px] text-[10.5px] resize-none"
                              placeholder="Type subjective details..."
                            />
                          </div>

                          {/* Review of Systems */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Review of Systems:</span>
                            <textarea
                              value={noteRos}
                              onChange={(e) => {
                                setNoteRos(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, noteSubjective, e.target.value, notePe, noteIo);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[50px] text-[10.5px] resize-none"
                              placeholder="Review of Systems..."
                            />
                          </div>

                          {/* Physical Exam */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Physical Exam:</span>
                            <textarea
                              value={notePe}
                              onChange={(e) => {
                                setNotePe(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, noteSubjective, noteRos, e.target.value, noteIo);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[60px] text-[10.5px] resize-none"
                            />
                          </div>

                          {/* Intake and Output */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Intake and Output:</span>
                            <textarea
                              value={noteIo}
                              onChange={(e) => {
                                setNoteIo(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, noteSubjective, noteRos, notePe, e.target.value);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[50px] text-[10.5px] resize-none"
                            />
                          </div>

                        </div>
                      ) : (
                        // Read / Text View matching standard note
                        <div className="space-y-4 text-gray-800 leading-relaxed select-text font-mono whitespace-pre-line text-[10.5px]">
                          {/* Assessment Section */}
                          <div>
                            {assessmentItems.map((item, idx) => (
                              <div key={idx} className="pl-2">{item}</div>
                            ))}
                          </div>

                          {/* Orders Section */}
                          {ordersItems.length > 0 && (
                            <div>
                              <div className="font-bold mt-2">Orders:</div>
                              {ordersItems.map((item, idx) => (
                                <div key={idx} className="pl-2">{item}</div>
                              ))}
                            </div>
                          )}

                          {/* Subjective Section */}
                          <div>
                            <div className="font-bold mt-2">Subjective</div>
                            <div className="pl-2 text-gray-600">{noteSubjective || "—"}</div>
                          </div>

                          {/* ROS Section */}
                          <div>
                            <div className="font-bold mt-2">{noteRos.split('\n')[0]}</div>
                            <div className="pl-2 text-gray-600">{noteRos.includes('\n') ? noteRos.substring(noteRos.indexOf('\n') + 1) : "—"}</div>
                          </div>

                          {/* PE Section */}
                          <div>
                            <div className="font-bold mt-2">{notePe.split('\n')[0]}</div>
                            <div className="pl-2 text-gray-600">{notePe.includes('\n') ? notePe.substring(notePe.indexOf('\n') + 1) : "—"}</div>
                          </div>

                          {/* IO Section */}
                          <div>
                            <div className="font-bold mt-2">{noteIo.split('\n')[0]}</div>
                            <div className="pl-2 text-gray-600">{noteIo.includes('\n') ? noteIo.substring(noteIo.indexOf('\n') + 1) : "—"}</div>
                          </div>

                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right Column - Clinical Info Sidebar (Meds, Allergies, Labs) */}
                  <div className="w-[280px] bg-white border-l border-[#cbd8e3] flex flex-col shrink-0 overflow-y-auto p-2.5 space-y-3.5">
                    
                    {/* Medications section */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#0f4471] border-b border-[#cbd8e3] pb-0.5">Medications</h4>
                      <div className="space-y-2 text-[9px] text-gray-700">
                        <div>
                          <span className="font-bold text-gray-900 block border-b border-gray-100 pb-0.2">Inpatient</span>
                          <ul className="list-disc pl-3.5 space-y-1 mt-1">
                            <li>albumin human 25% intravenous solution, 12.5 g, 50 mL, IV Piggyback, As Directed (see comments), PRN</li>
                            <li>aspirin buffered oral tablet, 325 mg, 1 tab, Oral, BID</li>
                            <li>D5W 250 mL + amiodarone IV additive 450 mg, Continuous, Daily</li>
                            <li>dextrose 5% with 0.45% NaCl and potassium chloride 20 mEq/L 1,000 mL, 1000 mL, IV</li>
                            <li>hydrogen peroxide 3% topical solution, 1 app, Topical, Daily</li>
                            <li>Lovenox, 40 mg, 0.4 mL, Subcutaneous, Daily</li>
                            <li>morphine, 2 mg, 1 mL, IV Push, every 3 hr, PRN</li>
                            <li>Procrit, 10000 units, 1 mL, IV Push, Mon/We/Fr</li>
                            <li>Restoril, 15 mg, 1 cap, Oral, HS, PRN</li>
                            <li>sodium chloride 0.9% bolus, 200 mL, IV Piggyback, As Directed (see comments), PRN</li>
                            <li>Tylenol, 650 mg, 2 tab, Oral, every 6 hr, PRN</li>
                            <li>Zemplar, 5 mcg, 1 mL, IV Push, Mon/We/Fr</li>
                            <li>Zofran, 4 mg, 1 tab, Oral, every 6 hr, PRN</li>
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block border-b border-gray-100 pb-0.2">Home</span>
                          <ul className="list-disc pl-3.5 space-y-1 mt-1">
                            <li>glimepiride 4 mg oral tablet, 4 mg, 1 tab, Oral, Daily</li>
                            <li>lisinopril 20 mg oral tablet, 20 mg, 1 tab, Oral, Daily</li>
                            <li>metFORMIN 500 mg oral tablet, 500 mg, 1 tab, Oral, BID</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Allergies section */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#0f4471] border-b border-[#cbd8e3] pb-0.5">Allergies</h4>
                      <p className="text-[9.5px] text-gray-500">No active allergies recorded.</p>
                    </div>

                    {/* Lab Results section */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#0f4471] border-b border-[#cbd8e3] pb-0.5">Lab Results (Last 24 Hours)</h4>
                      <p className="text-[9.5px] text-gray-500">No qualifying laboratory data available.</p>
                    </div>
                  </div>

                </div>

                {/* Bottom action buttons footer */}
                <div className="bg-[#f0f4f8] border-t border-[#cbd8e3] p-2 flex justify-between items-center shrink-0 select-none">
                  <div className="text-[10px] text-gray-500 font-sans">
                    Note Details: Progress Note Generic, Sanders MD, Michael Lawrence, 10/23/2017 10:46 CDT, Progress Note
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowSignModal(true);
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Sign/Submit
                    </button>
                    <button 
                      onClick={() => {
                        setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                        alert('Note saved successfully!');
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                        closeTab(activeTab.id, {} as any);
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Save & Close
                    </button>
                    <button 
                      onClick={(e) => closeTab(activeTab.id, e as any)}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Sign/Submit Note Confirmation Modal */}
                {showSignModal && (
                  <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[99999]">
                    <div 
                      className="bg-[#f0f4f8] border-2 border-[#115b8d] w-[520px] shadow-2xl rounded-sm flex flex-col font-sans select-none text-[11px] text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Title bar */}
                      <div className="bg-[#0b4369] text-white px-3 py-1.5 flex justify-between items-center select-none font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">📄</span>
                          <span>Sign/Submit Note</span>
                        </div>
                        <button 
                          onClick={() => setShowSignModal(false)}
                          className="hover:bg-red-600 hover:text-white px-1.5 py-0.5 rounded text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Modal Body Form */}
                      <div className="p-4 space-y-3 bg-[#f8f9fa] border-b border-[#cbd8e3]">
                        
                        {/* Type row */}
                        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">*Type:</span>
                          <select 
                            value={signType1}
                            onChange={(e) => setSignType1(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                          >
                            <option>Office/Clinic Note-Physician</option>
                            <option>Progress Note-Generic</option>
                          </select>
                          <select 
                            value={signType2}
                            onChange={(e) => setSignType2(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                          >
                            <option>Personal Note Type List</option>
                            <option>System Note Type List</option>
                          </select>
                        </div>

                        {/* Title row */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">Title:</span>
                          <input 
                            type="text" 
                            value={signTitleVal}
                            onChange={(e) => setSignTitleVal(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                                setShowSignModal(false);
                                closeTab(activeTab.id, {} as any);
                              }
                            }}
                          />
                        </div>

                        {/* Date row */}
                        <div className="grid grid-cols-[80px_1.5fr_1fr_auto] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">*Date:</span>
                          <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                            <input 
                              type="text" 
                              value={signDateVal}
                              onChange={(e) => setSignDateVal(e.target.value)}
                              className="px-1.5 py-1 text-[11px] focus:outline-none flex-1 border-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                                  setShowSignModal(false);
                                  closeTab(activeTab.id, {} as any);
                                }
                              }}
                            />
                            <button className="bg-gray-100 hover:bg-gray-200 border-l border-gray-300 px-1.5 py-1 text-[10px]">📅</button>
                          </div>
                          <input 
                            type="text" 
                            value={signTimeVal}
                            onChange={(e) => setSignTimeVal(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none text-center"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                                  setShowSignModal(false);
                                  closeTab(activeTab.id, {} as any);
                              }
                            }}
                          />
                          <span className="font-bold text-gray-600">{signTimezoneVal}</span>
                        </div>

                        {/* Author row */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">*Author:</span>
                          <input 
                            type="text" 
                            value={signAuthorVal}
                            disabled
                            className="bg-gray-100 border border-gray-300 rounded px-1.5 py-1 text-[11px] text-gray-500 focus:outline-none cursor-not-allowed"
                          />
                        </div>

                      </div>

                      {/* Modal Footer actions */}
                      <div className="bg-[#cbd8e3]/45 p-2 flex justify-end gap-2 shrink-0 select-none">
                        <button 
                          onClick={() => {
                            setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                            setShowSignModal(false);
                            closeTab(activeTab.id, {} as any);
                          }}
                          className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-1 px-5 rounded-sm shadow-xs text-[11px] transition-all"
                        >
                          Sign
                        </button>
                        <button 
                          onClick={() => setShowSignModal(false)}
                          className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-1 px-5 rounded-sm shadow-xs text-[11px] transition-all"
                        >
                          Cancel
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {activeTab.type === 'HelpCentre' && (
            <div className="flex flex-1 overflow-auto bg-[#fafbfc] p-6 text-gray-800 text-[11px] select-text">
              <div className="max-w-[1200px] mx-auto w-full grid grid-cols-[1fr_280px] gap-6">
                
                {/* Left Area */}
                <div className="space-y-6">
                  
                  {/* Top Search bar */}
                  <div className="space-y-2">
                    <h1 className="text-xl font-bold text-[#0f4471] tracking-wide font-sans">Help Center</h1>
                    <p className="text-gray-500 text-[11px]">Find answers, learn how to use AxioVital, and get the support you need.</p>
                    <div className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="Search for help articles, guides, and more..." 
                        className="flex-1 bg-white border border-[#bdcddc] rounded px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0f4471]"
                      />
                      <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1.5 rounded shadow-sm text-[11px]">Search</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600 pt-1">
                      <span className="font-semibold">Popular Searches:</span>
                      {['Patient Registration', 'Orders', 'Results', 'Dashboard', 'Reports', 'User Management'].map((term) => (
                        <button key={term} className="bg-[#eef2f5] hover:bg-[#cbd8e3]/50 border border-[#bdcddc] px-2 py-0.5 rounded-sm transition-colors">{term}</button>
                      ))}
                    </div>
                  </div>

                  {/* Browse Help Topics */}
                  <div className="space-y-3">
                    <h2 className="font-bold text-xs text-[#0f4471] border-b border-[#bdcddc]/50 pb-1">Browse Help Topics</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: 'Getting Started', desc: 'New to AxioVital? Learn the basics and get up to speed quickly.', count: '12 Articles', icon: '🚀' },
                        { title: 'Patient Management', desc: 'Manage patient information, registration, search, and demographics.', count: '28 Articles', icon: '👥' },
                        { title: 'Clinical Workflow', desc: 'Streamline clinical processes, orders, and documentation.', count: '35 Articles', icon: '📋' },
                        { title: 'Reports & Analytics', desc: 'Generate reports, dashboards, and analyze data.', count: '24 Articles', icon: '📊' },
                        { title: 'Administrative', desc: 'User management, settings, and system configuration.', count: '18 Articles', icon: '⚙️' },
                        { title: 'Billing & Finance', desc: 'Billing workflows, claims, payments, and financial reports.', count: '22 Articles', icon: '💵' },
                        { title: 'Integration & Interfaces', desc: 'External system integration, APIs, and data exchange.', count: '15 Articles', icon: '🔌' },
                        { title: 'System & Technical', desc: 'System requirements, troubleshooting, and technical support.', count: '20 Articles', icon: '💻' }
                      ].map((topic, i) => (
                        <div key={i} className="bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] rounded p-3 shadow-sm flex items-start gap-3 transition-colors cursor-pointer">
                          <span className="text-xl p-1.5 bg-gray-50 rounded border border-gray-100">{topic.icon}</span>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-gray-900 text-[11.5px]">{topic.title}</h4>
                            <p className="text-gray-500 leading-relaxed text-[10px]">{topic.desc}</p>
                            <div className="flex justify-between items-center text-[10px] text-blue-800 font-semibold pt-1">
                              <span>{topic.count}</span>
                              <span>❯</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequently Asked Questions */}
                  <div className="space-y-2">
                    <h2 className="font-bold text-xs text-[#0f4471] border-b border-[#bdcddc]/50 pb-1">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        'How do I register a new patient?',
                        'How do I generate a patient report?',
                        'How can I search for a patient?',
                        'How do I reset my password?',
                        'How do I place an order for lab tests?',
                        'How do I add a new user?',
                        'How do I view patient lab results?',
                        'Who do I contact for technical support?'
                      ].map((faq, i) => (
                        <div key={i} className="bg-white border border-[#e2e8f0] rounded px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                          <span className="font-semibold text-gray-800">❓ {faq}</span>
                          <span className="text-gray-400">❯</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 text-right">
                      <button className="text-blue-800 hover:underline font-semibold">View All FAQs ❯</button>
                    </div>
                  </div>

                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                  
                  {/* Need Immediate Help */}
                  <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                    <div className="bg-[#cbd8e3]/30 p-2 border-b border-[#bdcddc] font-bold text-[#0f4471]">
                      Need Immediate Help?
                    </div>
                    <div className="p-3 space-y-3.5">
                      {[
                        { title: 'Create Support Ticket', desc: 'Submit a ticket to our support team', icon: '🎫' },
                        { title: 'Live Chat', desc: 'Chat with our support team', tag: 'Available 24/7', icon: '💬' },
                        { title: 'Call Support', desc: '1800-AXIO-HELP (1800-2946-4357)', tag: '24/7 Support Line', icon: '📞' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2.5 cursor-pointer group pb-3 last:pb-0 last:border-b-0 border-b border-gray-100">
                          <span className="text-base">{item.icon}</span>
                          <div className="flex-1 space-y-0.5">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors">{item.title}</h4>
                            <p className="text-gray-500 text-[10px]">{item.desc}</p>
                            {item.tag && <div className="text-[9px] text-green-700 font-bold mt-0.5">{item.tag}</div>}
                          </div>
                          <span className="text-gray-400 pt-1">❯</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documentation */}
                  <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                    <div className="bg-[#cbd8e3]/30 p-2 border-b border-[#bdcddc] font-bold text-[#0f4471]">
                      Documentation
                    </div>
                    <div className="p-3 space-y-3">
                      {[
                        { title: 'User Manuals', desc: 'Comprehensive user guides', icon: '📖' },
                        { title: 'Quick Reference Guides', desc: 'Short guides for common tasks', icon: '📄' },
                        { title: 'Release Notes', desc: 'Latest updates and improvements', icon: '📋' },
                        { title: 'Training Videos', desc: 'Step-by-step video tutorials', icon: '🎥' }
                      ].map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center cursor-pointer group">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{doc.icon}</span>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors">{doc.title}</h4>
                              <p className="text-gray-500 text-[9.5px]">{doc.desc}</p>
                            </div>
                          </div>
                          <span className="text-gray-400">🔗</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                    <div className="bg-[#cbd8e3]/30 p-2 border-b border-[#bdcddc] font-bold text-[#0f4471]">
                      System Information
                    </div>
                    <div className="p-3 space-y-2 text-gray-800">
                      <div className="flex justify-between">
                        <span className="text-gray-500">System Version</span>
                        <span className="font-semibold">v5.12.3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Database Version</span>
                        <span className="font-semibold">v15.4.7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="font-semibold">28/05/2025 10:20 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Environment</span>
                        <span className="font-semibold text-blue-900 font-bold">PROD</span>
                      </div>
                      <div className="border-t border-gray-100 pt-2 text-right">
                        <button className="text-blue-800 hover:underline font-semibold text-[10px]">View System Status ❯</button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {activeTab.type === 'RescheduleRequests' && (
            <div className="flex flex-1 flex-col overflow-auto p-4 space-y-4 bg-[#f8f9fa] text-[11px] select-text">
              
              {/* Data Table */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10.5px] font-sans leading-snug">
                    <thead>
                      <tr className="bg-[#dce7f1] text-[#0f4471] font-bold border-b border-[#bdcddc] select-none text-[10.5px]">
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">MRN</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Request ID</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Patient Name</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Current Appointment</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Department / Clinic</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Requested New Date & Time</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Request Reason</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Requested On / By</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Priority</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rescheduleRequests.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-[#d0dbe5] text-[10.5px] text-gray-800 font-sans cursor-pointer transition-colors ${
                            idx % 2 === 0 ? 'bg-white hover:bg-[#eef4f9]' : 'bg-[#f0f5fa] hover:bg-[#eef4f9]'
                          }`}
                          onClick={() => {
                            setSelectedRescheduleReq(row);
                            setShowRescheduleModal(true);
                          }}
                        >
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-mono">{row.mrn}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-bold text-gray-700">{row.id}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5]" onClick={(e) => e.stopPropagation()}>
                            <span 
                              className="font-bold text-[#0d7a86] cursor-pointer hover:underline" 
                              onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe')}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPatientContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  patientName: row.name,
                                  patientMrn: row.mrn
                                });
                              }}
                            >{row.name}</span>
                          </td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-semibold">{row.current}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5]">{row.dept}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] text-[#0f4471] font-bold">{row.requested}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5]">{row.reason}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] text-gray-600">{row.requestedOn}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-semibold text-gray-800">{row.priority}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-semibold text-gray-800">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#fafbfc] border-t border-[#bdcddc] p-2 flex justify-between items-center text-[10px] select-none text-gray-600 font-sans">
                  <div className="flex gap-4">
                    <span>Sort Order: Location, ascending</span>
                    <span>Filter: Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Showing 8 of 8 records</span>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[9.5px] font-semibold text-gray-700">Refresh List</button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab.type === 'AdmitPatient' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] text-[10.5px] select-text h-full">
              
              {/* Card 1: Search Existing Patient */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#0f4471] text-white px-3 py-2 font-bold font-sans">
                  Search Existing Patient
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-[1.2fr_1.5fr_1.5fr_auto_1.8fr_auto_1.8fr_auto] gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold">Search By <span className="text-red-600">*</span></label>
                      <select 
                        value={admitSearchBy} 
                        onChange={(e) => setAdmitSearchBy(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      >
                        <option>Name</option>
                        <option>Aadhaar</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">First Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter First Name" 
                        value={admitSearchFirst}
                        onChange={(e) => setAdmitSearchFirst(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter Last Name" 
                        value={admitSearchLast}
                        onChange={(e) => setAdmitSearchLast(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <div className="font-bold text-gray-500 text-center pb-1">OR</div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">Aadhaar Number</label>
                      <input 
                        type="text" 
                        placeholder="Enter Aadhaar Number" 
                        value={admitSearchAadhaar}
                        onChange={(e) => setAdmitSearchAadhaar(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <div className="font-bold text-gray-500 text-center pb-1">OR</div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">Date of Birth</label>
                      <input 
                        type="text" 
                        placeholder="DD/MM/YYYY" 
                        value={admitSearchDob}
                        onChange={(e) => setAdmitSearchDob(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1.5 rounded shadow-sm">
                      Search
                    </button>
                  </div>

                  <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded p-2 text-blue-800 text-[10px] flex items-center gap-2 select-none">
                    <span className="text-xs">ℹ️</span>
                    <span>Search to verify if the patient already exists in the system before creating a new record.</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Patient Details */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#cbd8e3]/30 px-3 py-2 border-b border-[#bdcddc] font-bold text-[#0f4471] font-sans">
                  Patient Details
                </div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Title</label>
                    <select value={admitTitle} onChange={(e) => setAdmitTitle(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">First Name <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter First Name" value={admitFirst} onChange={(e) => setAdmitFirst(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Middle Name</label>
                    <input type="text" placeholder="Enter Middle Name" value={admitMiddle} onChange={(e) => setAdmitMiddle(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Last Name <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter Last Name" value={admitLast} onChange={(e) => setAdmitLast(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Date of Birth <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="DD/MM/YYYY" value={admitDobVal} onChange={(e) => setAdmitDobVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Age</label>
                    <input type="text" placeholder="--" value={admitAgeVal} onChange={(e) => setAdmitAgeVal(e.target.value)} className="w-full bg-gray-50 border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Gender <span className="text-red-600">*</span></label>
                    <select value={admitGender} onChange={(e) => setAdmitGender(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Marital Status</label>
                    <select value={admitMarital} onChange={(e) => setAdmitMarital(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Aadhaar Number</label>
                    <input type="text" placeholder="Enter Aadhaar Number" value={admitAadhaarVal} onChange={(e) => setAdmitAadhaarVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Mobile Number <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter Mobile Number" value={admitMobileVal} onChange={(e) => setAdmitMobileVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Email</label>
                    <input type="text" placeholder="Enter Email ID" value={admitEmailVal} onChange={(e) => setAdmitEmailVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Alternate Mobile</label>
                    <input type="text" placeholder="Enter Alternate Number" value={admitAltMobile} onChange={(e) => setAdmitAltMobile(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Blood Group</label>
                    <select value={admitBlood} onChange={(e) => setAdmitBlood(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Nationality</label>
                    <select value={admitNation} onChange={(e) => setAdmitNation(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Indian</option>
                      <option>American</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Religion</label>
                    <select value={admitReligion} onChange={(e) => setAdmitReligion(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Hindu</option>
                      <option>Christian</option>
                      <option>Muslim</option>
                      <option>Sikh</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Language</label>
                    <select value={admitLang} onChange={(e) => setAdmitLang(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Hindi</option>
                      <option>English</option>
                      <option>Spanish</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Address Information */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#cbd8e3]/30 px-3 py-2 border-b border-[#bdcddc] font-bold text-[#0f4471] font-sans">
                  Address Information
                </div>
                <div className="p-4 grid grid-cols-[2fr_2fr_1.5fr] gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Address Line 1 <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter Address Line 1" value={admitAddr1} onChange={(e) => setAdmitAddr1(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Address Line 2</label>
                    <input type="text" placeholder="Enter Address Line 2" value={admitAddr2} onChange={(e) => setAdmitAddr2(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Landmark</label>
                    <input type="text" placeholder="Enter Landmark" value={admitLandmark} onChange={(e) => setAdmitLandmark(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                </div>
                <div className="px-4 pb-4 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">City <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter City" value={admitCityVal} onChange={(e) => setAdmitCityVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">State / Province <span className="text-red-600">*</span></label>
                    <select value={admitStateVal} onChange={(e) => setAdmitStateVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>West Bengal</option>
                      <option>Delhi</option>
                      <option>Maharashtra</option>
                      <option>Florida</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">ZIP / Postal Code <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter ZIP / Postal Code" value={admitZipVal} onChange={(e) => setAdmitZipVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Country <span className="text-red-600">*</span></label>
                    <select value={admitCountryVal} onChange={(e) => setAdmitCountryVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>India</option>
                      <option>USA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 4: Admission Information */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#cbd8e3]/30 px-3 py-2 border-b border-[#bdcddc] font-bold text-[#0f4471] font-sans">
                  Admission Information
                </div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Admission Type <span className="text-red-600">*</span></label>
                    <select value={admitTypeVal} onChange={(e) => setAdmitTypeVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Emergency</option>
                      <option>Routine</option>
                      <option>Transfer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Visit Type <span className="text-red-600">*</span></label>
                    <select value={admitVisitVal} onChange={(e) => setAdmitVisitVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Inpatient</option>
                      <option>Outpatient</option>
                      <option>Day Care</option>
                    </select>
                  </div>
                   <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Date of Admission <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="DD/MM/YYYY" value={admitDateVal} readOnly disabled className="w-full bg-gray-50 border border-[#bdcddc] rounded px-2 py-1 focus:outline-none cursor-not-allowed select-none text-gray-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Time of Admission <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="00:00 AM/PM" value={admitTimeVal} readOnly disabled className="w-full bg-gray-50 border border-[#bdcddc] rounded px-2 py-1 focus:outline-none cursor-not-allowed select-none text-gray-500" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Referred By</label>
                    <input type="text" placeholder="Enter Referring Doctor / Source" value={admitReferredBy} onChange={(e) => setAdmitReferredBy(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Referring Doctor</label>
                    <div className="flex gap-1">
                      <input type="text" placeholder="" value={admitRefDoctor} onChange={(e) => setAdmitRefDoctor(e.target.value)} className="flex-1 bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                      <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 rounded font-semibold text-gray-500">...</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Department <span className="text-red-600">*</span></label>
                    <select value={admitDeptVal} onChange={(e) => setAdmitDeptVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Pulmonology</option>
                      <option>Oncology</option>
                      <option>ENT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Bed / Room</label>
                    <input type="text" placeholder="Enter Bed / Room" value={admitBedRoom} onChange={(e) => setAdmitBedRoom(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Primary Insurance</label>
                    <div className="flex gap-1">
                      <select value={admitInsPrimary} onChange={(e) => setAdmitInsPrimary(e.target.value)} className="flex-1 bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                        <option>Select</option>
                        <option>Blue Cross / Blue Shield</option>
                        <option>Medicare</option>
                      </select>
                      <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 rounded font-semibold text-gray-500">...</button>
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-gray-500 font-semibold">Insurance ID</label>
                    <input type="text" placeholder="Enter Insurance ID" value={admitInsIdVal} onChange={(e) => setAdmitInsIdVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Policy / Member ID</label>
                    <input type="text" placeholder="Enter Policy / Member ID" value={admitPolicyId} onChange={(e) => setAdmitPolicyId(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 p-4 select-none">
                  <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-gray-700 font-bold">Clear</button>
                  <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-[#0f4471] font-bold">Save & Continue</button>
                  <button onClick={() => selectOrOpenTab('PatientList', 'Patient List', 'patient-list-tab')} className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-5 py-1.5 rounded shadow-sm">Save & Admit</button>
                </div>
              </div>

            </div>
          )}

          {activeTab.type === 'ReferralTransfer' && (
            <div className="flex-1 flex flex-col bg-[#f0f3f6] text-[10.5px] font-sans select-none overflow-hidden h-full">
              {/* Top Cerner Toolbar */}
              <div className="bg-[#f4f7fa] border-b border-[#bccada] px-2 py-1 flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-1.5 text-[13px] text-[#2c5282]">
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded flex items-center gap-1 text-[11px] font-semibold text-[#1c4d78] transition-colors" title="Add Patient / Referral">
                    <span>👤+</span>
                  </button>
                  <span className="text-gray-300">|</span>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Remove">🗑️</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Properties">📋</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Transfer / Move">⏭️</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Search List">🔍</button>
                  <span className="text-gray-300">|</span>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Schedule">🗓️</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Clinical Notes">📝</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Print List">🖨️</button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                  <span className="font-semibold">View Mode:</span>
                  <select className="bg-white border border-[#bccada] rounded px-1.5 py-0.5 text-[#1c4d78] font-bold focus:outline-none">
                    <option>All Active Referrals & Transfers</option>
                    <option>Inbound Transfers Only</option>
                    <option>Outbound Referrals Only</option>
                  </select>
                </div>
              </div>

              {/* Sub-Header Filter Description Bar */}
              <div className="bg-white px-3 py-1 border-b border-[#bccada] text-[10px] text-gray-600 shrink-0 truncate font-sans italic">
                Admitting Physician, Attending Physician, Consulting Physician - Emergency, Inpatient, Observation, Referral & Transfer Requests...
              </div>

              {/* Scrollable Cerner Grid Container */}
              <div className="flex-1 m-2 bg-white border border-[#a8b8c8] overflow-auto shadow-inner select-text">
                <table className="w-full text-left border-collapse text-[10.5px] font-sans">
                  <thead>
                    <tr className="bg-[#e6ecf2] border-b border-[#a8b8c8] text-[#1c4d78] font-bold sticky top-0 z-10 select-none whitespace-nowrap shadow-xs">
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Location</th>
                      <th className="py-1.5 px-1 border-r border-[#bccada] text-center w-[26px]">📁</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Name</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Length of Stay</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">MRN</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">FIN / Req ID</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Age</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">DOB</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Admitted / Requested</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Admitting / Referring Physician</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Visit Reason / Transfer Type</th>
                      <th className="py-1.5 px-2 text-[#1c4d78]">Primary Care Physician / Target Dept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { loc: '2C CVH 2304 0', icon: '📁', name: 'TEST, NEWMERGE ONE', los: '46.7 Days', mrn: '64802090', fin: '1200209389', age: '56 years', dob: '01/01/61', adm: '05/29/17 20:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'TESTING MERGE ACCOUNTS', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2E Card Interm 2416 0', icon: '📄', name: 'PHARMDRC, EIGHTMONTH', los: '43.0 Days', mrn: '64802042', fin: '1200209310', age: '9 months', dob: '09/22/16', adm: '05/22/17 17:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pain', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2E Card Interm 2420 0', icon: '📁', name: 'UCTEST, CPABBLINGCOMB', los: '120.0 Days', mrn: '64801201', fin: '1200208114', age: '8 years', dob: '03/14/09', adm: '03/06/17 15:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'headache', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2E Card Interm 2422 0', icon: '📄', name: 'PHARMDRC, EIGHTYEAR', los: '43.0 Days', mrn: '64802043', fin: '1200209311', age: '8 years', dob: '05/22/09', adm: '05/22/17 17:12 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pain', pcp: 'Dr. A. Verma (Cardiology)' },
                      { loc: '2E Card Interm 2424 0', icon: '📄', name: 'PHARMDRC, EIGHTYEARCP', los: '43.0 Days', mrn: '64802044', fin: '1200209312', age: '8 years', dob: '05/22/09', adm: '05/22/17 17:17 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pain', pcp: 'Dr. M. Roy (Oncology)' },
                      { loc: '2E Card Interm 2429 0', icon: '📁', name: 'TESTRODNEY, INPATIENT', los: '18.2 Days', mrn: '64802647', fin: '1200209259', age: '39 years', dob: '05/25/78', adm: '05/24/17 08:30 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'lkj / Transfer Req', pcp: 'Dr. S. Nair (Neurology)' },
                      { loc: '2N Cardiology 2212 0', icon: '📄', name: 'MEDTEST, JR', los: '16.1 Days', mrn: '64801906', fin: '1200209168', age: '41 years', dob: '09/24/75', adm: '06/19/17 09:15 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'chest pain', pcp: 'Moulder MD, Rebekah Wilbourn' },
                      { loc: '2N Cardiology 2220 0', icon: '📁', name: 'UCTEST, CPADEFECTTVVO', los: '117.9 Days', mrn: '64801227', fin: '1200208168', age: '25 years', dob: '10/14/91', adm: '03/09/17 13:18 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'headache', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2S Telemetry 2505 0', icon: '📄', name: 'ZZZTEST, BRADADMISSIONTWO', los: '173.9 Days', mrn: '64802066', fin: '1200207523', age: '26 years', dob: '11/11/90', adm: '01/12/17 14:10 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'chest pain', pcp: 'Shekoni MD, Nurudeen Areliku' },
                      { loc: '2S Telemetry 2514 0', icon: '📁', name: 'AWESOMEDUDEONE, MEME', los: '42.9 Days', mrn: '64802086', fin: '1200209374', age: '54 years', dob: '12/23/62', adm: '05/23/17 16:20 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'CHEST PAIN', pcp: 'LayneTEST MD, Scott Christopher' },
                      { loc: '3E Renal/Urol 3403 0', icon: '📄', name: 'QUALITYCONNECT, AMY', los: '225.0 Days', mrn: '64800472', fin: '1200206758', age: '29 years', dob: '02/10/88', adm: '11/22/16 10:54 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'abnormal lab', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '3E Renal/Urol 3406 0', icon: '📁', name: 'NURSING, RENAL', los: '49.9 Days', mrn: '64801954', fin: '1200209175', age: '65 years', dob: '02/02/52', adm: '05/16/17 14:04 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'UTI', pcp: 'Dr. P. Das (ENT)' },
                      { loc: '3E Renal/Urol 3416 0', icon: '📄', name: 'PHARMDRC, THIRTEEN', los: '43.9 Days', mrn: '64802029', fin: '1200209277', age: '13 years', dob: '05/21/04', adm: '05/22/17 14:53 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'NAUSEA/VOMITING', pcp: 'City Hospital Referral' },
                      { loc: '3S PostOp Surg 3502 0', icon: '📁', name: 'QUALITYCONNECT, OMNICELL ONE', los: '217.9 Days', mrn: '64800575', fin: '1200207186', age: '43 years', dob: '06/23/74', adm: '11/28/16 13:33 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'back pain', pcp: 'Apex Clinic Referral' },
                      { loc: '3S PostOp Surg 3503 0', icon: '📄', name: 'QUALITYCONNECT, SENTRE SEVEN', los: '217.9 Days', mrn: '64800576', fin: '1200207187', age: '71 years', dob: '05/33/46', adm: '11/28/16 13:46 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'surgery', pcp: 'Dr. D. Patel (Oncology)' },
                      { loc: '3S PostOp Surg 3512 0', icon: '📁', name: 'PHARMDRC, ONEMONTH', los: '43.9 Days', mrn: '64802036', fin: '1200209284', age: '2 months', dob: '04/22/17', adm: '05/22/17 15:35 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'HIGH FEVER', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '3W-W ICU 3611 0', icon: '📄', name: 'NURSING, ICUWEST', los: '49.8 Days', mrn: '64801364', fin: '1200209187', age: '65 years', dob: '02/02/52', adm: '05/16/17 18:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'trouble breathing', pcp: 'ICU Transfer Bed Req' },
                      { loc: '4E Med Surg 4402 0', icon: '📁', name: 'TESTANGY, DONOTDISCHARGE', los: '132.0 Days', mrn: '64800761', fin: '1200207454', age: '25 years', dob: '01/04/92', adm: '01/04/17 11:23 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'Chest Pain', pcp: 'LayneTEST MD, Scott Christopher' },
                      { loc: '4E Med Surg 4403 0', icon: '📄', name: 'TEST, ALLERGY', los: '47.9 Days', mrn: '64801995', fin: '1200209224', age: '22 years', dob: '06/04/95', adm: '05/18/17 15:47 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'testing', pcp: 'Dr. G. Jones' },
                      { loc: '4E Med Surg 4404 0', icon: '📁', name: 'QUALITYCONNECT, SUSAN', los: '29.9 Days', mrn: '64800983', fin: '1200207673', age: '38 years', dob: '10/08/78', adm: '06/05/17 08:14 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'test / Second Opinion', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '4E Med Surg 4407 0', icon: '📄', name: 'WBTPATIENT, TESTFIVE', los: '32.9 Days', mrn: '64801314', fin: '1200209043', age: '27 years', dob: '05/27/90', adm: '06/02/17 13:42 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pace maker checkup', pcp: 'Cardiology Referral' },
                      { loc: '4E Med Surg 4416 0', icon: '📁', name: 'SOFTBALL, TEST HC', los: '29.5 Days', mrn: '64801114', fin: '1200209529', age: '46 years', dob: '10/31/70', adm: '06/05/17 23:29 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'Pain', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '4N Observation 4210 0', icon: '📄', name: 'MEDTEST, XR', los: '16.1 Days', mrn: '64802557', fin: '1200209170', age: '58 years', dob: '06/27/58', adm: '06/19/17 09:21 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'Abdominal pain', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '4S Oncology 4503 0', icon: '📁', name: 'ITFIVE, PATIENTONE DIRECTADMIT', los: '38.2 Days', mrn: '64802325', fin: '1200209054', age: '35 years', dob: '02/18/62', adm: '06/05/17 08:14 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'ILL / Direct Admit Req', pcp: 'LayneTEST MD, Scott Christopher' },
                      { loc: '4S Oncology 4504 0', icon: '📄', name: 'NURSING, ONC', los: '49.7 Days', mrn: '64801367', fin: '1200209190', age: '52 years', dob: '01/15/65', adm: '05/16/17 18:10 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'tumor / Transfer Req', pcp: 'Oncology Consult' },
                      { loc: '4W-S ICU 4602 0', icon: '📁', name: 'WBTPATIENT, TESTFOUR', los: '32.9 Days', mrn: '64802315', fin: '1200209042', age: '36 years', dob: '07/27/80', adm: '06/02/17 13:34 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'MVA', pcp: 'ICU Critical Care' },
                      { loc: '5E Womens 5405 0', icon: '📄', name: 'SMITH-WILLIAMS, AMANDA', los: '64.9 Days', mrn: '645017808', fill: '1200209535', age: '30 years', dob: '04/04/87', adm: '05/01/17 13:50 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'testing / OB Transfer', pcp: 'Womens Specialty Req' },
                      { loc: '5E Womens 5406 0', icon: '📁', name: 'REGISTER, PENNY', los: '97.9 Days', mrn: '64801434', fin: '1200208444', age: '31 years', dob: '01/01/86', adm: '03/29/17 13:47 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'Pain', pcp: 'Sanders MD, Michael Lawrence' }
                    ].map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-[#d9ecff] cursor-pointer transition-colors whitespace-nowrap ${
                          idx % 2 === 1 ? 'bg-[#fcfdfe]' : 'bg-white'
                        }`}
                      >
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.loc}</td>
                        <td className="py-1 px-1 border-r border-[#e2e8f0] text-center">
                          <span className="text-[12px]" title="View Record">{row.icon}</span>
                        </td>
                        <td 
                          className="py-1 px-2 border-r border-[#e2e8f0] font-bold text-[#1c4d78] hover:underline"
                          onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.name.split(',')[0]}`, 'patient-doe')}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPatientContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              patientName: row.name,
                              patientMrn: row.mrn
                            });
                          }}
                        >
                          {row.name}
                        </td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.los}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-600 font-mono">{row.mrn}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-600 font-mono">{row.mrn}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.age}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-600">{row.dob}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.adm}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-800">{row.doc}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-800">{row.reason}</td>
                        <td className="py-1 px-2 text-gray-700">{row.pcp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Cerner Status/Footer Bar */}
              <div className="bg-[#f0f3f6] border-t border-[#bccada] px-3 py-1 flex items-center justify-between text-[10px] text-gray-600 shrink-0 font-sans">
                <div className="flex items-center gap-3">
                  <span>List: <b>Referrals & Transfers (19)</b></span>
                  <span>|</span>
                  <span>Sort Order: <b>Location, ascending</b></span>
                  <span>|</span>
                  <span>Filter: <b>Active</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Showing 28 of 28 records</span>
                  <button className="bg-white border border-[#bccada] hover:bg-gray-100 px-2 py-0.5 rounded text-[9.5px]">Refresh List</button>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'DischargeList' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] text-[10.5px] select-text h-full">
              
              {/* Data Table */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10.5px] font-sans leading-snug">
                    <thead>
                      <tr className="bg-[#dce7f1] text-[#0f4471] font-bold border-b border-[#bdcddc] select-none text-[10.5px]">
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">MRN</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Discharge ID</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Patient Name</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Admitting Ward / Bed No.</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Primary Physician / Dept</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Discharge Scheduled Date/Time</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Destination / Status</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Requested On / By</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Priority</th>
                        <th className="py-1.5 px-2 border-r border-[#bdcddc]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'DIS-2025-000412', name: 'Vikram Singh', mrn: '1000245695', ward: 'ICU-A / Bed 04', dept: 'Dr. K. Iyer (Cardiology)', requested: '28/05/2025, 05:00 PM', reason: 'Discharge to Home', requestedOn: '28/05/2025, 10:15 AM by Dr. K. Iyer', priority: 'High', status: 'Pending', priorityColor: 'bg-red-50 text-red-800 border-red-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                        { id: 'DIS-2025-000413', name: 'Anjali Gupta', mrn: '1000245696', ward: 'GEN-03 / Bed 12', dept: 'Dr. M. Desai (Oncology)', requested: '29/05/2025, 10:30 AM', reason: 'Refer to Rehab Center', requestedOn: '28/05/2025, 11:00 AM by Dr. M. Desai', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                        { id: 'DIS-2025-000414', name: 'Robert Johnson', mrn: '1000245697', ward: 'NEU-01 / Bed 02', dept: 'Dr. P. Singh (Neurology)', requested: '28/05/2025, 03:00 PM', reason: 'Discharge to Home', requestedOn: '28/05/2025, 09:30 AM by Dr. P. Singh', priority: 'Normal', status: 'Discharged', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-green-100 text-green-800 border-green-200' },
                        { id: 'DIS-2025-000415', name: 'Kiran Patel', mrn: '1000245698', ward: 'PUL-02 / Bed 08', dept: 'Dr. S. Reddy (Pulmonology)', requested: '28/05/2025, 04:30 PM', reason: 'Discharge Summary Drafted', requestedOn: '28/05/2025, 10:45 AM by Dr. S. Reddy', priority: 'Normal', status: 'Drafted', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-blue-100 text-blue-800 border-blue-200' }
                      ].map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-[#d0dbe5] text-[10.5px] text-gray-800 font-sans cursor-pointer transition-colors ${
                            idx % 2 === 0 ? 'bg-white hover:bg-[#eef4f9]' : 'bg-[#f0f5fa] hover:bg-[#eef4f9]'
                          }`}
                        >
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-mono">{row.mrn}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-bold text-gray-700">{row.id}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5]" onClick={(e) => e.stopPropagation()}>
                            <div 
                              className="font-bold text-[#0d7a86] cursor-pointer hover:underline" 
                              onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe')}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPatientContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  patientName: row.name,
                                  patientMrn: row.mrn
                                });
                              }}
                            >{row.name}</div>
                          </td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-semibold">{row.ward}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5]">{row.dept}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] text-[#0f4471] font-bold">{row.requested}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5]">{row.reason}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] text-gray-600">{row.requestedOn.split(' by ')[0]}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-semibold text-gray-800">{row.priority}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-semibold text-gray-800">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#fafbfc] border-t border-[#bdcddc] p-2 flex justify-between items-center text-[10px] select-none text-gray-600 font-sans">
                  <div className="flex gap-4">
                    <span>Sort Order: Location, ascending</span>
                    <span>Filter: Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Showing 4 of 4 records</span>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[9.5px] font-semibold text-gray-700">Refresh List</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'Orders' && (
            <div className="flex-1 bg-white flex flex-col overflow-hidden text-[11px]">
              {/* Toolbar matching the second image's icons perfectly */}
              <div className="bg-[#fafbfc] border-b border-[#bdcddc] px-3 py-1 flex items-center gap-5 text-[#333333] text-[11px] select-none font-sans">
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#d1154f" className="inline mr-0.5">
                    <path d="M14 3.25c-.41 0-.75.34-.75.75v16c0 .41.34.75.75.75s.75-.34.75-.75V4c0-.41-.34-.75-.75-.75zM3 9v6h3l5 5V4L6 9H3zm17.5 3c0-1.8-1.04-3.36-2.5-4.13v8.26c1.46-.77 2.5-2.33 2.5-4.13z"/>
                  </svg>
                  <span className="text-[#333333]">Communicate</span>
                  <span className="text-[8px] text-gray-400">▼</span>
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffb300" className="inline">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                  </svg>
                  <span className="text-[#333333]">Open</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#1e88e5" className="inline">
                    <path d="M21 5c-1.11-.9-2.45-1-4-1-1.48 0-2.75.1-4 1-1.25-.9-2.52-1-4-1-1.55 0-2.89.1-4 1v14.5c1.11-.9 2.45-1 4-1 1.48 0 2.75.1 4 1 1.25-.9 2.52-1 4-1 1.55 0 2.89.1 4 1V5zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-3.4.25-5 1V6.5c1.6-.75 3.3-1 5-1 1.2 0 2.4.15 3.5.5v13z"/>
                  </svg>
                  <span className="text-[#333333]">Message Journal</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" className="inline">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#cbd8e3"/>
                    <path d="M11 16v-3H8v-2h3V8l5 4-5 4z" fill="#d32f2f"/>
                  </svg>
                  <span className="text-[#333333]">Forward Only</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#311b92" className="inline">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="text-[#333333]">Select Patient</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#37474f" className="inline">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="text-[#333333]">Select All</span>
                </button>
              </div>

              {/* Table with custom font, high contrast text and border styles */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#f0f4f8] text-[#333333] select-none sticky top-0 z-10 text-[11px]">
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Patient Name</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order/Plan Name</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order Action</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order Comment</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Originator Name</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Create Date</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Date</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Type</th>
                      <th className="p-1 px-2 border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrdersData.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.patientName.toUpperCase()}`, 'patient-doe')}
                        className={`hover:bg-[#eaf4fc] cursor-pointer transition-colors ${
                          idx % 2 === 1 ? 'bg-[#f4f8fb]' : 'bg-white'
                        }`}
                      >
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] font-bold text-black uppercase whitespace-nowrap text-[11px]">
                          {row.patientName}
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-[#004b87] hover:underline whitespace-nowrap text-[11px]">
                          {row.orderPlanName}
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] whitespace-nowrap text-gray-800 text-[11px]">{row.action}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">
                          {row.detailsDate}...
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-700 whitespace-nowrap text-[11px]">
                          {row.detailsDesc}
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-600 whitespace-nowrap text-[11px]">{row.comment}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-600 whitespace-nowrap text-[11px]">{row.originator}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">{row.createDate}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">{row.stopDate}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-700 whitespace-nowrap text-[11px]">{row.stopType}</td>
                        <td className="p-1 px-2 border-b border-[#e5edf5] font-bold text-[#008000] whitespace-nowrap text-[11px]">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab.type === 'Labs' && (
            <div className="flex-1 bg-white flex flex-col overflow-hidden text-[11px]">
              {/* Toolbar matching the second image's icons perfectly */}
              <div className="bg-[#fafbfc] border-b border-[#bdcddc] px-3 py-1 flex items-center gap-5 text-[#333333] text-[11px] select-none font-sans">
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#d1154f" className="inline mr-0.5">
                    <path d="M14 3.25c-.41 0-.75.34-.75.75v16c0 .41.34.75.75.75s.75-.34.75-.75V4c0-.41-.34-.75-.75-.75zM3 9v6h3l5 5V4L6 9H3zm17.5 3c0-1.8-1.04-3.36-2.5-4.13v8.26c1.46-.77 2.5-2.33 2.5-4.13z"/>
                  </svg>
                  <span className="text-[#333333]">Communicate</span>
                  <span className="text-[8px] text-gray-400">▼</span>
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffb300" className="inline">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                  </svg>
                  <span className="text-[#333333]">Open</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#1e88e5" className="inline">
                    <path d="M21 5c-1.11-.9-2.45-1-4-1-1.48 0-2.75.1-4 1-1.25-.9-2.52-1-4-1-1.55 0-2.89.1-4 1v14.5c1.11-.9 2.45-1 4-1 1.48 0 2.75.1 4 1 1.25-.9 2.52-1 4-1 1.55 0 2.89.1 4 1V5zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-3.4.25-5 1V6.5c1.6-.75 3.3-1 5-1 1.2 0 2.4.15 3.5.5v13z"/>
                  </svg>
                  <span className="text-[#333333]">Message Journal</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" className="inline">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#cbd8e3"/>
                    <path d="M11 16v-3H8v-2h3V8l5 4-5 4z" fill="#d32f2f"/>
                  </svg>
                  <span className="text-[#333333]">Forward Only</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#311b92" className="inline">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="text-[#333333]">Select Patient</span>
                </button>
                <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#37474f" className="inline">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="text-[#333333]">Select All</span>
                </button>
              </div>

              {/* Table with custom font, high contrast text and border styles */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#f0f4f8] text-[#333333] select-none sticky top-0 z-10 text-[11px]">
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Patient Name</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order/Plan Name</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order Action</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Order Comment</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Originator Name</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Create Date</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Date</th>
                      <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Type</th>
                      <th className="p-1 px-2 border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrdersData.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.patientName.toUpperCase()}`, 'patient-doe')}
                        className={`hover:bg-[#eaf4fc] cursor-pointer transition-colors ${
                          idx % 2 === 1 ? 'bg-[#f4f8fb]' : 'bg-white'
                        }`}
                      >
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] font-bold text-black uppercase whitespace-nowrap text-[11px]">
                          {row.patientName}
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-[#004b87] hover:underline whitespace-nowrap text-[11px]">
                          {row.orderPlanName}
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] whitespace-nowrap text-gray-800 text-[11px]">{row.action}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">
                          {row.detailsDate}...
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-700 whitespace-nowrap text-[11px]">
                          {row.detailsDesc}
                        </td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-600 whitespace-nowrap text-[11px]">{row.comment}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-600 whitespace-nowrap text-[11px]">{row.originator}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">{row.createDate}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">{row.stopDate}</td>
                        <td className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-700 whitespace-nowrap text-[11px]">{row.stopType}</td>
                        <td className="p-1 px-2 border-b border-[#e5edf5] font-bold text-[#008000] whitespace-nowrap text-[11px]">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab.type as string) === 'DeveloperTools' && (
            <div className="flex-1 overflow-hidden bg-[#fafbfc] text-[#333333] text-[11px] flex select-none">
              {/* Left sidebar admin options list */}
              <div className="w-[200px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col">
                <div className="bg-[#789cbb] text-white font-bold p-1.5">
                  Administration
                </div>
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  <div className="p-1 space-y-1">
                    <div className="font-bold p-1 border-b border-[#bdcddc]/50 flex items-center gap-1">
                      📁 Content Server
                    </div>
                    <div className="pl-3 space-y-0.5">
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">My Content Server</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">Browse Content</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">Search Logs</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">Content Management</div>
                    </div>
                    
                    <div className="font-bold p-1 border-b border-[#bdcddc]/50 flex items-center gap-1 pt-2">
                      ⚙️ Administration
                    </div>
                    <div className="pl-3 space-y-0.5">
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">Log Files</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer text-blue-900 font-bold bg-white border border-[#bdcddc]">Component Manager</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">General Configuration</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">Content Security</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">Internet Configuration</div>
                      <div className="p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">Localization Settings</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Settings Configuration Form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white select-text">
                <div className="border border-[#bdcddc] rounded shadow-sm overflow-hidden bg-white">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] p-2 font-bold text-xs text-[#002a46] flex justify-between items-center select-none">
                    <span>Component Manager - Core Application Settings</span>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[10px] text-gray-700">Refresh Settings</button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="text-[10.5px] text-gray-600 leading-relaxed border-b pb-2 select-none">
                      Enable or disable application components, toggle system debugging properties, and activate edge development libraries. Select components to register in this runtime workstation's execution manifest.
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: 'Imaging', desc: 'Acts as the interface for document ingestion, file preview, and tools such as medical imagery viewers.', checked: true },
                        { name: 'IpmRepository', desc: 'Adds functionality to the metadata layer allowing Oracle WebCenter Content integration.', checked: false },
                        { name: 'LinkManager', desc: 'Extracts URL links, parses relative paths, and maintains local cache directories.', checked: true },
                        { name: 'MSOfficeHtmlConverterSupport', desc: 'Allows conversion of native Microsoft Office file formats to clean static HTML display frames.', checked: false },
                        { name: 'OracleDocumentsFolders', desc: 'Enables external folder sync systems to cloud repositories for diagnostic reports.', checked: false },
                        { name: 'PDFWatermark', desc: 'Adds PDF watermark rendering for printed documents.', checked: false },
                        { name: 'PortalVCRHelper', desc: 'Integrates Content Portal modules into core view pipelines.', checked: true },
                        { name: 'RedwoodUI', desc: 'Offers a modern, premium design system aesthetic layout matching the Oracle Redwood principle patterns.', checked: true },
                        { name: 'SESCrawlerExport', desc: 'Enables XML data extraction pipelines.', checked: true },
                        { name: 'SharedLinks', desc: 'Allows creating links to folder paths to share patient resources.', checked: true },
                        { name: 'SiebelEcmIntegration', desc: 'Provides integration links with Siebel enterprise database schemas.', checked: false }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start hover:bg-gray-50/50 p-1.5 rounded transition-all">
                          <input type="checkbox" defaultChecked={item.checked} className="mt-0.5 rounded-sm" id={`comp-${idx}`} />
                          <div className="space-y-0.5">
                            <label htmlFor={`comp-${idx}`} className="font-bold text-blue-900 cursor-pointer hover:underline">{item.name}</label>
                            <p className="text-gray-600 text-[10px] leading-snug">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 select-none">
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-4 py-1.5 rounded transition-all">
                        Reset Defaults
                      </button>
                      <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1.5 rounded shadow-sm transition-all">
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'BillingReceipt' && (
            <div className="flex-1 overflow-y-auto bg-[#f4f7f9] p-6 select-text text-gray-800">
              <div className="max-w-[1200px] mx-auto space-y-6">
                
                {/* Top Patient Banner */}
                <div className="bg-[#0f4471] text-white p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold tracking-wide">Araceli Test</span>
                      <span className="bg-[#1b7a2a] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active Encounter</span>
                    </div>
                    <div className="text-[11.5px] text-blue-100 flex gap-4">
                      <span><strong>MRN:</strong> MRN-98203</span>
                      <span><strong>DOB:</strong> 01/04/1985 (39 Y)</span>
                      <span><strong>Encounter:</strong> ENC-40291 (OBV)</span>
                      <span><strong>Guarantor:</strong> Araceli Test (Self)</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[18px] font-black tracking-wider text-emerald-300">RECEIPT #RCP-2026-88492</div>
                    <div className="text-[11px] text-blue-100">Date Issued: 17/07/2026 03:30 PM</div>
                  </div>
                </div>

                {/* Action Strip & Status */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg p-3.5 shadow-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => alert('Printing official patient receipt...')} className="bg-[#0f4471] hover:bg-[#0b3355] text-white text-[11px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
                      <span>🖨️</span> Print Official Receipt
                    </button>
                    <button onClick={() => alert('Receipt emailed to patient securely.')} className="bg-white border border-[#0f4471] text-[#0f4471] hover:bg-blue-50 text-[11px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                      <span>📧</span> Email Receipt
                    </button>
                    <button onClick={() => alert('PDF Statement downloaded.')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                      <span>📥</span> Download PDF Statement
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500 font-bold uppercase">Account Status:</span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-[11.5px] tracking-wide">
                      ✔ PAID / SETTLED IN FULL
                    </span>
                  </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Charges</span>
                    <span className="text-[22px] font-black text-gray-900">$1,450.00</span>
                    <span className="text-[10px] text-gray-400 block">4 Clinical & Diagnostic Services</span>
                  </div>
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1 border-l-4 border-l-blue-600">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Insurance Payment</span>
                    <span className="text-[22px] font-black text-blue-700">-$1,150.00</span>
                    <span className="text-[10px] text-blue-600 font-medium block">Blue Cross Blue Shield (PPO)</span>
                  </div>
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1 border-l-4 border-l-emerald-600">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Patient Paid / Copay</span>
                    <span className="text-[22px] font-black text-emerald-700">$300.00</span>
                    <span className="text-[10px] text-emerald-600 font-medium block">Visa ending in 4092 (Auth #88412)</span>
                  </div>
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1 bg-gray-50">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Balance Due</span>
                    <span className="text-[22px] font-black text-gray-500">$0.00</span>
                    <span className="text-[10px] text-gray-400 font-medium block">No further payments required</span>
                  </div>
                </div>

                {/* Itemized Services Table */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                    <span>Itemized Statement & Service Breakdown</span>
                    <span className="text-[10.5px] text-gray-600 font-normal">Encounter Date: 01/04/2017</span>
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#eaeaea] text-gray-700 font-bold border-b border-gray-300">
                      <tr>
                        <th className="p-2.5">Service Date</th>
                        <th className="p-2.5">CPT / Code</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Department</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">99214</td>
                        <td className="p-2.5 font-medium">Office Visit - Level 4 (Established Patient)</td>
                        <td className="p-2.5 text-gray-600">Outpatient Clinic</td>
                        <td className="p-2.5 text-right font-mono">$250.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$250.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">76805</td>
                        <td className="p-2.5 font-medium">Ultrasound : (OB) Complete After First Trimester</td>
                        <td className="p-2.5 text-gray-600">Diagnostic Imaging</td>
                        <td className="p-2.5 text-right font-mono">$450.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$450.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">80050</td>
                        <td className="p-2.5 font-medium">General Health Panel (CBC & Comprehensive Metabolic)</td>
                        <td className="p-2.5 text-gray-600">Laboratory</td>
                        <td className="p-2.5 text-right font-mono">$350.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$350.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">90471</td>
                        <td className="p-2.5 font-medium">Immunization Administration & Consultation</td>
                        <td className="p-2.5 text-gray-600">Preventive Med</td>
                        <td className="p-2.5 text-right font-mono">$400.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$400.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Transaction & Payment Audit Trail */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                    <span>Payment & Transaction History</span>
                    <span className="text-[10.5px] text-emerald-700 font-bold">Total Received: $1,450.00</span>
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#eaeaea] text-gray-700 font-bold border-b border-gray-300">
                      <tr>
                        <th className="p-2.5">Date & Time</th>
                        <th className="p-2.5">Payment Method</th>
                        <th className="p-2.5">Reference / TXN</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5">Processed By</th>
                        <th className="p-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017 04:15 PM</td>
                        <td className="p-2.5 font-bold text-emerald-800">Credit Card (Visa ending 4092)</td>
                        <td className="p-2.5 font-mono">TXN-99812401</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">$300.00</td>
                        <td className="p-2.5 text-gray-600">Cashier / Billing Dept</td>
                        <td className="p-2.5 text-gray-600">Copay & co-insurance settled at discharge</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">15/04/2017 10:00 AM</td>
                        <td className="p-2.5 font-bold text-blue-800">Electronic Remittance (BCBS)</td>
                        <td className="p-2.5 font-mono">ERA-88210344</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-700">$1,150.00</td>
                        <td className="p-2.5 text-gray-600">Auto-Posting / Clearinghouse</td>
                        <td className="p-2.5 text-gray-600">Claim #CLM-2017-901 adjudicated and paid in full</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {activeTab.type === 'ClinicalDecisionSupport' && (
            <div className="flex-1 overflow-y-auto bg-[#f4f7f9] p-6 select-text text-gray-800">
              <div className="max-w-[1200px] mx-auto space-y-6">
                
                {/* Page Title & Intro */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-xs flex justify-between items-center">
                  <div className="space-y-1">
                    <h2 className="text-[16px] font-bold text-[#002a46] flex items-center gap-2">
                      🛡️ Clinical Decision Support System (CDSS)
                    </h2>
                    <p className="text-[11px] text-gray-600">
                      Configure real-time clinical warnings, order interaction checks, diagnostic alerts, and notification preferences.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#e0f2fe] text-[#0369a1] text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wide border border-[#bae6fd]">
                      Engine Status: Active
                    </span>
                  </div>
                </div>

                {/* Main Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Core CDSS Rule Engines & Severities */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Core Rules Panel */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                        <span>Core Decision Engines & Verification Checks</span>
                        <span className="text-[10px] text-gray-500 font-normal">Runs during Order Entry and Charting</span>
                      </div>
                      
                      <div className="p-4 space-y-3.5">
                        
                        {/* Drug-Drug */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Drug-Drug Interactions</span>
                            <p className="text-[10.5px] text-gray-500">Cross-checks newly ordered medications against patient's active medication list.</p>
                          </div>
                          <button 
                            onClick={() => setCdsDrugDrug(!cdsDrugDrug)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsDrugDrug ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsDrugDrug ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Drug-Allergy */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Drug-Allergy Interactions</span>
                            <p className="text-[10.5px] text-gray-500">Cross-checks medication orders against documented patient allergies and drug classes.</p>
                          </div>
                          <button 
                            onClick={() => setCdsDrugAllergy(!cdsDrugAllergy)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsDrugAllergy ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsDrugAllergy ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Duplicate Therapy */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Duplicate Therapy Alert</span>
                            <p className="text-[10.5px] text-gray-500">Triggers if ordered medication belongs to the same therapeutic class as an active medication.</p>
                          </div>
                          <button 
                            onClick={() => setCdsDuplicateTherapy(!cdsDuplicateTherapy)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsDuplicateTherapy ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsDuplicateTherapy ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Renal Dosing */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Renal Clearance Dosage Warning</span>
                            <p className="text-[10.5px] text-gray-500">Flags dosage adjustments when patient eGFR or Creatinine Clearance falls below threshold.</p>
                          </div>
                          <button 
                            onClick={() => setCdsRenalDosing(!cdsRenalDosing)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsRenalDosing ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsRenalDosing ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Geriatric warning */}
                        <div className="flex items-start justify-between pb-1">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Geriatric Contraindications (Beers Criteria)</span>
                            <p className="text-[10.5px] text-gray-500">Flags potentially inappropriate medication use in older adults (65 years and older).</p>
                          </div>
                          <button 
                            onClick={() => setCdsGeriatric(!cdsGeriatric)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsGeriatric ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsGeriatric ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Best Practice Alerts list */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46]">
                        Best Practice Alerts & Screenings (BPA)
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div className="border border-[#e2e8f0] rounded p-3 flex justify-between items-start bg-gray-50/50">
                            <div className="space-y-1 pr-4">
                              <span className="text-[11.5px] font-bold text-gray-900 block">Sepsis Early Warning Alert</span>
                              <p className="text-[10px] text-gray-500">Triggers clinical bundle order suggestions when systemic inflammatory response (SIRS) is suspected.</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={cdsSepsisRule} 
                              onChange={(e) => setCdsSepsisRule(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471] cursor-pointer"
                            />
                          </div>

                          <div className="border border-[#e2e8f0] rounded p-3 flex justify-between items-start bg-gray-50/50">
                            <div className="space-y-1 pr-4">
                              <span className="text-[11.5px] font-bold text-gray-900 block">Diabetic Retinopathy Screening</span>
                              <p className="text-[10px] text-gray-500">Triggers an alert during review if diabetic patient has not had a documented eye exam in past 12 months.</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={cdsRetinopathyRule} 
                              onChange={(e) => setCdsRetinopathyRule(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471] cursor-pointer"
                            />
                          </div>

                          <div className="border border-[#e2e8f0] rounded p-3 flex justify-between items-start bg-gray-50/50 md:col-span-2">
                            <div className="space-y-1 pr-4">
                              <span className="text-[11.5px] font-bold text-gray-900 block">Preventive Care: Annual Influenza Vaccine Reminder</span>
                              <p className="text-[10px] text-gray-500">Prompts clinician to order or log influenza vaccination status for all patients during autumn/winter admission.</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={cdsFluVaccineRule} 
                              onChange={(e) => setCdsFluVaccineRule(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471] cursor-pointer"
                            />
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Severity Thresholds & Notification Settings */}
                  <div className="space-y-6">
                    
                    {/* Severity Panel */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46]">
                        Alert Sensitivity & Severity Thresholds
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-bold text-gray-700 block">Minimum Trigger Threshold</label>
                          <select 
                            value={cdsSeverityThreshold} 
                            onChange={(e) => setCdsSeverityThreshold(e.target.value)}
                            className="w-full text-[11px] border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-800 focus:outline-none focus:border-[#0f4471] font-medium"
                          >
                            <option value="Critical Only">Critical Only (Interruptive alerts only for severe risks)</option>
                            <option value="Medium & Critical">Warning & Critical (Default recommended settings)</option>
                            <option value="All (Informational, Warning, Critical)">All (Informational, Warning, Critical)</option>
                          </select>
                          <p className="text-[9.5px] text-gray-400">
                            Setting a lower threshold increases clinical alerts but may contribute to warning fatigue.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notification Channels */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46]">
                        Delivery & Notification Channels
                      </div>
                      <div className="p-4 space-y-3.5">
                        
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={cdsInterruptiveAlerts} 
                            onChange={(e) => setCdsInterruptiveAlerts(e.target.checked)}
                            className="w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[11.5px] font-bold text-gray-900 block">Interruptive Pop-up Dialogs</span>
                            <span className="text-[10px] text-gray-500 block">Requires clinician to acknowledge or provide override reason to proceed.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={cdsBannerAlerts} 
                            onChange={(e) => setCdsBannerAlerts(e.target.checked)}
                            className="w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[11.5px] font-bold text-gray-900 block">Inline Banner Alerts</span>
                            <span className="text-[10px] text-gray-500 block">Non-interruptive color banner displayed directly inside patient flowsheets.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={cdsSidebarAlerts} 
                            onChange={(e) => setCdsSidebarAlerts(e.target.checked)}
                            className="w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[11.5px] font-bold text-gray-900 block">CDSS Sidebar Dock</span>
                            <span className="text-[10px] text-gray-500 block">Consolidates active warnings inside a collateral sidebar tray.</span>
                          </div>
                        </label>

                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setCdsDrugDrug(true);
                          setCdsDrugAllergy(true);
                          setCdsDuplicateTherapy(true);
                          setCdsRenalDosing(true);
                          setCdsGeriatric(false);
                          setCdsSeverityThreshold('Medium & Critical');
                          setCdsSepsisRule(true);
                          setCdsRetinopathyRule(true);
                          setCdsFluVaccineRule(false);
                          setCdsInterruptiveAlerts(true);
                          setCdsBannerAlerts(true);
                          setCdsSidebarAlerts(false);
                          alert('Decision Support settings reset to hospital defaults.');
                        }}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-4 py-1.5 rounded transition-all"
                      >
                        Reset Defaults
                      </button>
                      <button 
                        onClick={() => alert('Clinical Decision Support configurations successfully updated.')}
                        className="bg-[#0f4471] hover:bg-[#0b3355] text-white text-[11px] font-bold px-4 py-1.5 rounded shadow-sm transition-all"
                      >
                        Save Configuration
                      </button>
                    </div>

                  </div>

                </div>

                {/* Bottom Audit Log Table */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                    <span>CDSS Alert History & Clinician Override Audit Log</span>
                    <span className="text-[10px] text-gray-500 font-normal">Recent 5 alerts logged</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#eaeaea] text-gray-700 font-bold border-b border-gray-300 select-none">
                        <tr>
                          <th className="p-2.5">Date / Time</th>
                          <th className="p-2.5">Rule / Interaction</th>
                          <th className="p-2.5">Patient</th>
                          <th className="p-2.5 text-center">Severity</th>
                          <th className="p-2.5">Alert Text</th>
                          <th className="p-2.5">Action Taken</th>
                          <th className="p-2.5">Clinician</th>
                          <th className="p-2.5">Override/Action Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cdsAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="p-2.5 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                            <td className="p-2.5 font-bold text-[#0f4471]">{log.ruleName}</td>
                            <td className="p-2.5 font-medium text-gray-900 uppercase">{log.patientName}</td>
                            <td className="p-2.5 text-center">
                              <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold ${
                                log.severity === 'Critical' 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {log.severity}
                              </span>
                            </td>
                            <td className="p-2.5 text-gray-600 max-w-[280px] break-words">{log.alertText}</td>
                            <td className="p-2.5 font-medium whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                                log.action === 'Overridden' 
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                  : log.action === 'Accepted'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-2.5 text-gray-700 font-medium whitespace-nowrap">{log.clinician}</td>
                            <td className="p-2.5 text-gray-500 italic max-w-[240px] break-words">{log.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer Bar */}
      {!isFullscreen && (
        <div className="bg-[#002a46] text-white px-3 py-1 flex justify-between items-center text-[9.5px] border-t border-[#001729]">
          <span>Ready</span>
          <span>Patient: JOHN DOE ( MRN: 1000245678 )</span>
          <span>User: Axiovital Admin</span>
          <span>AXIOVITAL HEALTHCARE SYSTEM</span>
          <span>PROD</span>
          <span>05/28/2025 03:45 PM</span>
        </div>
      )}

      {/* Floating Exit Full Screen Button */}
      {isFullscreen && (
        <button 
          onClick={() => setIsFullscreen(false)}
          className="fixed top-3 right-3 z-50 bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3.5 py-1.5 rounded shadow-lg border border-[#0d3455] flex items-center gap-1.5 text-[11px] transition-all cursor-pointer animate-in fade-in zoom-in duration-200"
        >
          <span>Exit Full Screen</span>
          <span className="font-mono font-bold">✕</span>
        </button>
      )}

     {/* Reschedule Modal Overlay */}
      {/* Conversation Launcher Modal */}
      {showConversationLauncher && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4 font-sans" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
          <div className="bg-[#f0f0f0] border border-[#0078d7] shadow-xl flex flex-col w-[680px] select-none rounded-sm overflow-hidden">
            {/* Header (Windows Style) */}
            <div className="flex justify-between items-center bg-white h-[30px] select-none relative">
              <div className="flex items-center pl-2 absolute left-0">
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-[8px] overflow-hidden">
                  <span className="text-gray-600">💬</span>
                </div>
              </div>
              <div className="flex-1 flex justify-center items-center pointer-events-none">
                <span className="text-[12px] text-black">Person Mgmt: Conversation Launcher</span>
              </div>
              <div className="flex items-center h-full absolute right-0">
                <button className="h-full w-[45px] flex items-center justify-center hover:bg-[#e5e5e5] transition-colors text-black text-[10px]">
                  <span>__</span>
                </button>
                <button className="h-full w-[45px] flex items-center justify-center hover:bg-[#e5e5e5] transition-colors text-black text-[10px]">
                  <span>⬜</span>
                </button>
                <button onClick={() => setShowConversationLauncher(false)} className="h-full w-[45px] flex items-center justify-center hover:bg-[#e81123] hover:text-white transition-colors text-black text-[12px]">
                  <span>✕</span>
                </button>
              </div>
            </div>
            
            {/* Content Body */}
            <div className="px-3 pt-3 pb-2 flex-1">
              <div className="bg-white border border-[#a0a0a0] p-4">
                <div className="grid grid-cols-7 gap-x-2 gap-y-6">
                  {[
                    { label: 'Add/Modify Person', icon: '👤', action: () => { selectOrOpenTabRef.current('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe'); setShowConversationLauncher(false); } },
                    { label: 'Bed Transfer', icon: '🛏️', action: () => { selectOrOpenTabRef.current('ReferralTransfer', 'Referrals & Transfers', 'referrals-transfers-tab'); setShowConversationLauncher(false); } },
                    { label: 'Cancel Discharge', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Encounter', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Pending...', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Pendi...', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Transfer', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Discharge Encounter', icon: '🚪', action: () => { selectOrOpenTabRef.current('DischargeList', 'Discharge List', 'discharge-list-tab'); setShowConversationLauncher(false); } },
                    { label: 'Facility Transfer', icon: '🏥', action: () => { selectOrOpenTabRef.current('ReferralTransfer', 'Referrals & Transfers', 'referrals-transfers-tab'); setShowConversationLauncher(false); } },
                    { label: 'Leave of Absence', icon: '🚶', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Modify Discharge', icon: '📝', action: () => { selectOrOpenTabRef.current('DischargeList', 'Discharge List', 'discharge-list-tab'); setShowConversationLauncher(false); } },
                    { label: 'Newborn Modify', icon: '👶', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Newborn Quick Reg', icon: '👶', action: () => { selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Pending Discharge', icon: '⏳', action: () => { selectOrOpenTabRef.current('DischargeList', 'Discharge List', 'discharge-list-tab'); setShowConversationLauncher(false); } },
                    { label: 'Pending Facil...', icon: '⏳', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Pending Transfer', icon: '⏳', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Pre-Register Outpatient', icon: '📋', action: () => { selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Pre-Register Patient To...', icon: '📋', action: () => { selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Print Specimen Labels', icon: '🏷️', action: () => { selectOrOpenTabRef.current('Labs', 'Labs', 'labs-tab'); setShowConversationLauncher(false); } },
                    { label: 'Process Alert', icon: '⚠️', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Quick Reg', icon: '⚡', action: () => { selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Referral Management', icon: '👔', action: () => { selectOrOpenTabRef.current('ReferralTransfer', 'Referrals & Transfers', 'referrals-transfers-tab'); setShowConversationLauncher(false); } },
                    { label: 'Register Outpatient', icon: '🏥', action: () => { selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Register Patient To...', icon: '🏥', action: () => { selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Stillborn', icon: '👼', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Update Patient Information', icon: '🔄', action: () => { selectOrOpenTabRef.current('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe'); setShowConversationLauncher(false); } },
                    { label: 'View Encounter', icon: '👁️', action: () => { selectOrOpenTabRef.current('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe'); setShowConversationLauncher(false); } },
                    { label: 'View Person', icon: '👤', action: () => { selectOrOpenTabRef.current('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe'); setShowConversationLauncher(false); } },
                    { label: 'WH Quick Reg', icon: '⚡', action: () => { selectOrOpenTabRef.current('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } }
                  ].map((item, idx) => (
                    <div key={idx} onClick={item.action} className="flex flex-col items-center justify-start text-center cursor-pointer hover:bg-[#e5f1fb] hover:border-[#cce4f7] border border-transparent p-1 rounded-sm">
                      <div className="text-3xl mb-1 flex items-center justify-center h-[36px] w-[36px] bg-no-repeat bg-center" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' }}>
                        {item.icon}
                      </div>
                      <div className="text-[11px] leading-[1.1] font-normal text-black w-full px-0.5" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-3 pb-3 pt-1 flex justify-end gap-2 bg-[#f0f0f0]">
              <button onClick={() => setShowConversationLauncher(false)} className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-[#adadad] hover:border-[#0078d7] px-4 py-1 text-[12px] min-w-[75px] h-[23px] flex items-center justify-center text-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.5)] active:bg-[#cce4f7] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] outline-none focus:border-[#0078d7]">
                OK
              </button>
              <button onClick={() => setShowConversationLauncher(false)} className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-[#adadad] hover:border-[#0078d7] px-4 py-1 text-[12px] min-w-[75px] h-[23px] flex items-center justify-center text-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.5)] active:bg-[#cce4f7] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] outline-none focus:border-[#0078d7]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedRescheduleReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-[#f1f5f9] w-[1100px] h-[650px] rounded-lg shadow-2xl border border-[#bdcddc] flex flex-col overflow-hidden text-[10.5px]">
            
            {/* Modal Title Banner */}
            <div className="bg-[#0f4471] text-white px-4 py-2.5 flex justify-between items-center select-none">
              <span className="font-bold text-xs flex items-center gap-1.5">📅 Reschedule Appointment: {selectedRescheduleReq.name}</span>
              <button 
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedRescheduleReq(null);
                }} 
                className="hover:bg-white/10 rounded px-2 py-0.5 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Workspace */}
            <div className="flex-1 p-4 grid grid-cols-[260px_1fr_260px] gap-4 overflow-auto">
              
              {/* Column 1: Patient & Current Info Card */}
              <div className="space-y-3">
                <div className="bg-white border border-[#cbd5e1] rounded-md p-3.5 shadow-sm space-y-3">
                  <h4 className="font-bold text-[#0f4471] border-b pb-1">1. Patient & Current Appointment Information</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Patient Name</span>
                      <span className="font-bold text-blue-900 text-[11px]">{selectedRescheduleReq.name}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">ABHA-ID</span>
                      <span className="font-mono font-bold text-gray-800">{selectedRescheduleReq.mrn}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">DOB / Age</span>
                      <span className="font-semibold text-gray-800">22/07/1986 (38 Y)</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Phone</span>
                      <span className="font-semibold text-gray-800">9876543211</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Email</span>
                      <span className="font-semibold text-gray-800 text-[10px] break-all">{selectedRescheduleReq.name.toLowerCase().replace(' ', '.')}@email.com</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#cbd5e1] rounded-md p-3.5 shadow-sm space-y-2">
                  <h4 className="font-bold text-[#0f4471] border-b pb-1">Current Appointment</h4>
                  
                  <div className="grid grid-cols-[85px_1fr] gap-y-1.5 text-gray-700">
                    <span className="text-gray-400">Appointment ID</span>
                    <span className="font-mono font-bold">APT-2025-000678</span>
                    
                    <span className="text-gray-400">Date & Time</span>
                    <span className="font-bold">{selectedRescheduleReq.current}</span>
                    
                    <span className="text-gray-400">Provider</span>
                    <span className="font-semibold text-gray-900">{selectedRescheduleReq.dept.split(' (')[0]}</span>
                    
                    <span className="text-gray-400">Department</span>
                    <span className="font-semibold">{selectedRescheduleReq.dept.split('(')[1]?.replace(')', '') || 'General'}</span>

                    <span className="text-gray-400">Location / Unit</span>
                    <span className="font-semibold">NEU-02 / Bed 05</span>

                    <span className="text-gray-400">Visit Type</span>
                    <span className="font-semibold">Follow-up Visit</span>

                    <span className="text-gray-400">Status</span>
                    <span className="bg-orange-100 text-orange-800 text-[8.5px] px-1.5 rounded-sm font-bold w-fit">Scheduled</span>
                  </div>
                </div>

                <div className="bg-white border border-[#cbd5e1] rounded-md p-3 shadow-sm space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold block">Reschedule Reason (Select)</label>
                    <select className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none">
                      <option>Patient Request</option>
                      <option>Provider Conflict</option>
                      <option>Equipment Failure</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold block">Reason Details (Optional)</label>
                    <textarea 
                      className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] h-[55px] resize-none focus:outline-none"
                      defaultValue="Patient is not available at current time. Requesting to reschedule."
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: New Slot Grid Calendar Selector */}
              <div className="bg-white border border-[#cbd5e1] rounded-md p-3.5 shadow-sm flex flex-col overflow-hidden">
                <h4 className="font-bold text-[#0f4471] border-b pb-1.5 mb-2.5">2. Select New Appointment Slot</h4>
                
                {/* Form Selection Ribbon */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="space-y-0.5">
                    <label className="text-gray-400 text-[9px] uppercase font-bold">Provider</label>
                    <select className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none font-semibold">
                      <option>{selectedRescheduleReq.dept}</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-gray-400 text-[9px] uppercase font-bold">Visit Type</label>
                    <select className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none font-semibold">
                      <option>Follow-up Visit</option>
                      <option>Consultation Visit</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-gray-400 text-[9px] uppercase font-bold">Location / Unit</label>
                    <select className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none font-semibold">
                      <option>NEU-02 / Bed 05</option>
                    </select>
                  </div>
                </div>

                {/* Calendar Slot selector */}
                <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded">
                  {/* Date range header */}
                  <div className="bg-[#cbd8e3]/30 px-3 py-1.5 border-b border-gray-200 flex justify-between items-center select-none">
                    <button className="hover:bg-gray-150 px-1 py-0.5 rounded text-gray-500">❮</button>
                    <span className="font-bold text-gray-700">📅 26 May – 01 Jun 2025</span>
                    <div className="flex border border-gray-300 rounded overflow-hidden text-[9px]">
                      <button className="bg-[#0f4471] text-white px-2 py-0.5 font-bold">Day View</button>
                      <button className="bg-white hover:bg-gray-50 px-2 py-0.5 text-gray-600 font-semibold border-l border-gray-300">Week View</button>
                    </div>
                    <button className="hover:bg-gray-150 px-1 py-0.5 rounded text-gray-500">❯</button>
                  </div>

                  {/* Calendar columns grid */}
                  <div className="flex-1 overflow-y-auto grid grid-cols-[60px_repeat(5,1fr)] text-center divide-x divide-gray-100 text-[9.5px]">
                    
                    {/* Time labels column */}
                    <div className="divide-y divide-gray-100 font-bold bg-gray-50/50 text-gray-500 py-1 select-none">
                      <div className="h-[28px]" />
                      {['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map((t, idx) => (
                        <div key={idx} className="h-[34px] flex items-center justify-center border-t border-gray-200">{t}</div>
                      ))}
                    </div>

                    {/* Date Slot Columns */}
                    {[
                      { day: 'Wed 28 May', slots: { '9:00 AM': 'green', '10:00 AM': 'green', '11:00 AM': 'green', '2:00 PM': 'green', '3:00 PM': 'green', '4:00 PM': 'green' } },
                      { day: 'Thu 29 May', slots: { '8:30 AM': 'green', '9:30 AM': 'green', '10:30 AM': 'blue', '11:30 AM': 'green', '12:30 PM': 'gray', '1:30 PM': 'gray', '2:30 PM': 'green', '3:30 PM': 'green', '4:30 PM': 'green' } },
                      { day: 'Fri 30 May', slots: { '9:00 AM': 'green', '10:00 AM': 'green', '11:00 AM': 'gray', '12:00 PM': 'gray', '1:00 PM': 'green', '2:00 PM': 'green', '3:00 PM': 'green', '4:00 PM': 'green' } },
                      { day: 'Sat 31 May', slots: { '9:30 AM': 'green', '10:30 AM': 'green', '11:30 AM': 'green', '12:30 PM': 'green', '1:30 PM': 'green', '2:30 PM': 'green', '3:30 PM': 'green', '4:30 PM': 'green' } },
                      { day: 'Sun 01 Jun', slots: { '10:00 AM': 'green', '11:00 AM': 'green', '12:00 PM': 'gray' } }
                    ].map((col, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="h-[28px] font-bold text-gray-700 bg-gray-50 flex items-center justify-center border-b border-gray-200 select-none">{col.day}</div>
                        
                        <div className="flex-1 py-1 space-y-1 px-1">
                          {Object.entries(col.slots).map(([time, type], slotIdx) => {
                            let style = 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer';
                            if (type === 'blue') style = 'bg-blue-600 border-blue-700 text-white font-bold cursor-pointer';
                            if (type === 'gray') style = 'bg-gray-150 border-gray-200 text-gray-400 select-none cursor-not-allowed';
                            return (
                              <button key={slotIdx} className={`w-full py-0.8 border text-[8.5px] rounded-sm font-semibold transition-all ${style}`}>
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Slot selection legend footer */}
                  <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 flex gap-4 text-[9px] text-gray-500 font-bold select-none">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-100 border border-green-300 rounded-sm"></span> Available</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gray-200 border border-gray-300 rounded-sm"></span> Booked</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm"></span> Unavailable</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Request details and Action History sidebar */}
              <div className="space-y-3">
                <div className="bg-white border border-[#cbd5e1] rounded-md p-3 shadow-sm space-y-2.5">
                  <h4 className="font-bold text-[#0f4471] border-b pb-1 flex justify-between items-center">
                    <span>Appointment Request Details</span>
                  </h4>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b pb-0.5">
                      <span className="text-gray-400">Request ID</span>
                      <span className="font-mono font-bold text-gray-800">{selectedRescheduleReq.id}</span>
                    </div>

                    <div className="flex justify-between border-b pb-0.5">
                      <span className="text-gray-400">Requested On</span>
                      <span className="font-semibold">{selectedRescheduleReq.requestedOn.split(' by ')[0]}</span>
                    </div>

                    <div className="flex justify-between border-b pb-0.5 flex-col">
                      <span className="text-gray-400">Requested By</span>
                      <span className="font-semibold text-gray-900">{selectedRescheduleReq.requestedOn.split(' by ')[1] || 'Patient'}</span>
                    </div>

                    <div className="flex justify-between border-b pb-0.5">
                      <span className="text-gray-400">Request Type</span>
                      <span className="font-semibold text-gray-800">Reschedule</span>
                    </div>

                    <div className="flex justify-between border-b pb-0.5">
                      <span className="text-gray-400">Priority</span>
                      <span className={`px-1.5 rounded-sm font-bold text-[8.5px] border ${selectedRescheduleReq.priorityColor}`}>{selectedRescheduleReq.priority}</span>
                    </div>

                    <div className="flex justify-between border-b pb-0.5">
                      <span className="text-gray-400">Status</span>
                      <span className={`px-1.5 rounded-sm font-bold text-[8.5px] border ${selectedRescheduleReq.statusColor}`}>{selectedRescheduleReq.status}</span>
                    </div>

                    <div className="flex flex-col pt-1">
                      <span className="text-gray-400 block font-semibold text-[9px]">Notes</span>
                      <p className="text-gray-700 italic text-[9.5px] leading-tight">Patient requested to change the appointment time.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#cbd5e1] rounded-md p-3 shadow-sm flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="font-bold text-[#0f4471] border-b pb-1 flex justify-between items-center">
                      <span>Appointment History</span>
                      <span className="text-blue-600 hover:underline text-[9px] cursor-pointer">View All</span>
                    </div>
                    
                    <div className="space-y-3 mt-1.5">
                      <div className="relative pl-3 border-l-2 border-green-500">
                        <div className="font-bold text-gray-800 text-[9.5px]">Scheduled</div>
                        <div className="text-gray-400 text-[9px]">20/05/2025, 11:20 AM</div>
                        <p className="text-gray-500 text-[8.5px] mt-0.5">Original appointment scheduled.</p>
                      </div>

                      <div className="relative pl-3 border-l-2 border-amber-500">
                        <div className="font-bold text-gray-800 text-[9.5px]">Reschedule Requested</div>
                        <div className="text-gray-400 text-[9px]">{selectedRescheduleReq.requestedOn.split(' by ')[0]}</div>
                        <p className="text-gray-500 text-[8.5px] mt-0.5">Patient requested to reschedule.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Controls Ribbon */}
            <div className="bg-white border-t border-[#cbd5e1] p-3 flex justify-end gap-2 select-none">
              <button 
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedRescheduleReq(null);
                }} 
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-4 py-1.5 rounded transition-all"
              >
                Cancel Request
              </button>
              <button 
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedRescheduleReq(null);
                }} 
                className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1.5 rounded shadow-sm transition-all"
              >
                Review & Confirm →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* First Sub-Popup Card: Treatment & Clinical / Billing Hub (Cerner PowerChart Style - input_file_0.png) */}
      {showTreatmentPopup && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs flex items-center justify-center select-none font-sans text-[#333333] text-[11px]">
          <div className="bg-[#ececec] w-[1100px] h-[680px] rounded shadow-2xl border border-[#7a7a7a] flex flex-col overflow-hidden">
            
            {/* Title Bar */}
            <div className="bg-[#ffffff] text-[#333333] px-2.5 py-1 flex justify-between items-center border-b border-[#a0a0a0] shrink-0 h-[26px]">
              <div className="flex items-center gap-1.5 font-bold text-[11.5px]">
                <span className="text-[13px]">📄</span>
                <span>Treatment (Test, Araceli - 01/04/2017 03:30 PM, OBV) *</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowTreatmentPopup(false)} className="w-5 h-4 bg-[#e0e0e0] hover:bg-[#d0d0d0] border border-[#a0a0a0] flex items-center justify-center text-[10px] leading-none">—</button>
                <button onClick={() => setShowTreatmentPopup(false)} className="w-5 h-4 bg-[#e0e0e0] hover:bg-[#d0d0d0] border border-[#a0a0a0] flex items-center justify-center text-[10px] leading-none">⬜</button>
                <button onClick={() => setShowTreatmentPopup(false)} className="w-5 h-4 bg-[#e0e0e0] hover:bg-red-600 hover:text-white border border-[#a0a0a0] flex items-center justify-center text-[10px] leading-none font-bold">✕</button>
              </div>
            </div>

            {/* Top Tabs Bar */}
            <div className="bg-[#e4e4e4] px-2 pt-1 flex gap-1 border-b border-gray-400 shrink-0 select-none text-[11px]">
              {(['Pt. Info', 'Encounter', 'Physical', 'Hub'] as const).map(tabName => (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => setTreatmentTopTab(tabName)}
                  className={`px-3 py-1 font-bold rounded-t transition-all ${
                    treatmentTopTab === tabName
                      ? 'bg-[#ececec] border-t border-l border-r border-gray-400 text-black shadow-xs -mb-[1px] z-10'
                      : 'bg-[#cfcfcf] border border-gray-400 text-gray-700 hover:bg-[#dcdcdc]'
                  }`}
                >
                  {tabName}
                </button>
              ))}
            </div>

            {/* Classic Cerner Toolbar across top */}
            <div className="bg-[#dcdcdc] px-1.5 py-1 flex items-center justify-between border-b border-[#999999] shadow-xs shrink-0 select-none gap-1 text-[11px] overflow-x-auto">
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { id: 'allergies', label: 'Allergies & Adverse Reactions (A)', icon: <span className="w-4 h-4 rounded-full bg-[#a31c1c] text-white font-bold text-[10px] flex items-center justify-center shadow-xs border border-[#6b1010]">A</span> },
                  { id: 'copy', label: 'Copy Existing Order / Note', icon: <span className="text-[13px] font-black text-[#6d28d9]">📑</span> },
                  { id: 'meds', label: 'Medication Administration Record (Rx)', icon: <span className="text-[14px]">💊</span> },
                  { id: 'vitals', label: 'Clinical Vitals & Assessment', icon: <span className="text-[14px]">🩺</span> },
                  { id: 'docs', label: 'Clinical Documentation & Forms', icon: <span className="text-[14px]">📋</span> },
                  { id: 'notes', label: 'Progress Notes & Clinical Journal', icon: <span className="text-[14px]">📁</span> },
                  { id: 'subjective', label: 'Subjective / Chief Complaint (S)', icon: <span className="font-serif font-bold text-[#0e5a64] text-[14px] leading-none">S</span> },
                  { id: 'surgery', label: 'Surgical Procedures & Interventions', icon: <span className="text-[14px]">✂️</span> },
                  { id: 'review', label: 'Review of Systems & History (R)', icon: <span className="font-serif font-bold text-[#1e6f3d] text-[14px] leading-none">R</span> },
                  { id: 'glasses', label: 'Ophthalmology & Optometry Exams', icon: <span className="text-[14px]">👓</span> },
                  { id: 'remedy', label: 'Therapeutic Remedies & Orders (Re)', icon: <span className="font-serif font-bold text-[#14478f] text-[13px] leading-none">R<sub className="text-[8px] font-sans">e</sub></span> },
                  { id: 'bag', label: 'Clinical Supplies & Equipment Kit', icon: <span className="text-[14px]">💼</span> },
                  { id: 'diagnosis', label: 'Problem List & Diagnoses (Dx)', icon: <span className="font-serif font-bold text-[#333333] text-[13px] leading-none">D<sub className="text-[8px] font-sans">x</sub></span> },
                  { id: 'pinned', label: 'Pinned Orders & Reminders', icon: <span className="text-[14px]">📌</span> },
                  { id: 'schedule', label: 'Patient Schedule & Appointments', icon: <span className="text-[14px]">📅</span> },
                  { id: 'infusion', label: 'IV Infusion & Fluid Management', icon: <span className="text-[14px]">💉</span> },
                  { id: 'labs', label: 'Laboratory Results & Specimen', icon: <span className="text-[14px]">🧪</span> },
                  { id: 'radiology', label: 'Radiology & Imaging Reports', icon: <span className="text-[14px]">🩻</span> },
                  { id: 'alerts', label: 'Patient Alerts & Notifications', icon: <span className="text-[14px]">🔔</span> },
                  { id: 'signoff', label: 'Sign & Document Verification', icon: <span className="text-[14px]">📝</span> },
                  { id: 'echeck', label: 'ePrescribe & eCheck Verification', icon: <span className="relative font-bold text-[#14478f] text-[13px] leading-none">e<span className="absolute -bottom-0.5 -right-1 text-[8.5px] text-[#1b7a2a] font-black">✔</span></span> },
                  { id: 'flowsheet', label: 'Interactive Flowsheets & Tracking', icon: <span className="text-[14px]">📊</span> },
                  { id: 'tasks', label: 'Task List & Action Items (T)', icon: <span className="w-3.5 h-3.5 bg-[#4b3c8c] text-white font-bold text-[9px] flex items-center justify-center rounded-2xs border border-[#31265e]">T</span> },
                  { id: 'folders', label: 'Clinical Files & Folders (F)', icon: <span className="relative text-[13px] flex items-center justify-center">📁<span className="absolute inset-0 flex items-center justify-center text-[7.5px] font-black text-black">F</span></span> },
                  { id: 'billing', label: 'Billing, Charges & Financials ($) - Second Image Icon', icon: <span className="font-bold text-[#186b23] text-[13px] leading-none flex items-center">$<span className="text-[10px]">📄</span></span> },
                  { id: 'specimen', label: 'Specimen Collection & Blood Bank', icon: <span className="text-[14px]">⚗️</span> },
                  { id: 'orderset', label: 'Order Set Catalog (OS)', icon: <span className="w-3.5 h-3.5 rounded-full bg-[#d0d0d0] text-[#333] border border-[#666] font-bold text-[7.5px] flex items-center justify-center">OS</span> }
                ].map((opt, idx) => (
                  <React.Fragment key={opt.id}>
                    <button
                      type="button"
                      title={opt.label}
                      onClick={() => {
                        if (opt.id === 'billing') {
                          // Second image icon clicked inside popup: open Billing Receipt new page!
                          setShowTreatmentPopup(false);
                          setShowPersonSearch(false);
                          selectOrOpenTab('BillingReceipt', 'Billing & Payments Receipt', 'billing-receipt-tab');
                        } else {
                          alert(`Treatment Option: ${opt.label}`);
                        }
                      }}
                      className={`w-[24px] h-[24px] flex items-center justify-center rounded-2xs bg-[#d8d8d8] hover:bg-[#e8e8e8] border transition-all shadow-none cursor-pointer ${
                        opt.id === 'billing'
                          ? 'border-[#186b23] bg-[#e6f4e8] ring-1 ring-[#186b23]/50 animate-pulse'
                          : 'border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-600 hover:border-r-gray-600 active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white'
                      }`}
                    >
                      {opt.icon}
                    </button>
                    {(idx === 4 || idx === 8 || idx === 13 || idx === 18 || idx === 23) && (
                      <div className="w-[2px] h-5 bg-gradient-to-r from-gray-500 to-white mx-0.5 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Rx & Orders Bar */}
            <div className="bg-[#eaeaea] px-2 py-1.5 border-b border-gray-400 flex items-center justify-between text-[11px] shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-800">Rx</span>
                <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded flex items-center gap-1 text-gray-800">
                  <span>Cur Rx</span> <span className="text-[8px]">▼</span>
                </button>
                <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded flex items-center gap-1 text-blue-800 font-bold">
                  <span>+ Add</span> <span className="text-[8px]">▼</span>
                </button>
                <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-red-700 font-bold">
                  - Remove
                </button>
                <div className="w-[1px] h-4 bg-gray-400 mx-1" />
                <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded flex items-center gap-1 text-gray-800">
                  <span>Education</span> <span className="text-[8px]">▼</span>
                </button>
                <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-gray-700">
                  Formulary
                </button>
                <label className="flex items-center gap-1 cursor-pointer select-none ml-1">
                  <input
                    type="checkbox"
                    checked={treatmentPopUpChecked}
                    onChange={(e) => setTreatmentPopUpChecked(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium text-gray-800">Pop Up</span>
                </label>
              </div>

              <div className="flex items-center gap-2 bg-[#dfdfdf] px-2 py-0.5 rounded border border-gray-400">
                <span className="text-gray-700 font-medium">Generate Hx By</span>
                {(['Id', 'Code', 'Group'] as const).map(hx => (
                  <label key={hx} className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="genHx"
                      checked={treatmentGenerateHxBy === hx}
                      onChange={() => setTreatmentGenerateHxBy(hx)}
                    />
                    <span className="font-bold text-gray-800">{hx}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub-Tabs Bar */}
            <div className="bg-[#dcdcdc] px-2 pt-1 flex gap-1 border-b border-gray-400 shrink-0 select-none text-[11px]">
              {(['Gonococcal', 'Others'] as const).map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setTreatmentSubTab(sub)}
                  className={`px-3 py-1 font-bold rounded-t transition-all ${
                    treatmentSubTab === sub
                      ? 'bg-white border-t border-l border-r border-gray-400 text-black shadow-xs -mb-[1px] z-10'
                      : 'bg-[#cfcfcf] border border-gray-400 text-gray-700 hover:bg-[#e2e2e2]'
                  }`}
                >
                  {sub === 'Gonococcal' ? 'Gonococcal infection' : 'Others'}
                </button>
              ))}
            </div>

            {/* Medications Table Grid */}
            <div className="bg-white border-b border-gray-400 h-[135px] overflow-y-auto shrink-0 select-text">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-[#4a5c8c] text-white font-bold sticky top-0">
                  <tr>
                    <th className="p-1 border-r border-[#6a7cac] w-6 text-center">⚠️</th>
                    <th className="p-1 border-r border-[#6a7cac]">Comme</th>
                    <th className="p-1 border-r border-[#6a7cac]">Name</th>
                    <th className="p-1 border-r border-[#6a7cac]">Strength</th>
                    <th className="p-1 border-r border-[#6a7cac]">Formul</th>
                    <th className="p-1 border-r border-[#6a7cac]">Take</th>
                    <th className="p-1 border-r border-[#6a7cac]">Route</th>
                    <th className="p-1 border-r border-[#6a7cac]">Frequenc</th>
                    <th className="p-1 border-r border-[#6a7cac]">Duration</th>
                    <th className="p-1 border-r border-[#6a7cac]">Disp</th>
                    <th className="p-1 border-r border-[#6a7cac]">Refill</th>
                    <th className="p-1 border-r border-[#6a7cac]">Auth</th>
                    <th className="p-1 border-r border-[#6a7cac] text-right">AWP</th>
                    <th className="p-1">Stop Da</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-blue-50 bg-[#fffde8]">
                    <td className="p-1 text-center font-bold text-amber-600">⚠️</td>
                    <td className="p-1 text-gray-600">Initial</td>
                    <td className="p-1 font-bold text-[#0f4471]">Ceftriaxone (ceftriaxone 250 mg IM)</td>
                    <td className="p-1 font-mono">250 mg</td>
                    <td className="p-1 text-emerald-700 font-bold">Formulary</td>
                    <td className="p-1">1 injection</td>
                    <td className="p-1 font-bold">IM</td>
                    <td className="p-1">Once</td>
                    <td className="p-1">1 Day</td>
                    <td className="p-1 text-center">1</td>
                    <td className="p-1 text-center">0</td>
                    <td className="p-1 text-center"><span className="bg-emerald-100 text-emerald-800 px-1 rounded">Auth</span></td>
                    <td className="p-1 text-right font-mono">$45.00</td>
                    <td className="p-1 text-gray-500">02/04/2017</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="p-1 text-center"></td>
                    <td className="p-1 text-gray-600">Adjunct</td>
                    <td className="p-1 font-bold text-[#0f4471]">Azithromycin (azithromycin 1,000 mg PO)</td>
                    <td className="p-1 font-mono">1,000 mg</td>
                    <td className="p-1 text-emerald-700 font-bold">Formulary</td>
                    <td className="p-1">1 packet</td>
                    <td className="p-1 font-bold">PO</td>
                    <td className="p-1">Once</td>
                    <td className="p-1">1 Day</td>
                    <td className="p-1 text-center">1</td>
                    <td className="p-1 text-center">0</td>
                    <td className="p-1 text-center"><span className="bg-emerald-100 text-emerald-800 px-1 rounded">Auth</span></td>
                    <td className="p-1 text-right font-mono">$28.50</td>
                    <td className="p-1 text-gray-500">02/04/2017</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Three Lower Panels: Labs, Diagnostic Imaging, Procedures */}
            <div className="grid grid-cols-3 gap-1 bg-[#d0d0d0] p-1 h-[130px] shrink-0 border-b border-gray-400">
              {/* Labs */}
              <div className="bg-white border border-gray-400 flex flex-col overflow-hidden">
                <div className="bg-[#4a5c8c] text-white px-2 py-0.5 font-bold flex justify-between items-center text-[11px] shrink-0">
                  <span>Labs</span>
                  <button className="bg-[#e0e0e0] text-gray-800 border border-gray-400 px-1.5 py-0 rounded text-[9.5px]">Browse...</button>
                </div>
                <div className="flex-1 p-1.5 overflow-y-auto text-gray-400 italic text-[11px]">
                  No active laboratory orders selected.
                </div>
              </div>

              {/* Diagnostic Imaging */}
              <div className="bg-white border border-gray-400 flex flex-col overflow-hidden">
                <div className="bg-[#4a5c8c] text-white px-2 py-0.5 font-bold flex justify-between items-center text-[11px] shrink-0">
                  <span>Diagnostic Imaging</span>
                  <button className="bg-[#e0e0e0] text-gray-800 border border-gray-400 px-1.5 py-0 rounded text-[9.5px]">Browse...</button>
                </div>
                <div className="flex-1 p-1.5 overflow-y-auto font-medium text-gray-800 space-y-1">
                  <div className="p-1 bg-blue-50 border border-blue-200 rounded font-bold text-[#0f4471]">
                    Ultrasound : (OB) Complete After 1...
                  </div>
                </div>
              </div>

              {/* Procedures */}
              <div className="bg-white border border-gray-400 flex flex-col overflow-hidden">
                <div className="bg-[#4a5c8c] text-white px-2 py-0.5 font-bold flex justify-between items-center text-[11px] shrink-0">
                  <span>Procedures</span>
                  <button className="bg-[#e0e0e0] text-gray-800 border border-gray-400 px-1.5 py-0 rounded text-[9.5px]">Browse...</button>
                </div>
                <div className="flex-1 p-1.5 overflow-y-auto text-gray-400 italic text-[11px]">
                  No procedure items recorded.
                </div>
              </div>
            </div>

            {/* Bottom Notes & Action Section */}
            <div className="flex-1 bg-[#e4e4e4] p-1.5 flex flex-col gap-1 overflow-hidden">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-800">Notes</span>
                  <button className="bg-white border border-gray-400 px-2 py-0.5 rounded font-bold text-gray-800 flex items-center gap-1">
                    <span>Clinical Notes</span> <span className="text-[8px]">▼</span>
                  </button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-gray-800">Browse...</button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-gray-800">Spell chk</button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-gray-800">Clr</button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-blue-800 font-bold">▲</button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-gray-800">Outgoing Referral</button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-gray-800">eCliniSense</button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded text-gray-800">Add Info</button>
                  <button className="bg-[#dcdcdc] hover:bg-[#e8e8e8] border border-gray-400 px-2 py-0.5 rounded font-bold text-blue-900 border-b-2 border-b-blue-800">New Action</button>
                </div>
              </div>
              <textarea
                className="w-full flex-1 bg-white border border-gray-400 p-1.5 font-sans text-[11px] text-gray-800 focus:outline-none resize-none"
                defaultValue="Patient presenting for routine OB evaluation and follow-up on diagnostic imaging. Ultrasound completed satisfactorily. All prescriptions reviewed and authorized."
              />
            </div>

            {/* Bottom Footer Bar */}
            <div className="bg-[#d8d8d8] px-2 py-1.5 border-t border-gray-400 flex justify-between items-center text-[11px] shrink-0">
              <div className="flex items-center gap-1.5">
                <button className="bg-[#eaeaea] hover:bg-white border border-gray-400 px-2.5 py-1 rounded font-bold text-gray-800 flex items-center gap-1">
                  <span>◄</span> <span>Preventive Med</span>
                </button>
                <button className="bg-[#eaeaea] hover:bg-white border border-gray-400 px-2.5 py-1 rounded font-bold text-gray-800 flex items-center gap-1">
                  <span>Print Orders</span> <span className="text-[8px]">▼</span>
                </button>
                <button className="bg-[#eaeaea] hover:bg-white border border-gray-400 px-2.5 py-1 rounded font-bold text-gray-800 flex items-center gap-1">
                  <span>Send Rx</span> <span className="text-[8px]">▼</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button className="bg-[#c4c4c4] border border-gray-500 px-4 py-1 rounded font-bold text-gray-800 shadow-inner">
                  Allergies
                </button>
                <button className="bg-white border border-gray-400 px-4 py-1 rounded font-bold text-gray-800 hover:bg-gray-50">
                  Interaction
                </button>
              </div>

              <div>
                <button className="bg-[#eaeaea] hover:bg-white border border-gray-400 px-4 py-1 rounded font-bold text-gray-800 flex items-center gap-1.5">
                  <span>CDSS</span> <span>►</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Person Search Modal Overlay */}
      {showPersonSearch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs select-none">
          <div 
            className="bg-[#f0f0f0] w-[1050px] h-[650px] rounded shadow-2xl border border-gray-400 flex flex-col overflow-hidden text-[10.5px] font-sans text-[#333333] absolute"
            style={{ 
              top: psModalPos.x === -1 ? '50%' : psModalPos.y,
              left: psModalPos.x === -1 ? '50%' : psModalPos.x,
              transform: psModalPos.x === -1 ? 'translate(-50%, -50%)' : 'none',
            }}
          >
            
            {/* Title Bar */}
            <div 
              className="bg-[#f2b744] text-black px-3 py-1 flex justify-between items-center border-b border-[#c89228] select-none shrink-0 h-[28px] cursor-move"
              onMouseDown={handlePsDragStart}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-[12px]">👥</span>
                <span>Person Search</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="hover:bg-black/10 w-5 h-5 flex items-center justify-center rounded-sm font-bold text-[10px]">—</button>
                <button className="hover:bg-black/10 w-5 h-5 flex items-center justify-center rounded-sm font-bold text-[10px]">⬜</button>
                <button 
                  onClick={() => { setShowPersonSearch(false); setPsModalPos({ x: -1, y: -1 }); }}
                  className="hover:bg-red-600 hover:text-white w-5 h-5 flex items-center justify-center rounded-sm font-bold text-[11px]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Classic Cerner Toolbar & Tab Bar (replacing standard tab bar) */}
            <div className="bg-[#dcdcdc] px-1.5 py-1 flex items-center justify-between border-b border-[#999999] shadow-xs shrink-0 select-none gap-1 text-[11px] overflow-x-auto">
              <div className="flex items-center gap-1 flex-wrap">
                {/* Person & Guarantor Tabs styled as classic pressed/unpressed buttons */}
                <button 
                  onClick={() => setPsActiveTab('Person')}
                  className={`px-2.5 py-1 font-bold rounded-2xs transition-all flex items-center gap-1 border ${
                    psActiveTab === 'Person'
                      ? 'bg-[#f0f0f0] border-t-gray-600 border-l-gray-600 border-b-white border-r-white text-black shadow-inner'
                      : 'bg-[#d8d8d8] border-t-white border-l-white border-b-gray-600 border-r-gray-600 hover:bg-[#e4e4e4] text-gray-800'
                  }`}
                >
                  <span>Person</span>
                </button>
                <button 
                  onClick={() => setPsActiveTab('Guarantor')}
                  className={`px-2.5 py-1 font-bold rounded-2xs transition-all flex items-center gap-1 border ${
                    psActiveTab === 'Guarantor'
                      ? 'bg-[#f0f0f0] border-t-gray-600 border-l-gray-600 border-b-white border-r-white text-black shadow-inner'
                      : 'bg-[#d8d8d8] border-t-white border-l-white border-b-gray-600 border-r-gray-600 hover:bg-[#e4e4e4] text-gray-800'
                  }`}
                >
                  <span>Guarantor</span>
                </button>

                {/* Classic Etched Divider */}
                <div className="w-[2px] h-5 bg-gradient-to-r from-gray-500 to-white mx-0.5 shrink-0" />

                {/* Classic Cerner PowerChart Toolbar Options (Image 1 style) */}
                {[
                  { id: 'allergies', label: 'Allergies & Adverse Reactions', icon: <span className="w-4 h-4 rounded-full bg-[#b31414] text-white font-bold text-[10px] flex items-center justify-center leading-none border border-[#7a0d0d] shadow-2xs">A</span> },
                  { id: 'copy', label: 'Copy / Clinical Documents', icon: <span className="text-[14px]">📑</span> },
                  { id: 'meds', label: 'Medication Administration Record (MAR)', icon: <span className="text-[14px]">💊</span> },
                  { id: 'vitals', label: 'Vitals & Measurements', icon: <span className="text-[14px]">🩺</span> },
                  { id: 'review', label: 'Review & Results Summary', icon: <span className="text-[14px]">📋</span> },
                  { id: 'chart', label: 'Patient Chart & History', icon: <span className="text-[14px] flex items-center">📁<sub className="text-[9px] -ml-1">👤</sub></span> },
                  { id: 'summary', label: 'Clinical Summary (S)', icon: <span className="font-serif font-black text-[#0f606b] text-[14px] leading-none">S</span> },
                  { id: 'surgery', label: 'Surgical Procedures & Notes', icon: <span className="text-[14px]">✂️</span> },
                  { id: 'orders', label: 'PowerOrders (R)', icon: <span className="font-serif font-black text-[#1e7a2b] text-[14px] leading-none">R</span> },
                  { id: 'vision', label: 'Ophthalmology / Vision Care', icon: <span className="text-[14px]">👓</span> },
                  { id: 'renewals', label: 'Prescription Renewals (Re)', icon: <span className="font-serif font-bold text-[#1a5c41] text-[13px] leading-none flex items-baseline">R<sub className="text-[9px]">e</sub></span> },
                  { id: 'emergency', label: 'Emergency / First Aid Record', icon: <span className="text-[14px]">🧰</span> },
                  { id: 'diagnosis', label: 'Problem List & Diagnosis (Dx)', icon: <span className="font-serif font-black text-[#111111] text-[13px] leading-none flex items-baseline">D<sub className="text-[9.5px]">x</sub></span> },
                  { id: 'pinned', label: 'Pinned Orders & Reminders', icon: <span className="text-[14px]">📌</span> },
                  { id: 'schedule', label: 'Patient Schedule & Appointments', icon: <span className="text-[14px]">📅</span> },
                  { id: 'infusion', label: 'IV Infusion & Fluid Management', icon: <span className="text-[14px]">💉</span> },
                  { id: 'labs', label: 'Laboratory Results & Specimen', icon: <span className="text-[14px]">🧪</span> },
                  { id: 'radiology', label: 'Radiology & Imaging Reports', icon: <span className="text-[14px]">🩻</span> },
                  { id: 'alerts', label: 'Patient Alerts & Notifications', icon: <span className="text-[14px]">🔔</span> },
                  { id: 'signoff', label: 'Sign & Document Verification', icon: <span className="text-[14px]">📝</span> },
                  { id: 'echeck', label: 'ePrescribe & eCheck Verification', icon: <span className="relative font-bold text-[#14478f] text-[13px] leading-none">e<span className="absolute -bottom-0.5 -right-1 text-[8.5px] text-[#1b7a2a] font-black">✔</span></span> },
                  { id: 'flowsheet', label: 'Interactive Flowsheets & Tracking', icon: <span className="text-[14px]">📊</span> },
                  { id: 'tasks', label: 'Task List & Action Items (T)', icon: <span className="w-3.5 h-3.5 bg-[#4b3c8c] text-white font-bold text-[9px] flex items-center justify-center rounded-2xs border border-[#31265e]">T</span> },
                  { id: 'folders', label: 'Clinical Files & Folders (F)', icon: <span className="relative text-[13px] flex items-center justify-center">📁<span className="absolute inset-0 flex items-center justify-center text-[7.5px] font-black text-black">F</span></span> },
                  { id: 'billing', label: 'Billing, Charges & Financials ($)', icon: <span className="font-bold text-[#186b23] text-[13px] leading-none flex items-center">$<span className="text-[10px]">📄</span></span> },
                  { id: 'specimen', label: 'Specimen Collection & Blood Bank', icon: <span className="text-[14px]">⚗️</span> },
                  { id: 'orderset', label: 'Order Set Catalog (OS)', icon: <span className="w-3.5 h-3.5 rounded-full bg-[#d0d0d0] text-[#333] border border-[#666] font-bold text-[7.5px] flex items-center justify-center">OS</span> }
                ].map((opt, idx) => (
                  <React.Fragment key={opt.id}>
                    <button
                      type="button"
                      title={opt.label}
                      onClick={() => {
                        if (opt.id === 'billing') {
                          setShowTreatmentPopup(true);
                        } else {
                          alert(`Cerner Option: ${opt.label}`);
                        }
                      }}
                      className="w-[24px] h-[24px] flex items-center justify-center rounded-2xs bg-[#d8d8d8] hover:bg-[#e8e8e8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-600 hover:border-r-gray-600 active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white transition-all shadow-none cursor-pointer"
                    >
                      {opt.icon}
                    </button>
                    {(idx === 4 || idx === 8 || idx === 13 || idx === 18 || idx === 23) && (
                      <div className="w-[2px] h-5 bg-gradient-to-r from-gray-500 to-white mx-0.5 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Info Message Bar */}
            <div className="bg-[#ebf3fc] border-b border-gray-300 px-3 py-2 flex justify-between items-center text-[#0f4471] font-medium shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] bg-blue-100 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center font-bold">i</span>
                <span>Turning on the Assume Wildcards setting will reduce search strength.</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-[12px]">⛶</button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden bg-[#f0f0f0]">
              
              {/* Left Pane (Search Form) */}
              <div className="w-[280px] border-r border-gray-300 p-3 flex flex-col justify-between shrink-0 bg-[#f0f0f0]">
                <div className="space-y-2.5">
                  {/* Search Method Dropdown */}
                  <div className="space-y-0.5">
                    <label className="font-semibold text-gray-700">Search Method</label>
                    <select
                      value={psSearchMethod}
                      onChange={(e) => setPsSearchMethod(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black font-semibold"
                    >
                      <option value="Name">Name (First/Last)</option>
                      <option value="AxioID">Axio ID (UHID)</option>
                      <option value="TokenNumber">Token Number (MRN)</option>
                      <option value="MRN">Person / MRN Identifier</option>
                    </select>
                  </div>

                  {psSearchMethod === 'Name' && (
                    <>
                      <div className="space-y-0.5">
                        <label className="font-semibold text-gray-700">Last Name</label>
                        <input 
                          type="text" 
                          value={psLastName}
                          onChange={(e) => setPsLastName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                          className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="font-semibold text-gray-700">First Name</label>
                        <input 
                          type="text" 
                          value={psFirstName}
                          onChange={(e) => setPsFirstName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                          className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                        />
                      </div>
                    </>
                  )}

                  {psSearchMethod === 'AxioID' && (
                    <div className="space-y-0.5">
                      <label className="font-semibold text-gray-700">Axio ID (UHID)</label>
                      <input 
                        type="text" 
                        value={psAxioId}
                        placeholder="e.g. AVX-000123"
                        onChange={(e) => setPsAxioId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                        className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                      />
                    </div>
                  )}

                  {psSearchMethod === 'TokenNumber' && (
                    <div className="space-y-0.5">
                      <label className="font-semibold text-gray-700">Token Number (MRN)</label>
                      <input 
                        type="text" 
                        value={psTokenNumber}
                        placeholder="e.g. 1000245678"
                        onChange={(e) => setPsTokenNumber(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                        className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                      />
                    </div>
                  )}

                  {psSearchMethod === 'MRN' && (
                    <div className="space-y-0.5">
                      <label className="font-semibold text-gray-700">Person Identifiers</label>
                      <input 
                        type="text" 
                        value={psPersonIdentifier}
                        onChange={(e) => setPsPersonIdentifier(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                        className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                      />
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <label className="font-semibold text-gray-700">Birth Date</label>
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        value={psBirthDate}
                        placeholder="DD/MM/YYYY"
                        onChange={(e) => setPsBirthDate(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                        className="flex-1 bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                      />
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-2 rounded-sm text-[11px] font-bold text-gray-600">📅</button>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="font-semibold text-gray-700">Any Phone Number</label>
                    <input 
                      type="text" 
                      value={psPhoneNumber}
                      onChange={(e) => setPsPhoneNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                      className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="font-semibold text-gray-700">Encounter Identifiers</label>
                    <input 
                      type="text" 
                      value={psEncounterIdentifier}
                      onChange={(e) => setPsEncounterIdentifier(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePsSearch()}
                      className="w-full bg-white border border-gray-300 rounded-sm px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 text-black" 
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 select-none">
                  <button 
                    onClick={handlePsSearch}
                    className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 active:bg-gray-100 text-black font-semibold py-1.5 rounded-sm shadow-xs text-[11px] transition-all"
                  >
                    Search...
                  </button>
                  <button 
                    onClick={handlePsClear}
                    className="bg-white hover:bg-gray-50 border border-gray-300 active:bg-gray-100 text-gray-700 font-semibold py-1.5 px-4 rounded-sm shadow-xs text-[11px] transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Right Pane (Results Tables) */}
              <div className="flex-1 p-3 flex flex-col gap-3 min-w-0 bg-[#f0f0f0]">
                
                {/* Upper Table (Person List) */}
                <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-300 rounded-sm overflow-hidden">
                  
                  {/* Table Header Controls */}
                  <div className="bg-[#fafafa] border-b border-gray-300 px-2 py-1 flex justify-between items-center text-[10px] font-bold text-gray-600 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#0f4471]">Person</span>
                      <button 
                        onClick={() => {
                          selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab');
                          setShowPersonSearch(false);
                        }}
                        className="hover:text-blue-900 flex items-center gap-0.5"
                      >
                        <span>➕</span> Add
                      </button>
                      <button className="hover:text-blue-900 flex items-center gap-0.5"><span>🔍</span> Preview</button>
                    </div>
                    <button 
                      onClick={() => setPsShowSettings(prev => !prev)}
                      className={`text-blue-800 hover:underline flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
                        psShowSettings ? 'bg-blue-100 border-blue-400 font-bold' : 'border-transparent'
                      }`}
                    >
                      ⚙️ Search Settings
                    </button>
                  </div>

                  {/* Results Grid */}
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-[#f0f4f8] text-gray-700 border-b border-gray-300 sticky top-0 font-bold select-none">
                          <th className="p-1.5 border-r border-gray-200">Name</th>
                          <th className="p-1.5 border-r border-gray-200">MRN</th>
                          <th className="p-1.5 border-r border-gray-200">Date of Birth</th>
                          <th className="p-1.5 border-r border-gray-200">Sex</th>
                          <th className="p-1.5 border-r border-gray-200">Age</th>
                          <th className="p-1.5 border-r border-gray-200">Account Number</th>
                          <th className="p-1.5">Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-black">
                        {psResults.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-4 text-center text-gray-400 italic">No search results. Enter parameters and click Search...</td>
                          </tr>
                        ) : (
                          psResults.map((p, idx) => (
                            <tr 
                              key={p.mrn}
                              onClick={() => setPsSelectedPersonIndex(idx)}
                              onDoubleClick={handlePsSelect}
                              onContextMenu={(e) => handlePsContextMenu(e, idx)}
                              className={`cursor-pointer transition-colors ${
                                psSelectedPersonIndex === idx 
                                  ? 'bg-[#0f4471] text-white hover:bg-[#0c3a61]' 
                                  : 'hover:bg-blue-50/50'
                              }`}
                            >
                              <td className="p-1.5 border-r border-gray-200 truncate max-w-[150px]">{p.name}</td>
                              <td className="p-1.5 border-r border-gray-200 font-mono font-semibold">{p.mrn}</td>
                              <td className="p-1.5 border-r border-gray-200">{p.dob}</td>
                              <td className="p-1.5 border-r border-gray-200">{p.ageGender?.split(' / ')[1] || 'Male'}</td>
                              <td className="p-1.5 border-r border-gray-200">{p.ageGender?.split(' / ')[0] || '45 Y'}</td>
                              <td className="p-1.5 border-r border-gray-200 font-mono text-gray-500">{p.uhid}</td>
                              <td className="p-1.5 truncate max-w-[200px]">{p.location || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lower Table (Encounter List) */}
                <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-300 rounded-sm overflow-hidden">
                  <div className="bg-[#fafafa] border-b border-gray-300 px-2 py-1 flex items-center text-[10px] font-bold text-gray-600 shrink-0">
                    <span className="text-[#0f4471]">Encounter</span>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-[#f0f4f8] text-gray-700 border-b border-gray-300 sticky top-0 font-bold select-none">
                          <th className="p-1.5 border-r border-gray-200">Encounter</th>
                          <th className="p-1.5 border-r border-gray-200">Facility</th>
                          <th className="p-1.5 border-r border-gray-200">Encounter Type</th>
                          <th className="p-1.5 border-r border-gray-200">Date of Service</th>
                          <th className="p-1.5 border-r border-gray-200">Resource</th>
                          <th className="p-1.5 border-r border-gray-200">Guarantor</th>
                          <th className="p-1.5">Discharge Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-black">
                        {psSelectedPersonIndex === null || psResults.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-4 text-center text-gray-400 italic">Select a person to view encounters.</td>
                          </tr>
                        ) : (
                          getSelectedPersonEncounters().map((enc, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="p-1.5 border-r border-gray-200 font-mono font-bold text-blue-900">{enc.encounter}</td>
                              <td className="p-1.5 border-r border-gray-200">{enc.facility}</td>
                              <td className="p-1.5 border-r border-gray-200">{enc.type}</td>
                              <td className="p-1.5 border-r border-gray-200">{enc.dateOfService}</td>
                              <td className="p-1.5 border-r border-gray-200">{enc.resource}</td>
                              <td className="p-1.5 border-r border-gray-200">{enc.guarantor}</td>
                              <td className="p-1.5">{enc.dischargeDate}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-[#cbd8e3]/40 border-t border-gray-300 p-2.5 flex justify-between items-center select-none shrink-0">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={psAssumeWildcards}
                    onChange={(e) => setPsAssumeWildcards(e.target.checked)}
                    className="rounded-sm w-3.5 h-3.5 border-gray-300 text-[#0f4471] focus:ring-[#0f4471]" 
                  />
                  <span>Assume Wildcards</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handlePsSelect}
                  disabled={psSelectedPersonIndex === null}
                  className={`font-semibold py-1 px-5 rounded-sm border shadow-xs text-[11px] transition-all ${
                    psSelectedPersonIndex === null
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50 border-gray-300 text-black active:bg-gray-100'
                  }`}
                >
                  Select
                </button>
                <button 
                  onClick={() => { setShowPersonSearch(false); setPsModalPos({ x: -1, y: -1 }); }}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-1 px-5 rounded-sm shadow-xs text-[11px] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Search Customization Settings Panel */}
            {psShowSettings && (
              <div className="absolute top-[28px] right-0 bottom-[40px] w-[320px] bg-white border-l border-gray-300 shadow-xl z-30 flex flex-col p-4 font-sans select-none text-[11px] text-gray-800">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <h3 className="font-bold text-[#0f4471] text-[12px] flex items-center gap-1">
                    <span>⚙️</span> Search Customization
                  </h3>
                  <button 
                    onClick={() => setPsShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600 font-bold text-[14px]"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  <div className="space-y-1">
                    <label className="font-bold block text-gray-700">Default Search Method</label>
                    <select
                      value={psSettingsDefaultMethod}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPsSettingsDefaultMethod(val);
                        setPsSearchMethod(val);
                      }}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                    >
                      <option value="Name">Name (First/Last)</option>
                      <option value="AxioID">Axio ID (UHID)</option>
                      <option value="TokenNumber">Token Number (MRN)</option>
                      <option value="MRN">Person / MRN Identifier</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold block text-gray-700">Max Results Limit</label>
                    <select
                      value={psSettingsMaxResults}
                      onChange={(e) => setPsSettingsMaxResults(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                    >
                      <option value="25">25 Results</option>
                      <option value="50">50 Results</option>
                      <option value="100">100 Results</option>
                      <option value="All">All Results (No Limit)</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input 
                        type="checkbox"
                        checked={psSettingsAutoWildcard}
                        onChange={(e) => {
                          setPsSettingsAutoWildcard(e.target.checked);
                          setPsAssumeWildcards(e.target.checked);
                        }}
                        className="rounded text-[#0f4471] focus:ring-[#0f4471]"
                      />
                      <span>Automatic Wildcards (Appends %)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input 
                        type="checkbox"
                        checked={psSettingsSearchOnType}
                        onChange={(e) => setPsSettingsSearchOnType(e.target.checked)}
                        className="rounded text-[#0f4471] focus:ring-[#0f4471]"
                      />
                      <span>Live Search (Search on type)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input 
                        type="checkbox"
                        checked={psSettingsShowInactive}
                        onChange={(e) => setPsSettingsShowInactive(e.target.checked)}
                        className="rounded text-[#0f4471] focus:ring-[#0f4471]"
                      />
                      <span>Show Inactive/Discharged Patients</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setPsSettingsDefaultMethod('Name');
                      setPsSettingsMaxResults('50');
                      setPsSettingsAutoWildcard(true);
                      setPsSettingsSearchOnType(false);
                      setPsSettingsShowInactive(false);
                      setPsSearchMethod('Name');
                      setPsAssumeWildcards(true);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded font-semibold text-center transition-colors"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={() => setPsShowSettings(false)}
                    className="flex-1 bg-[#0f4471] hover:bg-[#0b3355] text-white py-1.5 rounded font-semibold text-center transition-colors"
                  >
                    Apply Settings
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Prescription Renewal Modal Overlay */}
      {showPrescriptionRenewal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
          <div className="bg-white w-[900px] h-[600px] rounded shadow-2xl border border-gray-400 flex flex-col overflow-hidden text-[11px] font-sans text-[#333333]">
            
            {/* Title Bar */}
            <div className="bg-[#0f4471] text-white px-3 py-1.5 flex justify-between items-center border-b border-[#0d3455] select-none shrink-0 h-[32px]">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-[12px]">📄</span>
                <span>Prescription Renewal</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowPrescriptionRenewal(false)}
                  className="hover:bg-red-600 hover:text-white w-5 h-5 flex items-center justify-center rounded-sm font-bold text-[11px]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
              
              {/* Main Heading */}
              <div className="border-b border-gray-300 pb-1.5 mb-4">
                <h1 className="text-[18px] font-bold text-gray-900 font-sans tracking-wide">Prescription Renewal</h1>
              </div>

              {/* To field */}
              <div className="flex items-center gap-4 text-gray-800 text-[11px] font-medium mb-3">
                <span className="w-10 text-gray-500 text-right">To</span>
                <input 
                  type="text" 
                  value={prescriptionSearchTo}
                  onChange={(e) => setPrescriptionSearchTo(e.target.value)}
                  placeholder="Search" 
                  className="border border-gray-300 rounded px-2 py-1 w-[400px] focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              {/* Messaging Policies Alert Box */}
              <div className="bg-[#eef5fc] border border-[#a2c5eb] text-gray-800 rounded p-4 space-y-1">
                <div className="font-bold text-[12px]">
                  Messaging Policies <span className="text-blue-700 hover:underline cursor-pointer">(show details)</span>
                </div>
                <div>Do not use messaging for urgent matters.</div>
                <div>Normal turn-around time is one business day.</div>
              </div>

              {/* fieldset Prescription(s) to be Renewed */}
              <div className="border border-gray-300 rounded p-4 relative pt-5 mt-5">
                <span className="absolute -top-2.5 left-4 bg-white px-2 text-[#0f4471] font-semibold text-[11px] border border-gray-200 shadow-2xs rounded-sm">
                  Prescription(s) to be Renewed
                </span>

                <div className="space-y-4">
                  {/* Note block */}
                  <div className="bg-[#f5f5f5] border border-gray-300 p-3 rounded text-gray-700 leading-relaxed">
                    <div>To renew a prescription, enter the medication information below.</div>
                    <div className="text-gray-500 font-medium">(To enter multiple prescriptions, click Add Another Prescription.)</div>
                  </div>

                  {/* Inputs Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-[2fr_1.2fr_1.2fr_2fr_1fr] gap-3 text-gray-600 font-bold uppercase tracking-wider text-[9px] select-none pl-1">
                      <div>*Medication</div>
                      <div>Dose</div>
                      <div>Frequency</div>
                      <div>Reason</div>
                      <div>Quantity</div>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {prescriptions.map((p, idx) => (
                        <div key={idx} className="grid grid-cols-[2fr_1.2fr_1.2fr_2fr_1fr] gap-3">
                          <input 
                            type="text" 
                            value={p.medication}
                            onChange={(e) => updatePrescriptionRow(idx, 'medication', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <input 
                            type="text" 
                            value={p.dose}
                            onChange={(e) => updatePrescriptionRow(idx, 'dose', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <input 
                            type="text" 
                            value={p.frequency}
                            onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <input 
                            type="text" 
                            value={p.reason}
                            onChange={(e) => updatePrescriptionRow(idx, 'reason', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <input 
                            type="text" 
                            value={p.quantity}
                            onChange={(e) => updatePrescriptionRow(idx, 'quantity', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Another Prescription Button */}
                  <button 
                    onClick={addPrescriptionRow}
                    className="border border-gray-400 bg-gradient-to-b from-gray-50 to-gray-200 hover:from-gray-100 hover:to-gray-300 text-gray-800 px-3 py-1 font-semibold rounded shadow-2xs active:from-gray-200 active:to-gray-100 transition-all text-[10.5px]"
                  >
                    Add Another Prescription
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-[#cbd8e3]/45 border-t border-gray-300 p-2.5 flex justify-end gap-2 select-none shrink-0">
              <button 
                onClick={handlePrescriptionSubmit}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-[#0f4471] font-bold py-1 px-5 rounded-sm shadow-xs text-[11px] transition-all"
              >
                Submit Request
              </button>
              <button 
                onClick={() => setShowPrescriptionRenewal(false)}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-1 px-5 rounded-sm shadow-xs text-[11px] transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {psContextMenu.visible && (
        <div 
          className="fixed z-[9999] bg-white border border-gray-300 py-1 shadow-lg text-[#333333] text-[11.5px] font-sans rounded-xs select-none w-auto"
          style={{ 
            top: psContextMenu.y, 
            left: psContextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: 'Confirm...', action: () => alert('Confirm clicked') },
            { label: 'Contact...', action: () => alert('Contact clicked') },
            { label: 'Modify...', action: () => alert('Modify clicked') },
            { label: 'Reschedule', action: () => alert('Reschedule clicked') },
            { label: 'Hold...', action: () => alert('Hold clicked') },
            { label: 'Cancel...', action: () => alert('Cancel clicked') },
            { label: 'No Show...', action: () => alert('No Show clicked') },
            { divider: true },
            { label: 'Check In...', action: () => alert('Check In clicked') },
            { label: 'Check Out...', action: () => alert('Check Out clicked') },
            { label: 'Patient Seen...', action: () => alert('Patient Seen clicked') },
            { label: 'Batch Reschedule', action: () => alert('Batch Reschedule clicked') },
            { divider: true },
            { label: 'Group Info...', action: () => alert('Group Info clicked') },
            { label: 'Verify...', action: () => alert('Verify clicked') },
            { label: 'Med Nec Check...', action: () => alert('Med Nec Check clicked') },
            { divider: true },
            { label: 'Lock...', action: () => alert('Lock clicked') },
            { label: 'Unlock...', action: () => alert('Unlock clicked') },
            { label: 'Add New Appointment', action: () => alert('Add New Appointment clicked') },
            { divider: true },
            { label: 'Request', submenu: true },
            { label: 'Inquiry', submenu: true },
            { label: 'Notifications...', action: () => alert('Notifications clicked') },
            { label: 'Superbill...', action: () => alert('Superbill clicked') },
            { divider: true },
            { label: 'Person', submenu: true },
            { divider: true },
            { label: 'Link...', submenu: true },
            { label: 'Unlink...', action: () => alert('Unlink clicked') }
          ].map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="border-t border-gray-200 my-1" />;
            }
            return (
              <div 
                key={idx}
                onClick={() => {
                  if (item.action) item.action();
                  setPsContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="px-3 py-1 hover:bg-[#004b75] hover:text-white cursor-pointer flex justify-between items-center gap-4 transition-colors text-gray-800 text-[11.5px] whitespace-nowrap"
              >
                <span>{item.label}</span>
                {item.submenu && <span className="text-[9px] text-gray-400">▶</span>}
              </div>
            );
          })}
        </div>
      )}

      {contextMenu && contextMenu.visible && (
        <div 
          className="fixed bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[190px] shadow-lg rounded-none select-none z-[9999] text-left py-0.5"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Patient Snapshot clicked')}>Patient Snapshot...</div>
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Provider Information clicked')}>Provider Information...</div>
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Visit List clicked')}>Visit List...</div>
          
          <div className="border-t border-[#e2e2e2] my-0.5"></div>
          
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white text-gray-400 cursor-not-allowed">Inactivate Relationship...</div>
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Add/View Sticky Notes clicked')}>Add/View Sticky Notes...</div>
          
          <div className="border-t border-[#e2e2e2] my-0.5"></div>
          
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Sort clicked')}>Sort...</div>
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Hide clicked')}>Hide</div>
          <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Customize Columns clicked')}>Customize Columns...</div>
          
          <div className="border-t border-[#e2e2e2] my-0.5"></div>
          
          {/* Add to a Patient List (with hover submenu) */}
          <div className="relative group/addlist px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer flex justify-between items-center">
            <span>Add to a Patient List</span>
            <span className="text-[8px] text-gray-500 group-hover/addlist:text-white">▶</span>
            <div className="absolute left-full top-0 ml-0.5 hidden group-hover/addlist:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[120px] shadow-md rounded-none select-none z-[10000]">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Added to My List')}>My List</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer group/copy" onClick={() => alert('Copied patients')}>
            <span>Copy</span>
            <span className="text-[10px] text-gray-400 group-hover/copy:text-blue-100">Ctrl+C</span>
          </div>
          <div className="flex justify-between items-center px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer group/paste" onClick={() => alert('Pasted patients')}>
            <span>Paste</span>
            <span className="text-[10px] text-gray-400 group-hover/paste:text-blue-100">Ctrl+V</span>
          </div>
          
          <div className="border-t border-[#e2e2e2] my-0.5"></div>
          
          {/* Open Patient Chart (with hover submenu) */}
          <div className="relative group/openchart px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer flex justify-between items-center">
            <span>Open Patient Chart</span>
            <span className="text-[8px] text-gray-500 group-hover/openchart:text-white">▶</span>
            <div className="absolute left-full top-0 ml-0.5 hidden group-hover/openchart:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[160px] shadow-md rounded-none select-none z-[10000]">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Opening Active Chart')}>Active Chart</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white cursor-pointer" onClick={() => alert('Opening All Charts')}>All Charts</div>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Outpatient Order Reconciliation Popup (Exact 1:1 Replica of Cerner PowerChart) */}
      {isReconcileOpen && (
        <div 
          className="fixed bg-white border-2 border-[#194d7b] shadow-2xl rounded-none w-[1040px] max-h-[92vh] flex flex-col select-none z-[99990] overflow-hidden text-[10.5px] text-gray-800 font-sans"
          style={{ left: `${reconcilePos.x}px`, top: `${reconcilePos.y}px` }}
        >
          {/* Window Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingReconcile(true);
              setDragOffset({ x: e.clientX - reconcilePos.x, y: e.clientY - reconcilePos.y });
            }}
            className="bg-gradient-to-r from-[#194d7b] via-[#216298] to-[#194d7b] text-white px-2 py-1 flex justify-between items-center cursor-move font-semibold text-[11.5px] border-b border-[#0d365a]"
          >
            <div className="flex items-center gap-1.5">
              <span className="bg-[#0b3c66] text-white font-bold px-1.5 py-0.2 rounded text-[10px] border border-sky-300 shadow-sm">P</span>
              <span className="tracking-wide">Order Reconciliation: Outpatient - TESTPROD, ONE</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <button className="hover:bg-white/20 px-1.5 rounded transition-colors leading-none pb-0.5">_</button>
              <button className="hover:bg-white/20 px-1.5 rounded transition-colors leading-none pb-0.5">□</button>
              <button onClick={() => setIsReconcileOpen(false)} className="hover:bg-red-600 px-1.5 rounded transition-colors leading-none pb-0.5">✕</button>
            </div>
          </div>

          {/* Demographics Dark Navy/Teal Banner */}
          <div className="bg-[#0d4778] text-white px-2.5 py-2 border-b border-[#082d4c] flex items-start justify-between gap-4 text-[10px] leading-tight">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 border border-white/30 rounded p-1 flex items-center justify-center w-[40px] h-[40px] shadow-inner">
                <span className="text-2xl">👤</span>
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-[11.5px] tracking-wide text-white">TESTPROD, ONE</div>
                <div>Patient Portal: <strong className="text-white">YES</strong></div>
                <div>Loc: <strong className="text-white">CHC Willard</strong></div>
              </div>
            </div>

            <div className="space-y-0.5 border-l border-white/20 pl-3">
              <div>PCP: <strong className="text-white">TestUser, PX Physician - Family Practice...</strong></div>
              <div>Sex: <strong className="text-white">Male</strong></div>
            </div>

            <div className="space-y-0.5 border-l border-white/20 pl-3">
              <div>Age: <strong className="text-white">46 years</strong></div>
              <div>DOB: <strong className="text-white">11/12/1970</strong></div>
            </div>

            <div className="space-y-0.5 border-l border-white/20 pl-3">
              <div>MRN: <strong className="text-white font-mono">AMB0000380</strong></div>
              <div>Attending: <strong className="text-white">Krenn MD, Louis P</strong></div>
              <div className="truncate max-w-[280px]">Outpatient <span className="font-mono">AMB000001313324</span> [10/25/2016 1:00... &lt;No - Discharge date&gt;]</div>
            </div>

            <div className="space-y-0.5 border-l border-white/20 pl-3 text-right">
              <div className="font-mono font-bold">(417) 555-5555</div>
              <div className="text-red-300 font-semibold truncate max-w-[210px]" title="Ultram, sulfa drugs, amoxicillin, m...">Allergies: Ultram, sulfa drugs, amoxicillin, m...</div>
              <div className="text-sky-200 font-semibold">AMB-MEDICARE SERVICES-CARE</div>
            </div>
          </div>

          {/* Action Toolbar & Tabs */}
          <div className="bg-[#f0f2f5] border-b border-[#bdcddc] px-2.5 py-1 flex justify-between items-center text-[10.5px]">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setSelectedMedReconcile({ name: 'New Medication Order', details: '10 mg, By mouth, Daily, 90 tab, 0 Refill(s)', status: 'Ordered', after: 'New Order Entry', afterStatus: 'Prescribed' });
                  setIsSubPopupOpen(true);
                }}
                className="flex items-center gap-1 hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors"
              >
                <span className="text-blue-600 font-bold text-sm leading-none">+</span>
                <span className="text-blue-700 font-semibold underline">Add</span>
              </button>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-1">
                <span className="text-blue-700 font-semibold underline cursor-pointer hover:text-blue-900">Rx Plans</span>
                <span className="text-gray-700 font-medium">(0): No Benefit Found *</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Reconciliation Status</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer hover:text-black">
                  <input type="radio" name="reconcileTab" className="cursor-pointer accent-[#194d7b]" />
                  <span>Meds History</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-black">
                  <input type="radio" name="reconcileTab" className="cursor-pointer accent-[#194d7b]" />
                  <span>Admission</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-[#194d7b]">
                  <input type="radio" name="reconcileTab" defaultChecked className="cursor-pointer accent-[#194d7b]" />
                  <span>Outpatient</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sub-header (Show Formulary link) */}
          <div className="bg-white px-3 py-0.5 flex justify-end border-b border-gray-200 text-[9.5px]">
            <span className="text-blue-600 underline cursor-pointer hover:text-blue-800 italic">Show Formulary... ▼</span>
          </div>

          {/* Main Dual-Table Header without Action Columns */}
          <div className="bg-[#e6ecf2] border-b border-gray-300 text-[10.5px] font-bold text-[#1c4d78] grid grid-cols-2 divide-x divide-gray-300 items-center select-none shadow-sm">
            <div className="text-left pl-4 py-1.5">
              Orders Prior to Reconciliation
            </div>
            <div className="text-left pl-4 py-1.5">
              Orders After Reconciliation
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div className="flex-1 overflow-y-auto bg-white min-h-[370px] max-h-[460px] divide-y divide-gray-200 font-sans">
            
            {/* Group Bar 1: Home Medications */}
            <div className="grid grid-cols-2 divide-x divide-gray-300 bg-[#d3e3f3] border-b border-gray-300 font-bold text-[#0f4471] items-center text-[11px] sticky top-0 z-10">
              <div className="px-2 py-1 flex items-center gap-1.5">
                <span className="text-[9px]">▲</span>
                <span>Home Medications</span>
              </div>
              <div className="px-2 py-1 text-gray-500 font-normal text-[10px]">
                {/* Empty column right space */}
              </div>
            </div>

            {/* Exact Home Medication Rows */}
            {[
              { name: 'acetaminophen-hydrocodone (Norco 5 mg-...', details: '1 tab, By mouth, 6AM, PRN: for pain, 1 tab, PO...', status: 'Prescribed', sel: 'continue', after: 'acetaminophen-hydrocodone (Norco 5 mg-...', afterDetails: '1 tab, By mouth, 6AM, PRN: for pain, 1 tab, P... <Notes...>', afterStatus: 'Prescribed', icon: '💊' },
              { name: 'ALPRAZolam (Xanax 0.5 mg oral tablet)', details: '0.5 mg, By mouth, BID, 60 tab, 0 Refill(s)', status: 'Prescribed', sel: 'continue', after: 'ALPRAZolam (Xanax 0.5 mg oral tablet)', afterDetails: '0.5 mg, By mouth, BID, 60 tab, 0 Re... <Notes...>', afterStatus: 'Prescribed', icon: '💊' },
              { name: 'ibuprofen (Ibuprofen 800 mg oral tablet)', details: '800 mg, 1 tab, By mouth, TID, 270 tab, 0 Refill(s)', status: 'Documented', sel: 'continue', after: 'ibuprofen (Ibuprofen 800 mg oral tablet)', afterDetails: '800 mg, 1 tab, By mouth, TID, 270 t... <Notes...>', afterStatus: 'Acknowledged', icon: '💊' },
              { name: 'lisinopril (lisinopril 10 mg oral tablet)', details: '10 mg, 1 tab, By mouth, Daily, 90 tab, 0 Refill(s)', status: 'Prescribed', sel: 'continue', after: 'lisinopril (lisinopril 10 mg oral tablet)', afterDetails: '10 mg, 1 tab, By mouth, Daily, 90 t... <Notes...>', afterStatus: 'Prescribed', icon: '💊' },
              { name: 'lisinopril (lisinopril 30 mg oral tablet)', details: '30 mg, 1 tab, By mouth, Daily, 90 tab, 0 Refill(s)', status: 'Prescribed', sel: 'continue', after: 'lisinopril (lisinopril 30 mg oral tablet)', afterDetails: '30 mg, 1 tab, By mouth, Daily, 90 t... <Notes...>', afterStatus: 'Prescribed', icon: '💊' },
              { name: 'medroxyPROGESTERone (Depo-Provera)', details: '150 mg, IM, 0 Refill(s)', status: 'Documented', sel: 'continue', after: 'medroxyPROGESTERone (Depo-Provera)', afterDetails: '150 mg, IM, 0 Refill(s) | <Notes for Patient >', afterStatus: 'Acknowledged', icon: '💊' },
              { name: 'Miscellaneous (Medication/DME/supply) (Co...', details: 'See instructions, Wear daily for swelling. Patie...', status: 'Prescribed', sel: 'continue', after: 'Miscellaneous (Medication/DME/supply) (Co...', afterDetails: 'See instructions, Wear daily for sw... <Notes...>', afterStatus: 'Acknowledged', icon: '📦' },
              { name: 'phenazopyridine (Pyridium 200 mg oral tabl...', details: '200 mg, 1 tab, By mouth, ONCE, 1 tab, 0 Refi...', status: 'Prescribed', sel: 'continue', after: 'phenazopyridine (Pyridium 200 mg oral tabl...', afterDetails: '200 mg, 1 tab, By mouth, ONCE, 1 t... <Notes...>', afterStatus: 'Acknowledged', icon: '💊' },
              { name: 'rivaroxaban (Xarelto Starter Pack 15 mg-20...', details: 'See instructions, Voyager PAD Trial: Xarelto 2...', status: 'Prescribed', sel: 'continue', after: 'rivaroxaban (Xarelto Starter Pack 15 mg-20...', afterDetails: 'See instructions, Voyager PAD trial... <Notes...>', afterStatus: 'Acknowledged', icon: '💊' },
              { name: 'solifenacin (VESIcare 5 mg oral tablet)', details: '5 mg, By mouth, Daily, 90 tab, 0 Refill(s)', status: 'Prescribed', sel: 'continue', after: 'solifenacin (VESIcare 5 mg oral tablet)', afterDetails: '5 mg, By mouth, Daily, 90 tab, 0 Re... <Notes...>', afterStatus: 'Acknowledged', icon: '💊' },
              { name: 'Study Med (VOYAGER Study Drug (Rivaroxa...', details: 'See instructions, 2.5 mg By mouth BID, 0 Ref...', status: 'Discontinue', sel: 'discontinue', after: '', afterDetails: '', afterStatus: '', icon: '⚠️' },
              { name: 'Study Med (VOYAGER Study Drug (Rivaroxa...', details: 'See instructions, QAM, Voyager PAD trial, 0 Re...', status: 'Discontinue', sel: 'discontinue', after: '', afterDetails: '', afterStatus: '', icon: '⚠️' },
              { name: 'warfarin (Coumadin 1 mg oral tablet)', details: '1 mg, 1 tab, By mouth, Daily, 30 tab, 0 Refill(s)', status: 'Documented', sel: 'continue', after: 'warfarin (Coumadin 1 mg oral tablet)', afterDetails: '1 mg, 1 tab, By mouth, Daily, 30 ta... <Notes...>', afterStatus: 'Acknowledged', icon: '💊' },
              { name: 'warfarin (Jantoven 1 mg oral tablet)', details: 'See instructions, 1 tab By mouth Daily, 60 tab,...', status: 'Prescribed', sel: 'continue', after: 'warfarin (Jantoven 1 mg oral tablet)', afterDetails: 'See instructions, 1 tab By mouth D... <Notes...>', afterStatus: 'Acknowledged', icon: '💊' },
            ].map((med, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setSelectedMedReconcile(med);
                  setIsSubPopupOpen(true);
                }}
                className={`grid grid-cols-2 divide-x divide-gray-200 items-stretch hover:bg-[#eaf3fa] transition-colors cursor-pointer border-b border-gray-200 ${
                  idx % 2 === 1 ? 'bg-[#fcfdfe]' : 'bg-white'
                }`}
              >
                {/* Left side column */}
                <div className="p-1.5 pl-3 flex items-start gap-1.5">
                  <span className="text-gray-400 text-[10px] mt-0.5">▼</span>
                  <span className="text-[12px]">{med.icon}</span>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="font-bold text-[#0f4471] hover:underline truncate">{med.name}</span>
                      <span className="text-[9.5px] font-semibold text-gray-600 whitespace-nowrap">{med.status}</span>
                    </div>
                    <div className="text-gray-500 text-[9.5px] leading-tight truncate">{med.details}</div>
                  </div>
                </div>

                {/* Right side column */}
                <div className="p-1.5 pl-3 flex items-start gap-1.5">
                  {med.after ? (
                    <>
                      <span className="text-[12px] text-gray-500">💊</span>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline gap-1">
                          <span className="font-bold text-gray-800 truncate">{med.after}</span>
                          <span className="text-[9.5px] font-semibold text-gray-600 whitespace-nowrap">{med.afterStatus}</span>
                        </div>
                        <div className="text-gray-500 text-[9.5px] leading-tight truncate">{med.afterDetails}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-300 italic text-[10px] flex items-center h-full">Do not continue</div>
                  )}
                </div>
              </div>
            ))}

            {/* Group Bar 2: Medications (purple/mauve bar) */}
            <div className="grid grid-cols-2 divide-x divide-gray-300 bg-[#d8cddc] border-t border-b border-gray-300 font-bold text-[#4a2650] items-center text-[11px] sticky top-0 z-10">
              <div className="px-2 py-1 flex items-center gap-1.5">
                <span className="text-[9px]">▲</span>
                <span>Medications</span>
              </div>
              <div className="px-2 py-1 text-gray-500 font-normal text-[10px]"></div>
            </div>

            {/* Exact Medications Rows */}
            {[
              { name: 'dexamethasone', details: '4 mg, IM, ONCE', status: 'Ordered', icon: '💉' },
              { name: 'methylPREDNISolone (Depo-Medrol 40 mg/...', details: '40 mg, 1 ml, Intra-articular, ONCE', status: 'Ordered', icon: '💉' },
              { name: 'methylPREDNISolone (Depo-Medrol 40 mg/...', details: '40 mg, 1 ml, Intra-articular, ONCE', status: 'Ordered', icon: '💉' },
            ].map((med, idx) => (
              <div 
                key={`ordered_${idx}`}
                onClick={() => {
                  setSelectedMedReconcile(med);
                  setIsSubPopupOpen(true);
                }}
                className="grid grid-cols-2 divide-x divide-gray-200 items-stretch hover:bg-[#eaf3fa] transition-colors cursor-pointer border-b border-gray-200 bg-[#faf8fb]"
              >
                <div className="p-1.5 pl-3 flex items-start gap-1.5">
                  <span className="text-gray-400 text-[10px] mt-0.5">▼</span>
                  <span className="text-[12px]">{med.icon}</span>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="font-bold text-[#4a2650] hover:underline truncate">{med.name}</span>
                      <span className="text-[9.5px] font-semibold text-gray-600 whitespace-nowrap">{med.status}</span>
                    </div>
                    <div className="text-gray-500 text-[9.5px] leading-tight truncate">{med.details}</div>
                  </div>
                </div>

                <div className="p-1.5 pl-3 flex items-center text-gray-400 italic text-[10px]">
                  <span>Unreconciled order</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar beneath Table */}
          <div className="bg-[#f8f9fa] border-t border-b border-gray-300 px-3 py-1.5 flex justify-end items-center gap-2 text-[10.5px]">
            <button className="bg-[#e2e6ea] border border-[#adb5bd] text-gray-500 font-semibold px-3 py-0.5 rounded-sm shadow-inner cursor-not-allowed">
              Acknowledge Remaining Home Meds
            </button>
            <button className="bg-white border border-[#6c757d] hover:bg-gray-100 text-gray-800 font-semibold px-3 py-0.5 rounded-sm shadow-sm">
              Do Not Continue Remaining Orders
            </button>
          </div>

          {/* Details Section right underneath */}
          <div className="bg-[#eef2f6] border-b border-gray-300 px-2.5 py-1 flex justify-between items-center text-[10.5px] font-bold text-[#1c4d78]">
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="text-[9px]">▲</span>
              <span>Details</span>
            </div>
          </div>
          <div className="h-[28px] bg-white border-b border-gray-300 px-3 py-1 text-gray-500 italic text-[10px] flex items-center">
            {selectedMedReconcile ? `Selected Order: ${selectedMedReconcile.name} — Click anywhere on row or option to open full action response card.` : `0 Missing Required Details. Select any row above or + Add to open interactive action popup.`}
          </div>

          {/* Bottom Footer Bar */}
          <div className="bg-[#f0f2f5] px-3 py-2 flex justify-between items-center text-[10.5px]">
            <div className="flex items-center gap-3">
              <span className="border border-gray-300 bg-white px-2 py-0.5 text-gray-600 rounded-sm font-semibold shadow-2xs">
                0 Missing Required Details
              </span>
              <span className="border border-[#194d7b] bg-[#e6f0fa] text-[#194d7b] font-bold px-2 py-0.5 rounded-sm shadow-2xs">
                6 Unreconciled Order(s)
              </span>
              <label className="flex items-center gap-1 cursor-pointer font-semibold text-gray-700 ml-2">
                <input type="checkbox" className="cursor-pointer accent-[#194d7b]" />
                <span>Rx Table</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => { alert('Reconciled and Signed successfully.'); setIsReconcileOpen(false); }}
                className="bg-white border border-[#194d7b] hover:bg-[#eef4f8] text-[#194d7b] font-bold px-5 py-1 rounded-sm shadow-sm transition-colors"
              >
                Reconcile And Sign
              </button>
              <button 
                onClick={() => setIsReconcileOpen(false)}
                className="bg-white border border-[#6c757d] hover:bg-gray-100 text-gray-800 font-semibold px-5 py-1 rounded-sm shadow-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-detail Draggable Popup Card */}
      {isSubPopupOpen && (
        <div 
          className="fixed bg-white border-2 border-[#194d7b] shadow-2xl rounded-none w-[540px] flex flex-col select-none z-[100000] overflow-hidden text-[11px] text-gray-800 font-sans"
          style={{ left: `${subPopupPos.x}px`, top: `${subPopupPos.y}px` }}
        >
          {/* Sub Popup Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingSub(true);
              setDragOffsetSub({ x: e.clientX - subPopupPos.x, y: e.clientY - subPopupPos.y });
            }}
            className="bg-gradient-to-r from-[#194d7b] via-[#216298] to-[#194d7b] text-white px-2.5 py-1.5 flex justify-between items-center cursor-move font-semibold text-[11.5px] border-b border-[#0d365a]"
          >
            <div className="flex items-center gap-1.5">
              <span className="bg-[#0b3c66] text-white font-bold px-1.5 py-0.2 rounded text-[10px] border border-sky-300">P</span>
              <span>Medication Order Response: {selectedMedReconcile?.name || 'New Medication Entry'}</span>
            </div>
            <button onClick={() => setIsSubPopupOpen(false)} className="hover:bg-red-600 px-1.5 rounded transition-colors font-mono pb-0.5">✕</button>
          </div>

          {/* Sub Popup Content */}
          <div className="p-3 space-y-3 bg-[#f8fafc] max-h-[72vh] overflow-y-auto">
            <div className="bg-white border border-[#cbd5e1] p-2.5 rounded shadow-sm space-y-2">
              <div className="flex justify-between items-start border-b border-gray-150 pb-1.5">
                <div>
                  <div className="font-bold text-[#0f4471] text-[12px]">{selectedMedReconcile?.name || 'New Medication Order'}</div>
                  <div className="text-gray-500 text-[10px]">{selectedMedReconcile?.details || 'Take as directed by provider'}</div>
                </div>
                <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  {selectedMedReconcile?.status || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div><span className="text-gray-500 block text-[9.5px]">Dosage & Route</span><strong className="text-gray-900">Standard Dose / PO</strong></div>
                <div><span className="text-gray-500 block text-[9.5px]">Prescriber</span><strong className="text-gray-900">Krenn MD, Louis P</strong></div>
                <div><span className="text-gray-500 block text-[9.5px]">Indication / Problem</span><strong className="text-gray-900">Outpatient Profile Care</strong></div>
                <div><span className="text-gray-500 block text-[9.5px]">Pharmacy Destination</span><strong className="text-gray-900">Retail Outpatient Pharmacy</strong></div>
              </div>
            </div>

            {/* Reconciliation Action Selection */}
            <div className="bg-white border border-[#cbd5e1] p-2.5 rounded shadow-sm space-y-2">
              <div className="font-bold text-[#194d7b] text-[10.5px]">Select Action Response for this Order:</div>
              <div className="grid grid-cols-3 gap-1.5">
                {['Continue (Prescribe)', 'Modify Dose / Sig', 'Discontinue Order', 'Document Only', 'Hold Temporary', 'Replace with Alt'].map((act) => (
                  <button 
                    key={act}
                    onClick={() => setSelectedMedReconcile({ ...selectedMedReconcile, status: act })}
                    className={`px-2 py-1 rounded-sm text-center border font-semibold text-[10px] transition-all ${
                      selectedMedReconcile?.status === act
                        ? 'bg-[#194d7b] text-white border-[#194d7b] shadow'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Instructions / Comments */}
            <div className="bg-white border border-[#cbd5e1] p-2 rounded shadow-sm space-y-1">
              <label className="font-bold text-[#194d7b] text-[10.5px] block">Provider Notes & Clinical Rationale:</label>
              <textarea 
                rows={2}
                placeholder="Enter clinical notes, sig changes, or patient counseling instructions..."
                defaultValue="Reviewed during outpatient reconciliation. Patient compliant with therapy; continue regimen without modification."
                className="w-full border border-gray-300 rounded p-1.5 text-[10.5px] focus:outline-none focus:border-[#194d7b]"
              />
            </div>

            {/* Safety Check box */}
            <div className="bg-emerald-50 border border-emerald-300 rounded p-2 text-emerald-900 text-[10px] flex items-center gap-2">
              <span className="text-xs font-bold">✓</span>
              <span><strong>Formulary & Allergy Verified:</strong> No adverse interaction with patient allergies (Ultram, sulfa drugs, amoxicillin).</span>
            </div>
          </div>

          {/* Sub Popup Footer */}
          <div className="bg-[#f0f2f5] border-t border-[#cbd5e1] px-3 py-2 flex justify-end gap-2 text-[10.5px]">
            <button 
              onClick={() => setIsSubPopupOpen(false)}
              className="bg-white border border-[#6c757d] hover:bg-gray-100 font-semibold px-4 py-1 rounded-sm text-gray-800 shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsSubPopupOpen(false)}
              className="bg-white border border-[#194d7b] hover:bg-[#eef4f8] text-[#194d7b] font-bold px-4 py-1 rounded-sm shadow-sm transition-colors"
            >
              Apply Decision & Close
            </button>
          </div>
        </div>
      )}

      {patientContextMenu && (
        <div 
          className="fixed bg-white border border-[#a0a0a0] text-[#333333] text-[11px] p-0 w-[190px] shadow-md rounded-none select-none z-[99999] text-left py-0.5 font-sans"
          style={{ left: `${patientContextMenu.x}px`, top: `${patientContextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            'Bed Transfer',
            'Cancel Discharge',
            'Cancel Pending Discharge',
            'Cancel Pending Transfer',
            'Cancel Transfer',
            'Clozapine Registry',
            'Discharge Encounter',
            'Facility Transfer',
            'Leave of Absence',
            'Modify Discharge',
            'Pending Discharge',
            'Pending Facility Transfer',
            'Pending Transfer',
            'Print Labels',
            'Process Alert',
            'Update Patient Information',
            'View Encounter',
            'View Person'
          ].map((item) => (
            <div 
              key={item}
              className="px-3.5 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-800 transition-colors" 
              onClick={() => { 
                alert(`${item} clicked for ${patientContextMenu.patientName}`); 
                setPatientContextMenu(null); 
              }}
            >
              {item}
            </div>
          ))}
          <div className="border-t border-gray-200 my-0.5"></div>
          <div 
            className="px-3.5 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-[#0f4471] font-semibold" 
            onClick={() => { 
              selectOrOpenTab('PatientProfile', `Patient Profile: ${patientContextMenu.patientName.toUpperCase()}`, 'patient-doe');
              setPatientContextMenu(null); 
            }}
          >
            Keep Open
          </div>
          <div className="px-3.5 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-500" onClick={() => setPatientContextMenu(null)}>
            Close
          </div>
        </div>
      )}
      {openMessagePopups.map((popup) => (
        <div
          key={popup.id}
          className="fixed bg-[#f8f9fa] border border-[#bdcddc] rounded shadow-2xl flex flex-col font-sans select-none text-[11px]"
          style={{
            left: `${popup.x}px`,
            top: `${popup.y}px`,
            width: '760px',
            zIndex: popup.zIndex,
          }}
          onClick={() => {
            const newZ = maxZIndex + 1;
            setMaxZIndex(newZ);
            setOpenMessagePopups(prev => prev.map(p => p.id === popup.id ? { ...p, zIndex: newZ } : p));
          }}
        >
          {/* Draggable Title Bar */}
          <div
            onMouseDown={(e) => handleStartDrag(popup.id, e)}
            className="bg-[#cbd8e3] border-b border-[#bdcddc] flex justify-between items-center px-2.5 py-1 cursor-move select-none"
          >
            <span className="font-bold text-[11px] text-[#002a46] flex items-center gap-1.5">
              ✉️ General Messages: {popup.patientName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMessagePopups(prev => prev.filter(p => p.id !== popup.id));
              }}
              className="text-gray-600 hover:text-red-600 font-bold text-sm px-1"
            >
              ×
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="bg-[#fafbfc] border-b border-[#bdcddc] px-3 py-1 flex items-center gap-4 text-[#2c3e50] text-[10.5px] font-medium border-t border-white">
            <button className="hover:text-black flex items-center gap-1">✉️ Forward</button>
            <button className="hover:text-black flex items-center gap-1 text-red-600 font-semibold">❌ Delete</button>
            <button className="hover:text-black flex items-center gap-1">🖨️ Print</button>
            <span className="text-gray-300">|</span>
            <button className="hover:text-black flex items-center gap-1">⬆️ Previous</button>
            <button className="hover:text-black flex items-center gap-1">⬇️ Next</button>
            <span className="text-gray-300">|</span>
            <button className="hover:text-black flex items-center gap-1">✉️ Mark Unread</button>
            <button className="hover:text-black flex items-center gap-1 font-semibold flex-wrap">💬 Communicate <span className="text-[8px] text-gray-400">▼</span></button>
            <span className="text-gray-300">|</span>
            <button className="hover:text-black flex items-center gap-1 font-semibold text-[#0d7a86]">➕ Add</button>
          </div>

          {/* Blue Patient Header Banner */}
          <div className="bg-[#0f4471] text-white p-3.5 flex justify-between items-start shadow-inner relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide">{popup.patientName}</h2>
                <button 
                  onClick={() => {
                    selectOrOpenTab('PatientProfile', `Patient Profile: ${popup.patientName}`, 'patient-doe');
                  }}
                  className="text-[9px] bg-[#0d7a86] px-1 py-0.2 rounded font-bold uppercase hover:bg-[#0b636d]"
                >
                  View Profile
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5 text-[10px] text-gray-200">
                <div><span className="text-gray-400 font-medium">MRN:</span> {popup.mrn}</div>
                <div><span className="text-gray-400 font-medium">Axio-ID:</span> {popup.axioId}</div>
                <div><span className="text-gray-400 font-medium">Gender:</span> {popup.gender}</div>
                <div><span className="text-gray-400 font-medium">Allergies:</span> <span className="text-red-300 font-bold">{popup.allergies}</span></div>
              </div>
            </div>
            <div className="text-right text-[10px] space-y-0.5 text-gray-200">
              <div><span className="text-gray-400 font-medium">DOB:</span> {popup.dob}</div>
              <div><span className="text-gray-400 font-medium">Weight:</span> {popup.weight}</div>
              <div><span className="text-gray-400 font-medium">Height:</span> {popup.height}</div>
              <div><span className="text-gray-400 font-medium">Blood Type:</span> {popup.bloodType}</div>
              <div><span className="text-gray-400 font-medium">HealthLife:</span> {popup.healthLife}</div>
            </div>
          </div>

          {/* Body Content */}
          <div className="bg-white p-4 flex flex-col space-y-4 overflow-auto max-h-[300px] border-b border-[#bdcddc]">
            <div className="border-b border-[#bdcddc] pb-3 space-y-1">
              <h3 className="font-bold text-xs text-gray-800">Message Details</h3>
              <div className="grid grid-cols-[80px_1fr] gap-y-1 text-[11px]">
                <span className="text-gray-500 font-semibold">From:</span>
                <span className="font-semibold text-gray-800">System</span>
                <span className="text-gray-500 font-semibold">To:</span>
                <span className="text-gray-800">Axiovital Admin</span>
                <span className="text-gray-500 font-semibold">Subject:</span>
                <span className="font-semibold text-[#0f719b] hover:underline cursor-pointer">
                  {popup.subject}
                </span>
                <span className="text-gray-500 font-semibold">Date/Time:</span>
                <span className="text-gray-800">{popup.date}</span>
              </div>
            </div>
            <div className="space-y-3 leading-relaxed text-gray-800 text-[11px]">
              <div className="font-semibold border-b border-gray-100 pb-1 text-gray-700">Message Content</div>
              <p>{popup.content}</p>
              <div className="py-1">
                <button className="text-[#0f719b] font-semibold underline hover:text-[#0b5475]">Launch AxioNote - Edge Platform</button>
              </div>
              <p className="text-gray-500 text-[10px]">Thank you,<br />AxioVital Clinical System</p>
            </div>
          </div>
        </div>
      ))}

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999999] p-4 select-none">
          <div className="bg-[#cbd8e3] border-2 border-[#0a4c7a] w-[98vw] h-[95vh] flex flex-col font-sans text-gray-800 shadow-2xl overflow-hidden text-[10.5px]">
            {/* Top blue tab bar */}
            <div className="bg-[#002a46] px-1 py-0.5 flex justify-between items-center text-white h-[26px]">
              <div className="flex items-center gap-1">
                <div className="bg-[#005a94] border-t border-x border-[#003c63] px-3 py-1 font-bold text-[10px] text-white flex items-center gap-2 h-[26px] rounded-t-sm shadow-sm relative top-[2px] z-10 border-b-transparent">
                  <span>TESTSANDERS, PATTHREE</span>
                  <button onClick={() => setIsNewOrderModalOpen(false)} className="hover:text-red-300 font-bold text-xs">×</button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] pr-2 text-gray-300">
                <button className="hover:text-white flex items-center gap-0.5"><span>⬅️</span> List</button>
                <button className="hover:text-white flex items-center gap-0.5"><span>📂</span> Recent</button>
                <div className="relative bg-white text-black px-1 py-0.2 rounded-xs flex items-center border border-gray-400">
                  <input type="text" className="w-[120px] text-[10px] focus:outline-none bg-transparent" placeholder="Name" />
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Demographics Blue/Teal Banner */}
            <div className="bg-[#005a94] text-white px-3 py-1.5 border-b border-[#003c63] flex flex-wrap items-start justify-between gap-x-6 gap-y-1 text-[9.5px] leading-tight">
              <div className="space-y-0.5">
                <div className="font-extrabold text-[11.5px] uppercase tracking-wide">TESTSANDERS, PATTHREE</div>
                <div className="text-gray-300">Allergies: <span className="text-red-300 font-bold">Allergies Not Recorded</span></div>
              </div>
              <div className="grid grid-cols-4 gap-x-4 gap-y-0.5">
                <div><span className="text-gray-300">DOB:</span> 07/07/71</div>
                <div><span className="text-gray-300">Age:</span> 46 years</div>
                <div><span className="text-gray-300">Dose Wt:</span> </div>
                <div><span className="text-gray-300">Sex:</span> Male</div>
                <div><span className="text-gray-300">MRN:</span> 64002748</div>
                <div className="col-span-2 truncate"><span className="text-gray-300">Attending:</span> McHenry MD, David Glen</div>
                <div></div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <div className="truncate"><span className="text-gray-300">Inpatient FIN:</span> 1200290423 [Admit Dt: 07/07/2017 10:44 Disch Dt: &lt;No - Discharge date&gt;]</div>
                <div><span className="text-gray-300">Loc:</span> 6N Med Surg | 6205 : 0</div>
              </div>
            </div>

            {/* Sub-toolbar */}
            <div className="bg-[#eaf1f7] border-b border-gray-300 px-3 py-1 flex justify-between items-center text-[10.5px] h-[30px]">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-bold cursor-pointer">❮</span>
                <span className="text-gray-400">🏠</span>
                <span className="font-bold text-[#002a46]">Orders</span>
                <span className="text-gray-300">|</span>
                <button className="flex items-center gap-0.5 hover:bg-gray-200 px-1 py-0.5 rounded font-semibold text-gray-700">
                  <span className="text-green-600 font-bold text-xs">+</span> Add
                </button>
                <button className="hover:bg-gray-200 px-1 py-0.5 rounded font-semibold text-gray-700">Document Medication by Hx</button>
                <button className="hover:bg-gray-200 px-1 py-0.5 rounded font-semibold text-gray-700">Reconciliation ▾</button>
                <button className="hover:bg-gray-200 px-1 py-0.5 rounded font-semibold text-gray-700">Check Interactions</button>
                <button className="hover:bg-gray-200 px-1 py-0.5 rounded font-semibold text-gray-700">External Rx History ▾</button>
                <button className="hover:bg-gray-200 px-1 py-0.5 rounded font-semibold text-gray-700">No Check ▾</button>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-[10px]">
                <button className="hover:text-black">🖥️ Full screen</button>
                <button className="hover:text-black">🖨️ Print</button>
                <span>0 minutes ago</span>
                <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                  <span className="text-gray-500 font-semibold">Reconciliation Status:</span>
                  <span className="text-green-700 font-bold flex items-center gap-0.5">✓ Meds History</span>
                  <span className="text-orange-600 font-bold flex items-center gap-0.5">⚠️ Admission</span>
                  <span className="text-orange-600 font-bold flex items-center gap-0.5">⚠️ Discharge</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs row */}
            <div className="bg-[#cbd8e3] border-b border-gray-300 px-3 flex items-end h-[24px]">
              <div className="flex border-b border-transparent gap-0.5 text-[10px]">
                <button className="px-4 py-0.5 font-bold border-t border-x rounded-t-sm bg-white border-gray-300 text-blue-900 border-b-white relative z-10">Orders</button>
                <button className="px-4 py-0.5 font-semibold border-t border-x rounded-t-sm bg-gray-100/70 border-transparent text-gray-600 hover:bg-gray-200/50">Medication List</button>
                <button className="px-4 py-0.5 font-semibold border-t border-x rounded-t-sm bg-gray-100/70 border-transparent text-gray-600 hover:bg-gray-200/50">Document In Plan</button>
              </div>
            </div>

            {/* Main Panel Content Area */}
            <div className="flex-1 flex overflow-hidden bg-white">
              
              {/* Left Panel: Diagnoses & Problems */}
              <div className="w-[320px] border-r border-gray-300 flex flex-col bg-gray-50 p-2 overflow-y-auto space-y-4">
                <div className="bg-[#005a94] text-white text-center font-bold py-0.5 text-[10.5px]">
                  Diagnoses & Problems
                </div>

                {/* Section 1: Diagnosis addressed */}
                <div className="bg-white border border-gray-300 p-1.5 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-[10px] text-gray-700">Diagnosis (Problem) being Addressed this Visit</div>
                  <div className="flex gap-1.5">
                    <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-0.5"><span className="text-blue-600">+</span> Add</button>
                    <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold">🔄 Convert</button>
                    <select className="bg-white border border-gray-300 rounded-sm text-gray-700 px-1 py-0.5 focus:outline-none"><option>Display: Active</option></select>
                  </div>
                  <table className="w-full text-left border border-gray-200 text-[9.5px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                        <th className="p-1 border-r border-gray-200 w-[20px] text-center"><input type="checkbox" defaultChecked /></th>
                        <th className="p-1 border-r border-gray-200 w-[20px] text-center">❌</th>
                        <th className="p-1 border-r border-gray-200">Annotated Display</th>
                        <th className="p-1 border-r border-gray-200">Code</th>
                        <th className="p-1">Clinical...</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b border-gray-100 text-gray-800">
                        <td className="p-1 border-r border-gray-200 text-center"><input type="checkbox" defaultChecked /></td>
                        <td className="p-1 border-r border-gray-200 text-center text-red-500">❌</td>
                        <td className="p-1 border-r border-gray-200 font-semibold truncate max-w-[120px]" title="Nondisplaced fracture of ...">Nondisplaced fracture of ...</td>
                        <td className="p-1 border-r border-gray-200">S72.115A</td>
                        <td className="p-1 truncate max-w-[60px]">Nondi...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Problems */}
                <div className="bg-white border border-gray-300 p-1.5 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-[10px] text-gray-700">Problems</div>
                  <div className="flex gap-1.5 flex-wrap">
                    <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-0.5"><span className="text-blue-600">+</span> Add</button>
                    <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold">🔄 Convert</button>
                    <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-semibold">No Chronic Problems</button>
                  </div>
                  <select className="bg-white border border-gray-300 rounded-sm text-gray-700 px-1 py-0.5 focus:outline-none w-fit"><option>Display: Active</option></select>
                  <table className="w-full text-left border border-gray-200 text-[9.5px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                        <th className="p-1 border-r border-gray-200 w-[20px] text-center"><input type="checkbox" defaultChecked /></th>
                        <th className="p-1 border-r border-gray-200">Annotated Display</th>
                        <th className="p-1 border-r border-gray-200">Name of Problem</th>
                        <th className="p-1">Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b border-gray-100 text-gray-800">
                        <td className="p-1 border-r border-gray-200 text-center"><input type="checkbox" defaultChecked /></td>
                        <td className="p-1 border-r border-gray-200 font-semibold text-blue-800 underline truncate max-w-[100px]" title="At risk of venous thromb...">At risk of venous thromb...</td>
                        <td className="p-1 border-r border-gray-200 font-semibold text-blue-800 underline truncate max-w-[100px]" title="At risk of venous thromb...">At risk of venous thromb...</td>
                        <td className="p-1 font-mono">2674624018</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Related Results / Formulary Details */}
                <div className="bg-[#cbd8e3]/50 border border-gray-300 text-center font-semibold text-[10px] text-gray-700 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors">
                  Related Results
                </div>
                <div className="bg-[#cbd8e3]/50 border border-gray-300 text-center font-semibold text-[10px] text-gray-700 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors">
                  Formulary Details
                </div>
              </div>

              {/* Right Panel: Search & Order folders */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden p-3 space-y-3">
                {/* Search controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 p-2 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Search:</span>
                    <div className="relative bg-white text-black px-2 py-0.5 rounded-sm flex items-center border border-gray-300 w-[240px]">
                      <input type="text" className="w-full text-[10.5px] focus:outline-none bg-transparent" placeholder="" />
                      <span className="text-gray-400">🔍</span>
                    </div>
                    <button className="text-blue-700 font-semibold text-[10px] hover:underline flex items-center gap-0.5">Advanced Options ▾</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600 font-semibold">Type:</span>
                      <select className="bg-white border border-gray-300 text-[10.5px] py-0.5 px-1.5 focus:outline-none rounded-sm">
                        <option>Inpatient</option>
                      </select>
                    </div>
                    <button onClick={() => setIsNewOrderModalOpen(false)} className="text-gray-400 hover:text-red-600 font-extrabold text-sm leading-none border border-gray-300 rounded px-1.5 py-0.2 bg-white">×</button>
                  </div>
                </div>

                {/* Sub-ribbon navigation */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 text-[10.5px]">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                      <span>⬆️</span> Up
                    </button>
                    <button className="flex items-center gap-0.5 text-[#005a94] hover:text-blue-900 font-semibold">
                      <span>🏠</span> Home
                    </button>
                    <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                      <span>⭐</span> Favorites ▾
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                      <span>📁</span> Folders
                    </button>
                    <button className="flex items-center gap-0.5 text-gray-600 hover:text-black font-semibold">
                      <span>📄</span> Copy
                    </button>
                    <span className="text-gray-600 font-bold ml-2">Folder: Hospitalist Orders</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Search within:</span>
                    <select className="bg-white border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none">
                      <option>All</option>
                    </select>
                  </div>
                </div>

                {/* Folder List tree view */}
                <div className="flex-1 border border-gray-200 bg-white rounded-sm p-4 overflow-y-auto space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                    <span className="text-yellow-600 text-sm">📁</span>
                    <span className="font-semibold text-gray-800 text-[11.5px]">Admit/Transfer Orders</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                    <span className="text-yellow-600 text-sm">📁</span>
                    <span className="font-semibold text-gray-800 text-[11.5px]">Discharge Orders</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                    <span className="text-yellow-600 text-sm">📁</span>
                    <span className="font-semibold text-gray-800 text-[11.5px]">Laboratory</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                    <span className="text-yellow-600 text-sm">📁</span>
                    <span className="font-semibold text-gray-800 text-[11.5px]">Imaging</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Grayed status sections */}
            <div className="bg-gray-100 border-t border-gray-300 px-3 py-1 flex items-center text-gray-500 font-semibold select-none h-[22px]">
              <span>Orders for Signature</span>
            </div>
            <div className="bg-white border-t border-gray-300 px-3 py-1 flex items-center text-gray-500 font-semibold select-none h-[22px] border-b">
              <span>Details</span>
            </div>

            {/* Footer row */}
            <div className="bg-[#cbd8e3] p-2 flex justify-between items-center border-t border-gray-300">
              <div className="flex gap-2">
                <button className="bg-white border border-gray-400 text-gray-600 font-bold px-3 py-1 text-[10px] rounded-xs shadow-sm hover:bg-gray-150">
                  0 Missing Required Details
                </button>
                <button className="bg-white border border-gray-400 text-gray-600 font-bold px-4 py-1 text-[10px] rounded-xs shadow-sm hover:bg-gray-150">
                  Dx Table
                </button>
                <button className="bg-white border border-gray-400 text-gray-600 font-bold px-4 py-1 text-[10px] rounded-xs shadow-sm hover:bg-gray-150">
                  Orders For Cosignature
                </button>
              </div>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="bg-white border border-[#0a4c7a] hover:bg-[#eef4f8] text-[#0a4c7a] font-extrabold px-6 py-1 text-[10px] rounded-xs shadow-sm transition-colors">
                Sign
              </button>
            </div>

            {/* Status bar */}
            <div className="bg-[#002a46] text-white px-3 py-0.5 flex justify-end text-[9px] font-mono select-none h-[18px]">
              <span>P248 | 26217 | July 07, 2017 12:48 CDT</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
