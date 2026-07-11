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
  type: 'MessageCenter' | 'Analytics' | 'PatientList' | 'Notifications' | 'PatientProfile' | 'EditPatientProfile' | 'MedicalReport' | 'HelpCentre' | 'RescheduleRequests' | 'AdmitPatient' | 'ReferralTransfer' | 'DischargeList' | 'DeveloperTools' | 'Orders' | 'Home' | 'PatientNotes';
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Notifications Filter State
  const [notifType, setNotifType] = useState('All');
  const [notifPriority, setNotifPriority] = useState('All');
  const [notifStatus, setNotifStatus] = useState('All');
  const [notifFromDate, setNotifFromDate] = useState('28/04/2025');
  const [notifToDate, setNotifToDate] = useState('28/05/2025');
  const [notifSearch, setNotifSearch] = useState('');

  // Patient Profile Section State
  const [profileTab, setProfileTab] = useState('Demographics');

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

  const selectOrOpenTab = (type: 'MessageCenter' | 'Analytics' | 'PatientList' | 'Notifications' | 'PatientProfile' | 'EditPatientProfile' | 'MedicalReport' | 'HelpCentre' | 'RescheduleRequests' | 'AdmitPatient' | 'ReferralTransfer' | 'DischargeList' | 'DeveloperTools' | 'Orders' | 'Home' | 'PatientNotes', title: string, id: string) => {
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

  // Mock Patient Directory rows data 1:1 matching requested layout
  const patientDirectoryData = [
    { mrn: '1360508', uhid: 'AVX-000123', name: 'AHSDEMO, Peds', ageGender: '8 Y / Female', dob: '12/03/2018', phone: '9876543210', visit: 'Inpatient', dept: 'General Medicine', physician: 'Test, Prov Gen Phys', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: '101 / A', admitted: '28/05/2025 08:30 AM' },
    { mrn: '1360509', uhid: 'AVX-000124', name: 'AHSDEMO, SDS', ageGender: '56 Y / Female', dob: '22/07/1970', phone: '9876543211', visit: 'Inpatient', dept: 'General Medicine', physician: 'Test, Prov Gen Phys', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: '101 / B', admitted: '28/05/2025 09:15 AM' },
    { mrn: '1360510', uhid: 'AVX-000125', name: 'AHSDEMO, READMISSION', ageGender: '57 Y / Male', dob: '14/11/1968', phone: '9876543212', visit: 'Outpatient', dept: 'General Medicine', physician: 'Test, Prov Gen Phys', status: 'Registered', statusBg: 'bg-blue-100 text-blue-800', location: '102 / A', admitted: '28/05/2025 10:20 AM' },
    { mrn: '1360511', uhid: 'AVX-000126', name: 'AHSDEMO, HEART 0103', ageGender: '57 Y / Female', dob: '30/09/1968', phone: '9876543213', visit: 'Inpatient', dept: 'General Medicine', physician: 'Train, Provider: Primary Care0050', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: '102 / B', admitted: '28/05/2025 06:10 AM' },
    { mrn: '1360512', uhid: 'AVX-000127', name: 'AHSDEMO, CHF-1', ageGender: '62 Y / Female', dob: '19/02/1964', phone: '9876543214', visit: 'Day Care', dept: 'General Medicine', physician: 'Train, Provider: Primary Care0050', status: 'In Treatment', statusBg: 'bg-orange-100 text-orange-800', location: '103 / A', admitted: '28/05/2025 11:00 AM' },
    { mrn: '1360513', uhid: 'AVX-000128', name: 'AHSDEMO, ORTHO', ageGender: '79 Y / Male', dob: '07/06/1947', phone: '9876543215', visit: 'Outpatient', dept: 'General Medicine', physician: 'Train, Provider: Primary Care0050', status: 'Completed', statusBg: 'bg-gray-100 text-gray-800', location: '103 / B', admitted: '28/05/2025 11:30 AM' },
    { mrn: '1360514', uhid: 'AVX-000129', name: 'AHSDEMO, LABOR', ageGender: '30 Y / Female', dob: '23/08/1995', phone: '9876543216', visit: 'Inpatient', dept: 'General Medicine', physician: 'Test, Barrett', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: '104 / A', admitted: '27/05/2025 09:50 PM' },
    { mrn: '1360515', uhid: 'AVX-000130', name: 'AHSDEMO, STROKE', ageGender: '45 Y / Female', dob: '02/04/1981', phone: '9876543217', visit: 'Inpatient', dept: 'General Medicine', physician: 'Train, Provider: General Surgeon0209', status: 'ICU', statusBg: 'bg-red-100 text-red-800', location: '104 / B', admitted: '27/05/2025 05:25 PM' },
    { mrn: '1360516', uhid: 'AVX-000131', name: 'AHSDEMO, INFECTION', ageGender: '50 Y / Female', dob: '16/05/1976', phone: '9876543218', visit: 'Inpatient', dept: 'General Medicine', physician: 'Train, Provider: General Surgeon0004', status: 'Scheduled', statusBg: 'bg-yellow-100 text-yellow-800', location: '105 / A', admitted: '29/05/2025 09:00 AM' },
    { mrn: '1360517', uhid: 'AVX-000132', name: 'AHSDEMO, PNEUMONIA', ageGender: '36 Y / Female', dob: '11/12/1989', phone: '9876543219', visit: 'Outpatient', dept: 'General Medicine', physician: 'Train, Provider: Primary Care0004', status: 'Registered', statusBg: 'bg-blue-100 text-blue-800', location: '105 / B', admitted: '26/05/2025 04:20 PM' }
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

  // F10 Person Search popup states
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
      // ESC → Cancel / Close the topmost open modal or context menu
      if (e.key === 'Escape') {
        e.preventDefault();
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
      filtered = filtered.filter(p => p.uhid.toLowerCase().includes(psAxioId.toLowerCase()));
    } else if (psSearchMethod === 'TokenNumber' && psTokenNumber) {
      // Token number maps to MRN in this context
      filtered = filtered.filter(p => p.mrn.includes(psTokenNumber));
    } else if (psSearchMethod === 'MRN' && psPersonIdentifier) {
      filtered = filtered.filter(p => p.mrn.includes(psPersonIdentifier) || p.uhid.includes(psPersonIdentifier));
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
        filtered = filtered.filter(p => p.phone.includes(psPhoneNumber));
      }
      if (psPersonIdentifier) {
        filtered = filtered.filter(p => p.mrn.includes(psPersonIdentifier) || p.uhid.includes(psPersonIdentifier));
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
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5 text-white/80">
              <span className="cursor-pointer hover:underline">Logout</span>
              <span>|</span>
              <span className="cursor-pointer hover:underline">Help</span>
              <span>|</span>
              <span className="cursor-pointer hover:underline">Refresh Page</span>
            </div>
            
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
    <div className="flex flex-col h-screen bg-[#f0f4f8] text-[#1c2833] text-[11px] font-sans overflow-hidden select-none">
      
      {/* Title Bar */}
      <div className="bg-[#002a46] text-white px-3 py-1.5 flex justify-between items-center border-b border-[#001729]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-wide">AxioVital Operating Environment</span>
        </div>
      </div>

      {/* Classic Menu Bar */}
      <div className="bg-[#f0f4f8] border-b border-[#bdcddc] px-3 py-0.5 flex gap-3 text-[#2c3e50] text-[10.5px] items-center relative z-50">
        <button 
          onClick={() => selectOrOpenTab('Home', 'Home', 'home-tab')}
          className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold"
        >
          Home
        </button>
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
        <div className="relative group">
          <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#002a46]">
            Help
          </button>
          <div className="absolute right-0 top-full -mt-0.5 hidden group-hover:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[180px] shadow-md rounded-none select-none z-50">
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Welcome</div>
              <div 
                onClick={() => selectOrOpenTab('HelpCentre', 'Help Center', 'help-center-tab')}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] font-semibold"
              >
                Show All Commands
              </div>
              {/* Editor Playground Dropdown Option with submenus */}
              <div className="relative group/playground px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333] flex justify-between items-center">
                <span>Editor Playground</span>
                <span className="text-[9px] text-gray-500 group-hover/playground:text-white ml-2">◀</span>
                
                {/* Submenu A: Editor options card (bright theme) */}
                <div className="absolute right-full top-0 mr-0.5 hidden group-hover/playground:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[240px] shadow-md rounded-none select-none z-[100] text-left">
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
                      <span className="text-[9px] text-gray-500 group-hover/appearance:text-white ml-2">◀</span>
                      
                      {/* Appearance Options */}
                      <div className="absolute right-full top-0 mr-0.5 hidden group-hover/appearance:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[200px] shadow-md rounded-none select-none z-[110] text-left">
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
                      <span className="text-[9px] text-gray-500 group-hover/layout:text-white ml-2">◀</span>
                      
                      {/* Submenu B: Split editor options card (bright theme) */}
                      <div className="absolute right-full top-0 mr-0.5 hidden group-hover/layout:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[240px] shadow-md rounded-none select-none z-[110] text-left">
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
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Open Walkthrough...</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Provide Feedback</div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Download Diagnostics</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">View License</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div 
                onClick={() => selectOrOpenTab('DeveloperTools', 'Developer Tools & System Settings', 'dev-tools-tab')}
                className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]"
              >
                Toggle Developer Tools
              </div>
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Open Process Explorer</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">Check for Updates...</div>
            </div>
            <div className="border-t border-[#e2e2e2] my-0.5"></div>
            <div className="py-0.5">
              <div className="px-4 py-1 hover:bg-[#0f4471] hover:text-white rounded-none cursor-pointer outline-none text-[#333333]">About</div>
            </div>
          </div>
        </div>
      </div>

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
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">MyExperience</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Reports</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">UpToDate</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">AxioCard</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">Protocol Library</button>
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
        
        <button className="flex items-center gap-1 hover:text-black">Clinical Decision Support</button>
        <button 
          onClick={() => selectOrOpenTab('Orders', 'Orders', 'orders-tab')}
          className="flex items-center gap-1 hover:text-black font-semibold text-[#002a46]"
        >
          Order Sets
        </button>
        <button className="flex items-center gap-1 hover:text-black">Care Pathways</button>
        <button className="flex items-center gap-1 hover:text-black">Labs</button>
        <button className="flex items-center gap-1 hover:text-black">Imaging</button>
        <button className="flex items-center gap-1 hover:text-black">Pharmacy</button>
        <button 
          onClick={() => selectOrOpenTab('Analytics', 'Analytics Overview', 'analytics-overview')}
          className="flex items-center gap-1 hover:text-black font-semibold"
        >
          Analytics
        </button>
      </div>

      {/* Blue Header Banner */}
      <div className="bg-[#0f4471] text-white px-3 py-1.5 flex justify-between items-center border-b border-[#001729]">
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
          {(activeTab.type as string) === 'Home' && 'Home'}
          {(activeTab.type as string) === 'DeveloperTools' && 'Developer Configuration & System Administration'}
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
          
          <button className="bg-[#00223b] border border-[#0d3455] hover:bg-[#002e50] rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
            🗂️ Recent <ChevronDown className="w-2.5 h-2.5" />
          </button>
          
          <button className="bg-[#00223b] border border-[#0d3455] hover:bg-[#002e50] rounded px-1.5 py-0.5 text-[10px]"><Maximize2 className="w-2.5 h-2.5" /></button>
          
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
            className="bg-[#00223b] border border-[#0d3455] hover:bg-[#002e50] rounded px-1.5 py-0.5 text-[10px]"
          >
            <Printer className="w-2.5 h-2.5 text-white" />
          </button>
          
          <span className="text-[9.5px] text-gray-300 ml-1">⏱️ 3 minutes ago</span>
        </div>
      </div>

      {/* Main split view container with Multi-tab Chrome structure */}
      <div className="flex flex-1 overflow-hidden flex-col">
        
        {/* Chrome-Style Tab bar */}
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
                  {t.title}
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

        {/* Workspace content matching the active Chrome tab type */}
        <div className="flex flex-1 overflow-hidden bg-[#fafbfc]">

          {activeTab.type === 'MessageCenter' && (
            <div className="flex flex-1 overflow-hidden">
              {/* Left pane: Navigation menu */}
              <div className="w-[200px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
                <div className="bg-[#789cbb] text-white font-bold p-1.5 flex justify-between items-center">
                  <span>Inbox Summary</span>
                  <Badge className="bg-[#002a46] hover:bg-[#002a46] text-white text-[9px] px-1 py-0 rounded-none h-4">0</Badge>
                </div>
                
                <div className="bg-[#cbd8e3] p-0.5 flex gap-0.5 border-b border-[#bdcddc] text-[10px]">
                  <button className="flex-1 bg-white border border-[#bdcddc] py-0.5 font-bold text-center">Inbox</button>
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
                        <div className="p-0.5 text-red-700 hover:bg-blue-100/30 rounded-sm cursor-pointer">
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
                <div className="bg-[#cbd8e3] border-b border-[#bdcddc] flex items-center px-1">
                  <button className="bg-white border-t border-x border-[#bdcddc] px-3.5 py-1 font-bold text-[10.5px] flex items-center gap-2 rounded-t-sm">
                    General Messages: JOHN DOE
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
                  onClick={() => selectOrOpenTab('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')}
                  className="bg-[#0f4471] text-white p-3 rounded-sm flex justify-between items-center shadow-md relative overflow-hidden cursor-pointer hover:bg-[#0c395f] transition-all"
                >
                  <div className="space-y-1 z-10">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold tracking-wide">JOHN DOE</h2>
                      <span className="text-[9px] bg-[#0d7a86] px-1 py-0.2 rounded font-bold uppercase">View Profile</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-0.5 text-[11px] text-gray-200">
                      <div><span className="text-gray-400 font-medium">MRN:</span> 1000245678</div>
                      <div><span className="text-gray-400 font-medium">Axio-ID:</span> AXSL06-S1L2V3</div>
                      <div><span className="text-gray-400 font-medium">Gender:</span> Male</div>
                      <div><span className="text-gray-400 font-medium">Age:</span> 45Y 8M</div>
                      <div className="col-span-2"><span className="text-gray-400 font-medium">Allergies:</span> Penicillin, Iodine</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-right text-[11px] z-10">
                    <div><span className="text-gray-400 font-medium">DOB:</span> 03/12/1979 (45Y)</div>
                    <div><span className="text-gray-400 font-medium">Weight:</span> 80.2 kg (04/25/2024)</div>
                    <div><span className="text-gray-400 font-medium">Height:</span> 175 cm</div>
                    <div><span className="text-gray-400 font-medium">Blood Type:</span> O+</div>
                    <div><span className="text-gray-400 font-medium">HealthLife:</span> Yes</div>
                  </div>
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
                      <span className="font-semibold text-[#0f719b]">Clinical Note Ready for Review</span>
                      <span className="text-gray-500 font-semibold">Date/Time:</span>
                      <span>05/28/2025 03:42 PM</span>
                    </div>
                  </div>
                  <div className="space-y-3 leading-relaxed text-gray-800">
                    <div className="font-semibold border-b border-gray-100 pb-1">Message Content</div>
                    <p>The clinical note for patient JOHN DOE (MRN: 1000245678) is ready to review and sign in AxioNote.</p>
                    <p>Please click the link below or use the Clinical menu &gt; AxioNote - Edge Platform from the top toolbar to launch the platform.</p>
                    <div className="py-2">
                      <button className="text-[#0f719b] font-semibold underline hover:text-[#0b5475]">Launch AxioNote - Edge Platform</button>
                    </div>
                    <p className="text-gray-500 text-[10.5px]">Thank you,<br />AxioVital Clinical System</p>
                  </div>
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
              {/* Patient Directory Title bar */}
              <div className="flex justify-between items-center bg-white border border-[#bdcddc] p-2 rounded-sm shadow-sm">
                <span className="font-bold text-xs text-[#002a46]">Patient Directory</span>
                <div className="flex gap-2 items-center">
                  <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                    <option>Saved Views</option>
                  </select>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[10px]">Save View</button>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">🔄</button>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">🖨️</button>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">•••</button>
                </div>
              </div>

              {/* Search Filters Row */}
              <div className="bg-[#fafbfc] border border-[#bdcddc] p-3 rounded-sm shadow-sm grid grid-cols-6 gap-3 text-[10.5px]">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search By</label>
                  <select 
                    value={pdSearchBy}
                    onChange={(e) => setPdSearchBy(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>Name</option>
                    <option>MRN</option>
                    <option>UHID</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search Text</label>
                  <input
                    type="text"
                    placeholder="Enter Patient Name"
                    value={pdSearchText}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">MRN</label>
                  <input
                    type="text"
                    placeholder="Enter MRN"
                    value={pdMrn}
                    onChange={(e) => setPdMrn(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">UHID / Axio ID</label>
                  <input
                    type="text"
                    placeholder="Enter UHID / Axio ID"
                    value={pdUhid}
                    onChange={(e) => setPdUhid(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Date of Birth</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={pdDob}
                    onChange={(e) => setPdDob(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 text-[10px] font-semibold rounded">
                      More Filters
                    </button>
                    <button className="flex-1 bg-[#0f4471] hover:bg-[#0b3355] text-white py-1 text-[10px] font-bold rounded">
                      🔍 Search
                    </button>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-1 text-[10px] font-semibold rounded">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

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
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                       {patientDirectoryData.map((row, index) => (
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
                          <td className={`p-2.5 border-r border-gray-200 font-medium ${selectedPatientMrns.includes(row.mrn) ? 'text-blue-150' : 'text-gray-500'}`}>{row.uhid}</td>
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
                          <td className="p-2.5 border-r border-gray-200">{row.ageGender}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dob}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.phone}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.visit}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dept}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.physician}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2 py-0.5 rounded-sm font-semibold text-[9px] ${
                              selectedPatientMrns.includes(row.mrn) 
                                ? 'bg-white/20 text-white' 
                                : row.statusBg
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-gray-200">{row.location}</td>
                          <td className={`p-2.5 border-r border-gray-200 ${selectedPatientMrns.includes(row.mrn) ? 'text-blue-150' : 'text-gray-500'}`}>{row.admitted}</td>
                          <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button className={`border px-1.5 py-0.5 rounded text-[10px] ${
                              selectedPatientMrns.includes(row.mrn) 
                                ? 'bg-white/10 border-white/20 hover:bg-white/25 text-white' 
                                : 'bg-white border-[#bdcddc] hover:bg-gray-50 text-gray-700'
                            }`}>•••</button>
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
                    <button className="px-2 py-0.5 hover:bg-gray-100 rounded">3</button>
                    <button className="px-2 py-0.5 hover:bg-gray-100 rounded">4</button>
                    <button className="px-2 py-0.5 hover:bg-gray-100 rounded">5</button>
                    <span>...</span>
                    <button className="px-2 py-0.5 hover:bg-gray-100 rounded">50</button>
                    <button className="px-1.5 py-0.5 hover:bg-gray-100 rounded">❯</button>
                  </div>
                  <div className="text-gray-500">
                    Showing 1 to 25 of 1,248 entries
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
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="p-2.5 border-r border-gray-200 text-center">
                            <input type="checkbox" className="rounded-sm" />
                          </td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className="flex items-center gap-1">
                              <span className="text-xs">{row.icon}</span>
                              <span className={`font-semibold ${row.priorityColor}`}>{row.priority}</span>
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-gray-200 font-bold text-[#0d7a86] cursor-pointer hover:underline" onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.patient.toUpperCase()}`, 'patient-doe')}>{row.patient}</td>
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

          {activeTab.type === 'PatientProfile' && (
            <div className="flex flex-1 overflow-hidden">
              
              {/* Left Column: Patient Profile Content Workspace */}
              <div className="flex-1 bg-white flex flex-col overflow-auto text-[10.5px] p-3 space-y-3">
                
                {/* Patient Profile Header Banner Card */}
                <div className="bg-[#0f4471] text-white p-3 rounded-sm flex justify-between items-start shadow-sm border border-[#0d3455] h-auto">
                  <div className="space-y-2 w-full">
                    <h2 className="text-base font-bold tracking-wide -mt-1 font-sans">JOHN DOE</h2>
                    <div className="grid grid-cols-[1fr_1.8fr_1fr] gap-x-8 gap-y-1.5 text-[9.5px] text-gray-200">
                      <div className="space-y-1">
                        <div><span className="text-gray-400 font-semibold inline-block w-[50px]">ABHA:</span> 1000245678</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[50px]">Axio-ID:</span> AXSL06-S1L2V3</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[50px]">DOB:</span> 03/12/1979 (45Y)</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[50px]">Gender:</span> Male</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div><span className="text-gray-400 font-semibold inline-block w-[100px]">Phone:</span> (305) 666-5599</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[100px]">Email:</span> jenwatts@aol.net</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[100px]">Address:</span> 7235 SW 48th St, Miami, FL 33155</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[100px]">Primary Insurance:</span> Blue Cross / Blue Shield</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div><span className="text-gray-400 font-semibold inline-block w-[105px]">Attending Physician:</span> Dr. Herman Stewart</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[105px]">Referring Physician:</span> Dr. W. Garland</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[105px]">First Visit:</span> 07/15/2004</div>
                        <div><span className="text-gray-400 font-semibold inline-block w-[105px]">Patient Status:</span> Active</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end self-end h-full">
                    <button 
                      onClick={() => selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe')}
                      className="bg-white border border-[#bdcddc] hover:bg-gray-100 text-[#0f4471] font-bold px-3 py-1 rounded text-[9.5px]"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Sub Tab Navigation Ribbon */}
                <div className="flex border-b border-[#bdcddc] gap-1 text-[10.5px]">
                  {['Demographics', 'Insurance', 'Contacts', 'Clinical', 'Visit History', 'Notes'].map((t) => (
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

                {/* Main Tab Panels Content */}
                {profileTab === 'Demographics' && (
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Panel 1: Personal Information */}
                    <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col">
                      <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                        <span className="text-[11px]">Personal Information</span>
                        <button 
                          onClick={() => selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe')}
                          className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2.5 py-0.5 rounded text-[9.5px] font-semibold text-gray-700 flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
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
                        <button 
                          onClick={() => selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe')}
                          className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2.5 py-0.5 rounded text-[9.5px] font-semibold text-gray-700 flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                      <div className="p-3 grid grid-cols-[120px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                        <span className="text-gray-500 font-medium">Address</span>
                        <span className="text-gray-900">{editAddress}</span>
                        
                        <span className="text-gray-500 font-medium">City</span>
                        <span className="text-gray-900">{editCity}</span>
                        
                        <span className="text-gray-500 font-medium">State / Province</span>
                        <span className="text-gray-900">{editState}</span>
                        
                        <span className="text-gray-500 font-medium">ZIP / Postal Code</span>
                        <span className="text-gray-900">{editZip}</span>
                        
                        <span className="text-gray-500 font-medium">Country</span>
                        <span className="text-gray-900">{editCountry}</span>
                      </div>
                    </div>

                    {/* Panel 3: Contact Information */}
                    <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col">
                      <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                        <span className="text-[11px]">Contact Information</span>
                        <button 
                          onClick={() => selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe')}
                          className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2.5 py-0.5 rounded text-[9.5px] font-semibold text-gray-700 flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                      <div className="p-3 grid grid-cols-[120px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                        <span className="text-gray-500 font-medium">Phone</span>
                        <span className="text-gray-900">{editPhone}</span>

                        <span className="text-gray-500 font-medium">Mobile / Pager</span>
                        <span className="text-gray-900">{editMobile}</span>

                        <span className="text-gray-500 font-medium">Fax</span>
                        <span className="text-gray-900">{editFax}</span>

                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="font-semibold text-blue-800">{editEmail}</span>

                        <span className="text-gray-500 font-medium">Alternate Email</span>
                        <span className="text-gray-900">{editAlternateEmail || '—'}</span>
                      </div>
                    </div>

                    {/* Panel 4: Physician Information */}
                    <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col">
                      <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                        <span className="text-[11px]">Physician Information</span>
                        <button 
                          onClick={() => selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe')}
                          className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2.5 py-0.5 rounded text-[9.5px] font-semibold text-gray-700 flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                      <div className="p-3 grid grid-cols-[120px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                        <span className="text-gray-500 font-medium">Referring Physician</span>
                        <span className="text-gray-900">{editReferringPhysician}</span>

                        <span className="text-gray-500 font-medium">Attending Physician</span>
                        <span className="text-gray-900">{editAttendingPhysician}</span>

                        <span className="text-gray-500 font-medium">Date of First Visit</span>
                        <span className="text-gray-900">{editFirstVisit}</span>

                        <span className="text-gray-500 font-medium">Patient Status</span>
                        <span className="text-gray-900">{editStatus}</span>
                      </div>
                    </div>

                    {/* Panel 5: Additional Information */}
                    <div className="bg-white border border-[#e2e8f0] rounded shadow-sm flex flex-col h-fit col-span-2">
                      <div className="bg-[#f8fafc] px-3 py-2 font-bold border-b border-[#e2e8f0] flex justify-between items-center text-[#1e293b]">
                        <span className="text-[11px]">Additional Information</span>
                        <button 
                          onClick={() => selectOrOpenTab('EditPatientProfile', 'Edit Patient Profile: JOHN DOE', 'edit-patient-doe')}
                          className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2.5 py-0.5 rounded text-[9.5px] font-semibold text-gray-700 flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                      <div className="p-3 grid grid-cols-[150px_1fr] gap-x-2 gap-y-2.5 text-gray-700 text-[10.5px]">
                        <span className="text-gray-500 font-medium">Insurance / Coverage</span>
                        <span className="text-gray-900">{editPrimaryInsurance}</span>

                        <span className="text-gray-500 font-medium">Insurance ID</span>
                        <span className="text-gray-900">{editInsuranceId}</span>
                      </div>
                    </div>

                  </div>
                )}

                {profileTab === 'Insurance' && (
                  <div className="flex-1 space-y-4 text-gray-800 text-[10.5px]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center select-none">
                      <div>
                        <h3 className="font-bold text-sm text-[#0f4471]">Insurance</h3>
                        <p className="text-gray-500 text-[9.5px]">View patient's insurance history and current coverage details.</p>
                      </div>
                      <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1 text-[9.5px]">
                        ➕ Add New Insurance
                      </button>
                    </div>

                    {/* Sub-navigation Menu Ribbon */}
                    <div className="flex gap-4 border-b border-gray-150 pb-1.5 select-none font-semibold text-[10px]">
                      <button className="text-[#0f4471] border-b-2 border-[#0f4471] pb-1">Insurance History</button>
                      <button className="text-gray-500 hover:text-gray-700 pb-1">Coverage Summary</button>
                      <button className="text-gray-500 hover:text-gray-700 pb-1">Authorizations</button>
                    </div>



                    {/* History Timeline block */}
                    <div className="space-y-3">
                      <div className="font-bold text-[11px] text-gray-700 select-none">
                        Insurance History Timeline
                        <p className="text-gray-400 font-normal text-[9px] mt-0.5">Complete history of patient's insurance coverage from earliest to current.</p>
                      </div>

                      <div className="relative border-l-2 border-gray-200 pl-4 ml-2.5 space-y-4">
                        
                        {/* Timeline Item 3 (Active) */}
                        <div className="relative">
                          <span className="absolute -left-[27.5px] top-0 w-5 h-5 rounded-full bg-green-500 text-white font-bold text-[10px] flex items-center justify-center select-none border-2 border-white">3</span>
                          
                          <div className="bg-[#f0fdf4]/30 border border-green-200 rounded p-3 shadow-sm grid grid-cols-[160px_1fr_1.2fr_auto] gap-4">
                            <div className="bg-gradient-to-r from-red-400 to-pink-500 rounded p-2 text-white font-sans flex flex-col justify-between h-[90px] shadow-sm select-none border border-red-300">
                              <div className="flex justify-between items-start text-[8px]">
                                <span className="font-bold">XYZ Insurance Company</span>
                                <span>ABC Brokerage</span>
                              </div>
                              <div className="font-mono text-[10px] font-bold text-center tracking-wider">X12356632</div>
                              <div className="flex justify-between items-end text-[7px] text-gray-100">
                                <div>
                                  <div>EFFECTIVE DATE</div>
                                  <div>06 Jun 2017</div>
                                </div>
                                <div>
                                  <div>EXPIRY DATE</div>
                                  <div>06 Jun 2018</div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 text-[11px]">XYZ Insurance Company</h4>
                                <span className="bg-green-100 text-green-800 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase select-none">Active</span>
                              </div>
                              <p className="text-gray-500 text-[9px]">ABC Brokerage</p>
                              <p className="text-gray-500 text-[9px]">123 First Avenue, Calgary, AB</p>
                              <div className="grid grid-cols-3 gap-2 pt-1 text-[9px]">
                                <div><span className="text-gray-400">Policy Number</span><div className="font-semibold">X12356632</div></div>
                                <div><span className="text-gray-400">Effective Date</span><div className="font-semibold">06 Jun 2017</div></div>
                                <div><span className="text-gray-400">Expiry Date</span><div className="font-semibold">06 Jun 2018</div></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-[9px]">
                                <div><span className="text-gray-400">Insured</span><div className="font-semibold">John Doe (Self)</div></div>
                                <div><span className="text-gray-400">Insured DOB</span><div className="font-semibold">{editDob}</div></div>
                                <div><span className="text-gray-400">Insured DOB</span><div className="font-semibold">{editDob}</div></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px]">
                              <div><span className="text-gray-400 block">Insurance Type</span><span className="font-semibold">Motor Vehicle Liability</span></div>
                              <div><span className="text-gray-400 block">Insured Number</span><span className="font-semibold">—</span></div>
                              <div><span className="text-gray-400 block">Group Number</span><span className="font-semibold">—</span></div>
                              <div><span className="text-gray-400 block">Plan / Coverage</span><span className="font-semibold">Liability Insurance</span></div>
                            </div>

                            <div className="flex flex-col justify-center items-end select-none">
                              <div className="flex border border-gray-200 rounded overflow-hidden">
                                <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                                <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Item 2 (Expired) */}
                        <div className="relative">
                          <span className="absolute -left-[27.5px] top-0 w-5 h-5 rounded-full bg-gray-400 text-white font-bold text-[10px] flex items-center justify-center select-none border-2 border-white">2</span>
                          
                          <div className="bg-white border border-gray-200 rounded p-3 shadow-sm grid grid-cols-[160px_1fr_1.2fr_auto] gap-4">
                            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded p-2 text-white font-sans flex flex-col justify-between h-[90px] shadow-sm select-none border border-blue-300">
                              <div className="flex justify-between items-start text-[8px]">
                                <span className="font-bold">HealthFirst Insurance</span>
                                <span>HealthFirst Network</span>
                              </div>
                              <div className="font-mono text-[10px] font-bold text-center tracking-wider">HF7894562</div>
                              <div className="flex justify-between items-end text-[7px] text-gray-100">
                                <div>
                                  <div>EFFECTIVE DATE</div>
                                  <div>01 Jan 2015</div>
                                </div>
                                <div>
                                  <div>EXPIRY DATE</div>
                                  <div>31 Dec 2016</div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 text-[11px]">HealthFirst Insurance</h4>
                                <span className="bg-gray-100 text-gray-800 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase select-none">Expired</span>
                              </div>
                              <p className="text-gray-500 text-[9px]">HealthFirst Network</p>
                              <p className="text-gray-500 text-[9px]">456 Health Blvd, Calgary, AB</p>
                              <div className="grid grid-cols-3 gap-2 pt-1 text-[9px]">
                                <div><span className="text-gray-400">Policy Number</span><div className="font-semibold">HF7894562</div></div>
                                <div><span className="text-gray-400">Effective Date</span><div className="font-semibold">01 Jan 2015</div></div>
                                <div><span className="text-gray-400">Expiry Date</span><div className="font-semibold">31 Dec 2016</div></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-[9px]">
                                <div><span className="text-gray-400">Insured</span><div className="font-semibold">John Doe (Self)</div></div>
                                <div><span className="text-gray-400">Insured DOB</span><div className="font-semibold">{editDob}</div></div>
                                <div><span className="text-gray-400">Insured DOB</span><div className="font-semibold">{editDob}</div></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px]">
                              <div><span className="text-gray-400 block">Insurance Type</span><span className="font-semibold">Health Insurance</span></div>
                              <div><span className="text-gray-400 block">Insured Number</span><span className="font-semibold">—</span></div>
                              <div><span className="text-gray-400 block">Group Number</span><span className="font-semibold">HF-20215</span></div>
                              <div><span className="text-gray-400 block">Plan / Coverage</span><span className="font-semibold">Family Health Plan</span></div>
                            </div>

                            <div className="flex flex-col justify-center items-end select-none">
                              <div className="flex border border-gray-200 rounded overflow-hidden">
                                <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                                <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Item 1 (Expired) */}
                        <div className="relative">
                          <span className="absolute -left-[27.5px] top-0 w-5 h-5 rounded-full bg-gray-400 text-white font-bold text-[10px] flex items-center justify-center select-none border-2 border-white">1</span>
                          
                          <div className="bg-white border border-gray-200 rounded p-3 shadow-sm grid grid-cols-[160px_1fr_1.2fr_auto] gap-4">
                            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded p-2 text-white font-sans flex flex-col justify-between h-[90px] shadow-sm select-none border border-yellow-300">
                              <div className="flex justify-between items-start text-[8px]">
                                <span className="font-bold">SecureLife Insurance</span>
                                <span>SecureLife Group</span>
                              </div>
                              <div className="font-mono text-[10px] font-bold text-center tracking-wider">SL45678901</div>
                              <div className="flex justify-between items-end text-[7px] text-gray-100">
                                <div>
                                  <div>EFFECTIVE DATE</div>
                                  <div>10 Mar 2012</div>
                                </div>
                                <div>
                                  <div>EXPIRY DATE</div>
                                  <div>31 Dec 2014</div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 text-[11px]">SecureLife Insurance</h4>
                                <span className="bg-gray-100 text-gray-800 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase select-none">Expired</span>
                              </div>
                              <p className="text-gray-500 text-[9px]">SecureLife Group</p>
                              <p className="text-gray-500 text-[9px]">789 Secure Way, Calgary, AB</p>
                              <div className="grid grid-cols-3 gap-2 pt-1 text-[9px]">
                                <div><span className="text-gray-400">Policy Number</span><div className="font-semibold">SL45678901</div></div>
                                <div><span className="text-gray-400">Effective Date</span><div className="font-semibold">10 Mar 2012</div></div>
                                <div><span className="text-gray-400">Expiry Date</span><div className="font-semibold">31 Dec 2014</div></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-[9px]">
                                <div><span className="text-gray-400">Insured</span><div className="font-semibold">John Doe (Self)</div></div>
                                <div><span className="text-gray-400">Insured DOB</span><div className="font-semibold">{editDob}</div></div>
                                <div><span className="text-gray-400">Insured DOB</span><div className="font-semibold">{editDob}</div></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px]">
                              <div><span className="text-gray-400 block">Insurance Type</span><span className="font-semibold">Health Insurance</span></div>
                              <div><span className="text-gray-400 block">Insured Number</span><span className="font-semibold">—</span></div>
                              <div><span className="text-gray-400 block">Group Number</span><span className="font-semibold">SL-12012</span></div>
                              <div><span className="text-gray-400 block">Plan / Coverage</span><span className="font-semibold">Basic Health Plan</span></div>
                            </div>

                            <div className="flex flex-col justify-center items-end select-none">
                              <div className="flex border border-gray-200 rounded overflow-hidden">
                                <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                                <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Footer Info Notice */}
                    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded p-2 text-blue-800 text-[9.5px] flex items-center gap-2 select-none">
                      <span className="text-[10px]">ℹ️</span>
                      <span>Insurance history is displayed from oldest to newest. The most recent active insurance is shown at the top.</span>
                    </div>

                  </div>
                )}

                {profileTab === 'Clinical' && (
                  <div className="flex-1 space-y-4 text-gray-800 text-[10.5px]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center select-none">
                      <div>
                        <h3 className="font-bold text-sm text-[#0f4471]">Clinical History & Health Journey</h3>
                        <p className="text-gray-500 text-[9.5px]">Complete chronological logs of clinics and hospitals visited during the patient's health journey.</p>
                      </div>
                      <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1 text-[9.5px]">
                        🔍 Filter History
                      </button>
                    </div>

                    {/* Timeline Container */}
                    <div className="relative border-l-2 border-gray-200 pl-6 ml-14 space-y-6">
                      
                      {/* Timeline Item 1 */}
                      <div className="relative">
                        {/* Left absolute date */}
                        <div className="absolute -left-[95px] top-1 text-right w-[75px] select-none">
                          <div className="font-bold text-gray-900 text-[9.5px]">2 days ago</div>
                          <div className="text-gray-400 text-[9px] mt-0.5">28 May 2025</div>
                        </div>
                        {/* Dot marker */}
                        <span className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-[#0d7a86] border-2 border-white shadow-sm flex items-center justify-center"></span>
                        
                        {/* Content Card */}
                        <div className="bg-white border border-[#e2e8f0] hover:border-gray-300 rounded p-3.5 shadow-sm grid grid-cols-[80px_1.6fr_1fr_1fr_1.2fr_auto] gap-4 items-center">
                          <div className="relative overflow-hidden rounded border border-gray-200 h-14 w-14 flex items-center justify-center bg-gray-50">
                            <img src="/rockyview_hospital.png" alt="Rockyview Hospital" className="h-full w-full object-cover" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-[11px]">Rockyview General Hospital</h4>
                              <span className="bg-green-150 text-green-800 text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase">Hospital</span>
                            </div>
                            <p className="text-gray-400 text-[9px] mt-0.5">7007 14 St SW, Calgary, AB T2R 1P8</p>
                            <p className="text-gray-500 font-semibold text-[9px] mt-1">Department: Cardiology  |  Dr. P. Singh (Cardiologist)</p>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Visit Type</span>
                            <span className="font-semibold text-gray-800">Outpatient Visit</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Reason</span>
                            <span className="font-semibold text-gray-800">Chest Pain Follow-up</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">MRN / Visit No.</span>
                            <span className="font-mono text-gray-800 font-bold">RGH-2025-001245</span>
                          </div>

                          <div className="flex border border-gray-200 rounded overflow-hidden select-none">
                            <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                            <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Item 2 */}
                      <div className="relative">
                        {/* Left absolute date */}
                        <div className="absolute -left-[95px] top-1 text-right w-[75px] select-none">
                          <div className="font-semibold text-gray-500 text-[9.5px]">12 May 2025</div>
                        </div>
                        {/* Dot marker */}
                        <span className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-sm flex items-center justify-center"></span>
                        
                        {/* Content Card */}
                        <div className="bg-white border border-[#e2e8f0] hover:border-gray-300 rounded p-3.5 shadow-sm grid grid-cols-[80px_1.6fr_1fr_1fr_1.2fr_auto] gap-4 items-center">
                          <div className="relative overflow-hidden rounded border border-gray-200 h-14 w-14 flex items-center justify-center bg-gray-50">
                            <img src="/sunridge_clinic.png" alt="Sunridge Clinic" className="h-full w-full object-cover" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-[11px]">Sunridge Medical Clinic</h4>
                              <span className="bg-blue-50 text-blue-800 text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase">Clinic</span>
                            </div>
                            <p className="text-gray-400 text-[9px] mt-0.5">2555 32 Ave NE, Calgary, AB T1Y 6J7</p>
                            <p className="text-gray-500 font-semibold text-[9px] mt-1">Provider: Dr. A. Mehta (Family Physician)</p>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Visit Type</span>
                            <span className="font-semibold text-gray-800">Clinic Visit</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Reason</span>
                            <span className="font-semibold text-gray-800">Regular Checkup</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">MRN / Visit No.</span>
                            <span className="font-mono text-gray-800 font-bold">SMC-2025-000987</span>
                          </div>

                          <div className="flex border border-gray-200 rounded overflow-hidden select-none">
                            <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                            <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Item 3 */}
                      <div className="relative">
                        {/* Left absolute date */}
                        <div className="absolute -left-[95px] top-1 text-right w-[75px] select-none">
                          <div className="font-semibold text-gray-500 text-[9.5px]">22 Apr 2025</div>
                        </div>
                        {/* Dot marker */}
                        <span className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-sm flex items-center justify-center"></span>
                        
                        {/* Content Card */}
                        <div className="bg-white border border-[#e2e8f0] hover:border-gray-300 rounded p-3.5 shadow-sm grid grid-cols-[80px_1.6fr_1fr_1fr_1.2fr_auto] gap-4 items-center">
                          <div className="relative overflow-hidden rounded border border-gray-200 h-14 w-14 flex items-center justify-center bg-gray-50">
                            <img src="/foothills_centre.png" alt="Foothills Centre" className="h-full w-full object-cover" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-[11px]">Foothills Medical Centre</h4>
                              <span className="bg-green-150 text-green-800 text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase">Hospital</span>
                            </div>
                            <p className="text-gray-400 text-[9px] mt-0.5">1403 29 St NW, Calgary, AB T2N 2T9</p>
                            <p className="text-gray-500 font-semibold text-[9px] mt-1">Department: Emergency  |  Dr. R. Wilson (ER Physician)</p>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Visit Type</span>
                            <span className="font-semibold text-gray-800">Emergency Visit</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Reason</span>
                            <span className="font-semibold text-gray-800">Shortness of Breath</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">MRN / Visit No.</span>
                            <span className="font-mono text-gray-800 font-bold">FMC-2025-000762</span>
                          </div>

                          <div className="flex border border-gray-200 rounded overflow-hidden select-none">
                            <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                            <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Item 4 */}
                      <div className="relative">
                        {/* Left absolute date */}
                        <div className="absolute -left-[95px] top-1 text-right w-[75px] select-none">
                          <div className="font-semibold text-gray-500 text-[9.5px]">05 Feb 2025</div>
                        </div>
                        {/* Dot marker */}
                        <span className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-sm flex items-center justify-center"></span>
                        
                        {/* Content Card */}
                        <div className="bg-white border border-[#e2e8f0] hover:border-gray-300 rounded p-3.5 shadow-sm grid grid-cols-[80px_1.6fr_1fr_1fr_1.2fr_auto] gap-4 items-center">
                          <div className="relative overflow-hidden rounded border border-gray-200 h-14 w-14 flex items-center justify-center bg-gray-50">
                            <img src="/rockyview_hospital.png" alt="Edmonton Hospital" className="h-full w-full object-cover" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-[11px]">Edmonton General Hospital</h4>
                              <span className="bg-green-150 text-green-800 text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase">Hospital</span>
                            </div>
                            <p className="text-gray-400 text-[9px] mt-0.5">11111 Jasper Ave, Edmonton, AB T5K 0L4</p>
                            <p className="text-gray-500 font-semibold text-[9px] mt-1">Department: Pulmonology  |  Dr. S. Verma (Pulmonologist)</p>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Visit Type</span>
                            <span className="font-semibold text-gray-800">Outpatient Visit</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Reason</span>
                            <span className="font-semibold text-gray-800">Asthma Management</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">MRN / Visit No.</span>
                            <span className="font-mono text-gray-800 font-bold">EGH-2025-000531</span>
                          </div>

                          <div className="flex border border-gray-200 rounded overflow-hidden select-none">
                            <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                            <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Item 5 */}
                      <div className="relative">
                        {/* Left absolute date */}
                        <div className="absolute -left-[95px] top-1 text-right w-[75px] select-none">
                          <div className="font-semibold text-gray-500 text-[9.5px]">18 Dec 2024</div>
                        </div>
                        {/* Dot marker */}
                        <span className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-sm flex items-center justify-center"></span>
                        
                        {/* Content Card */}
                        <div className="bg-white border border-[#e2e8f0] hover:border-gray-300 rounded p-3.5 shadow-sm grid grid-cols-[80px_1.6fr_1fr_1fr_1.2fr_auto] gap-4 items-center">
                          <div className="relative overflow-hidden rounded border border-gray-200 h-14 w-14 flex items-center justify-center bg-gray-50">
                            <img src="/sunridge_clinic.png" alt="HealthPlus Clinic" className="h-full w-full object-cover" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-[11px]">HealthPlus Clinic Downtown</h4>
                              <span className="bg-blue-50 text-blue-800 text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase">Clinic</span>
                            </div>
                            <p className="text-gray-400 text-[9px] mt-0.5">999 Burrard St, Vancouver, BC V6Z 2R9</p>
                            <p className="text-gray-500 font-semibold text-[9px] mt-1">Provider: Dr. K. Lee (General Practitioner)</p>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Visit Type</span>
                            <span className="font-semibold text-gray-800">Clinic Visit</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">Reason</span>
                            <span className="font-semibold text-gray-800">Flu Symptoms</span>
                          </div>

                          <div className="text-[9.5px]">
                            <span className="text-gray-400 block">MRN / Visit No.</span>
                            <span className="font-mono text-gray-800 font-bold">HPC-2024-000321</span>
                          </div>

                          <div className="flex border border-gray-200 rounded overflow-hidden select-none">
                            <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 text-[9px] shadow-sm">View Details</button>
                            <button className="bg-white border-l border-gray-200 hover:bg-gray-50 px-1.5 py-1 text-[9px] text-gray-500 font-semibold">▼</button>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>

              {/* Right Column: Profile Picture & Quick Demographics Sidebar */}
              <div className="w-[230px] bg-white border-l border-[#bdcddc] flex flex-col p-3 space-y-4 overflow-y-auto text-[10px]">
                
                {/* Profile Photo Area */}
                <div className="border border-[#e2e8f0] p-2 bg-white rounded flex justify-center text-[10px]">
                  <div className="w-[150px] h-[150px] relative bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 rounded">
                    <img 
                      src="/avatar.png" 
                      alt="Patient Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Quick Demographics Summary Panel */}
                <div className="border border-[#bdcddc] rounded-sm overflow-hidden bg-white">
                  <div className="bg-[#cbd8e3]/30 p-1.5 border-b border-[#bdcddc] font-bold text-[10.5px] text-[#0f4471]">
                    Quick Demographics
                  </div>
                  <div className="p-2 space-y-1.5 text-gray-800">
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="text-gray-500">Age</span>
                      <span className="font-semibold">45 Years</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="text-gray-500">Gender</span>
                      <span className="font-semibold">Male</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="text-gray-500">DOB</span>
                      <span className="font-semibold">{editDob}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="text-gray-500">Blood Type</span>
                      <span className="font-semibold text-red-700">O+</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="text-gray-500">Height</span>
                      <span className="font-semibold">175 cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight</span>
                      <span className="font-semibold">80.2 kg (04/25/2024)</span>
                    </div>
                  </div>
                </div>

                {/* Insurance Summary Panel */}
                <div className="border border-[#bdcddc] rounded-sm overflow-hidden bg-white">
                  <div className="bg-[#cbd8e3]/30 p-1.5 border-b border-[#bdcddc] font-bold text-[10.5px] text-[#0f4471]">
                    Insurance Summary
                  </div>
                  <div className="p-2 space-y-1.5 text-gray-800">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Primary Payer</span>
                      <span className="font-semibold">{editPrimaryInsurance}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Insurance ID</span>
                      <span className="font-semibold">{editInsuranceId}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Group Number</span>
                      <span className="font-semibold">BCBS123456</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-semibold">PPO</span>
                    </div>
                  </div>
                </div>

                {/* Important Notes Scrollable Area */}
                <div className="border border-[#bdcddc] rounded-sm overflow-hidden bg-white">
                  <div className="bg-[#cbd8e3]/30 p-1.5 border-b border-[#bdcddc] font-bold text-[10.5px] text-[#0f4471]">
                    Important Note
                  </div>
                  <div className="p-2 text-gray-800 h-[100px] overflow-y-auto text-[9.5px] leading-relaxed whitespace-pre-line">
                    {patientNotesMap[editMrn] || "11/25/2004: Allergic rhinitis | Nasal polyps | Acute sinusitis."}
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab.type === 'EditPatientProfile' && (
            <div className="flex flex-1 overflow-hidden select-none">
              
              {/* Left Sidebar: Edit Patient Options */}
              <div className="w-[180px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
                <div className="bg-[#789cbb] text-white font-bold p-1.5 flex justify-between items-center">
                  <span>Clinical Options</span>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-3 py-1.5 bg-[#007cc0] text-white font-bold">Demographics</button>
                  {['Insurance', 'Contacts', 'Clinical Chart', 'Allergies', 'Medications', 'Problems', 'Documents', 'Images', 'Lab Results', 'Immunizations', 'Vitals', 'Care Plans', 'Notes', 'Export Data', 'Backup', 'Audit Trail', 'Exit'].map((opt) => (
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
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Primary Insurance</label>
                        <select 
                          value={editPrimaryInsurance} 
                          onChange={(e) => setEditPrimaryInsurance(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Blue Cross / Blue Shield</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Insurance ID</label>
                        <input 
                          type="text" 
                          value={editInsuranceId} 
                          onChange={(e) => setEditInsuranceId(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
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
                      <span>Age: {patient.ageGender.split(' / ')[0]}</span>
                      <span>Dose Wt: 80.200 kg (07/24/2017)</span>
                      <span>Sex: {patient.ageGender.split(' / ')[1]}</span>
                      <span>MRN: {patient.mrn}</span>
                      <span>Attending: {patient.physician}</span>
                    </div>
                    <div className="flex items-center gap-3">
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#115b8d] mt-1 pt-1 text-[9.5px] text-[#bde0f5]">
                    <div className="flex items-center gap-4">
                      <span>FIN: 1200290664</span>
                      <span>Admit: {patient.admitted}</span>
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
              
              {/* Header Title & Controls */}
              <div className="flex justify-between items-center bg-white border border-[#bdcddc] p-2 rounded-sm shadow-sm select-none">
                <span className="font-bold text-xs text-[#002a46]">Appointment Reschedule Requests</span>
                <div className="flex gap-2 items-center">
                  <button className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-3 py-1.5 rounded text-[10px] flex items-center gap-1 font-semibold text-gray-700">
                    📥 Export <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
                  </button>
                  <button className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-600 font-bold">•••</button>
                </div>
              </div>

              {/* Status Summary KPI Cards Row */}
              <div className="grid grid-cols-5 gap-3.5 select-none">
                {[
                  { label: 'Total Requests', value: '8', change: 'All time', icon: '👤', bg: 'bg-[#faf5ff] border-[#f3e8ff]', color: 'text-[#8b5cf6]' },
                  { label: 'Pending', value: '5', change: '62.5%', icon: '⏱️', bg: 'bg-[#fffbeb] border-[#fef3c7]', color: 'text-amber-600' },
                  { label: 'Reviewing', value: '1', change: '12.5%', icon: 'ℹ️', bg: 'bg-[#eff6ff] border-[#dbeafe]', color: 'text-blue-600' },
                  { label: 'Approved', value: '1', change: '12.5%', icon: '✅', bg: 'bg-[#f0fdf4] border-[#dcfce7]', color: 'text-green-600' },
                  { label: 'Declined', value: '1', change: '12.5%', icon: '❌', bg: 'bg-[#fef2f2] border-[#fee2e2]', color: 'text-red-600' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-[#e2e8f0] p-3.5 rounded flex items-center gap-3.5 shadow-sm">
                    <span className={`text-lg ${kpi.color} p-2.5 ${kpi.bg} rounded border font-bold`}>{kpi.icon}</span>
                    <div>
                      <div className="text-gray-500 font-bold text-[9.5px]">{kpi.label}</div>
                      <div className="text-xl font-bold text-gray-900 leading-tight">{kpi.value}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">{kpi.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search Filters Row */}
              <div className="bg-[#fafbfc] border border-[#bdcddc] p-3 rounded-sm shadow-sm grid grid-cols-6 gap-3 text-[10.5px] select-none">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search By</label>
                  <select 
                    value={rsSearchBy}
                    onChange={(e) => setRsSearchBy(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>Patient Name</option>
                    <option>Request ID</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search Text</label>
                  <input
                    type="text"
                    placeholder="Enter Patient Name / MRN"
                    value={rsSearchText}
                    onChange={(e) => setRsSearchText(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Request ID</label>
                  <input
                    type="text"
                    placeholder="Enter Request ID"
                    value={rsRequestId}
                    onChange={(e) => setRsRequestId(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Provider</label>
                  <select 
                    value={rsProvider}
                    onChange={(e) => setRsProvider(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>Select Provider</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Status</label>
                  <select 
                    value={rsStatus}
                    onChange={(e) => setRsStatus(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>All</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 text-[10px] font-semibold rounded">
                      More Filters
                    </button>
                    <button className="flex-1 bg-[#0f4471] hover:bg-[#0b3355] text-white py-1 text-[10px] font-bold rounded">
                      🔍 Search
                    </button>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-1 text-[10px] font-semibold rounded">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#bdcddc] select-none">
                        <th className="p-2.5 border-r border-[#bdcddc] w-[30px] text-center">
                          <input type="checkbox" className="rounded-sm" />
                        </th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Request ID</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Patient Name<br/><span className="text-[9px] text-gray-400">MRN</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Current Appointment<br/><span className="text-[9px] text-gray-400">Date & Time</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Provider<br/><span className="text-[9px] text-gray-400">Department</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Requested New Date & Time</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Request Type<br/><span className="text-[9px] text-gray-400">Reason</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Requested On<br/><span className="text-[9px] text-gray-400">Requested By</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Priority</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Status</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rescheduleRequests.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => {
                            setSelectedRescheduleReq(row);
                            setShowRescheduleModal(true);
                          }}
                        >
                          <td className="p-2.5 border-r border-gray-200 text-center select-none" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="rounded-sm" />
                          </td>
                          <td className="p-2.5 border-r border-gray-200 font-bold text-gray-700">{row.id}</td>
                          <td className="p-2.5 border-r border-gray-200" onClick={(e) => e.stopPropagation()}>
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
                            <div className="text-[9px] text-gray-500 font-mono">{row.mrn}</div>
                          </td>
                          <td className="p-2.5 border-r border-gray-200 font-semibold">{row.current}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dept}</td>
                          <td className="p-2.5 border-r border-gray-200 text-blue-900 font-bold">{row.requested}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.reason}</td>
                          <td className="p-2.5 border-r border-gray-200 text-gray-500">{row.requestedOn}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] border ${row.priorityColor}`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2.5 py-0.5 rounded-sm font-bold text-[9px] border ${row.statusColor}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center select-none" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => {
                                setSelectedRescheduleReq(row);
                                setShowRescheduleModal(true);
                              }}
                              className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[9.5px] text-[#0f4471] font-bold"
                            >
                              Reschedule
                            </button>
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
                    Showing 1 to 8 of 8 entries
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] text-[10.5px] select-text h-full">
              {/* Header Title & Controls */}
              <div className="flex justify-between items-center bg-white border border-[#bdcddc] p-2 rounded-sm shadow-sm select-none">
                <span className="font-bold text-xs text-[#002a46]">Referral & Transfer Management</span>
                <div className="flex gap-2 items-center">
                  <button className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-3 py-1.5 rounded text-[10px] flex items-center gap-1 font-semibold text-gray-700">
                    📥 Export <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
                  </button>
                  <button className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-600 font-bold">•••</button>
                </div>
              </div>

              {/* Search Filters Row */}
              <div className="bg-[#fafbfc] border border-[#bdcddc] p-3 rounded-sm shadow-sm grid grid-cols-6 gap-3 text-[10.5px] select-none">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search By</label>
                  <select 
                    value={rsSearchBy}
                    onChange={(e) => setRsSearchBy(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>Patient Name</option>
                    <option>Request ID</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search Text</label>
                  <input
                    type="text"
                    placeholder="Enter Patient Name / MRN"
                    value={rsSearchText}
                    onChange={(e) => setRsSearchText(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Request ID</label>
                  <input
                    type="text"
                    placeholder="Enter Request ID"
                    value={rsRequestId}
                    onChange={(e) => setRsRequestId(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Provider</label>
                  <select 
                    value={rsProvider}
                    onChange={(e) => setRsProvider(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>Select Provider</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Status</label>
                  <select 
                    value={rsStatus}
                    onChange={(e) => setRsStatus(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>All</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 text-[10px] font-semibold rounded">
                      More Filters
                    </button>
                    <button className="flex-1 bg-[#0f4471] hover:bg-[#0b3355] text-white py-1 text-[10px] font-bold rounded">
                      🔍 Search
                    </button>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-1 text-[10px] font-semibold rounded">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary KPI Cards Row */}
              <div className="grid grid-cols-5 gap-3.5 select-none">
                {[
                  { label: 'Total Referrals', value: '4', change: 'All time', icon: '🔗', bg: 'bg-[#faf5ff] border-[#f3e8ff]', color: 'text-[#8b5cf6]' },
                  { label: 'Pending Approval', value: '2', change: '50.0%', icon: '⏱️', bg: 'bg-[#fffbeb] border-[#fef3c7]', color: 'text-amber-600' },
                  { label: 'In Progress', value: '1', change: '25.0%', icon: 'ℹ️', bg: 'bg-[#eff6ff] border-[#dbeafe]', color: 'text-blue-600' },
                  { label: 'Completed', value: '1', change: '25.0%', icon: '✅', bg: 'bg-[#f0fdf4] border-[#dcfce7]', color: 'text-green-600' },
                  { label: 'Declined/Rejected', value: '0', change: '0.0%', icon: '❌', bg: 'bg-[#fef2f2] border-[#fee2e2]', color: 'text-red-600' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-[#e2e8f0] p-3.5 rounded flex items-center gap-3.5 shadow-sm">
                    <span className={`text-lg ${kpi.color} p-2.5 ${kpi.bg} rounded border font-bold`}>{kpi.icon}</span>
                    <div>
                      <div className="text-gray-500 font-bold text-[9.5px]">{kpi.label}</div>
                      <div className="text-xl font-bold text-gray-900 leading-tight">{kpi.value}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">{kpi.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#bdcddc] select-none">
                        <th className="p-2.5 border-r border-[#bdcddc] w-[30px] text-center">
                          <input type="checkbox" className="rounded-sm" />
                        </th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Referral ID</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Patient Name<br/><span className="text-[9px] text-gray-400">MRN</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Referring Doctor<br/><span className="text-[9px] text-gray-400">Source Hospital</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Target Department<br/><span className="text-[9px] text-gray-400">Physician</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Admission/Transfer Requested Date</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Type<br/><span className="text-[9px] text-gray-400">Clinical Reason</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Requested On<br/><span className="text-[9px] text-gray-400">Status Date</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Priority</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Status</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'REF-2025-000841', name: 'Rohan Sharma', mrn: '1000245690', current: '28/05/2025, 02:30 PM', dept: 'Dr. A. Verma (Cardiology)', requested: '30/05/2025, 10:00 AM', reason: 'Transfer: Specialty Care', requestedOn: '28/05/2025, 10:00 AM by City Hospital', priority: 'High', status: 'Pending', priorityColor: 'bg-red-50 text-red-800 border-red-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                        { id: 'REF-2025-000842', name: 'Samantha Miller', mrn: '1000245691', current: '28/05/2025, 04:00 PM', dept: 'Dr. M. Roy (Oncology)', requested: '31/05/2025, 11:30 AM', reason: 'Referral: Second Opinion', requestedOn: '28/05/2025, 11:15 AM by Dr. D. Patel', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                        { id: 'REF-2025-000843', name: 'Aarav Mehta', mrn: '1000245692', current: '29/05/2025, 10:00 AM', dept: 'Dr. S. Nair (Neurology)', requested: '29/05/2025, 03:00 PM', reason: 'Transfer: ICU Bed', requestedOn: '28/05/2025, 11:40 AM by Apex Clinic', priority: 'High', status: 'In Progress', priorityColor: 'bg-red-50 text-red-800 border-red-200', statusColor: 'bg-blue-100 text-blue-800 border-blue-200' },
                        { id: 'REF-2025-000844', name: 'Lily Evans', mrn: '1000245693', current: '29/05/2025, 11:00 AM', dept: 'Dr. P. Das (ENT)', requested: '29/05/2025, 01:00 PM', reason: 'Referral: Routine Consult', requestedOn: '28/05/2025, 12:05 PM by Dr. G. Jones', priority: 'Normal', status: 'Completed', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-green-100 text-green-800 border-green-200' }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="p-2.5 border-r border-gray-200 text-center select-none">
                            <input type="checkbox" className="rounded-sm" />
                          </td>
                          <td className="p-2.5 border-r border-gray-200 font-bold text-gray-700">{row.id}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <div className="font-bold text-[#0d7a86] cursor-pointer hover:underline" onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe')}>{row.name}</div>
                            <div className="text-[9px] text-gray-500 font-mono">{row.mrn}</div>
                          </td>
                          <td className="p-2.5 border-r border-gray-200 font-semibold">{row.requestedOn.split(' by ')[1]}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dept}</td>
                          <td className="p-2.5 border-r border-gray-200 text-blue-900 font-bold">{row.requested}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.reason}</td>
                          <td className="p-2.5 border-r border-gray-200 text-gray-500">{row.requestedOn.split(' by ')[0]}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] border ${row.priorityColor}`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2.5 py-0.5 rounded-sm font-bold text-[9px] border ${row.statusColor}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center select-none">
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
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-1.5 py-0.5 hover:bg-gray-100 rounded text-gray-400">❮</button>
                    <button className="px-2 py-0.5 bg-[#0f4471] text-white font-bold rounded">1</button>
                    <button className="px-1.5 py-0.5 hover:bg-gray-100 rounded">❯</button>
                  </div>
                  <div className="text-gray-500">
                    Showing 1 to 4 of 4 entries
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'DischargeList' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] text-[10.5px] select-text h-full">
              {/* Header Title & Controls */}
              <div className="flex justify-between items-center bg-white border border-[#bdcddc] p-2 rounded-sm shadow-sm select-none">
                <span className="font-bold text-xs text-[#002a46]">Patient Discharge List</span>
                <div className="flex gap-2 items-center">
                  <button className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-3 py-1.5 rounded text-[10px] flex items-center gap-1 font-semibold text-gray-700">
                    📥 Export <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
                  </button>
                  <button className="bg-white border border-[#cbd5e1] hover:bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-600 font-bold">•••</button>
                </div>
              </div>

              {/* Search Filters Row */}
              <div className="bg-[#fafbfc] border border-[#bdcddc] p-3 rounded-sm shadow-sm grid grid-cols-6 gap-3 text-[10.5px] select-none">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search By</label>
                  <select 
                    value={rsSearchBy}
                    onChange={(e) => setRsSearchBy(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>Patient Name</option>
                    <option>Request ID</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Search Text</label>
                  <input
                    type="text"
                    placeholder="Enter Patient Name / MRN"
                    value={rsSearchText}
                    onChange={(e) => setRsSearchText(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Request ID</label>
                  <input
                    type="text"
                    placeholder="Enter Request ID"
                    value={rsRequestId}
                    onChange={(e) => setRsRequestId(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Provider</label>
                  <select 
                    value={rsProvider}
                    onChange={(e) => setRsProvider(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>Select Provider</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Status</label>
                  <select 
                    value={rsStatus}
                    onChange={(e) => setRsStatus(e.target.value)}
                    className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px] focus:outline-none"
                  >
                    <option>All</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 text-[10px] font-semibold rounded">
                      More Filters
                    </button>
                    <button className="flex-1 bg-[#0f4471] hover:bg-[#0b3355] text-white py-1 text-[10px] font-bold rounded">
                      🔍 Search
                    </button>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-1 text-[10px] font-semibold rounded">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary KPI Cards Row */}
              <div className="grid grid-cols-5 gap-3.5 select-none">
                {[
                  { label: 'Total Discharges', value: '4', change: 'All time', icon: '🚪', bg: 'bg-[#faf5ff] border-[#f3e8ff]', color: 'text-[#8b5cf6]' },
                  { label: 'Pending Discharge', value: '2', change: '50.0%', icon: '⏱️', bg: 'bg-[#fffbeb] border-[#fef3c7]', color: 'text-amber-600' },
                  { label: 'Summaries Drafted', value: '1', change: '25.0%', icon: 'ℹ️', bg: 'bg-[#eff6ff] border-[#dbeafe]', color: 'text-blue-600' },
                  { label: 'Discharged Today', value: '1', change: '25.0%', icon: '✅', bg: 'bg-[#f0fdf4] border-[#dcfce7]', color: 'text-green-600' },
                  { label: 'Postponed', value: '0', change: '0.0%', icon: '❌', bg: 'bg-[#fef2f2] border-[#fee2e2]', color: 'text-red-600' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-[#e2e8f0] p-3.5 rounded flex items-center gap-3.5 shadow-sm">
                    <span className={`text-lg ${kpi.color} p-2.5 ${kpi.bg} rounded border font-bold`}>{kpi.icon}</span>
                    <div>
                      <div className="text-gray-500 font-bold text-[9.5px]">{kpi.label}</div>
                      <div className="text-xl font-bold text-gray-900 leading-tight">{kpi.value}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">{kpi.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#bdcddc] select-none">
                        <th className="p-2.5 border-r border-[#bdcddc] w-[30px] text-center">
                          <input type="checkbox" className="rounded-sm" />
                        </th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Discharge ID</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Patient Name<br/><span className="text-[9px] text-gray-400">MRN</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Admitting Ward<br/><span className="text-[9px] text-gray-400">Bed No.</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Primary Physician<br/><span className="text-[9px] text-gray-400">Department</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Discharge Scheduled Date/Time</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Destination<br/><span className="text-[9px] text-gray-400">Discharge Status</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Requested On<br/><span className="text-[9px] text-gray-400">Requested By</span></th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Priority</th>
                        <th className="p-2.5 border-r border-[#bdcddc]">Status</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'DIS-2025-000412', name: 'Vikram Singh', mrn: '1000245695', ward: 'ICU-A / Bed 04', dept: 'Dr. K. Iyer (Cardiology)', requested: '28/05/2025, 05:00 PM', reason: 'Discharge to Home', requestedOn: '28/05/2025, 10:15 AM by Dr. K. Iyer', priority: 'High', status: 'Pending', priorityColor: 'bg-red-50 text-red-800 border-red-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                        { id: 'DIS-2025-000413', name: 'Anjali Gupta', mrn: '1000245696', ward: 'GEN-03 / Bed 12', dept: 'Dr. M. Desai (Oncology)', requested: '29/05/2025, 10:30 AM', reason: 'Refer to Rehab Center', requestedOn: '28/05/2025, 11:00 AM by Dr. M. Desai', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                        { id: 'DIS-2025-000414', name: 'Robert Johnson', mrn: '1000245697', ward: 'NEU-01 / Bed 02', dept: 'Dr. P. Singh (Neurology)', requested: '28/05/2025, 03:00 PM', reason: 'Discharge to Home', requestedOn: '28/05/2025, 09:30 AM by Dr. P. Singh', priority: 'Normal', status: 'Discharged', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-green-100 text-green-800 border-green-200' },
                        { id: 'DIS-2025-000415', name: 'Kiran Patel', mrn: '1000245698', ward: 'PUL-02 / Bed 08', dept: 'Dr. S. Reddy (Pulmonology)', requested: '28/05/2025, 04:30 PM', reason: 'Discharge Summary Drafted', requestedOn: '28/05/2025, 10:45 AM by Dr. S. Reddy', priority: 'Normal', status: 'Drafted', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-blue-100 text-blue-800 border-blue-200' }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="p-2.5 border-r border-gray-200 text-center select-none">
                            <input type="checkbox" className="rounded-sm" />
                          </td>
                          <td className="p-2.5 border-r border-gray-200 font-bold text-gray-700">{row.id}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <div className="font-bold text-[#0d7a86] cursor-pointer hover:underline" onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe')}>{row.name}</div>
                            <div className="text-[9px] text-gray-500 font-mono">{row.mrn}</div>
                          </td>
                          <td className="p-2.5 border-r border-gray-200 font-semibold">{row.ward}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dept}</td>
                          <td className="p-2.5 border-r border-gray-200 text-blue-900 font-bold">{row.requested}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.reason}</td>
                          <td className="p-2.5 border-r border-gray-200 text-gray-500">{row.requestedOn.split(' by ')[0]}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] border ${row.priorityColor}`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2.5 py-0.5 rounded-sm font-bold text-[9px] border ${row.statusColor}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center select-none">
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
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-1.5 py-0.5 hover:bg-gray-100 rounded text-gray-400">❮</button>
                    <button className="px-2 py-0.5 bg-[#0f4471] text-white font-bold rounded">1</button>
                    <button className="px-1.5 py-0.5 hover:bg-gray-100 rounded">❯</button>
                  </div>
                  <div className="text-gray-500">
                    Showing 1 to 4 of 4 entries
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab.type === 'Orders' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f9fa] text-[10.5px] select-text h-full flex flex-col min-h-0">
              

              {/* Main Table Container */}
              <div className="flex-1 min-h-0 bg-white border border-[#bdcddc] rounded-sm overflow-hidden flex flex-col shadow-sm">
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="bg-[#f0f4f8] text-gray-700 border-b border-gray-300 sticky top-0 font-bold select-none text-[10.5px]">
                        <th className="p-2 border-r border-gray-200">Patient Name</th>
                        <th className="p-2 border-r border-gray-200">Order/Plan Name</th>
                        <th className="p-2 border-r border-gray-200">Order Action</th>
                        <th className="p-2 border-r border-gray-200">Details</th>
                        <th className="p-2 border-r border-gray-200">Details</th>
                        <th className="p-2 border-r border-gray-200">Order Comment</th>
                        <th className="p-2 border-r border-gray-200">Originator Name</th>
                        <th className="p-2 border-r border-gray-200">Create Date</th>
                        <th className="p-2 border-r border-gray-200">Stop Date</th>
                        <th className="p-2 border-r border-gray-200">Stop Type</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-black">
                      {mockOrdersData.map((order, idx) => (
                        <tr 
                          key={idx} 
                          className="hover:bg-blue-50/30 transition-colors border-b border-gray-100"
                        >
                          <td 
                            className="p-2 border-r border-gray-100 font-bold text-[#0d7a86] cursor-pointer hover:underline" 
                            onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${order.patientName.toUpperCase()}`, 'patient-doe')}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPatientContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                patientName: order.patientName,
                                patientMrn: '1000245678'
                              });
                            }}
                          >
                            {order.patientName}
                          </td>
                          <td className="p-2 border-r border-gray-100 text-blue-900 font-bold">{order.orderPlanName}</td>
                          <td className="p-2 border-r border-gray-100">{order.action}</td>
                          <td className="p-2 border-r border-gray-100 text-gray-600">{order.detailsDate}...</td>
                          <td className="p-2 border-r border-gray-100 text-gray-700 font-medium">{order.detailsDesc}</td>
                          <td className="p-2 border-r border-gray-100 text-gray-500">{order.comment}</td>
                          <td className="p-2 border-r border-gray-100 text-gray-600">{order.originator}</td>
                          <td className="p-2 border-r border-gray-100 font-mono text-gray-600">{order.createDate}</td>
                          <td className="p-2 border-r border-gray-100 font-mono text-gray-600">{order.stopDate}</td>
                          <td className="p-2 border-r border-gray-100">{order.stopType}</td>
                          <td className="p-2">
                            <span className="px-2 py-0.5 rounded-sm font-bold text-[9px] bg-green-50 text-green-700 border border-green-200">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
        </div>

      </div>

      {/* Footer Bar */}
      <div className="bg-[#002a46] text-white px-3 py-1 flex justify-between items-center text-[9.5px] border-t border-[#001729]">
        <span>Ready</span>
        <span>Patient: JOHN DOE ( MRN: 1000245678 )</span>
        <span>User: Axiovital Admin</span>
        <span>AXIOVITAL HEALTHCARE SYSTEM</span>
        <span>PROD</span>
        <span>05/28/2025 03:45 PM</span>
      </div>

     {/* Reschedule Modal Overlay */}
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

            {/* Tab Bar */}
            <div className="bg-[#e4e4e4] px-2 pt-1 flex gap-1 border-b border-gray-300 shrink-0 select-none">
              <button 
                onClick={() => setPsActiveTab('Person')}
                className={`px-4 py-1.5 border-t border-x rounded-t-sm font-semibold transition-all ${
                  psActiveTab === 'Person'
                    ? 'bg-[#f0f0f0] border-gray-300 border-b-[#f0f0f0] text-black'
                    : 'bg-[#d8d8d8] border-transparent border-b-gray-300 hover:bg-[#dfdfdf] text-gray-700'
                }`}
              >
                Person
              </button>
              <button 
                onClick={() => setPsActiveTab('Guarantor')}
                className={`px-4 py-1.5 border-t border-x rounded-t-sm font-semibold transition-all ${
                  psActiveTab === 'Guarantor'
                    ? 'bg-[#f0f0f0] border-gray-300 border-b-[#f0f0f0] text-black'
                    : 'bg-[#d8d8d8] border-transparent border-b-gray-300 hover:bg-[#dfdfdf] text-gray-700'
                }`}
              >
                Guarantor
              </button>
              
              <div className="flex-1" />
              
              <button 
                onClick={() => setPsShowSettings(prev => !prev)}
                className={`px-4 py-1.5 border-t border-x rounded-t-sm font-semibold transition-all flex items-center gap-1 ${
                  psShowSettings
                    ? 'bg-[#e0eaf3] border-blue-300 border-b-[#e0eaf3] text-[#0f4471] font-bold'
                    : 'bg-[#d8d8d8] border-transparent border-b-gray-300 hover:bg-[#dfdfdf] text-gray-700'
                }`}
              >
                ⚙️ Search Settings Customization
              </button>
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

      {patientContextMenu && (
        <div 
          className="fixed bg-white border border-[#a0a0a0] text-[#333333] text-[11.5px] p-0 w-[140px] shadow-md rounded-none select-none z-[99999] text-left py-1 font-sans"
          style={{ left: `${patientContextMenu.x}px`, top: `${patientContextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-800" onClick={() => { alert('Appointments clicked'); setPatientContextMenu(null); }}>
            Appointments
          </div>
          <div className="px-4 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-800" onClick={() => { alert('Registration clicked'); setPatientContextMenu(null); }}>
            Registration
          </div>
          <div className="px-4 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-800" onClick={() => { alert('Encounters clicked'); setPatientContextMenu(null); }}>
            Encounters
          </div>
          <div className="px-4 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-800" onClick={() => { alert('Patient Account clicked'); setPatientContextMenu(null); }}>
            Patient Account
          </div>
          <div className="px-4 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-800" onClick={() => { alert('Charge Entry clicked'); setPatientContextMenu(null); }}>
            Charge Entry
          </div>
          <div className="px-4 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-800" onClick={() => { alert('History clicked'); setPatientContextMenu(null); }}>
            History
          </div>

          <div className="border-t border-gray-200 my-1"></div>

          <div 
            className="px-4 py-1.5 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-[#0f4471] font-semibold" 
            onClick={() => { 
              selectOrOpenTab('PatientProfile', `Patient Profile: ${patientContextMenu.patientName.toUpperCase()}`, 'patient-doe');
              setPatientContextMenu(null); 
            }}
          >
            Keep Open
          </div>
          <div className="px-4 py-1 hover:bg-[#e8f2fe] hover:text-black cursor-pointer text-gray-600" onClick={() => setPatientContextMenu(null)}>
            Close
          </div>
        </div>
      )}

    </div>
  );
}
