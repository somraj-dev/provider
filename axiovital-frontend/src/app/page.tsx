'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { wsClient } from '@/lib/ws-client';
import { SchedulingAPI, AppointmentHoldAPI, AppointmentRequestAPI, AppointmentAPI, AvailabilityResponse } from '@/lib/scheduling-api';
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
  ChevronDown, Maximize2, Printer, RefreshCw, Download, Share2
} from 'lucide-react';
import LabReportPreviewModal from '@/components/LabReportPreviewModal';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { TabItem } from '@/pages/_shared/types';
import { CHART_OPTIONS, formatEhrDate, formatEhrTime, getChartDataForSelection, patientDemographics, extensionApps, getAppIcon } from '@/pages/_shared/constants';

import { LoginPage } from '@/pages/Login/LoginPage';
import { HomePage } from '@/pages/Dashboard/HomePage';
import { DeveloperToolsPage } from '@/pages/Admin/DeveloperToolsPage';
import { ProcessExplorerTab } from '@/pages/Admin/ProcessExplorerTab';
import { MessageCenterTab } from '@/pages/Dashboard/MessageCenterTab';
import { CustomisedTab } from '@/pages/Dashboard/CustomisedTab';
import { AnalyticsTab } from '@/pages/Dashboard/AnalyticsTab';
import { NotificationsTab } from '@/pages/Dashboard/NotificationsTab';
import { HelpCentreTab } from '@/pages/Dashboard/HelpCentreTab';
import { ClinicalEventViewTab } from '@/pages/Clinical/ClinicalEventViewTab';
import { ProtocolLibraryTab } from '@/pages/Clinical/ProtocolLibraryTab';
import { QualityMeasuresTab } from '@/pages/Clinical/QualityMeasuresTab';
import { PhysicianHandoffTab } from '@/pages/Clinical/PhysicianHandoffTab';
import { ReferralTransferTab } from '@/pages/Clinical/ReferralTransferTab';
import { DischargeListTab } from '@/pages/Clinical/DischargeListTab';
import { ClinicalDecisionSupportTab } from '@/pages/Clinical/ClinicalDecisionSupportTab';
import { PatientListTab } from '@/pages/PatientProfile/PatientListTab';
import { ReportsTab } from '@/pages/Reports/ReportsTab';
import { MedicalReportTab } from '@/pages/Reports/MedicalReportTab';
import { PatientProfileTab } from '@/pages/PatientProfile/PatientProfileTab';
import { EditPatientProfileTab } from '@/pages/PatientProfile/EditPatientProfileTab';
import { PatientNotesTab } from '@/pages/PatientProfile/PatientNotesTab';
import { RescheduleRequestsTab } from '@/pages/Scheduler/RescheduleRequestsTab';
import { AdmitPatientTab } from '@/pages/AdmitPatient/AdmitPatientTab';
import { OrdersTab } from '@/pages/Orders/OrdersTab';
import { LabsTab } from '@/pages/Laboratory/LabsTab';
import { LabReportDetailTab } from '@/pages/Laboratory/LabReportDetailTab';
import { BillingReceiptTab } from '@/pages/Billing/BillingReceiptTab';
export default function App() {
  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn ?? false;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginDomain, setLoginDomain] = useState('PROD');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiPatients, setApiPatients] = useState<any[]>([]);
  const [isSubmittingAdmit, setIsSubmittingAdmit] = useState(false);
  const [dbRescheduleRequests, setDbRescheduleRequests] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [appointmentTypesList, setAppointmentTypesList] = useState<any[]>([]);
  const popupIdCounterRef = React.useRef(0);

  useEffect(() => {
    if (isLoggedIn) {
      wsClient.connect(auth?.tenantId);
      const handleAdmitted = (payload: any) => {
        console.log('⚡ Real-time PATIENT_ADMITTED event received:', payload);
      };
      wsClient.subscribe('patient_admitted', handleAdmitted);

      const fetchSchedulingInitialData = async () => {
        try {
          const [reqs, docs, types] = await Promise.all([
            AppointmentRequestAPI.list().catch(() => []),
            apiClient.get('/doctors').catch(() => []),
            SchedulingAPI.getAppointmentTypes().catch(() => []),
          ]);
          if (Array.isArray(reqs) && reqs.length > 0) setDbRescheduleRequests(reqs);
          if (Array.isArray(docs?.data || docs)) setDoctorsList(docs?.data || docs);
          if (Array.isArray(types)) setAppointmentTypesList(types);
        } catch (err) {
          console.error('Failed to load initial scheduling data:', err);
        }
      };

      fetchSchedulingInitialData();

      const handleSlotChanged = () => {
        fetchSchedulingInitialData();
      };

      wsClient.subscribe('appointment.slot.changed', handleSlotChanged);
      wsClient.subscribe('appointment_created', handleSlotChanged);
      wsClient.subscribe('appointment_rescheduled', handleSlotChanged);

      return () => {
        wsClient.unsubscribe('patient_admitted', handleAdmitted);
        wsClient.unsubscribe('appointment.slot.changed', handleSlotChanged);
        wsClient.unsubscribe('appointment_created', handleSlotChanged);
        wsClient.unsubscribe('appointment_rescheduled', handleSlotChanged);
      };
    }
  }, [isLoggedIn, auth?.tenantId]);
  
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
    popupIdCounterRef.current += 1;
    const id = `popup-${popupIdCounterRef.current}`;
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

  // Clinical Event View Flowsheet states
  const [flowsheetLevel, setFlowsheetLevel] = useState('Clinical Event View');
  const [flowsheetView, setFlowsheetView] = useState<'Table' | 'Group' | 'List'>('Table');
  const [navigatorVisible, setNavigatorVisible] = useState(true);
  const [navigatorChecked, setNavigatorChecked] = useState({
    clinicalEventNotification: true,
    adverseReactionEvent: true,
    amaGuidelinesEvent: true,
    labRadDetailsEvent: true,
    clinicianNotification: true,
  });
  const [flowsheetSelectedCell, setFlowsheetSelectedCell] = useState<{row: string, col: number} | null>(null);
  
  // Search Criteria modal states
  const [showSearchCriteria, setShowSearchCriteria] = useState(false);
  const [searchCriteriaLookupMode, setSearchCriteriaLookupMode] = useState<'clinical' | 'posting' | 'count' | 'new' | 'admission'>('clinical');
  const [searchCriteriaFromDate, setSearchCriteriaFromDate] = useState('03/03/2009');
  const [searchCriteriaFromTime, setSearchCriteriaFromTime] = useState('0817');
  const [searchCriteriaToDate, setSearchCriteriaToDate] = useState('03/30/2014');
  const [searchCriteriaToTime, setSearchCriteriaToTime] = useState('1414');
  const [searchCriteriaRangeText, setSearchCriteriaRangeText] = useState('03 March 2009 08:17 EST - 30 March 2014 14:14 EDT (Clinical Range)');
  const [protocolLibraryListSelection, setProtocolLibraryListSelection] = useState('Holding in Recovery Room');

  // Quality Measures states
  const [qualityMeasuresSubTab, setQualityMeasuresSubTab] = useState<'age_sex_diagnoses' | 'concept_explode' | 'summary_count'>('age_sex_diagnoses');
  const [diagnosisCodeParent, setDiagnosisCodeParent] = useState('All values');
  const [drugRelatedDiagnosis, setDrugRelatedDiagnosis] = useState('All values');
  const [restrictedDiagnosis, setRestrictedDiagnosis] = useState('Traumatic injury');
  const [headFinding, setHeadFinding] = useState('All values');

  // Physician Handoff states
  const [handoffNavigator, setHandoffNavigator] = useState({
    sampleInfo: true,
    cbcSmear: true,
    coagulation: true,
    chemistry: true,
    serology: false,
    dischargeDoc: false
  });
  const [selectedHandoffCell, setSelectedHandoffCell] = useState<{row: string, col: number} | null>({ row: 'specimen', col: 0 });

  // Reports (Results Review) states
  const [reportsSubTab, setReportsSubTab] = useState('lab-extended');
  const [reportsNavigator, setReportsNavigator] = useState({
    lytesMetabolites: true,
    carbTolerance: true,
    extendedChemistry: true,
    hepatic: true,
    cardiacMarkers: true,
    lipids: true,
    routineCoagulation: true,
    hemogram: true,
    leukocytes: true,
    redCells: true
  });
  const [selectedReportsCell, setSelectedReportsCell] = useState<{row: string, col: number} | null>({ row: 'potassium', col: 0 });
  const [showReportsContextMenu, setShowReportsContextMenu] = useState(false);
  const [reportsContextMenuPosition, setReportsContextMenuPosition] = useState({ x: 0, y: 0 });

  // Status Bar States & Effects
  const [statusBarDateTime, setStatusBarDateTime] = useState('');

  const getUserDisplayName = () => {
    switch (email) {
      case 'administrator':
        return 'Axiovital Admin';
      case 'dr_stewart':
        return 'Dr. Herman Stewart';
      case 'dr_sharma':
        return 'Dr. R. Sharma';
      case 'dr_iyer':
        return 'Dr. K. Iyer';
      case 'nurse_jenkins':
        return 'Nurse Jenkins';
      default:
        return 'Axiovital Admin';
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const yyyy = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formatted = `${dd}/${mm}/${yyyy} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      setStatusBarDateTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusBarPatient = (() => {
    const currentTab = openTabs.find(t => t.id === activeTabId) || openTabs[0];
    if (currentTab && (currentTab.type === 'PatientProfile' || currentTab.type === 'EditPatientProfile' || currentTab.type === 'PatientNotes')) {
      const title = currentTab.title;
      let name = 'JOHN DOE';
      if (title.includes('Patient Profile:')) {
        name = title.replace('Patient Profile:', '').trim();
      } else if (title.includes('Edit Patient Profile:')) {
        name = title.replace('Edit Patient Profile:', '').trim();
      } else if (title.includes('Patient Notes:')) {
        name = title.replace('Patient Notes:', '').trim();
      }
      
      const upperName = name.toUpperCase();
      const matchingDemo = Object.keys(patientDemographics).find(k => k.toUpperCase() === upperName);
      if (matchingDemo) {
        return {
          name: matchingDemo,
          mrn: patientDemographics[matchingDemo].mrn
        };
      } else {
        const demoVal = Object.values(patientDemographics).find(d => upperName.includes(d.mrn));
        if (demoVal) {
          const keyName = Object.keys(patientDemographics).find(k => patientDemographics[k] === demoVal);
          return {
            name: keyName || name.toUpperCase(),
            mrn: demoVal.mrn
          };
        } else {
          return { name: name.toUpperCase(), mrn: '1000245678' };
        }
      }
    }
    return { name: 'JOHN DOE', mrn: '1000245678' };
  })();

  // Refresh functionality states
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(() => Date.now());
  const [minutesAgo, setMinutesAgo] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesAgo(Math.floor((Date.now() - lastRefreshedAt) / 60000));
    }, 10000);
    return () => clearInterval(interval);
  }, [lastRefreshedAt]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastRefreshedAt(Date.now());
    setMinutesAgo(0);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };


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

  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [isRibbon0DropdownOpen, setIsRibbon0DropdownOpen] = useState(false);
  const [isRibbon1DropdownOpen, setIsRibbon1DropdownOpen] = useState(false);
  const [isRibbon2DropdownOpen, setIsRibbon2DropdownOpen] = useState(false);
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

  // Care Team Popup State
  const [isCareTeamOpen, setIsCareTeamOpen] = useState(false);
  const [careTeamPos, setCareTeamPos] = useState({ x: 300, y: 180 });
  const [isDraggingCareTeam, setIsDraggingCareTeam] = useState(false);
  const [dragOffsetCareTeam, setDragOffsetCareTeam] = useState({ x: 0, y: 0 });

  // Print Labels Popup State
  const [isPrintLabelsOpen, setIsPrintLabelsOpen] = useState(false);
  const [printLabelsPos, setPrintLabelsPos] = useState({ x: 260, y: 100 });
  const [isDraggingPrintLabels, setIsDraggingPrintLabels] = useState(false);
  const [dragOffsetPrintLabels, setDragOffsetPrintLabels] = useState({ x: 0, y: 0 });

  // Process Alert Popup State
  const [isProcessAlertOpen, setIsProcessAlertOpen] = useState(false);
  const [processAlertPos, setProcessAlertPos] = useState({ x: 280, y: 110 });
  const [isDraggingProcessAlert, setIsDraggingProcessAlert] = useState(false);
  const [dragOffsetProcessAlert, setDragOffsetProcessAlert] = useState({ x: 0, y: 0 });

  // View Encounter Popup State (Medical Record Request 1:1 Replica)
  const [isViewEncounterOpen, setIsViewEncounterOpen] = useState(false);
  const [viewEncounterPos, setViewEncounterPos] = useState({ x: 200, y: 80 });
  const [isDraggingViewEncounter, setIsDraggingViewEncounter] = useState(false);
  const [dragOffsetViewEncounter, setDragOffsetViewEncounter] = useState({ x: 0, y: 0 });

  // Bed Transfer Popup State
  const [isBedTransferOpen, setIsBedTransferOpen] = useState(false);

  // Cancel Warning Popup State
  const [isCancelWarningOpen, setIsCancelWarningOpen] = useState(false);
  const [cancelWarningData, setCancelWarningData] = useState({ title: '', message: '' });
  const [cancelWarningPos, setCancelWarningPos] = useState({ x: 400, y: 250 });
  const [isDraggingCancelWarning, setIsDraggingCancelWarning] = useState(false);
  const [dragOffsetCancelWarning, setDragOffsetCancelWarning] = useState({ x: 0, y: 0 });

  // Cancel Discharge Form Popup State
  const [isCancelDischargeFormOpen, setIsCancelDischargeFormOpen] = useState(false);
  const [cancelDischargeFormPos, setCancelDischargeFormPos] = useState({ x: 100, y: 50 });
  const [isDraggingCancelDischargeForm, setIsDraggingCancelDischargeForm] = useState(false);
  const [dragOffsetCancelDischargeForm, setDragOffsetCancelDischargeForm] = useState({ x: 0, y: 0 });
  const [bedTransferPos, setBedTransferPos] = useState({ x: 150, y: 50 });
  const [isDraggingBedTransfer, setIsDraggingBedTransfer] = useState(false);
  const [dragOffsetBedTransfer, setDragOffsetBedTransfer] = useState({ x: 0, y: 0 });

  // Discharge Encounter Popup State
  const [isDischargeEncounterOpen, setIsDischargeEncounterOpen] = useState(false);
  const [dischargeEncounterPos, setDischargeEncounterPos] = useState({ x: 150, y: 50 });
  const [isDraggingDischargeEncounter, setIsDraggingDischargeEncounter] = useState(false);
  const [dragOffsetDischargeEncounter, setDragOffsetDischargeEncounter] = useState({ x: 0, y: 0 });

  // YouTube Popup State
  const [isYoutubePopupOpen, setIsYoutubePopupOpen] = useState(false);
  const [youtubePopupPos, setYoutubePopupPos] = useState({ x: 300, y: 100 });
  const [isDraggingYoutube, setIsDraggingYoutube] = useState(false);
  const [dragOffsetYoutube, setDragOffsetYoutube] = useState({ x: 0, y: 0 });

  // Facility Transfer State
  const [isFacilityTransferOpen, setIsFacilityTransferOpen] = useState(false);
  const [isRecipientTransferOpen, setIsRecipientTransferOpen] = useState(false);

  // Resize handler for all popups
  const [popupSizes, setPopupSizes] = useState<Record<string, {width: number, height: number}>>({});

  const startResizing = (e: React.MouseEvent, popupId: string, direction: 'r' | 'b' | 'br') => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Default initial sizes for all popups
    const initialWidth = popupSizes[popupId]?.width || (
      popupId === 'youtube-popup' ? 640 :
      popupId === 'careTeam' ? 420 :
      popupId === 'dischargeEncounter' ? 900 :
      popupId === 'bedTransfer' ? 800 :
      popupId.startsWith('facilityTransfer') ? 520 :
      popupId === 'printLabels' ? 500 :
      popupId === 'processAlert' ? 720 :
      popupId === 'viewEncounter' ? 870 :
      popupId === 'subPopup' ? 540 :
      popupId === 'cancelWarning' ? 450 :
      popupId === 'cancelDischarge' ? 800 :
      popupId === 'reconcile' ? 1040 : 760 // Default is 760 (message popups)
    );
    const initialHeight = popupSizes[popupId]?.height || (
      popupId === 'youtube-popup' ? 420 :
      popupId === 'careTeam' ? 380 :
      popupId === 'dischargeEncounter' ? 600 :
      popupId === 'bedTransfer' ? 550 :
      popupId.startsWith('facilityTransfer') ? 425 :
      popupId === 'printLabels' ? 380 :
      popupId === 'processAlert' ? 500 :
      popupId === 'viewEncounter' ? 450 :
      popupId === 'subPopup' ? 380 :
      popupId === 'cancelWarning' ? 200 :
      popupId === 'cancelDischarge' ? 500 :
      popupId === 'reconcile' ? 650 : 400
    );

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      const newSize = {
        width: initialWidth,
        height: initialHeight
      };

      if (direction === 'r' || direction === 'br') {
        newSize.width = Math.max(300, initialWidth + dx);
      }
      if (direction === 'b' || direction === 'br') {
        newSize.height = Math.max(150, initialHeight + dy);
      }

      setPopupSizes(prev => ({
        ...prev,
        [popupId]: newSize
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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

  // Dragging handlers for Reconciliation, Sub-detail, Care Team and Print Labels popups
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
      if (isDraggingCareTeam) {
        setCareTeamPos({
          x: Math.max(0, e.clientX - dragOffsetCareTeam.x),
          y: Math.max(0, e.clientY - dragOffsetCareTeam.y),
        });
      }
      if (isDraggingPrintLabels) {
        setPrintLabelsPos({
          x: Math.max(0, e.clientX - dragOffsetPrintLabels.x),
          y: Math.max(0, e.clientY - dragOffsetPrintLabels.y),
        });
      }
      if (isDraggingProcessAlert) {
        setProcessAlertPos({
          x: Math.max(0, e.clientX - dragOffsetProcessAlert.x),
          y: Math.max(0, e.clientY - dragOffsetProcessAlert.y),
        });
      }
      if (isDraggingViewEncounter) {
        setViewEncounterPos({
          x: Math.max(0, e.clientX - dragOffsetViewEncounter.x),
          y: Math.max(0, e.clientY - dragOffsetViewEncounter.y),
        });
      }
      if (isDraggingBedTransfer) {
        setBedTransferPos({
          x: Math.max(0, e.clientX - dragOffsetBedTransfer.x),
          y: Math.max(0, e.clientY - dragOffsetBedTransfer.y),
        });
      }
      if (isDraggingDischargeEncounter) {
        setDischargeEncounterPos({
          x: Math.max(0, e.clientX - dragOffsetDischargeEncounter.x),
          y: Math.max(0, e.clientY - dragOffsetDischargeEncounter.y),
        });
      }
      if (isDraggingCancelWarning) {
        setCancelWarningPos({
          x: Math.max(0, e.clientX - dragOffsetCancelWarning.x),
          y: Math.max(0, e.clientY - dragOffsetCancelWarning.y),
        });
      }
      if (isDraggingCancelDischargeForm) {
        setCancelDischargeFormPos({
          x: Math.max(0, e.clientX - dragOffsetCancelDischargeForm.x),
          y: Math.max(0, e.clientY - dragOffsetCancelDischargeForm.y),
        });
      }
      if (isDraggingYoutube) {
        setYoutubePopupPos({
          x: Math.max(0, e.clientX - dragOffsetYoutube.x),
          y: Math.max(0, e.clientY - dragOffsetYoutube.y),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingReconcile) setIsDraggingReconcile(false);
      if (isDraggingSub) setIsDraggingSub(false);
      if (isDraggingCareTeam) setIsDraggingCareTeam(false);
      if (isDraggingPrintLabels) setIsDraggingPrintLabels(false);
      if (isDraggingProcessAlert) setIsDraggingProcessAlert(false);
      if (isDraggingViewEncounter) setIsDraggingViewEncounter(false);
      if (isDraggingBedTransfer) setIsDraggingBedTransfer(false);
      if (isDraggingDischargeEncounter) setIsDraggingDischargeEncounter(false);
      if (isDraggingCancelWarning) setIsDraggingCancelWarning(false);
      if (isDraggingCancelDischargeForm) setIsDraggingCancelDischargeForm(false);
      if (isDraggingYoutube) setIsDraggingYoutube(false);
    };

    if (isDraggingReconcile || isDraggingSub || isDraggingCareTeam || isDraggingPrintLabels || isDraggingProcessAlert || isDraggingViewEncounter || isDraggingBedTransfer || isDraggingDischargeEncounter || isDraggingCancelWarning || isDraggingCancelDischargeForm || isDraggingYoutube) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingReconcile, dragOffset, isDraggingSub, dragOffsetSub, isDraggingCareTeam, dragOffsetCareTeam, isDraggingPrintLabels, dragOffsetPrintLabels, isDraggingProcessAlert, dragOffsetProcessAlert, isDraggingViewEncounter, dragOffsetViewEncounter, isDraggingBedTransfer, dragOffsetBedTransfer, isDraggingDischargeEncounter, dragOffsetDischargeEncounter, isDraggingCancelWarning, dragOffsetCancelWarning, isDraggingCancelDischargeForm, dragOffsetCancelDischargeForm, isDraggingYoutube, dragOffsetYoutube]);

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

  // Real Scheduling Engine States
  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [calendarOffsetDays, setCalendarOffsetDays] = useState(0);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedApptTypeId, setSelectedApptTypeId] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any | null>(null);
  const [activeHold, setActiveHold] = useState<any | null>(null);
  const [rescheduleReasonSelect, setRescheduleReasonSelect] = useState('Patient Request');
  const [rescheduleReasonText, setRescheduleReasonText] = useState('Patient is not available at current time. Requesting to reschedule.');
  const [appointmentHistoryList, setAppointmentHistoryList] = useState<any[]>([]);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  const loadAvailabilityData = async (docId: string, typeId?: string, offset = 0, excludeId?: string) => {
    if (!docId) return;
    setIsLoadingAvailability(true);
    try {
      const from = new Date();
      from.setDate(from.getDate() + offset);
      const to = new Date(from);
      to.setDate(to.getDate() + 4);

      const res = await SchedulingAPI.getAvailability({
        practitionerId: docId,
        appointmentTypeId: typeId,
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
        excludeAppointmentId: excludeId,
      });
      setAvailabilityData(res);
    } catch (err) {
      console.error('Failed to calculate availability:', err);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleOpenRescheduleModal = async (row: any) => {
    setSelectedRescheduleReq(row);
    setShowRescheduleModal(true);
    setSelectedTimeSlot(null);
    setActiveHold(null);
    setCalendarOffsetDays(0);

    const docId = row.appointment?.doctorId || row.doctorId || (doctorsList[0]?.id);
    if (docId) {
      setSelectedDoctorId(docId);
      const apptTypeId = row.appointment?.appointmentTypeId || (appointmentTypesList[0]?.id);
      if (apptTypeId) setSelectedApptTypeId(apptTypeId);

      loadAvailabilityData(docId, apptTypeId, 0, row.appointmentId || row.id);
    }

    if (row.appointmentId) {
      try {
        const history = await AppointmentAPI.getHistory(row.appointmentId);
        setAppointmentHistoryList(history);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSelectSlot = async (slot: any) => {
    if (slot.status !== 'AVAILABLE') return;
    setSelectedTimeSlot(slot);

    try {
      if (selectedDoctorId) {
        const hold = await AppointmentHoldAPI.create({
          doctorId: selectedDoctorId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
        setActiveHold(hold);
      }
    } catch (err: any) {
      alert(err.message || 'Slot conflict or hold error');
      if (selectedDoctorId) {
        loadAvailabilityData(selectedDoctorId, selectedApptTypeId, calendarOffsetDays, selectedRescheduleReq?.appointmentId || selectedRescheduleReq?.id);
      }
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedTimeSlot) {
      alert('Please select a new appointment slot from the calendar.');
      return;
    }

    const apptId = selectedRescheduleReq.appointmentId || selectedRescheduleReq.appointment?.id;
    if (!apptId) {
      alert('No active appointment ID found for rescheduling.');
      return;
    }

    setIsSubmittingReschedule(true);
    try {
      await AppointmentAPI.reschedule(apptId, {
        newStartTime: selectedTimeSlot.startTime,
        durationMinutes: selectedTimeSlot.durationMinutes,
        reason: `${rescheduleReasonSelect}: ${rescheduleReasonText}`,
      });

      if (selectedRescheduleReq.id && !String(selectedRescheduleReq.id).startsWith('REQ-2025-')) {
        await AppointmentRequestAPI.complete(selectedRescheduleReq.id, {
          status: 'APPROVED',
          notes: 'Reschedule confirmed by staff.',
        });
      }

      alert('Appointment successfully rescheduled!');
      setShowRescheduleModal(false);
      setSelectedRescheduleReq(null);
      setSelectedTimeSlot(null);
      setActiveHold(null);

      const reqs = await AppointmentRequestAPI.list().catch(() => []);
      if (Array.isArray(reqs)) setDbRescheduleRequests(reqs);
    } catch (err: any) {
      alert(`Reschedule failed: ${err.message || 'Slot conflict'}`);
      if (selectedDoctorId) {
        loadAvailabilityData(selectedDoctorId, selectedApptTypeId, calendarOffsetDays, apptId);
      }
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const handleCancelRequest = async () => {
    if (selectedRescheduleReq?.id && !String(selectedRescheduleReq.id).startsWith('REQ-2025-')) {
      try {
        await AppointmentRequestAPI.complete(selectedRescheduleReq.id, {
          status: 'DECLINED',
          notes: 'Request cancelled by staff.',
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (activeHold?.id) {
      AppointmentHoldAPI.release(activeHold.id).catch(() => null);
    }

    setShowRescheduleModal(false);
    setSelectedRescheduleReq(null);
    setSelectedTimeSlot(null);
    setActiveHold(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    await auth?.login(email, password);
  };

  const handleLogout = async () => {
    await auth?.logout();
    setEmail('');
    setPassword('');
    setOpenTabs([{ id: 'patient-doe', title: 'Patient Profile: JOHN DOE', type: 'PatientProfile' }]);
    setActiveTabId('patient-doe');
  };

  const handleSearchExistingPatient = async () => {
    try {
      let query = '';
      if (admitSearchBy === 'Aadhaar' && admitSearchAadhaar) {
        query = admitSearchAadhaar;
      } else if (admitSearchFirst || admitSearchLast) {
        query = `${admitSearchFirst} ${admitSearchLast}`.trim();
      }
      if (!query) {
        alert('Please enter a search term (First Name, Last Name, or Aadhaar Number).');
        return;
      }

      const res = await apiClient.get(`/patients?q=${encodeURIComponent(query)}`);
      const results = res.data || [];
      if (results.length === 0) {
        alert('No matching patient records found in hospital database.');
      } else {
        const p = results[0];
        setAdmitTitle(p.title || 'Select');
        setAdmitFirst(p.firstName || '');
        setAdmitMiddle(p.middleName || '');
        setAdmitLast(p.lastName || '');
        setAdmitDobVal(p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-GB') : '');
        setAdmitGender(p.gender ? p.gender.charAt(0) + p.gender.slice(1).toLowerCase() : 'Select');
        setAdmitMobileVal(p.phone || '');
        setAdmitEmailVal(p.email || '');
        setAdmitAddr1(p.addressLine1 || '');
        setAdmitCityVal(p.city || '');
        alert(`Found matching patient: ${p.firstName} ${p.lastName} (MRN: ${p.mrn}). Details populated!`);
      }
    } catch (err: any) {
      alert(`Search Error: ${err?.message || 'Search failed'}`);
    }
  };

  const handleSaveAndAdmit = async () => {
    if (!admitFirst || !admitLast || !admitDobVal || !admitMobileVal) {
      alert('Please fill in all required fields marked with * (First Name, Last Name, Date of Birth, Mobile Number).');
      return;
    }

    setIsSubmittingAdmit(true);
    try {
      const payload = {
        title: admitTitle !== 'Select' ? admitTitle : undefined,
        firstName: admitFirst,
        middleName: admitMiddle || undefined,
        lastName: admitLast,
        dateOfBirth: admitDobVal.includes('/')
          ? admitDobVal.split('/').reverse().join('-')
          : admitDobVal,
        gender: admitGender !== 'Select' ? admitGender.toUpperCase() : 'MALE',
        maritalStatus: admitMarital !== 'Select' ? admitMarital.toUpperCase() : 'SINGLE',
        bloodGroup: admitBlood !== 'Select' ? admitBlood.replace('+', '_POSITIVE').replace('-', '_NEGATIVE') : undefined,
        phone: admitMobileVal,
        alternateMobile: admitAltMobile || undefined,
        email: admitEmailVal || undefined,
        nationality: admitNation !== 'Select' ? admitNation : undefined,
        religion: admitReligion !== 'Select' ? admitReligion : undefined,
        language: admitLang !== 'Select' ? admitLang : undefined,
        addressLine1: admitAddr1,
        addressLine2: admitAddr2 || undefined,
        landmark: admitLandmark || undefined,
        city: admitCityVal,
        state: admitStateVal !== 'Select' ? admitStateVal : undefined,
        country: admitCountryVal,
        postalCode: admitZipVal,
        admissionType: admitTypeVal !== 'Select' ? admitTypeVal : 'Routine',
        visitType: admitVisitVal !== 'Select' ? admitVisitVal : 'Inpatient',
        referredBy: admitReferredBy || undefined,
        referringDoctor: admitRefDoctor || undefined,
        department: admitDeptVal !== 'Select' ? admitDeptVal : 'General Medicine',
        bedId: admitBedRoom || undefined,
        primaryInsurance: admitInsPrimary !== 'Select' ? admitInsPrimary : undefined,
        insuranceId: admitInsIdVal || undefined,
        policyId: admitPolicyId || undefined,
      };

      const res = await apiClient.post('/admissions/admit-workflow', payload);
      alert(`Patient ${res.patient?.firstName || admitFirst} ${res.patient?.lastName || admitLast} admitted successfully!\nMRN: ${res.patient?.mrn || 'Assigned'}\nBed: ${res.bed?.bedNumber || 'Unassigned'}`);
      selectOrOpenTab('PatientList', 'Patient List', 'patient-list-tab');
    } catch (err: any) {
      alert(`Admission Error: ${err?.message || 'Failed to submit admission'}`);
    } finally {
      setIsSubmittingAdmit(false);
    }
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

  const openLabReportTab = (row: any) => {
    const reportId = `lab-report-${row.patientName.replace(/[^a-zA-Z0-9]/g, '')}-${row.orderPlanName.replace(/[^a-zA-Z0-9]/g, '')}`;
    setOpenedLabReports(prev => ({ ...prev, [reportId]: row }));
    
    let cleanTitle = row.patientName;
    if (cleanTitle.includes(',')) {
      const parts = cleanTitle.split(',');
      const first = parts[1].trim();
      const last = parts[0].trim();
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      cleanTitle = `${capitalize(first)} ${capitalize(last)}`;
    }
    
    selectOrOpenTab('LabReportDetail', `Lab Report: ${cleanTitle}`, reportId);
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
    { priority: 'Medium', priorityColor: 'text-orange-600', icon: '✉️', name: 'New Plan Received', patient: 'Patel, Rahul', mrn: '1000245679', category: 'Plans', message: 'MRI Brain WO Contrast', dateTime: '28/05/2025 09:48 AM', status: 'Unread', statusColor: 'text-red-600 font-bold' },
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
    { patientName: 'JAMES, WILLIAM', orderPlanName: 'CBC with Differential', action: 'Plan', detailsDate: '05/28/17 08:30', detailsDesc: 'Routine blood test', comment: 'AXIO, MD', originator: 'AXIO, MD', createDate: '05/28/2017 08:30', stopDate: '05/28/2017 08:30', stopType: 'Physician Stop', status: 'Open' },
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
  const [selectedLabOrder, setSelectedLabOrder] = useState<any>(null);
  const [openedLabReports, setOpenedLabReports] = useState<Record<string, any>>({});
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
      <HomePage
        selectOrOpenTab={selectOrOpenTab}
        openDropdownChart={openDropdownChart}
        setOpenDropdownChart={setOpenDropdownChart}
        chartSelections={chartSelections}
        setChartSelections={setChartSelections}
        mockChartData={mockChartData}
      />
    );
  }

  if (activeTab.type === 'DeveloperTools') {
    return (
      <DeveloperToolsPage
        handleLogout={handleLogout}
        selectOrOpenTab={selectOrOpenTab}
        devSidebarExpanded={devSidebarExpanded}
        setDevSidebarExpanded={setDevSidebarExpanded}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginPage
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loginDomain={loginDomain}
        setLoginDomain={setLoginDomain}
        handleLogin={handleLogin}
        auth={auth}
      />
    );
  }
  return (
    <div onMouseMove={handleDrag} onMouseUp={handleEndDrag} className="flex flex-col h-screen bg-[#f0f4f8] text-[#1c2833] text-[11px] font-sans overflow-hidden select-none">
      
      {!isFullscreen && (
        <>
          {/* Top Header styled as a single bright bar */}
          <div className="bg-[#f0f4f8] border-b border-[#bdcddc] px-3 py-1 flex gap-3 text-[#2c3e50] text-[11px] items-center relative z-50">
            <div className="flex items-center gap-2 select-none pr-3">
              <span className="font-bold text-xs tracking-wide text-[#0f4471]">Axiovital HRM</span>
            </div>
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
                className="hover:bg-[#dbe6ef] hover:text-[#002a46] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#2c3e50]"
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
        <button className="hover:bg-[#dbe6ef] hover:text-[#002a46] px-1.5 py-0.5 rounded-sm transition-colors text-[#2c3e50] font-semibold">
          Ledger
        </button>

        {/* Patient Dropdown Trigger */}
        <div className="relative group">
          <button className="hover:bg-[#dbe6ef] hover:text-[#002a46] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#2c3e50]">
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
          <button className="hover:bg-[#dbe6ef] hover:text-[#002a46] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#2c3e50]">
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
          className="hover:bg-[#dbe6ef] hover:text-[#002a46] px-1.5 py-0.5 rounded-sm transition-colors text-[#2c3e50] font-semibold"
        >
          Notifications
        </button>

        {/* Admin Dropdown Trigger */}
        <div className="relative group">
          <button className="hover:bg-[#dbe6ef] hover:text-[#002a46] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#2c3e50]">
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
            className="hover:bg-[#dbe6ef] hover:text-[#002a46] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#2c3e50]"
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
              <div 
                onClick={() => { selectOrOpenTab('ProcessExplorer', 'Process Explorer', 'process-explorer-tab'); setIsHelpDropdownOpen(false); }}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]"
              >
                Open Process Explorer
              </div>
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
        <div className="ml-auto flex items-center gap-2 pr-1 relative">
          <button 
            onClick={() => setIsYoutubePopupOpen(true)}
            className="text-gray-500 hover:text-black p-1 hover:bg-black/5 rounded transition-colors" 
            title="Presentation"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 3h18" />
              <rect x="4" y="3" width="16" height="12" rx="1" />
              <rect x="9" y="6" width="6" height="6" rx="1" />
              <polygon points="11.5,7.5 13.5,9 11.5,10.5" fill="currentColor" />
              <path d="M12 15v4" />
              <path d="M9 19h6" />
            </svg>
          </button>
          <div 
            onClick={() => setIsRibbon0DropdownOpen(!isRibbon0DropdownOpen)} 
            className="flex flex-col gap-[2px] cursor-pointer hover:bg-black/5 p-1.5 rounded transition-colors" 
            title="Customize Menu Bar"
          >
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
          </div>
          {isRibbon0DropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-[#0f4471] border border-[#0d3b62] text-white text-[11px] py-1 w-[220px] shadow-lg rounded-sm select-none z-[120] text-left font-sans">
              <div 
                onClick={() => { selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab'); setIsRibbon0DropdownOpen(false); }}
                className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center"
              >
                <span>Show Opened Editors</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon0DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Close All</span>
                <span className="text-[9px] text-[#93c5fd]">Ctrl+K W</span>
              </div>
              <div onClick={() => setIsRibbon0DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Close Saved</span>
                <span className="text-[9px] text-[#93c5fd]">Ctrl+K U</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon0DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Enable Preview Editors</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon0DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Lock Group</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div 
                onClick={() => { selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab'); setIsRibbon0DropdownOpen(false); }}
                className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center"
              >
                <span>Configure Editors</span>
              </div>
            </div>
          )}
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
        <button 
          onClick={() => selectOrOpenTab('PhysicianHandoff', 'Physician Handoff', 'physician-handoff-tab')} 
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold"
        >
          Physician Handoff
        </button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Care Workflow</button>
        <button onClick={() => selectOrOpenTab('QualityMeasures', 'Quality Measures', 'quality-measures-tab')} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Quality Measures</button>
        <button onClick={() => selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab')} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Customised</button>
        <button 
          onClick={() => selectOrOpenTab('Reports', 'Results Review', 'results-review-tab')} 
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold"
        >
          Reports
        </button>
        <button onClick={() => selectOrOpenTab('ClinicalEventView', 'Clinic Event Page', 'clinical-event-view-tab')} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold">UpToDate</button>

        <button onClick={() => selectOrOpenTab('ProtocolLibrary', 'Ongoing Activities', 'protocol-library-tab')} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold">Ongoing Activities</button>

        {/* Modifying 3-dots (Right Side) */}
        <div className="ml-auto flex items-center pr-1 relative">
          <div 
            onClick={() => setIsRibbon1DropdownOpen(!isRibbon1DropdownOpen)}
            className="flex flex-col gap-[2px] cursor-pointer hover:bg-gray-200 p-1.5 rounded transition-colors" 
            title="Customize Toolbar"
          >
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
          </div>
          {isRibbon1DropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-[#0f4471] border border-[#0d3b62] text-white text-[11px] py-1 w-[220px] shadow-lg rounded-sm select-none z-[120] text-left font-sans">
              <div 
                onClick={() => { selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab'); setIsRibbon1DropdownOpen(false); }}
                className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center"
              >
                <span>Show Opened Editors</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon1DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Close All</span>
                <span className="text-[9px] text-[#93c5fd]">Ctrl+K W</span>
              </div>
              <div onClick={() => setIsRibbon1DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Close Saved</span>
                <span className="text-[9px] text-[#93c5fd]">Ctrl+K U</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon1DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Enable Preview Editors</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon1DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Lock Group</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div 
                onClick={() => { selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab'); setIsRibbon1DropdownOpen(false); }}
                className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center"
              >
                <span>Configure Editors</span>
              </div>
            </div>
          )}
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
        <div className="ml-auto flex items-center pr-1 relative">
          <div 
            onClick={() => setIsRibbon2DropdownOpen(!isRibbon2DropdownOpen)}
            className="flex flex-col gap-[2px] cursor-pointer hover:bg-gray-200 p-1.5 rounded transition-colors" 
            title="Customize Shortcut Row"
          >
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
            <div className="w-[3px] h-[3px] bg-[#5c4b4a] rounded-full"></div>
          </div>
          {isRibbon2DropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-[#0f4471] border border-[#0d3b62] text-white text-[11px] py-1 w-[220px] shadow-lg rounded-sm select-none z-[120] text-left font-sans">
              <div 
                onClick={() => { selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab'); setIsRibbon2DropdownOpen(false); }}
                className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center"
              >
                <span>Show Opened Editors</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon2DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Close All</span>
                <span className="text-[9px] text-[#93c5fd]">Ctrl+K W</span>
              </div>
              <div onClick={() => setIsRibbon2DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Close Saved</span>
                <span className="text-[9px] text-[#93c5fd]">Ctrl+K U</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon2DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Enable Preview Editors</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div onClick={() => setIsRibbon2DropdownOpen(false)} className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center">
                <span>Lock Group</span>
              </div>
              <div className="border-t border-[#1c5a8e] my-1"></div>
              <div 
                onClick={() => { selectOrOpenTab('Customised', 'Customised Organizer', 'customised-tab'); setIsRibbon2DropdownOpen(false); }}
                className="px-4 py-1.5 hover:bg-[#185d95] cursor-pointer flex justify-between items-center"
              >
                <span>Configure Editors</span>
              </div>
            </div>
          )}
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
          {activeTab.type === 'ProcessExplorer' && 'Process Explorer'}
          {activeTab.type === 'BillingReceipt' && 'Billing & Payments Receipt'}
          {activeTab.type === 'ClinicalEventView' && 'Clinic Event Page'}
          {activeTab.type === 'ProtocolLibrary' && 'Ongoing Activities'}
          {activeTab.type === 'QualityMeasures' && 'Quality Measures'}
          {activeTab.type === 'PhysicianHandoff' && 'Results Flowsheet'}
          {activeTab.type === 'Reports' && 'Results Review'}
          {activeTab.type === 'LabReportDetail' && 'Laboratory Report'}
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
          
          <button 
            onClick={handleRefresh}
            className="text-[#c1d6e5] hover:text-white text-[10.5px] flex items-center gap-1.5 transition-all font-semibold bg-transparent border-none py-0.5 px-1.5 focus:outline-none cursor-pointer select-none active:scale-95"
            title="Refresh current workspace"
          >
            <svg className={`w-3.5 h-3.5 text-[#c1d6e5] hover:text-white transition-transform duration-700 ${isRefreshing ? 'rotate-180 animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{minutesAgo} minutes ago</span>
          </button>
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
            <MessageCenterTab
              messageCenterView={messageCenterView}
              setMessageCenterView={setMessageCenterView}
              selectedMessage={selectedMessage}
              setSelectedMessage={setSelectedMessage}
              openMessagePopupCard={openMessagePopupCard}
              selectOrOpenTab={selectOrOpenTab}
              mockOrdersData={mockOrdersData}
            />
          )}

          {activeTab.type === 'Customised' && <CustomisedTab />}

          {activeTab.type === 'ClinicalEventView' && <ClinicalEventViewTab />}

          {activeTab.type === 'ProtocolLibrary' && <ProtocolLibraryTab />}

          {activeTab.type === 'QualityMeasures' && <QualityMeasuresTab />}

          {activeTab.type === 'Analytics' && (
            <AnalyticsTab mockChartData={mockChartData} />
          )}

          {activeTab.type === 'PatientList' && (
            <PatientListTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              apiPatients={apiPatients}
              selectOrOpenTab={selectOrOpenTab}
            />
          )}

          {activeTab.type === 'Notifications' && (
            <NotificationsTab
              notifType={notifType}
              setNotifType={setNotifType}
              notifPriority={notifPriority}
              setNotifPriority={setNotifPriority}
              notifStatus={notifStatus}
              setNotifStatus={setNotifStatus}
              notifFromDate={notifFromDate}
              setNotifFromDate={setNotifFromDate}
              notifToDate={notifToDate}
              setNotifToDate={setNotifToDate}
              notifSearch={notifSearch}
              setNotifSearch={setNotifSearch}
              openMessagePopupCard={openMessagePopupCard}
              selectOrOpenTab={selectOrOpenTab}
            />
          )}

          {activeTab.type === 'PhysicianHandoff' && <PhysicianHandoffTab />}

          {activeTab.type === 'Reports' && (
            <ReportsTab
              reportsSubTab={reportsSubTab}
              setReportsSubTab={setReportsSubTab}
              reportsNavigator={reportsNavigator}
              setReportsNavigator={setReportsNavigator}
              selectedReportsCell={selectedReportsCell}
              setSelectedReportsCell={setSelectedReportsCell}
              showReportsContextMenu={showReportsContextMenu}
              setShowReportsContextMenu={setShowReportsContextMenu}
              reportsContextMenuPosition={reportsContextMenuPosition}
              setReportsContextMenuPosition={setReportsContextMenuPosition}
            />
          )}

          {activeTab.type === 'PatientProfile' && (
            <PatientProfileTab
              activeTab={activeTab}
              isSidebarCollapsed={isSidebarCollapsed}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
              profileSidebarOption={profileSidebarOption}
              setProfileSidebarOption={setProfileSidebarOption}
              isDetailedOrderActive={isDetailedOrderActive}
              setIsDetailedOrderActive={setIsDetailedOrderActive}
              isReconcileOpen={isReconcileOpen}
              setIsReconcileOpen={setIsReconcileOpen}
              profileTab={profileTab}
              setProfileTab={setProfileTab}
              selectedDocIndex={selectedDocIndex}
              setSelectedDocIndex={setSelectedDocIndex}
              selectOrOpenTab={selectOrOpenTab}
              ordersSearchQuery={ordersSearchQuery}
              setOrdersSearchQuery={setOrdersSearchQuery}
              isOrdersDropdownOpen={isOrdersDropdownOpen}
              setIsOrdersDropdownOpen={setIsOrdersDropdownOpen}
              setIsNewOrderModalOpen={setIsNewOrderModalOpen}
            />
          )}

          {activeTab.type === 'EditPatientProfile' && (
            <EditPatientProfileTab
              pdDob={pdDob}
              setPdDob={setPdDob}
              pdPhone={pdPhone}
              setPdPhone={setPdPhone}
              selectOrOpenTab={selectOrOpenTab}
            />
          )}

          {activeTab.type === 'MedicalReport' && <MedicalReportTab />}

          {activeTab.type === 'PatientNotes' && <PatientNotesTab activeTab={activeTab} closeTab={closeTab} />}

          {activeTab.type === 'HelpCentre' && (
            <HelpCentreTab
              isHelpDropdownOpen={isHelpDropdownOpen}
              setIsHelpDropdownOpen={setIsHelpDropdownOpen}
            />
          )}

          {activeTab.type === 'ProcessExplorer' && <ProcessExplorerTab />}

          {activeTab.type === 'RescheduleRequests' && (
            <RescheduleRequestsTab
              dbRescheduleRequests={dbRescheduleRequests}
              handleOpenRescheduleModal={handleOpenRescheduleModal}
              selectOrOpenTab={selectOrOpenTab}
            />
          )}

          {activeTab.type === 'AdmitPatient' && <AdmitPatientTab />}

          {activeTab.type === 'ReferralTransfer' && <ReferralTransferTab selectOrOpenTab={selectOrOpenTab} />}

          {activeTab.type === 'DischargeList' && <DischargeListTab selectOrOpenTab={selectOrOpenTab} />}

          {activeTab.type === 'Orders' && (
            <OrdersTab
              mockOrdersData={mockOrdersData}
              setIsNewOrderModalOpen={setIsNewOrderModalOpen}
              selectOrOpenTab={selectOrOpenTab}
              openLabReportTab={openLabReportTab}
            />
          )}

          {activeTab.type === 'Labs' && (
            <LabsTab selectOrOpenTab={selectOrOpenTab} openLabReportTab={openLabReportTab} />
          )}

          {activeTab.type === 'LabReportDetail' && (
            <LabReportDetailTab
              activeTab={activeTab}
              openedLabReports={openedLabReports}
            />
          )}

          {activeTab.type === 'BillingReceipt' && <BillingReceiptTab />}

          {activeTab.type === 'ClinicalDecisionSupport' && (
            <ClinicalDecisionSupportTab
              cdsDrugDrug={cdsDrugDrug}
              setCdsDrugDrug={setCdsDrugDrug}
              cdsDrugAllergy={cdsDrugAllergy}
              setCdsDrugAllergy={setCdsDrugAllergy}
              cdsDuplicateTherapy={cdsDuplicateTherapy}
              setCdsDuplicateTherapy={setCdsDuplicateTherapy}
              cdsRenalDosing={cdsRenalDosing}
              setCdsRenalDosing={setCdsRenalDosing}
              cdsGeriatric={cdsGeriatric}
              setCdsGeriatric={setCdsGeriatric}
              cdsSeverityThreshold={cdsSeverityThreshold}
              setCdsSeverityThreshold={setCdsSeverityThreshold}
              cdsSepsisRule={cdsSepsisRule}
              setCdsSepsisRule={setCdsSepsisRule}
              cdsRetinopathyRule={cdsRetinopathyRule}
              setCdsRetinopathyRule={setCdsRetinopathyRule}
              cdsFluVaccineRule={cdsFluVaccineRule}
              setCdsFluVaccineRule={setCdsFluVaccineRule}
              cdsInterruptiveAlerts={cdsInterruptiveAlerts}
              setCdsInterruptiveAlerts={setCdsInterruptiveAlerts}
              cdsBannerAlerts={cdsBannerAlerts}
              setCdsBannerAlerts={setCdsBannerAlerts}
              cdsSidebarAlerts={cdsSidebarAlerts}
              setCdsSidebarAlerts={setCdsSidebarAlerts}
              cdsAuditLogs={cdsAuditLogs}
            />
          )}
        </div>

      </div>

      {/* Footer Bar */}
      {!isFullscreen && (
        <div className="bg-[#002a46] text-white px-3 py-1 flex justify-between items-center text-[9.5px] border-t border-[#001729]">
          <span>Ready</span>
          <span>Patient: {statusBarPatient.name} ( MRN: {statusBarPatient.mrn} )</span>
          <span>User: {getUserDisplayName()}</span>
          <span>AXIOVITAL HEALTHCARE SYSTEM</span>
          <span>{loginDomain}</span>
          <span>{statusBarDateTime || '05/28/2025 03:45 PM'}</span>
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
                    { label: 'Add/Modify Person', icon: '👤', action: () => { selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe'); setShowConversationLauncher(false); } },
                    { label: 'Bed Transfer', icon: '🛏️', action: () => { selectOrOpenTab('ReferralTransfer', 'Referrals & Transfers', 'referrals-transfers-tab'); setShowConversationLauncher(false); } },
                    { label: 'Cancel Discharge', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Encounter', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Pending...', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Pendi...', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Cancel Transfer', icon: '❌', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Discharge Encounter', icon: '🚪', action: () => { selectOrOpenTab('DischargeList', 'Discharge List', 'discharge-list-tab'); setShowConversationLauncher(false); } },
                    { label: 'Facility Transfer', icon: '🏥', action: () => { selectOrOpenTab('ReferralTransfer', 'Referrals & Transfers', 'referrals-transfers-tab'); setShowConversationLauncher(false); } },
                    { label: 'Leave of Absence', icon: '🚶', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Modify Discharge', icon: '📝', action: () => { selectOrOpenTab('DischargeList', 'Discharge List', 'discharge-list-tab'); setShowConversationLauncher(false); } },
                    { label: 'Newborn Modify', icon: '👶', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Newborn Quick Reg', icon: '👶', action: () => { selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Pending Discharge', icon: '⏳', action: () => { selectOrOpenTab('DischargeList', 'Discharge List', 'discharge-list-tab'); setShowConversationLauncher(false); } },
                    { label: 'Pending Facil...', icon: '⏳', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Pending Transfer', icon: '⏳', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Pre-Register Outpatient', icon: '📋', action: () => { selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Pre-Register Patient To...', icon: '📋', action: () => { selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Print Specimen Labels', icon: '🏷️', action: () => { selectOrOpenTab('Labs', 'Labs', 'labs-tab'); setShowConversationLauncher(false); } },
                    { label: 'Process Alert', icon: '⚠️', action: () => { setIsProcessAlertOpen(true); setShowConversationLauncher(false); } },
                    { label: 'Quick Reg', icon: '⚡', action: () => { selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Referral Management', icon: '👔', action: () => { selectOrOpenTab('ReferralTransfer', 'Referrals & Transfers', 'referrals-transfers-tab'); setShowConversationLauncher(false); } },
                    { label: 'Register Outpatient', icon: '🏥', action: () => { selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Register Patient To...', icon: '🏥', action: () => { selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } },
                    { label: 'Stillborn', icon: '👼', action: () => { setShowConversationLauncher(false); } },
                    { label: 'Update Patient Information', icon: '🔄', action: () => { selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe'); setShowConversationLauncher(false); } },
                    { label: 'View Encounter', icon: '👁️', action: () => { setIsViewEncounterOpen(true); setShowConversationLauncher(false); } },
                    { label: 'View Person', icon: '👤', action: () => { selectOrOpenTab('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe'); setShowConversationLauncher(false); } },
                    { label: 'WH Quick Reg', icon: '⚡', action: () => { selectOrOpenTab('AdmitPatient', 'Admit Patient', 'admit-patient-tab'); setShowConversationLauncher(false); } }
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
                <h4 className="font-bold text-[#0f4471] border-b pb-1.5 mb-2.5 flex justify-between items-center">
                  <span>2. Select New Appointment Slot</span>
                  {activeHold && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[8.5px] font-mono">
                      ⏳ Slot Held (Expires: {new Date(activeHold.expiresAt).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })})
                    </span>
                  )}
                </h4>
                
                {/* Form Selection Ribbon */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="space-y-0.5">
                    <label className="text-gray-400 text-[9px] uppercase font-bold">Provider</label>
                    <select 
                      value={selectedDoctorId} 
                      onChange={(e) => {
                        const newDocId = e.target.value;
                        setSelectedDoctorId(newDocId);
                        setSelectedTimeSlot(null);
                        setActiveHold(null);
                        loadAvailabilityData(newDocId, selectedApptTypeId, calendarOffsetDays, selectedRescheduleReq?.appointmentId || selectedRescheduleReq?.id);
                      }}
                      className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none font-semibold"
                    >
                      {doctorsList.length > 0 ? doctorsList.map((d: any) => (
                        <option key={d.id} value={d.id}>Dr. {d.user?.firstName || ''} {d.user?.lastName || ''} ({d.specialization || d.department || 'General'})</option>
                      )) : (
                        <option value={selectedDoctorId}>{selectedRescheduleReq.dept}</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-gray-400 text-[9px] uppercase font-bold">Visit Type</label>
                    <select 
                      value={selectedApptTypeId}
                      onChange={(e) => {
                        const newTypeId = e.target.value;
                        setSelectedApptTypeId(newTypeId);
                        setSelectedTimeSlot(null);
                        loadAvailabilityData(selectedDoctorId, newTypeId, calendarOffsetDays, selectedRescheduleReq?.appointmentId || selectedRescheduleReq?.id);
                      }}
                      className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none font-semibold"
                    >
                      {appointmentTypesList.length > 0 ? appointmentTypesList.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>
                      )) : (
                        <>
                          <option value="FOLLOW_UP">Follow-up Visit (15 min)</option>
                          <option value="NEW_CONSULTATION">New Consultation (30 min)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-gray-400 text-[9px] uppercase font-bold">Location / Unit</label>
                    <select className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none font-semibold">
                      <option>Neurology OPD Room 3</option>
                      <option>Cardiology Suite 1</option>
                      <option>General Medicine OPD 2</option>
                    </select>
                  </div>
                </div>

                {/* Calendar Slot selector */}
                <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded">
                  {/* Date range header */}
                  <div className="bg-[#cbd8e3]/30 px-3 py-1.5 border-b border-gray-200 flex justify-between items-center select-none">
                    <button 
                      onClick={() => {
                        const newOffset = calendarOffsetDays - 5;
                        setCalendarOffsetDays(newOffset);
                        loadAvailabilityData(selectedDoctorId, selectedApptTypeId, newOffset, selectedRescheduleReq?.appointmentId || selectedRescheduleReq?.id);
                      }}
                      className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold border border-gray-300 bg-white cursor-pointer"
                    >
                      ❮
                    </button>
                    <span className="font-bold text-gray-700">
                      📅 {availabilityData?.dates?.[0]?.date || 'Loading dates...'} – {availabilityData?.dates?.[availabilityData?.dates?.length - 1]?.date || ''} ({availabilityData?.timeZone || 'UTC'})
                    </span>
                    <button 
                      onClick={() => {
                        const newOffset = calendarOffsetDays + 5;
                        setCalendarOffsetDays(newOffset);
                        loadAvailabilityData(selectedDoctorId, selectedApptTypeId, newOffset, selectedRescheduleReq?.appointmentId || selectedRescheduleReq?.id);
                      }}
                      className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold border border-gray-300 bg-white cursor-pointer"
                    >
                      ❯
                    </button>
                  </div>

                  {/* Calendar columns grid */}
                  {isLoadingAvailability ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-gray-500 font-semibold text-[11px]">
                      ⚡ Calculating real doctor availability...
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto grid grid-cols-5 text-center divide-x divide-gray-100 text-[9.5px]">
                      {availabilityData?.dates?.map((col, idx) => (
                        <div key={idx} className="flex flex-col border-r border-gray-100">
                          <div className="h-[28px] font-bold text-gray-700 bg-gray-50 flex items-center justify-center border-b border-gray-200 select-none">
                            {col.dayOfWeek.substring(0, 3)} {col.date}
                          </div>
                          <div className="flex-1 py-1 space-y-1 px-1 overflow-y-auto max-h-[340px]">
                            {col.slots && col.slots.length > 0 ? col.slots.map((slot, slotIdx) => {
                              const isSelected = selectedTimeSlot?.startTime === slot.startTime;
                              let style = 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer';
                              if (slot.status === 'BOOKED') style = 'bg-gray-150 border-gray-200 text-gray-400 cursor-not-allowed select-none';
                              if (slot.status === 'HELD') style = 'bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed';
                              if (slot.status === 'UNAVAILABLE') style = 'bg-white border-gray-100 text-gray-300 cursor-not-allowed';
                              if (isSelected) style = 'bg-blue-600 border-blue-700 text-white font-bold cursor-pointer ring-2 ring-blue-400';

                              return (
                                <button 
                                  key={slotIdx} 
                                  disabled={slot.status !== 'AVAILABLE'}
                                  onClick={() => handleSelectSlot(slot)}
                                  className={`w-full py-1 border text-[9px] rounded-sm font-semibold transition-all ${style}`}
                                >
                                  {slot.time}
                                </button>
                              );
                            }) : (
                              <div className="text-gray-400 py-4 text-[9px]">OFF</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Slot selection legend footer */}
                  <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 flex gap-4 text-[9px] text-gray-500 font-bold select-none">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-100 border border-green-300 rounded-sm"></span> Available</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-600 border border-blue-700 rounded-sm"></span> Selected</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gray-200 border border-gray-300 rounded-sm"></span> Booked</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded-sm"></span> Held</span>
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
                      <span className="font-semibold">{selectedRescheduleReq.requestedOn?.split(' by ')[0] || 'Today'}</span>
                    </div>

                    <div className="flex justify-between border-b pb-0.5 flex-col">
                      <span className="text-gray-400">Requested By</span>
                      <span className="font-semibold text-gray-900">{selectedRescheduleReq.requestedOn?.split(' by ')[1] || 'Patient'}</span>
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
                      <p className="text-gray-700 italic text-[9.5px] leading-tight">{selectedRescheduleReq.reason || 'Patient requested to change appointment time.'}</p>
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
                      {appointmentHistoryList.length > 0 ? appointmentHistoryList.map((hist: any, idx: number) => (
                        <div key={idx} className={`relative pl-3 border-l-2 ${hist.toStatus === 'SCHEDULED' ? 'border-green-500' : 'border-amber-500'}`}>
                          <div className="font-bold text-gray-800 text-[9.5px]">{hist.toStatus}</div>
                          <div className="text-gray-400 text-[9px]">{new Date(hist.createdAt).toLocaleString()}</div>
                          <p className="text-gray-500 text-[8.5px] mt-0.5">{hist.reason || 'Status updated'}</p>
                        </div>
                      )) : (
                        <>
                          <div className="relative pl-3 border-l-2 border-green-500">
                            <div className="font-bold text-gray-800 text-[9.5px]">Scheduled</div>
                            <div className="text-gray-400 text-[9px]">20/05/2025, 11:20 AM</div>
                            <p className="text-gray-500 text-[8.5px] mt-0.5">Original appointment scheduled.</p>
                          </div>
                          <div className="relative pl-3 border-l-2 border-amber-500">
                            <div className="font-bold text-gray-800 text-[9.5px]">Reschedule Requested</div>
                            <div className="text-gray-400 text-[9px]">{selectedRescheduleReq.requestedOn?.split(' by ')[0]}</div>
                            <p className="text-gray-500 text-[8.5px] mt-0.5">Patient requested to reschedule.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Controls Ribbon */}
            <div className="bg-white border-t border-[#cbd5e1] p-3 flex justify-end gap-2 select-none">
              <button 
                onClick={handleCancelRequest}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-4 py-1.5 rounded transition-all cursor-pointer"
              >
                Cancel Request
              </button>
              <button 
                disabled={!selectedTimeSlot || isSubmittingReschedule}
                onClick={handleConfirmReschedule}
                className="bg-[#0f4471] hover:bg-[#0b3355] disabled:bg-gray-400 text-white font-bold px-4 py-1.5 rounded shadow-sm transition-all cursor-pointer"
              >
                {isSubmittingReschedule ? 'Rescheduling...' : 'Review & Confirm →'}
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
          className="fixed bg-white border-2 border-[#194d7b] shadow-2xl rounded-none max-h-[92vh] flex flex-col select-none z-[99990] overflow-hidden text-[10.5px] text-gray-800 font-sans"
          style={{ 
            left: `${reconcilePos.x}px`, 
            top: `${reconcilePos.y}px`,
            width: `${popupSizes['reconcile']?.width || 1040}px`,
            height: `${popupSizes['reconcile']?.height || 650}px`
          }}
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
          <div className="flex-1 overflow-y-auto bg-white min-h-[150px] divide-y divide-gray-200 font-sans">
            
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

      {/* Care Team Draggable Popup Card */}
      {isCareTeamOpen && (
        <div 
          className="fixed bg-white border-2 border-[#194d7b] shadow-2xl rounded-none flex flex-col select-none z-[99990] overflow-hidden text-[11px] text-gray-800 font-sans"
          style={{ 
            left: `${careTeamPos.x}px`, 
            top: `${careTeamPos.y}px`,
            width: `${popupSizes['careTeam']?.width || 420}px`,
            height: `${popupSizes['careTeam']?.height || 380}px`
          }}
        >
          {/* Window Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingCareTeam(true);
              setDragOffsetCareTeam({ x: e.clientX - careTeamPos.x, y: e.clientY - careTeamPos.y });
            }}
            className="bg-gradient-to-r from-[#194d7b] via-[#216298] to-[#194d7b] text-white px-2 py-1 flex justify-between items-center cursor-move font-semibold text-[11.5px] border-b border-[#0d365a]"
          >
            <div className="flex items-center gap-1.5 font-sans">
              <span className="bg-[#0b3c66] text-white font-bold px-1.5 py-0.2 rounded text-[10px] border border-sky-300 shadow-sm">C</span>
              <span className="tracking-wide">Care Team Details: John Doe</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsCareTeamOpen(false)} className="hover:bg-red-600 px-1.5 rounded transition-colors leading-none pb-0.5">✕</button>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 space-y-3 bg-[#fafbfc] select-text flex-1 overflow-y-auto">
            <div className="space-y-2 border border-gray-300 p-3 bg-white shadow-xs">
              <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-2.5 text-[11px] text-gray-700 font-sans">
                <span className="text-gray-500 font-semibold text-right">Primary Physician:</span>
                <span className="font-bold text-gray-900">Sanders MD, Michael Lawrence</span>

                <span className="text-gray-500 font-semibold text-right">Role:</span>
                <span className="font-semibold text-blue-900">Admitting Physician / Owner</span>

                <span className="text-gray-500 font-semibold text-right">Department:</span>
                <span className="text-gray-900">Orthopedics</span>

                <span className="text-gray-500 font-semibold text-right">Current Hospital:</span>
                <span className="text-gray-900">CHC Willard</span>

                <span className="text-gray-500 font-semibold text-right">Ownership Status:</span>
                <span className="text-green-700 font-bold">Active — Currently Owning Data</span>

                <span className="text-gray-500 font-semibold text-right">Doctor Contact:</span>
                <span className="text-gray-900 font-mono">(417) 555-5555</span>

                <span className="text-gray-500 font-semibold text-right">Pager:</span>
                <span className="text-gray-900 font-mono">#4928</span>

                <span className="text-gray-500 font-semibold text-right">Access Level:</span>
                <span className="text-gray-900">Full Access (Read/Write/Sign)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1.5 select-none">
              <button 
                onClick={() => setIsCareTeamOpen(false)}
                className="bg-white border border-[#194d7b] hover:bg-[#eef4f8] text-[#194d7b] font-bold px-4 py-1 rounded-sm shadow-sm transition-colors text-[10.5px]"
              >
                Close View
              </button>
            </div>
          </div>
          {/* Resize Handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'careTeam', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'careTeam', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'careTeam', 'br')} />
        </div>
      )}

      {/* Facility Transfer Fullscreen Page */}
      {isFacilityTransferOpen && (
        <div className="fixed inset-0 bg-white z-[99999] flex flex-col font-sans select-none overflow-hidden border-[3px] border-[#92bced]">
          {/* Title Bar */}
          <div 
            className="flex justify-between items-center px-2 py-1"
            style={{ background: 'linear-gradient(to bottom, #d6eaf8 0%, #a4cbf1 100%)', borderBottom: '1px solid #7eaadb' }}
          >
            <div className="text-[#204060] font-bold text-[14px] flex items-center gap-1">
              Inter-Hospital Patient Transfer
            </div>
            <button 
              onClick={() => setIsFacilityTransferOpen(false)}
              className="bg-[#d9534f] hover:bg-[#c9302c] text-white w-[45px] h-[22px] flex items-center justify-center font-bold shadow-inner rounded-[2px] text-[12px]"
              style={{ border: '1px solid #b52b27' }}
            >
              ✕
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f4f8fc] text-[12px] text-[#333333]">
            <div className="max-w-[1050px] mx-auto bg-white border border-[#a6c9e2] shadow-sm p-4">
              
              {/* Top Meta Info */}
              <div className="flex flex-col gap-3 pl-8 pb-4">
                <div className="flex items-center gap-1">
                  <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Transfer Date / Time :</span>
                  <div className="flex items-center ml-2">
                    <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[100px] outline-none bg-white text-center shadow-inner text-[11px]" />
                    <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] hover:bg-[#d5e4f2]">▼</button>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <input type="text" value="1414" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[60px] outline-none bg-white text-center shadow-inner text-[11px]" />
                    <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] hover:bg-[#d5e4f2]">▼</button>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Performed By :</span>
                  <div className="flex ml-2 shadow-inner border border-[#a9c6e2]">
                    <input type="text" value="TTP , Nurse" readOnly className="px-2 py-1 w-[200px] outline-none border-none text-[11px]" />
                    <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="14" y2="14" stroke="#9b68ad" strokeWidth="3.5" /><circle cx="7" cy="7" r="5" fill="#42d4f4" stroke="#255594" strokeWidth="1.5" /><path d="M5 5 Q 7 3 9 5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Current (Sending) Hospital Information */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Current (Sending) Hospital Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Name :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>City Care Multispeciality Hospital</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Code :</span>
                    <input type="text" value="CCH001" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Department :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>General Medicine</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-1 row-span-2">
                    <span className="w-[130px] text-right pt-1"><span className="text-red-600 font-bold">*</span> Address :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[55px] resize-none shadow-inner text-[11px]" readOnly defaultValue="123 Health Street,&#10;Chicago, IL 60601, USA"></textarea>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Contact Person :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Ramesh Sharma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="14" y2="14" stroke="#9b68ad" strokeWidth="3.5" /><circle cx="7" cy="7" r="5" fill="#42d4f4" stroke="#255594" strokeWidth="1.5" /><path d="M5 5 Q 7 3 9 5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Phone Number :</span>
                    <input type="text" value="+1 312 555 0198" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Email :</span>
                    <input type="text" value="transferdesk@citycarehospital.com" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                </div>
              </div>

              {/* Receiving Hospital Information */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Receiving Hospital Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Name :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>Metro Advanced Hospital</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Code :</span>
                    <input type="text" value="MAH002" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Department :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>Cardiology</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-1 row-span-2">
                    <span className="w-[130px] text-right pt-1"><span className="text-red-600 font-bold">*</span> Address :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[55px] resize-none shadow-inner text-[11px]" readOnly defaultValue="456 Wellness Avenue,&#10;Chicago, IL 60611, USA"></textarea>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Contact Person :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Anita Verma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="14" y2="14" stroke="#9b68ad" strokeWidth="3.5" /><circle cx="7" cy="7" r="5" fill="#42d4f4" stroke="#255594" strokeWidth="1.5" /><path d="M5 5 Q 7 3 9 5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Phone Number :</span>
                    <input type="text" value="+1 312 555 0456" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Email :</span>
                    <input type="text" value="admissions@metrohospital.com" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Transfer Details</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Reason for Transfer :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                        <option>Advanced Level of Care Required</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Mode of Transfer :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                        <option>Ambulance - ALS</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Priority :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                        <option>High</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Accompanied By :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                        <option>Nurse</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right">Accompanied Personnel :</span>
                      <input type="text" value="Nurse, Paramedic" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      <span className="w-[160px] text-right"><span className="text-red-600 font-bold">*</span> Estimated Departure Time :</span>
                      <div className="flex items-center ml-2">
                        <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <input type="text" value="1500" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <span className="ml-2">CDT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[160px] text-right"><span className="text-red-600 font-bold">*</span> Estimated Arrival Time :</span>
                      <div className="flex items-center ml-2">
                        <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <input type="text" value="1600" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <span className="ml-2">CDT</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="w-[160px] text-right pt-1">Comments :</span>
                      <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[70px] resize-none shadow-inner text-[11px]" defaultValue="Patient requires advanced cardiac&#10;intervention not available in current hospital."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Clinical Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[140px] text-right">Condition at Transfer :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>Stable</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-1 row-span-2">
                    <span className="w-[140px] text-right pt-1">Treatment Given :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[45px] resize-none shadow-inner text-[11px]" readOnly defaultValue="IV Fluids, Antibiotics, Oxygen Support,&#10;Pain Management"></textarea>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="w-[140px] text-right pt-1">Vital Signs Summary :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[45px] resize-none shadow-inner text-[11px]" readOnly defaultValue="BP: 120/80 mmHg, Pulse: 88 bpm,&#10;SpO2: 96% (RA), Temp: 98.6°F"></textarea>
                  </div>
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="w-[140px] text-right">Special Precautions :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>Fall Risk</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transfer Authorization */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Transfer Authorization</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Requested By :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Ramesh Sharma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="14" y2="14" stroke="#9b68ad" strokeWidth="3.5" /><circle cx="7" cy="7" r="5" fill="#42d4f4" stroke="#255594" strokeWidth="1.5" /><path d="M5 5 Q 7 3 9 5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Approved By :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Mehta, P." readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="14" y2="14" stroke="#9b68ad" strokeWidth="3.5" /><circle cx="7" cy="7" r="5" fill="#42d4f4" stroke="#255594" strokeWidth="1.5" /><path d="M5 5 Q 7 3 9 5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Requested Date / Time :</span>
                    <div className="flex items-center ml-2">
                      <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <input type="text" value="1200" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Approved Date / Time :</span>
                    <div className="flex items-center ml-2">
                      <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <input type="text" value="1245" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                </div>
              </div>

              {/* Handover Information */}
              <div className="mt-2 pb-8">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Handover Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover Completed :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>Yes</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover To :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Anita Verma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="14" y2="14" stroke="#9b68ad" strokeWidth="3.5" /><circle cx="7" cy="7" r="5" fill="#42d4f4" stroke="#255594" strokeWidth="1.5" /><path d="M5 5 Q 7 3 9 5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover Method :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]">
                      <option>Verbal</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover Time :</span>
                    <div className="flex items-center ml-2">
                      <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <input type="text" value="1450" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="w-full p-2 bg-[#f4f8fc] flex justify-end gap-3 z-10">
            <button 
              onClick={() => {
                setIsFacilityTransferOpen(false);
                setIsRecipientTransferOpen(true);
              }}
              className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-1.5 rounded-[2px] outline-none font-bold text-[12px] border border-[#2e6da4] shadow-sm"
            >
              Save
            </button>
            <button 
              onClick={() => setIsFacilityTransferOpen(false)}
              className="border border-[#ccc] hover:bg-[#e6e6e6] text-[#333333] px-8 py-1.5 rounded-[2px] outline-none bg-white font-bold text-[12px] shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {/* Recipient Transfer Page */}
      {isRecipientTransferOpen && (
        <div className="fixed inset-0 bg-white z-[99999] flex flex-col font-sans select-none overflow-y-auto pt-2">
          {/* Main Content Area */}
          <div className="mx-4 mb-4 border border-[#c4c4c4] bg-white mt-1 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <div className="p-5 pt-3">
              <h2 className="text-[#0f4a86] text-[22px] font-bold mb-5 tracking-tight">Recipient Transfer</h2>
              
              <div className="grid grid-cols-[140px_1fr] gap-y-2.5 text-[14px] mb-5 text-black">
                <div>CRID:</div>
                <div className="filter blur-sm bg-gray-200 w-[200px] h-5 rounded"></div>
                
                <div>Date of Birth:</div>
                <div className="filter blur-sm bg-gray-200 w-[150px] h-5 rounded"></div>
                
                <div>FROM Center:</div>
                <div className="filter blur-sm bg-gray-200 w-[500px] h-5 rounded"></div>
                
                <div>TO Center:</div>
                <div className="filter blur-sm bg-gray-200 w-[500px] h-5 rounded"></div>
              </div>

              {/* TO Center Data Fieldset */}
              <fieldset className="border border-[#007a68] border-opacity-30 p-5 pt-3 mb-4 text-[14px] text-black">
                <legend className="text-[#007a68] px-2 bg-white font-normal ml-3">TO Center Data</legend>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-2">
                    <label>Confirmed recipient with transferring FROM Center:</label>
                    <input type="checkbox" className="w-[13px] h-[13px] border-gray-400" />
                  </div>

                  <div className="flex items-center gap-2">
                    <label>Agreed upon effective date: <span className="text-[13px]">(date the transferring TO center assumes responsibility for recipient)</span></label>
                    <div className="flex items-center">
                      <input type="text" className="border border-[#7c9bc0] px-2 py-1 w-[200px] h-[26px] outline-none shadow-inner" />
                      <button className="bg-[#e4ebf1] border border-l-0 border-[#7c9bc0] px-2 h-[26px] flex items-center justify-center hover:bg-[#d0dbe6]">
                        📅
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label>Was a duplicate CRID created at your center:</label>
                    <div className="flex items-center gap-3 ml-2">
                      <label className="flex items-center gap-1.5"><input type="radio" name="dup_crid" className="w-3.5 h-3.5" /> Yes</label>
                      <label className="flex items-center gap-1.5"><input type="radio" name="dup_crid" className="w-3.5 h-3.5" /> No</label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4">
                    <label className="text-gray-600">Duplicate CRID:</label>
                    <input type="text" className="border border-[#7c9bc0] px-2 py-1 w-[200px] h-[26px] outline-none shadow-inner" />
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <label>Reason for transfer:</label>
                    <div className="flex flex-col gap-1.5 pl-8 mt-1">
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Center closed</label>
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Center split / merged</label>
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Follow-up care</label>
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Subsequent infusion</label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-8 pt-1">
                    <label className="text-gray-500">Date of subsequent infusion:</label>
                    <div className="flex items-center">
                      <input type="text" className="border border-[#7c9bc0] bg-[#f0f0f0] px-2 py-1 w-[150px] h-[26px] outline-none shadow-inner" disabled />
                      <button className="bg-[#8db4e2] border border-l-0 border-[#7c9bc0] px-2 h-[26px] flex items-center justify-center opacity-60 cursor-not-allowed">
                        📅
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3">
                    <label>Data Manager agrees that their center will assume reporting responsibility:</label>
                    <input type="checkbox" className="w-[13px] h-[13px] border-gray-400" />
                  </div>
                </div>
              </fieldset>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-center gap-[18px] mt-6 pb-2 border-t border-gray-200 pt-5">
                <button className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#eaf2f8] to-[#9dbce0] border border-[#6f90b2] px-10 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[130px]">
                  <span className="text-[#00529b] text-[10px]">▶</span> Submit
                </button>
                <button className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#f8f8f8] to-[#d0d0d0] border border-[#999999] px-6 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[150px]">
                  <span className="text-[#007a68] text-[10px]">▶</span> Return to My Work
                </button>
                <div className="border-[3px] border-[#6b2c6b] p-[2px]">
                  <button 
                    onClick={() => setIsRecipientTransferOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#eaf2f8] to-[#9dbce0] border border-[#6f90b2] px-8 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[150px]"
                  >
                    <span className="text-[#00529b] text-[10px]">▶</span> Cancel Transfer
                  </button>
                </div>
                <button 
                  onClick={() => setIsRecipientTransferOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#eaf2f8] to-[#9dbce0] border border-[#6f90b2] px-8 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[150px]"
                >
                  <span className="text-[#00529b] text-[10px]">▶</span> Decline Transfer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Discharge Encounter Draggable Popup Card */}
      {isDischargeEncounterOpen && (
        <div 
          className="fixed bg-[#f0f0f0] border-[1px] border-[#a2c5eb] shadow-2xl flex flex-col select-none z-[99995] text-[11px] text-[#333333] font-sans"
          style={{ 
            left: `${dischargeEncounterPos.x}px`, 
            top: `${dischargeEncounterPos.y}px`,
            width: `${popupSizes['dischargeEncounter']?.width || 900}px`,
            height: `${popupSizes['dischargeEncounter']?.height || 600}px`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
          }}
        >
          {/* Windows 8/10 Style Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingDischargeEncounter(true);
              setDragOffsetDischargeEncounter({ x: e.clientX - dischargeEncounterPos.x, y: e.clientY - dischargeEncounterPos.y });
            }}
            className="text-black px-2 flex justify-between items-center cursor-move font-normal text-[13px] border-b border-gray-400"
            style={{ 
              background: 'linear-gradient(to bottom, #dceefc 0%, #a4d1f4 100%)',
              height: '30px' 
            }}
          >
            <div className="flex items-center gap-1.5 font-sans">
              <span className="font-semibold px-1 text-black text-[12px]">Nursing Discharge Checklist - MH-FPHPAT, SEVENTEEN</span>
            </div>
            {/* Windows Style Control Box */}
            <div className="flex">
              <button className="flex items-center justify-center w-[30px] h-[30px] hover:bg-black/10 transition-colors text-[14px]">_</button>
              <button className="flex items-center justify-center w-[30px] h-[30px] hover:bg-black/10 transition-colors text-[14px]">□</button>
              <button 
                onClick={() => setIsDischargeEncounterOpen(false)} 
                className="flex items-center justify-center w-[40px] h-[30px] hover:bg-[#e81123] hover:text-white transition-colors text-[14px]"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center border-b border-gray-300 bg-white p-1 gap-1">
            <button className="p-0.5 border-[2px] border-red-500 bg-white text-blue-600 hover:bg-blue-50 w-6 h-6 flex items-center justify-center font-bold shadow-sm"><span className="text-[14px]">✓</span></button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-[14px]">💾</button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 text-blue-800 font-bold w-6 h-6 flex items-center justify-center text-[14px]">⃠</button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-[14px] text-purple-600">✎</button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 text-yellow-500 w-6 h-6 flex items-center justify-center text-[14px]">⚡</button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-[14px]">⬆</button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-[14px]">⬇</button>
            <div className="w-[1px] h-[18px] bg-gray-400 mx-1"></div>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-gray-700 text-[14px]">⌨</button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 text-teal-600 w-6 h-6 flex items-center justify-center text-[10px]">🔢</button>
            <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-gray-600 text-[14px]">📄</button>
          </div>

          {/* Context Banner */}
          <div className="flex items-center justify-between p-1 px-2 border-b border-gray-300 bg-white text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-black font-semibold">*Performed on:</span>
              <input type="text" value="09-Sep-2023" className="border border-gray-400 px-1 py-0.5 w-[90px] outline-none ml-1 shadow-inner" readOnly />
              <button className="border border-gray-400 px-1 bg-gray-100 flex items-center justify-center h-[22px] w-[20px] shadow-sm text-[10px]">▼</button>
              <input type="text" value="1047" className="border border-gray-400 px-1 py-0.5 w-[50px] outline-none ml-1 shadow-inner" readOnly />
              <button className="border border-gray-400 px-1 bg-gray-100 flex items-center justify-center h-[22px] w-[20px] shadow-sm text-[10px]">▼</button>
              <span className="ml-1 text-black font-semibold">PDT</span>
            </div>
            <div className="text-black">
              By: TestUser, Supervisor-Nurse
            </div>
          </div>

          {/* Main Body */}
          <div className="flex bg-[#f0f0f0] flex-1 min-h-[150px]">
            {/* Left Menu */}
            <div className="w-[160px] bg-white border-r border-gray-300 flex flex-col pt-1">
              <div className="bg-[#428bca] text-white px-2 py-1 mx-1 border-[2px] border-red-500 cursor-pointer shadow-sm text-[12px] font-semibold">
                Discharge Checklist
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 p-2 bg-white flex flex-col gap-3 overflow-y-auto">
              <div 
                className="text-white font-bold text-[18px] px-2 py-1 shadow-sm"
                style={{ background: 'linear-gradient(to bottom, #459df5, #5eaafa)' }}
              >
                Discharge Checklist
              </div>

              {/* Checklist Table */}
              <div>
                <div className="font-bold text-[12px] mb-1 text-black">Discharge Checklist</div>
                <div className="border border-gray-400 bg-[#f8f8f8]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#f0f0f0] border-b border-gray-300">
                        <th className="font-normal w-[50%] border-r border-gray-300 p-1"></th>
                        <th className="font-bold text-center w-[10%] border-r border-gray-300 p-1">N/A</th>
                        <th className="font-bold text-center w-[10%] border-r border-gray-300 p-1">Yes</th>
                        <th className="font-bold w-[30%] p-1">Other:</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr className="border-b border-gray-300 bg-white">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Follow Up Information Provided</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Discharge Education Provided</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-white">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Patient Discharge Summary Provided</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Prescriptions Given</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-white">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Medications Returned Per Inventory List</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                        <td className="p-1 border-r border-gray-300 font-bold text-black bg-[#f0f4f9]">Valuables Returned Per Inventory List</td>
                        <td className="p-1 border-r border-gray-300 text-center bg-[#f0f4f9]"></td>
                        <td className="p-1 text-center bg-[#428bca] text-white font-bold border-[2px] border-orange-800 shadow-inner">X</td>
                        <td className="p-1 bg-[#f0f4f9]"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-white">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Home Equipment/Supplies Arranged</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Community Services Arranged Post Discharge</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-white">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Transportation Arrangements Made</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Medication Calendar Completed</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-white">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Follow-Up Appointments Reviewed</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                        <td className="p-1 border-r border-gray-300 font-semibold text-black">Car Seat</td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1 border-r border-gray-300 text-center"></td>
                        <td className="p-1"></td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Scrollbar placeholder */}
                  <div className="w-full bg-[#f0f0f0] border-t border-gray-400 flex justify-between items-center text-[10px] text-gray-500 font-bold px-1 h-[14px]">
                    <span>&lt;</span>
                    <span>&gt;</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section Layout */}
              <div className="flex gap-4 mt-2">
                {/* Accompanied By */}
                <div className="flex-1">
                  <div className="font-bold text-[12px] mb-1 text-black">Accompanied By</div>
                  <div className="border border-gray-400 p-2 min-h-[95px]">
                    <div className="grid grid-cols-3 gap-y-1.5 gap-x-1">
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> None</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Daughter</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Ministry worker</label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Spouse</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Son</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Security</label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Friend</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Parent/caregiver</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Other:</label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Significant other</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> Sibling</label>
                    </div>
                  </div>
                </div>

                {/* Discharge Transportation */}
                <div className="flex-1">
                  <div className="font-bold text-[12px] mb-1 text-black">Discharge Transportation</div>
                  <div className="border border-gray-400 p-2 min-h-[95px]">
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-1">
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="radio" name="trans" className="w-[11px] h-[11px]" /> Ambulance</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="radio" name="trans" className="w-[11px] h-[11px]" /> Public transportation</label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="radio" name="trans" className="w-[11px] h-[11px]" /> Non-ambulance transport</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="radio" name="trans" className="w-[11px] h-[11px]" /> Taxi/taxi voucher</label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="radio" name="trans" className="w-[11px] h-[11px]" /> Patient Transfer Network</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="radio" name="trans" className="w-[11px] h-[11px]" /> Other:</label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer text-black"><input type="radio" name="trans" className="w-[11px] h-[11px]" /> Personal vehicle</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discharge Comments */}
              <div className="mt-2">
                <div className="font-bold text-[12px] mb-1 text-black">Discharge Comments</div>
                <textarea className="w-full border border-gray-400 h-[100px] outline-none p-1 resize-none bg-white"></textarea>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Bed Transfer Draggable Popup Card */}
      {isBedTransferOpen && (
        <div 
          className="fixed bg-[#f0f4f9] border-[1px] border-[#a2c5eb] shadow-2xl rounded-[3px] flex flex-col select-none z-[99995] text-[11px] text-[#333333] font-sans overflow-hidden"
          style={{ 
            left: `${bedTransferPos.x}px`, 
            top: `${bedTransferPos.y}px`,
            width: `${popupSizes['bedTransfer']?.width || 800}px`,
            height: `${popupSizes['bedTransfer']?.height || 550}px`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
          }}
        >
          {/* Windows 7 Style Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingBedTransfer(true);
              setDragOffsetBedTransfer({ x: e.clientX - bedTransferPos.x, y: e.clientY - bedTransferPos.y });
            }}
            className="text-[#1e395b] px-2 py-1.5 flex justify-between items-center cursor-move font-normal text-[12px] border-b border-[#96b4d3]"
            style={{
              background: 'linear-gradient(to bottom, #ebf3fc 0%, #d2e4f9 40%, #c1dbf6 50%, #b1d0f4 100%)',
              textShadow: '0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <div className="flex items-center gap-1.5 font-sans">
              <span className="font-semibold text-gray-800 text-[12px]">Bed Transfer</span>
            </div>
            {/* Custom Windows Vista/7 Glossy Close Button */}
            <button 
              onClick={() => setIsBedTransferOpen(false)} 
              className="flex items-center justify-center font-bold text-[10px] text-white transition-all shadow-sm outline-none"
              style={{
                background: 'linear-gradient(to bottom, #f18d7f 0%, #d85040 50%, #c63322 51%, #d74e3c 100%)',
                border: '1px solid #992c1e',
                borderRadius: '3px',
                width: '45px',
                height: '18px',
                textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 1px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
            >
              ✕
            </button>
          </div>

          {/* Form Body */}
          <div className="p-4 space-y-4 bg-white flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-150 relative">
            <div className="space-y-4">
              
              {/* Top Section */}
              <div className="flex gap-4 p-2 bg-[#f8fafd] border border-gray-200">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-[120px] text-right"><span className="text-red-500">*</span> Transfer Date / Time :</div>
                  <input type="text" value="07/10/2017" readOnly className="border border-gray-400 px-2 py-1 w-[100px] outline-none" />
                  <span>◆</span>
                  <input type="text" value="1414" readOnly className="border border-gray-400 px-2 py-1 w-[60px] outline-none" />
                  <span>◆ CDT</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 pt-0 pb-3">
                <div className="w-[120px] text-right"><span className="text-red-500">*</span> Performed By :</div>
                <div className="flex items-center border border-gray-400 bg-white">
                  <input type="text" value="TTP , Nurse" readOnly className="px-2 py-1 w-[200px] outline-none border-none" />
                  <div className="px-2 border-l border-gray-400 bg-gray-100 cursor-pointer">🔍</div>
                </div>
              </div>

              {/* Patient Information Section */}
              <div className="border border-gray-200 p-3 pt-4 relative mt-4">
                <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">Patient Information</div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <div className="w-[100px] text-right"><span className="text-red-500">*</span> Patient ID :</div>
                    <div className="flex items-center border border-gray-400 bg-white">
                      <input type="text" value="TTPTEST" readOnly className="px-2 py-1 w-[120px] outline-none border-none" />
                      <div className="px-2 border-l border-gray-400 bg-gray-100 cursor-pointer">🔍</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[100px] text-right"><span className="text-red-500">*</span> Patient Name :</div>
                    <input type="text" value="PATIENT02" readOnly className="border border-gray-400 px-2 py-1 w-[200px] outline-none bg-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[100px] text-right"><span className="text-red-500">*</span> Gender / Age :</div>
                    <input type="text" value="Male / 45 Y" readOnly className="border border-gray-400 px-2 py-1 w-[150px] outline-none bg-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[100px] text-right"><span className="text-red-500">*</span> Admission No. :</div>
                    <input type="text" value="ADT00012345" readOnly className="border border-gray-400 px-2 py-1 w-[200px] outline-none bg-white" />
                  </div>
                </div>
              </div>

              {/* Current Bed Information */}
              <div className="border border-gray-200 p-3 pt-4 relative mt-4">
                <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">Current Bed Information</div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Current Department :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>General Medicine</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Transfer Type :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>Within Hospital</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Current Ward :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>GM Ward - 2</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Reason for Transfer :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>Change in Clinical Condition</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Current Room :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>201</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Priority :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>Routine</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Current Bed :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>Bed - 02</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-[120px] text-right pt-1">Comments :</div>
                    <textarea className="border border-gray-400 px-2 py-1 w-[200px] h-12 outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>

              {/* New Bed Information */}
              <div className="border border-gray-200 p-3 pt-4 relative mt-4">
                <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">New Bed Information</div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> New Department :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>Cardiology</option>
                    </select>
                  </div>
                  <div className="col-start-1 flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> New Ward :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>Cardiac Ward - 1</option>
                    </select>
                  </div>
                  <div className="col-start-1 flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> New Room :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>101</option>
                    </select>
                  </div>
                  <div className="col-start-1 flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> New Bed :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                      <option>Bed - 01</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="border border-gray-200 p-3 pt-4 relative mt-4">
                <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">Transfer Details</div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Requested By :</div>
                    <div className="flex items-center border border-gray-400 bg-white">
                      <input type="text" value="Dr. Sharma, R." readOnly className="px-2 py-1 w-[150px] outline-none border-none" />
                      <div className="px-2 border-l border-gray-400 bg-gray-100 cursor-pointer">🔍</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Transferred By :</div>
                    <div className="flex items-center border border-gray-400 bg-white">
                      <input type="text" value="TTP , Nurse" readOnly className="px-2 py-1 w-[150px] outline-none border-none" />
                      <div className="px-2 border-l border-gray-400 bg-gray-100 cursor-pointer">🔍</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Requested Date / Time :</div>
                    <input type="text" value="07/10/2017" readOnly className="border border-gray-400 px-2 py-1 w-[80px] outline-none" />
                    <span>◆</span>
                    <input type="text" value="1200" readOnly className="border border-gray-400 px-2 py-1 w-[50px] outline-none" />
                    <span>◆ CDT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right"><span className="text-red-500">*</span> Transfer Date / Time :</div>
                    <input type="text" value="07/10/2017" readOnly className="border border-gray-400 px-2 py-1 w-[80px] outline-none" />
                    <span>◆</span>
                    <input type="text" value="1414" readOnly className="border border-gray-400 px-2 py-1 w-[50px] outline-none" />
                    <span>◆ CDT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Approved By :</div>
                    <div className="flex items-center border border-gray-400 bg-white">
                      <input type="text" value="Dr. Mehta, P." readOnly className="px-2 py-1 w-[150px] outline-none border-none" />
                      <div className="px-2 border-l border-gray-400 bg-gray-100 cursor-pointer">🔍</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Transfer Duration (Est.) :</div>
                    <input type="text" value="2" className="border border-gray-400 px-2 py-1 w-[60px] outline-none text-center" />
                    <select className="border border-gray-400 px-1 py-1 w-[80px] outline-none bg-white">
                      <option>Hours</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Approved Date / Time :</div>
                    <input type="text" value="07/10/2017" readOnly className="border border-gray-400 px-2 py-1 w-[80px] outline-none" />
                    <span>◆</span>
                    <input type="text" value="1245" readOnly className="border border-gray-400 px-2 py-1 w-[50px] outline-none" />
                    <span>◆ CDT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Transfer Duration (Actual) :</div>
                    <input type="text" value="1" className="border border-gray-400 px-2 py-1 w-[60px] outline-none text-center" />
                    <select className="border border-gray-400 px-1 py-1 w-[80px] outline-none bg-white">
                      <option>Hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border border-gray-200 p-3 pt-4 relative mt-4">
                <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">Additional Information</div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Equipment Accompanied :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[120px] outline-none bg-white">
                      <option>Yes</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Special Requirements :</div>
                    <input type="text" value="Cardiac Monitoring Required" className="border border-gray-400 px-2 py-1 w-[200px] outline-none bg-white" />
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-[120px] text-right pt-1">Equipment Details :</div>
                    <textarea className="border border-gray-400 px-2 py-1 w-[200px] h-12 outline-none resize-none" defaultValue="ECG Monitor, Oxygen Cylinder"></textarea>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] text-right">Handover Completed :</div>
                    <select className="border border-gray-400 px-1 py-1 w-[120px] outline-none bg-white">
                      <option>Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-end gap-3 mt-4 pt-2 pb-2">
              <button 
                onClick={() => setIsBedTransferOpen(false)}
                className="bg-[#2c5b96] hover:bg-[#1a4478] text-white px-6 py-1.5 rounded-sm outline-none"
              >
                Save
              </button>
              <button 
                onClick={() => setIsBedTransferOpen(false)}
                className="border border-gray-400 hover:bg-gray-100 text-gray-800 px-6 py-1.5 rounded-sm outline-none bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
          {/* Resize Handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'bedTransfer', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'bedTransfer', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'bedTransfer', 'br')} />
        </div>
      )}

      {/* Cancel Warning Popup */}
      {/* Cancel Discharge Form Popup */}
      {isCancelDischargeFormOpen && (
        <div 
          className="fixed bg-[#ece9d8] border-[2px] border-[#a0a0a0] shadow-2xl flex flex-col select-none z-[99995] text-[11px] text-black font-sans"
          style={{ 
            left: `${cancelDischargeFormPos.x}px`, 
            top: `${cancelDischargeFormPos.y}px`,
            width: `${popupSizes['cancelDischarge']?.width || 800}px`,
            height: `${popupSizes['cancelDischarge']?.height || 500}px`,
            borderRightColor: '#404040',
            borderBottomColor: '#404040',
            borderTopColor: '#ffffff',
            borderLeftColor: '#ffffff'
          }}
        >
          {/* Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingCancelDischargeForm(true);
              setDragOffsetCancelDischargeForm({ x: e.clientX - cancelDischargeFormPos.x, y: e.clientY - cancelDischargeFormPos.y });
            }}
            className="px-2 py-1 flex justify-between items-center cursor-move text-white"
            style={{
              background: 'linear-gradient(to right, #0A246A 0%, #A6CAF0 100%)',
            }}
          >
            <div className="flex items-center gap-1">
              <span className="text-red-500 font-bold text-[14px]">X</span>
              <span className="font-normal text-[12px]">Cancel Discharge</span>
            </div>
            <div className="flex gap-1">
              <button className="bg-[#ece9d8] text-black border-2 border-white border-b-gray-500 border-r-gray-500 w-4 h-4 flex items-center justify-center font-bold text-[8px] leading-none">-</button>
              <button className="bg-[#ece9d8] text-black border-2 border-white border-b-gray-500 border-r-gray-500 w-4 h-4 flex items-center justify-center font-bold text-[8px] leading-none">□</button>
              <button onClick={() => setIsCancelDischargeFormOpen(false)} className="bg-[#ece9d8] text-black border-2 border-white border-b-gray-500 border-r-gray-500 w-4 h-4 flex items-center justify-center font-bold text-[10px] leading-none">✕</button>
            </div>
          </div>

          {/* Main Body */}
          <div className="p-3 bg-[#ece9d8] flex-1 overflow-y-auto">
            <div className="bg-white border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white p-3 space-y-4">
              
              {/* Top Section */}
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-0.5">
                  <label>Complete Reg?:</label>
                  <select className="border border-gray-400 p-0.5 bg-[#a3fba3] w-full"><option>Yes</option></select>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Medical Record Number:</label>
                  <input type="text" value="760010021" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Encounter Number:</label>
                  <input type="text" value="7600000010104" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Full Name:</label>
                  <input type="text" value="REG-FOUNDATION, SU!" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full text-black font-bold" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Date of Birth:</label>
                  <div className="flex">
                    <input type="text" value="02-Feb-1982" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                    <div className="flex flex-col w-4 ml-0.5">
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▲</button>
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▼</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Age:</label>
                  <input type="text" value="36Y" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Gender:</label>
                  <input type="text" value="Female" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>BC PHN:</label>
                  <input type="text" value="9876391304" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 relative mt-2">
                <span className="absolute -top-2 left-4 bg-white px-1 text-gray-600">Discharge Information</span>
              </div>

              {/* Discharge Information Section */}
              <div className="grid grid-cols-4 gap-4 pt-2">
                <div className="flex flex-col gap-0.5">
                  <label>Discharge Disposition:</label>
                  <select className="border border-gray-400 p-0.5 w-full font-bold text-gray-700 bg-white"><option>Discharged Home wit...</option></select>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Discharge to Location:</label>
                  <select className="border border-gray-400 p-0.5 w-full bg-[#f0f0f0]"><option></option></select>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Discharge Date:</label>
                  <div className="flex">
                    <input type="text" value="14-Feb-2018" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                    <div className="flex flex-col w-4 ml-0.5">
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▲</button>
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▼</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Discharge Time:</label>
                  <div className="flex">
                    <input type="text" value="10:48" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                    <div className="flex flex-col w-4 ml-0.5">
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▲</button>
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▼</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Deceased Date:</label>
                  <div className="flex">
                    <input type="text" value="xx-xxx-xxxx" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full text-gray-500" />
                    <div className="flex flex-col w-4 ml-0.5">
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▲</button>
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▼</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Deceased Time:</label>
                  <div className="flex">
                    <input type="text" className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
                    <div className="flex flex-col w-4 ml-0.5">
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▲</button>
                      <button className="border h-1/2 bg-gray-200 flex items-center justify-center text-[6px]">▼</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Discharge Personnel ID:</label>
                  <input type="text" value="TEST.REGCLERK" readOnly className="border border-gray-400 p-0.5 bg-white w-[140px] font-bold text-gray-700" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 relative mt-2">
                <span className="absolute -top-2 left-4 bg-white px-1 text-gray-600">Location</span>
              </div>

              {/* Location Section */}
              <div className="grid grid-cols-5 gap-4 pt-2 items-end">
                <div className="flex flex-col gap-0.5">
                  <label>Building:</label>
                  <select className="border border-gray-400 p-0.5 w-full bg-[#ffffcc]"><option>LGH Lions Gate</option></select>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Unit/Clinic:</label>
                  <select className="border border-gray-400 p-0.5 w-full bg-[#ffffcc]"><option>LGH Endoscopy</option></select>
                </div>
                <div className="flex items-center justify-center pb-0.5">
                  <button className="bg-[#ece9d8] border-2 border-white border-b-gray-500 border-r-gray-500 px-3 py-0.5 shadow-sm active:border-t-gray-500 active:border-l-gray-500 active:border-b-white active:border-r-white w-full">Bed Availability</button>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Room:</label>
                  <select className="border border-gray-400 p-0.5 w-full bg-[#ffffcc]"><option>Endoscopy Wait</option></select>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label>Bed:</label>
                  <select className="border border-gray-400 p-0.5 w-[60px] bg-[#ffffcc]"><option>02</option></select>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 mt-4 mb-2"></div>

              {/* Providers Section */}
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="flex flex-col gap-0.5 w-[200px]">
                  <label>Attending Provider:</label>
                  <div className="flex">
                    <input type="text" value="Train, Gastroenterologis" readOnly className="border border-gray-400 p-0.5 bg-white w-full text-gray-500" />
                    <button className="bg-[#ece9d8] border border-gray-400 w-5 h-[22px] flex items-center justify-center ml-1">
                      <span className="text-[14px]">🔍</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 w-[200px]">
                  <label>Admitting Provider:</label>
                  <div className="flex">
                    <input type="text" value="Train, Gastroenterologis" readOnly className="border border-gray-400 p-0.5 bg-white w-full text-gray-500" />
                    <button className="bg-[#ece9d8] border border-gray-400 w-5 h-[22px] flex items-center justify-center ml-1">
                      <span className="text-[14px]">🔍</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 relative mt-2 mb-2">
                <span className="absolute -top-2 left-4 bg-white px-1 text-gray-600">Cancel Discharge Information</span>
              </div>
              <div className="h-6"></div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-2 bg-[#ece9d8]">
            <button 
              onClick={() => setIsCancelDischargeFormOpen(false)}
              className="bg-[#ece9d8] border-2 border-white border-b-gray-500 border-r-gray-500 px-6 py-0.5 shadow-sm min-w-[80px]"
            >
              Complete
            </button>
            <button 
              onClick={() => setIsCancelDischargeFormOpen(false)}
              className="bg-[#ece9d8] border-2 border-white border-b-gray-500 border-r-gray-500 px-6 py-0.5 shadow-sm min-w-[80px]"
            >
              Cancel
            </button>
          </div>
          {/* Resize Handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'cancelDischarge', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'cancelDischarge', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'cancelDischarge', 'br')} />
        </div>
      )}

      {isCancelWarningOpen && (
        <div 
          className="fixed bg-[#f0f0f0] border-[1px] border-[#a0a0a0] shadow-xl flex flex-col select-none z-[99995] text-[12px] text-gray-800 font-sans"
          style={{ 
            left: `${cancelWarningPos.x}px`, 
            top: `${cancelWarningPos.y}px`,
            width: `${popupSizes['cancelWarning']?.width || 450}px`,
            height: `${popupSizes['cancelWarning']?.height || 200}px`
          }}
        >
          {/* Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingCancelWarning(true);
              setDragOffsetCancelWarning({ x: e.clientX - cancelWarningPos.x, y: e.clientY - cancelWarningPos.y });
            }}
            className="px-2 py-1 flex justify-between items-center cursor-move text-black"
            style={{
              background: 'linear-gradient(to bottom, #d6e2f1 0%, #b8cde4 100%)',
              borderBottom: '1px solid #99b4d1'
            }}
          >
            <span className="font-normal">{cancelWarningData.title}</span>
            <button 
              onClick={() => setIsCancelWarningOpen(false)}
              className="flex items-center justify-center font-bold text-[10px] bg-red-600 text-white w-6 h-4 border border-[#8a2924] hover:bg-red-500 rounded-sm outline-none"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex p-4 gap-4 bg-white flex-1 overflow-y-auto">
            <div className="shrink-0 pt-1">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="url(#blue-grad)" stroke="#1c4779" strokeWidth="1" />
                <path d="M12 6c-2.2 0-3.5 1.5-3.5 3 h2c0-1 1-1.5 1.5-1.5 c.8 0 1.5.5 1.5 1.5 c0 1.5-2 1.5-2 3.5 v.5 h2 v-.3 c0-1.5 2-2 2-3.7 C15.5 7 14 6 12 6zm-1.5 10 h3 v3 h-3 v-3z" fill="white" />
                <defs>
                  <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#679be0" />
                    <stop offset="1" stopColor="#1a5399" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex-1 text-[12px] whitespace-pre-line text-[#333]">
              {cancelWarningData.message}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-2 p-3 bg-[#f0f0f0] border-t border-[#dfdfdf]">
            <button 
              onClick={() => setIsCancelWarningOpen(false)}
              className="min-w-[75px] px-4 py-1 bg-white border border-[#0060a6] text-black hover:bg-[#e6f0fa] hover:border-[#003c74] rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0060a6]"
            >
              Yes
            </button>
            <button 
              onClick={() => setIsCancelWarningOpen(false)}
              className="min-w-[75px] px-4 py-1 bg-white border border-[#8f8f8f] text-black hover:bg-[#e5f1fb] hover:border-[#0078d7] rounded shadow-sm outline-none"
            >
              No
            </button>
            <button 
              onClick={() => setIsCancelWarningOpen(false)}
              className="min-w-[75px] px-4 py-1 bg-white border border-[#8f8f8f] text-black hover:bg-[#e5f1fb] hover:border-[#0078d7] rounded shadow-sm outline-none"
            >
              Cancel
            </button>
          </div>
          {/* Resize Handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'cancelWarning', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'cancelWarning', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'cancelWarning', 'br')} />
        </div>
      )}

      {/* Print Labels Draggable Popup Card */}
      {isPrintLabelsOpen && (
        <div 
          className="fixed bg-white border-[4px] border-[#a2c5eb] shadow-2xl rounded-[3px] flex flex-col select-none z-[99995] text-[11px] text-gray-800 font-sans"
          style={{ 
            left: `${printLabelsPos.x}px`, 
            top: `${printLabelsPos.y}px`,
            width: `${popupSizes['printLabels']?.width || 500}px`,
            height: popupSizes['printLabels']?.height ? `${popupSizes['printLabels']?.height}px` : undefined,
            minHeight: '200px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
          }}
        >
          {/* Windows 7 Style Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingPrintLabels(true);
              setDragOffsetPrintLabels({ x: e.clientX - printLabelsPos.x, y: e.clientY - printLabelsPos.y });
            }}
            className="text-[#1e395b] px-1.5 py-1 flex justify-between items-center cursor-move font-normal text-[11.5px] border-b border-[#96b4d3]"
            style={{
              background: 'linear-gradient(to bottom, #ebf3fc 0%, #d2e4f9 40%, #c1dbf6 50%, #b1d0f4 100%)',
              textShadow: '0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <div className="flex items-center gap-1.5 font-sans">
              <span className="font-semibold text-gray-800 text-[11px]">Charting for: TTPTEST, PATIENT02</span>
            </div>
            {/* Custom Windows Vista/7 Glossy Close Button */}
            <button 
              onClick={() => setIsPrintLabelsOpen(false)} 
              className="flex items-center justify-center font-bold text-[10px] text-white transition-all shadow-sm outline-none"
              style={{
                background: 'linear-gradient(to bottom, #f18d7f 0%, #d85040 50%, #c63322 51%, #d74e3c 100%)',
                border: '1px solid #992c1e',
                borderRadius: '3px',
                width: '45px',
                height: '18px',
                textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 1px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
            >
              ✕
            </button>
          </div>

          {/* Form Body - Exactly same 1:1 replica layout */}
          <div className="p-3.5 space-y-3.5 bg-white text-[11px] overflow-y-auto max-h-[72vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-150">
            

            {/* Form Fields */}
            <div className="space-y-3 font-sans text-gray-800">
              
              {/* Performed Date/Time */}
              <div className="flex items-center">
                <span className="w-[140px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Performed date / time :</span>
                <input type="text" defaultValue="07/10/2017" className="border border-[#7f9db9] px-1 py-0.5 w-[90px] text-center text-[10.5px] outline-none" />
                <div className="flex flex-col -space-y-0.5 ml-0.5">
                  <button className="text-[6px] border border-gray-300 px-1 bg-gray-50 leading-none">▲</button>
                  <button className="text-[6px] border-x border-b border-gray-300 px-1 bg-gray-50 leading-none">▼</button>
                </div>
                <select className="border border-[#7f9db9] px-0.5 py-0.5 ml-1 bg-white outline-none w-[35px]"><option>▼</option></select>
                
                <input type="text" defaultValue="1414" className="border border-[#7f9db9] px-1 py-0.5 w-[50px] text-center ml-3 text-[10.5px] outline-none" />
                <div className="flex flex-col -space-y-0.5 ml-0.5">
                  <button className="text-[6px] border border-gray-300 px-1 bg-gray-50 leading-none">▲</button>
                  <button className="text-[6px] border-x border-b border-gray-300 px-1 bg-gray-50 leading-none">▼</button>
                </div>
                
                <span className="text-gray-700 font-normal ml-2">CDT</span>
              </div>

              {/* Performed By */}
              <div className="flex items-center">
                <span className="w-[140px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Performed by :</span>
                <div className="flex items-center max-w-[280px] flex-1">
                  <input type="text" defaultValue="TTP , Nurse" className="border border-[#7f9db9] px-1.5 py-0.5 w-full outline-none text-[10.5px]" />
                  <button className="border-y border-r border-[#7f9db9] bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 flex items-center justify-center">🔍</button>
                </div>
              </div>

              <div className="border-t border-gray-200 my-2"></div>

              {/* Med Education Fields */}
              <div className="flex items-center">
                <span className="w-[200px] text-right pr-2 text-gray-700">Medication Education - Individual Taught:</span>
                <select className="border border-[#7f9db9] px-1 py-0.5 w-[140px] bg-white outline-none"><option></option></select>
                <span className="text-blue-600 hover:underline cursor-pointer ml-2 text-[10px]">Trend</span>
              </div>
              <div className="flex items-center">
                <span className="w-[200px] text-right pr-2 text-gray-700">Med Edu Dosing/Indication/Side Effect:</span>
                <select className="border border-[#7f9db9] px-1 py-0.5 w-[140px] bg-white outline-none"><option></option></select>
                <span className="text-blue-600 hover:underline cursor-pointer ml-2 text-[10px]">Trend</span>
              </div>
              <div className="flex items-center">
                <span className="w-[200px] text-right pr-2 text-gray-700">Medication Education Evaluation:</span>
                <select className="border border-[#7f9db9] px-1 py-0.5 w-[140px] bg-white outline-none"><option></option></select>
                <span className="text-blue-600 hover:underline cursor-pointer ml-2 text-[10px]">Trend</span>
              </div>

              {/* Lot Number & Manufacturer (Highlighted with orange border!) */}
              <div className="border border-[#cb7a75] p-3 bg-white space-y-2.5 rounded-xs shadow-3xs" style={{ outline: '1px solid #cb7a75' }}>
                <div className="flex items-center">
                  <span className="w-[140px] text-right pr-2 font-normal text-gray-700"><span className="text-red-600 mr-0.5">*</span>Lot Number :</span>
                  <input type="text" className="border border-[#7f9db9] bg-[#ffffd0] px-1.5 py-0.5 w-[160px] outline-none text-[10.5px]" />
                </div>
                <div className="flex items-center">
                  <span className="w-[140px] text-right pr-2 font-normal text-gray-700"><span className="text-red-600 mr-0.5">*</span>Manufacturer :</span>
                  <select className="border border-[#7f9db9] bg-[#ffffd0] px-0.5 py-0.5 w-[250px] outline-none text-[10.5px]">
                    <option></option>
                    <option>GlaxoSmithKline Biologicals</option>
                    <option>Sanofi Pasteur</option>
                    <option>Merck & Co.</option>
                  </select>
                </div>
              </div>

              {/* Expiration Date */}
              <div className="flex items-center">
                <span className="w-[140px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Expiration Date :</span>
                <input type="text" placeholder="MM/DD/YYYY" className="border border-[#7f9db9] bg-[#ffffd0] px-1 py-0.5 w-[100px] text-center outline-none" />
                <div className="flex flex-col -space-y-0.5 ml-0.5">
                  <button className="text-[6px] border border-gray-300 px-1 bg-gray-50 leading-none">▲</button>
                  <button className="text-[6px] border-x border-b border-gray-300 px-1 bg-gray-50 leading-none">▼</button>
                </div>
                <select className="border border-[#7f9db9] px-0.5 py-0.5 ml-1 bg-white outline-none w-[35px]"><option>▼</option></select>
              </div>

              {/* Vaccines For Children */}
              <div className="flex items-center">
                <span className="w-[140px] text-right pr-2 text-gray-700">Vaccines For Children :</span>
                <select className="border border-[#7f9db9] px-1 py-0.5 w-[180px] bg-white outline-none"><option></option></select>
              </div>

              {/* Vaccine Information Statements */}
              <div className="border border-gray-200 p-2.5 space-y-2 bg-[#fcfcfc]">
                <div className="text-[10px] font-bold text-gray-600 mb-1">Vaccine Information Statements :</div>
                <div className="flex items-center">
                  <span className="w-[120px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Given :</span>
                  <input type="text" placeholder="MM/DD/YYYY" className="border border-[#7f9db9] px-1.5 py-0.5 w-[100px] outline-none" />
                  <div className="flex flex-col -space-y-0.5 ml-0.5">
                    <button className="text-[6px] border border-gray-300 px-1 bg-gray-50 leading-none">▲</button>
                    <button className="text-[6px] border-x border-b border-gray-300 px-1 bg-gray-50 leading-none">▼</button>
                  </div>
                  <select className="border border-[#7f9db9] px-0.5 py-0.5 ml-1 bg-white outline-none w-[35px]"><option>▼</option></select>
                </div>
                <div className="flex items-center">
                  <span className="w-[120px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Statements :</span>
                  <select className="border border-[#7f9db9] bg-[#ffffd0] px-0.5 py-0.5 w-[200px] outline-none text-[10.5px]"><option></option></select>
                  <button className="border border-[#7f9db9] bg-gray-100 px-1.5 py-0.5 flex items-center justify-center font-bold text-[10px] ml-1">+</button>
                  <button className="border border-[#7f9db9] bg-gray-100 px-1.5 py-0.5 flex items-center justify-center font-bold text-[10px] ml-1">-</button>
                </div>
                <div className="flex items-center">
                  <span className="w-[120px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Published :</span>
                  <input type="text" placeholder="MM/DD/YYYY" className="border border-[#7f9db9] px-1.5 py-0.5 w-[100px] outline-none" />
                  <div className="flex flex-col -space-y-0.5 ml-0.5">
                    <button className="text-[6px] border border-gray-300 px-1 bg-gray-50 leading-none">▲</button>
                    <button className="text-[6px] border-x border-b border-gray-300 px-1 bg-gray-50 leading-none">▼</button>
                  </div>
                  <select className="border border-[#7f9db9] px-0.5 py-0.5 ml-1 bg-white outline-none w-[35px]"><option>▼</option></select>
                </div>
              </div>

              {/* Dose/Route/Site */}
              <div className="space-y-2 border-t border-gray-200 pt-2.5">
                <div className="flex items-center">
                  <span className="w-[180px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>DTaP-polio pediatric vaccine:</span>
                  <input type="text" defaultValue="0.5" className="border border-[#7f9db9] px-1 py-0.5 w-[45px] text-center outline-none" />
                  <select className="border border-[#7f9db9] px-0.5 py-0.5 ml-1 bg-white outline-none w-[50px]"><option>mL</option></select>
                  <span className="text-gray-700 ml-3">Volume :</span>
                  <input type="text" className="border border-[#7f9db9] px-1 py-0.5 w-[65px] ml-1 outline-none" />
                  <span className="text-gray-600 ml-1">mL</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[180px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Route :</span>
                  <select className="border border-[#7f9db9] px-0.5 py-0.5 w-[80px] bg-white outline-none"><option>IM</option></select>
                  <span className="text-gray-700 ml-3"><span className="text-red-600 mr-0.5">*</span>Site :</span>
                  <select className="border border-[#7f9db9] bg-[#ffffd0] px-0.5 py-0.5 w-[100px] ml-1 outline-none"><option></option></select>
                </div>
                <div className="flex items-center text-gray-500 pl-[30px] gap-2">
                  <span>Total Volume :</span>
                  <input type="text" defaultValue="0.5" disabled className="border border-gray-200 bg-gray-50 px-1 py-0.5 w-[50px] text-center text-gray-500 outline-none" />
                  <span className="ml-3">Infused Over :</span>
                  <input type="text" defaultValue="0" className="border border-[#7f9db9] px-1 py-0.5 w-[50px] text-center outline-none text-gray-800" />
                </div>
              </div>

            </div>
          </div>
          
          {/* Resize handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'printLabels', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'printLabels', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'printLabels', 'br')} />
        </div>
      )}

      {/* Process Alert Draggable Popup Card */}
      {isProcessAlertOpen && (
        <div 
          className="fixed bg-white border-[4px] border-[#a2c5eb] shadow-2xl rounded-[3px] flex flex-col select-none z-[99995] text-[12px] text-black font-sans"
          style={{ 
            left: `${processAlertPos.x}px`, 
            top: `${processAlertPos.y}px`,
            width: `${popupSizes['processAlert']?.width || 720}px`,
            height: popupSizes['processAlert']?.height ? `${popupSizes['processAlert']?.height}px` : undefined,
            minHeight: '200px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
          }}
        >
          {/* Windows Style Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingProcessAlert(true);
              setDragOffsetProcessAlert({ x: e.clientX - processAlertPos.x, y: e.clientY - processAlertPos.y });
            }}
            className="text-[#1e395b] px-2 py-1 flex justify-between items-center cursor-move font-normal text-[11.5px] border-b border-[#96b4d3]"
            style={{
              background: 'linear-gradient(to bottom, #ebf3fc 0%, #d2e4f9 40%, #c1dbf6 50%, #b1d0f4 100%)',
              textShadow: '0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <div className="flex items-center gap-1.5 font-sans">
              <span className="font-semibold text-gray-800 text-[11.5px]">Process Alert: Clozapine Hematological Monitoring Report</span>
            </div>
            {/* Custom Windows Close Button */}
            <button 
              onClick={() => setIsProcessAlertOpen(false)} 
              className="flex items-center justify-center font-bold text-[10px] text-white transition-all shadow-sm outline-none"
              style={{
                background: 'linear-gradient(to bottom, #f18d7f 0%, #d85040 50%, #c63322 51%, #d74e3c 100%)',
                border: '1px solid #992c1e',
                borderRadius: '3px',
                width: '45px',
                height: '18px',
                textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 1px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
            >
              ✕
            </button>
          </div>

          {/* 1:1 Replica Content Body */}
          <div className="p-5 bg-white text-[12.5px] font-sans text-black overflow-y-auto max-h-[72vh] space-y-4">
            {/* Email Header Info */}
            <div className="space-y-1 text-[12.5px] border-b border-gray-200 pb-3">
              <div>
                <strong>From:</strong> <a href="mailto:do.not.reply@phsacdapp3.cerncd.com" className="text-[#0066cc] hover:underline">do.not.reply@phsacdapp3.cerncd.com</a> &lt;<a href="mailto:do.not.reply@phsacdapp3.cerncd.com" className="text-[#0066cc] hover:underline">do.not.reply@phsacdapp3.cerncd.com</a>&gt;
              </div>
              <div>
                <strong>Sent:</strong> Wednesday, September 27, 2023 9:15 AM
              </div>
              <div>
                <strong>To:</strong> <a href="mailto:vapharmacymhsu@vch.ca" className="text-[#0066cc] hover:underline">VA Pharmacy MHSU</a> &lt;<a href="mailto:vapharmacymhsu@vch.ca" className="text-[#0066cc] hover:underline">vapharmacymhsu@vch.ca</a>&gt;
              </div>
              <div>
                <strong>Cc:</strong> <a href="mailto:CernerCSTOps@phsa.ca" className="text-[#0066cc] hover:underline">Cerner CST Ops</a> &lt;<a href="mailto:CernerCSTOps@phsa.ca" className="text-[#0066cc] hover:underline">CernerCSTOps@phsa.ca</a>&gt;
              </div>
              <div>
                <strong>Subject:</strong> P0783 -- PROBLEM -- RRD Fax Monitor -- Clozapine Hematological Monitoring Report
              </div>
              <div>
                <strong>Importance:</strong> High
              </div>
            </div>

            {/* Warning Text */}
            <div className="space-y-3 pt-1">
              <p className="font-bold">
                WARNING: 1 RRD Fax with "Error" status was found based on the following qualifying criteria:
              </p>
              
              <ul className="list-disc pl-8 space-y-1">
                <li>
                  <strong>RRD Station Name:</strong> "Pharmacy Ops"
                </li>
                <li>
                  <strong>Freetext report title match:</strong> "*VGH/VGH Willow Pavillion/VGH S4*"
                </li>
              </ul>

              <p className="font-bold pt-2">
                As configured, there will be no further alerts for the job(s) listed below and they have been cancelled.
              </p>

              <p className="pt-2">
                Qualifying job(s) requiring investigation/remediation:
              </p>
            </div>

            {/* 1:1 Replica Table */}
            <div className="pt-1">
              <table className="w-full border-collapse border border-black text-[12px]">
                <thead>
                  <tr className="bg-white">
                    <th className="border border-black p-1 text-left font-bold w-[45%]">Report Title</th>
                    <th className="border border-black p-1 text-left font-bold w-[18%]">Submit Date/Time</th>
                    <th className="border border-black p-1 text-left font-bold w-[15%]">Destination Phone Number</th>
                    <th className="border border-black p-1 text-left font-bold text-center w-[8%]">No Connect Retries</th>
                    <th className="border border-black p-1 text-left font-bold text-center w-[8%]">Disconnect Retries</th>
                    <th className="border border-black p-1 text-left font-bold text-center w-[6%]">Busy Retries</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5 align-top leading-tight">
                      CHM - AA/APO-Clozapine (VGH/VGH Willow Pavillion/VGH S4). Date range: 26-SEP-2023 00:00:00 - 26-SEP-2023 23:59:59
                    </td>
                    <td className="border border-black p-1.5 align-top">
                      27-SEP-2023 08:01:43.00
                    </td>
                    <td className="border border-black p-1.5 align-top">
                      18668366778
                    </td>
                    <td className="border border-black p-1.5 align-top text-center">
                      2
                    </td>
                    <td className="border border-black p-1.5 align-top text-center">
                      0
                    </td>
                    <td className="border border-black p-1.5 align-top text-center">
                      0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Text */}
            <div className="space-y-4 pt-3 text-[12.5px]">
              <p>
                Rule name: Clozapine Hematological Monitoring Report
              </p>
              <p className="text-gray-800 text-[11.5px] pt-2">
                This alert was generated by CCL program: PHSA_RRD_MON
              </p>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="bg-[#f0f0f0] border-t border-[#dfdfdf] px-3 py-2 flex justify-end gap-2 rounded-b-[3px]">
            <button 
              onClick={() => {
                alert('Alert Acknowledged. Retrying fax...');
                setIsProcessAlertOpen(false);
              }}
              className="px-4 py-1 bg-white hover:bg-gray-150 border border-[#acacac] rounded-[3px] text-gray-800 font-semibold shadow-xs transition-all active:scale-[0.98] text-[11px]"
            >
              Retry Fax
            </button>
            <button 
              onClick={() => setIsProcessAlertOpen(false)}
              className="px-4 py-1 bg-white hover:bg-gray-150 border border-[#bcbcbc] rounded-[3px] text-gray-600 shadow-xs transition-all active:scale-[0.98] text-[11px]"
            >
              Close
            </button>
          </div>
          
          {/* Resize handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'processAlert', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'processAlert', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'processAlert', 'br')} />
        </div>
      )}

      {/* View Encounter (Medical Record Request) Draggable Popup Card */}
      {isViewEncounterOpen && (
        <div 
          className="fixed bg-[#ece9d8] border-[3px] border-[#3b80e8] shadow-2xl flex flex-col select-none z-[99995] text-[11px] text-black"
          style={{ 
            left: `${viewEncounterPos.x}px`, 
            top: `${viewEncounterPos.y}px`,
            width: `${popupSizes['viewEncounter']?.width || 870}px`,
            height: popupSizes['viewEncounter']?.height ? `${popupSizes['viewEncounter']?.height}px` : undefined,
            minHeight: '250px',
            fontFamily: 'Tahoma, sans-serif',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            borderRadius: '4px 4px 0 0'
          }}
        >
          {/* Windows Classic/XP Style Title Bar */}
          <div 
            onMouseDown={(e) => {
              setIsDraggingViewEncounter(true);
              setDragOffsetViewEncounter({ x: e.clientX - viewEncounterPos.x, y: e.clientY - viewEncounterPos.y });
            }}
            className="text-white px-2 py-1 flex justify-between items-center cursor-move font-semibold text-[11.5px] rounded-t-[1px]"
            style={{
              background: 'linear-gradient(to bottom, #76a5ee 0%, #4c87e3 10%, #1e5ac8 50%, #1852c1 70%, #205fd0 90%, #5c93e6 100%)',
              borderBottom: '1px solid #1a3c75'
            }}
          >
            <div className="flex items-center gap-1.5">
              {/* Document Icon */}
              <span className="text-[10px] bg-white border border-gray-400 text-blue-700 px-0.5 font-bold scale-90">📄</span>
              <span>Medical Record Request - CSTHIM, BUILDSALLY - 700004549</span>
            </div>
            {/* Windows XP Style Close Button */}
            <button 
              onClick={() => setIsViewEncounterOpen(false)} 
              className="flex items-center justify-center font-bold text-[10px] text-white hover:bg-[#e43c16] active:bg-[#b02b0c] transition-all outline-none"
              style={{
                background: 'linear-gradient(to bottom, #f37d5f 0%, #e64522 45%, #c52906 50%, #b82300 100%)',
                border: '1px solid #7d1802',
                borderRadius: '3px',
                width: '21px',
                height: '17px',
                textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)'
              }}
            >
              ✕
            </button>
          </div>

          {/* Form Content Area */}
          <div className="p-3 bg-[#f0f0f0] border-t border-white space-y-3.5">
            {/* Top Three Columns Dropdowns */}
            <div className="grid grid-cols-3 gap-x-5 gap-y-3 text-[11px]">
              {/* Column 1: Event Status */}
              <div className="flex flex-col space-y-1">
                <span>Event Status</span>
                <select className="border border-[#7f9db9] bg-white px-1 py-0.5 outline-none h-[20px] rounded-none">
                  <option>Verified and Pending</option>
                </select>
              </div>

              {/* Column 2: Template */}
              <div className="flex flex-col space-y-1">
                <span>Template</span>
                <select className="border border-[#7f9db9] bg-white px-1 py-0.5 outline-none h-[20px] rounded-none">
                  <option>Inpatient/General Transfer Template</option>
                </select>
              </div>

              {/* Column 3: Purpose */}
              <div className="flex flex-col space-y-1">
                <span>Purpose</span>
                <select className="border border-[#7f9db9] bg-white px-1 py-0.5 outline-none h-[20px] rounded-none">
                  <option>Patient Transfer</option>
                </select>
              </div>
            </div>

            {/* Middle Controls Block (Split Left/Right) */}
            <div className="flex gap-4">
              {/* Left Column: Date Range & Related Providers */}
              <div className="flex-1 flex flex-col space-y-3">
                {/* Date Range Fieldset */}
                <fieldset className="border border-gray-300 rounded px-2.5 pb-2 pt-1.5 space-y-2 relative">
                  <legend className="text-[11px] px-1 text-gray-800">Date Range</legend>
                  
                  {/* From Field */}
                  <div className="flex items-center space-x-1.5">
                    <span className="w-[35px] text-right">From:</span>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        defaultValue="xx-xxx-xxxx" 
                        className="border border-[#7f9db9] bg-white px-1.5 py-0.5 w-[110px] h-[20px] outline-none text-center rounded-none"
                      />
                      <div className="flex flex-col -space-y-0.5">
                        <button className="text-[5px] border border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▲</button>
                        <button className="text-[5px] border-x border-b border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▼</button>
                      </div>
                      <button className="border-y border-r border-[#7f9db9] bg-white px-1.5 h-[20px] flex items-center justify-center text-[7px]">▼</button>
                    </div>

                    <div className="flex items-center ml-2">
                      <input 
                        type="text" 
                        className="border border-[#7f9db9] bg-white px-1 py-0.5 w-[55px] h-[20px] outline-none rounded-none"
                      />
                      <div className="flex flex-col -space-y-0.5">
                        <button className="text-[5px] border border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▲</button>
                        <button className="text-[5px] border-x border-b border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▼</button>
                      </div>
                    </div>
                  </div>

                  {/* To Field */}
                  <div className="flex items-center space-x-1.5">
                    <span className="w-[35px] text-right">To:</span>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        defaultValue="xx-xxx-xxxx" 
                        className="border border-[#7f9db9] bg-white px-1.5 py-0.5 w-[110px] h-[20px] outline-none text-center rounded-none"
                      />
                      <div className="flex flex-col -space-y-0.5">
                        <button className="text-[5px] border border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▲</button>
                        <button className="text-[5px] border-x border-b border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▼</button>
                      </div>
                      <button className="border-y border-r border-[#7f9db9] bg-white px-1.5 h-[20px] flex items-center justify-center text-[7px]">▼</button>
                    </div>

                    <div className="flex items-center ml-2">
                      <input 
                        type="text" 
                        className="border border-[#7f9db9] bg-white px-1 py-0.5 w-[55px] h-[20px] outline-none rounded-none"
                      />
                      <div className="flex flex-col -space-y-0.5">
                        <button className="text-[5px] border border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▲</button>
                        <button className="text-[5px] border-x border-b border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▼</button>
                      </div>
                    </div>
                  </div>

                  {/* Clinical / Posting radio buttons */}
                  <div className="flex items-center space-x-6 pt-1 text-[11px]">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="radio" name="rangeType" defaultChecked className="outline-none" />
                      <span>Clinical Range</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="radio" name="rangeType" className="outline-none" />
                      <span>Posting Range</span>
                    </label>
                  </div>
                </fieldset>

                {/* Tab Container */}
                <div className="flex flex-col flex-1">
                  {/* Tabs */}
                  <div className="flex items-end text-[11px] -space-x-[1px] relative z-10">
                    <div className="px-3.5 py-1 bg-[#f0f0f0] border-t border-x border-gray-300 rounded-t-[3px] font-semibold border-b-[#f0f0f0]">
                      Related Providers
                    </div>
                    <div className="px-3.5 py-1 bg-[#e0e0e0] border border-gray-300 rounded-t-[3px] text-gray-600 cursor-pointer">
                      Sections
                    </div>
                  </div>

                  {/* Tab Body Box */}
                  <div className="border border-gray-300 p-2 bg-white flex flex-col space-y-2 relative -mt-[1px]">
                    {/* Providers Table */}
                    <div className="border border-[#7f9db9] overflow-y-auto max-h-[120px] min-h-[110px] bg-white">
                      <table className="w-full text-left text-[10.5px] border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-300">
                            <th className="px-2 py-1 border-r border-gray-300 w-[45%]">Name</th>
                            <th className="px-2 py-1 border-r border-gray-300 w-[33%]">Relationship</th>
                            <th className="px-2 py-1 w-[22%]">Destination</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[
                            { name: 'PLISBVCB, STUART, MD', rel: 'Primary Care Physician', dest: 'lgh_6w_l1' },
                            { name: 'Test, Alex', rel: 'BC Cancer External Referring', dest: 'lgh_6w_l1' },
                            { name: 'TestMI, Radiologist-RadNet5', rel: 'Radiologist', dest: 'lgh_6w_l1' },
                            { name: 'TestUser, ManagerSupervisor-HIM', rel: 'HIM Manager Supervisor', dest: 'lgh_6w_l1' }
                          ].map((p, index) => (
                            <tr key={index} className="hover:bg-blue-50">
                              <td className="px-2 py-0.5 border-r border-gray-200 flex items-center gap-1.5">
                                <input type="checkbox" className="outline-none" />
                                <span className="truncate">{p.name}</span>
                              </td>
                              <td className="px-2 py-0.5 border-r border-gray-200 truncate">{p.rel}</td>
                              <td className="px-2 py-0.5 truncate">{p.dest}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Radio Button Options below table */}
                    <div className="flex items-center space-x-6 text-[10.5px] pt-1">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="devOpt" defaultChecked className="outline-none" />
                        <span>Device selected</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="devOpt" className="outline-none" />
                        <span>Associated Destination</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Other fields & details */}
              <div className="w-[340px] flex flex-col space-y-3.5 text-[11px]">
                {/* Authorization check */}
                <label className="flex items-center space-x-1.5 pt-1.5 cursor-pointer">
                  <input type="checkbox" className="outline-none border-gray-300" />
                  <span>Proper authorization received?</span>
                </label>

                {/* Destination */}
                <div className="flex flex-col space-y-1">
                  <span>Destination</span>
                  <div className="flex">
                    <input 
                      type="text" 
                      defaultValue="VGH Transplant Clinic, Vancouver - Laurel" 
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 flex-1 h-[20px] outline-none rounded-none text-ellipsis overflow-hidden whitespace-nowrap"
                    />
                    <button className="border border-l-0 border-[#7f9db9] bg-gradient-to-bottom from-[#ffffff] to-[#eaeaea] hover:bg-gray-100 px-1.5 h-[20px] text-[10px] rounded-none">...</button>
                  </div>
                </div>

                {/* Requester */}
                <div className="flex flex-col space-y-1">
                  <span>Requester</span>
                  <div className="flex">
                    <input 
                      type="text" 
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 flex-1 h-[20px] outline-none rounded-none"
                    />
                    <button className="border border-l-0 border-[#7f9db9] bg-gradient-to-bottom from-[#ffffff] to-[#eaeaea] hover:bg-gray-100 px-1.5 h-[20px] text-[10px] rounded-none">...</button>
                  </div>
                </div>

                {/* Comment textarea */}
                <div className="flex flex-col space-y-1">
                  <span>Comment</span>
                  <textarea 
                    className="border border-[#7f9db9] bg-white px-1.5 py-1 w-full h-[65px] outline-none resize-none rounded-none overflow-y-scroll"
                  />
                </div>

                {/* Device & Copies selection */}
                <div className="flex items-end gap-3 text-[11px]">
                  {/* Device Dropdown */}
                  <div className="flex-1 flex flex-col space-y-1">
                    <span>Device</span>
                    <div className="flex">
                      <select className="border border-[#7f9db9] bg-white px-1 py-0.5 flex-1 h-[20px] outline-none rounded-none">
                        <option>lgh_6w_l1</option>
                      </select>
                      <button className="border border-l-0 border-[#7f9db9] bg-gradient-to-bottom from-[#ffffff] to-[#eaeaea] px-1.5 h-[20px] text-[10px] rounded-none">...</button>
                    </div>
                  </div>

                  {/* Copies count */}
                  <div className="w-[55px] flex flex-col space-y-1">
                    <span>Copies</span>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        defaultValue="1" 
                        className="border border-[#7f9db9] bg-white px-1.5 py-0.5 w-[38px] h-[20px] outline-none text-center rounded-none"
                      />
                      <div className="flex flex-col -space-y-0.5">
                        <button className="text-[5px] border border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▲</button>
                        <button className="text-[5px] border-x border-b border-gray-300 w-[14px] h-[10px] bg-gray-100 flex items-center justify-center leading-none">▼</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-between items-center pt-2">
              {/* Preview Button */}
              <div className="w-1/2 flex justify-center">
                <button 
                  onClick={() => alert('Opening Medical Record Request Preview...')}
                  className="px-8 py-1 bg-gradient-to-bottom from-[#ffffff] to-[#eaeaea] hover:to-[#dfdfdf] border border-[#7f9db9] active:scale-[0.98] text-[11px] font-medium"
                  style={{ width: '130px', boxShadow: 'inset 0 1px 0 #fff' }}
                >
                  Preview
                </button>
              </div>

              {/* Send Button */}
              <div className="w-1/2 flex justify-center">
                <button 
                  onClick={() => {
                    alert('Medical Record Request Sent Successfully.');
                    setIsViewEncounterOpen(false);
                  }}
                  className="px-8 py-1 bg-gradient-to-bottom from-[#ffffff] to-[#eaeaea] hover:to-[#dfdfdf] border border-[#7f9db9] active:scale-[0.98] text-[11px] font-semibold"
                  style={{ width: '130px', boxShadow: 'inset 0 1px 0 #fff' }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          {/* Resize handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'viewEncounter', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'viewEncounter', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'viewEncounter', 'br')} />
        </div>
      )}

      {/* Sub-detail Draggable Popup Card */}
      {isSubPopupOpen && (
        <div 
          className="fixed bg-white border-2 border-[#194d7b] shadow-2xl rounded-none flex flex-col select-none z-[100000] text-[11px] text-gray-800 font-sans"
          style={{ 
            left: `${subPopupPos.x}px`, 
            top: `${subPopupPos.y}px`,
            width: `${popupSizes['subPopup']?.width || 540}px`,
            height: `${popupSizes['subPopup']?.height || 380}px`,
            minHeight: '200px',
          }}
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
          <div className="p-3 space-y-3 bg-[#f8fafc] flex-1 overflow-y-auto">
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
          {/* Resize Handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'subPopup', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'subPopup', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'subPopup', 'br')} />
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
                if (item === 'Cancel Discharge' || item === 'Cancel Pending Discharge') {
                  setIsCancelDischargeFormOpen(true);
                  setPatientContextMenu(null);
                } else if (item === 'Cancel Transfer' || item === 'Cancel Pending Transfer') {
                  setCancelWarningData({
                    title: 'Facility Transfer',
                    message: 'This patient currently has a pending transfer to LGH HOPE Centre/LGH HOPE Centre/LGH MIU//\nwith an estimated complete date and time of .\nWould you like to complete the pending transfer?'
                  });
                  setIsCancelWarningOpen(true);
                  setPatientContextMenu(null);
                } else if (item === 'Process Alert') {
                  setIsProcessAlertOpen(true);
                  setPatientContextMenu(null);
                } else if (item === 'View Encounter') {
                  setIsViewEncounterOpen(true);
                  setPatientContextMenu(null);
                } else {
                  alert(`${item} clicked for ${patientContextMenu.patientName}`); 
                  setPatientContextMenu(null); 
                }
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
            width: `${popupSizes[popup.id]?.width || 760}px`,
            height: popupSizes[popup.id]?.height ? `${popupSizes[popup.id].height}px` : undefined,
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
          <div className="bg-white p-4 flex flex-col space-y-4 overflow-auto flex-1 border-b border-[#bdcddc]">
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
          {/* Resize Handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, popup.id, 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, popup.id, 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, popup.id, 'br')} />
        </div>
      ))}

      {isYoutubePopupOpen && (
        <div
          className="fixed bg-[#cbd8e3] border border-[#bdcddc] rounded shadow-2xl flex flex-col font-sans select-none overflow-hidden"
          style={{
            left: `${youtubePopupPos.x}px`,
            top: `${youtubePopupPos.y}px`,
            width: `${popupSizes['youtube-popup']?.width || 640}px`,
            height: `${popupSizes['youtube-popup']?.height || 420}px`,
            zIndex: 99999,
          }}
        >
          {/* Draggable Title Bar */}
          <div
            onMouseDown={(e) => {
              setIsDraggingYoutube(true);
              setDragOffsetYoutube({
                x: e.clientX - youtubePopupPos.x,
                y: e.clientY - youtubePopupPos.y,
              });
              e.preventDefault();
            }}
            className="bg-[#0f4471] text-white flex justify-between items-center px-2.5 py-1.5 cursor-move select-none"
          >
            <span className="font-bold text-[11px] flex items-center gap-1.5">
              📺 Quantaforze HRM - YouTube Channel
            </span>
            <button
              onClick={() => setIsYoutubePopupOpen(false)}
              className="text-white hover:text-red-300 font-bold text-sm px-1"
            >
              ×
            </button>
          </div>

          {/* Iframe content */}
          <div className="flex-1 bg-white relative">
            <iframe 
              src="https://www.youtube.com/embed?listType=user_uploads&list=Quantaforze-hrm"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            />
          </div>

          {/* Resize Handles */}
          <div className="absolute right-0 top-0 bottom-0 w-[5px] cursor-ew-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'youtube-popup', 'r')} />
          <div className="absolute bottom-0 left-0 right-0 h-[5px] cursor-ns-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'youtube-popup', 'b')} />
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] cursor-se-resize z-[99999]" onMouseDown={(e) => startResizing(e, 'youtube-popup', 'br')} />
        </div>
      )}

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
