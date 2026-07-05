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
  type: 'MessageCenter' | 'Analytics' | 'PatientList' | 'Notifications' | 'PatientProfile' | 'EditPatientProfile' | 'MedicalReport';
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chrome browser style tabs state
  const [openTabs, setOpenTabs] = useState<TabItem[]>([
    { id: 'patient-doe', title: 'Patient Profile: JOHN DOE', type: 'PatientProfile' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('patient-doe');

  // Sidebar navigation paths for Analytics
  const [analyticsMenu, setAnalyticsMenu] = useState('Overview');

  // Patient Directory Search State
  const [pdSearchBy, setPdSearchBy] = useState('Name');
  const [pdSearchText, setPdSearchText] = useState('');
  const [pdMrn, setPdMrn] = useState('');
  const [pdUhid, setPdUhid] = useState('');
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

  const selectOrOpenTab = (type: 'MessageCenter' | 'Analytics' | 'PatientList' | 'Notifications' | 'PatientProfile' | 'EditPatientProfile' | 'MedicalReport', title: string, id: string) => {
    const exists = openTabs.find(t => t.id === id);
    if (!exists) {
      setOpenTabs([...openTabs, { id, title, type }]);
    }
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
    { mrn: '1000245678', uhid: 'AVX-000123', name: 'James, William', ageGender: '45 Y / Male', dob: '12/03/1979', phone: '9876543210', visit: 'Inpatient', dept: 'Cardiology', physician: 'Dr. R. Sharma', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: 'ICU-01 / Bed 02', admitted: '28/05/2025 08:30 AM' },
    { mrn: '1000245679', uhid: 'AVX-000124', name: 'Patel, Rahul', ageGender: '38 Y / Male', dob: '22/07/1986', phone: '9876543211', visit: 'Inpatient', dept: 'Neurology', physician: 'Dr. P. Singh', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: 'NEU-02 / Bed 05', admitted: '28/05/2025 09:15 AM' },
    { mrn: '1000245680', uhid: 'AVX-000125', name: 'Johnson, Maria', ageGender: '29 Y / Female', dob: '14/11/1995', phone: '9876543212', visit: 'Outpatient', dept: 'General Medicine', physician: 'Dr. K. Iyer', status: 'Registered', statusBg: 'bg-blue-100 text-blue-800', location: '—', admitted: '28/05/2025 10:20 AM' },
    { mrn: '1000245681', uhid: 'AVX-000126', name: 'Lee, David', ageGender: '52 Y / Male', dob: '30/09/1972', phone: '9876543213', visit: 'Inpatient', dept: 'Pulmonology', physician: 'Dr. S. Reddy', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: 'PUL-01 / Bed 01', admitted: '28/05/2025 06:10 AM' },
    { mrn: '1000245682', uhid: 'AVX-000127', name: 'Garcia, Lucia', ageGender: '41 Y / Female', dob: '19/02/1984', phone: '9876543214', visit: 'Day Care', dept: 'Oncology', physician: 'Dr. M. Desai', status: 'In Treatment', statusBg: 'bg-orange-100 text-orange-800', location: 'DAY-CARE 02', admitted: '28/05/2025 11:00 AM' },
    { mrn: '1000245683', uhid: 'AVX-000128', name: 'Thomas, Michael', ageGender: '33 Y / Male', dob: '07/06/1991', phone: '9876543215', visit: 'Outpatient', dept: 'Dermatology', physician: 'Dr. N. Verma', status: 'Completed', statusBg: 'bg-gray-100 text-gray-800', location: '—', admitted: '28/05/2025 11:30 AM' },
    { mrn: '1000245684', uhid: 'AVX-000129', name: 'Kim, James', ageGender: '27 Y / Male', dob: '23/08/1997', phone: '9876543216', visit: 'Inpatient', dept: 'Diabetology', physician: 'Dr. P. Nair', status: 'Admitted', statusBg: 'bg-green-100 text-green-800', location: 'DIAB-01 / Bed 03', admitted: '27/05/2025 09:50 PM' },
    { mrn: '1000245685', uhid: 'AVX-000130', name: 'Brown, Elizabeth', ageGender: '48 Y / Female', dob: '02/04/1977', phone: '9876543217', visit: 'Inpatient', dept: 'Nephrology', physician: 'Dr. R. Menon', status: 'ICU', statusBg: 'bg-red-100 text-red-800', location: 'ICU-02 / Bed 01', admitted: '27/05/2025 05:25 PM' },
    { mrn: '1000245686', uhid: 'AVX-000131', name: 'White, Charles', ageGender: '55 Y / Male', dob: '16/05/1970', phone: '9876543218', visit: 'Inpatient', dept: 'ENT', physician: 'Dr. S. Malhotra', status: 'Scheduled', statusBg: 'bg-yellow-100 text-yellow-800', location: '—', admitted: '29/05/2025 09:00 AM' },
    { mrn: '1000245687', uhid: 'AVX-000132', name: 'Davis, Patricia', ageGender: '36 Y / Female', dob: '11/12/1988', phone: '9876543219', visit: 'Outpatient', dept: 'Ophthalmology', physician: 'Dr. V. Bhatia', status: 'Registered', statusBg: 'bg-blue-100 text-blue-800', location: '—', admitted: '26/05/2025 04:20 PM' }
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

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] text-[#1c2833] text-[11px] font-sans overflow-hidden select-none">
      
      {/* Title Bar */}
      <div className="bg-[#002a46] text-white px-3 py-1.5 flex justify-between items-center border-b border-[#001729]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-wide">AxioVital Operating Environment</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span>Axiovital Admin</span>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0d7a86] text-white font-bold text-[9px] hover:bg-[#085f68]"
          >
            AV
          </button>
        </div>
      </div>

      {/* Classic Menu Bar */}
      <div className="bg-[#f0f4f8] border-b border-[#bdcddc] px-3 py-0.5 flex gap-3 text-[#2c3e50] text-[10.5px] items-center relative z-50">
        {['Terminal', 'Session', 'View', 'Patient'].map((item) => (
          <button key={item} className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors">
            {item}
          </button>
        ))}

        {/* Simple clinical menu trigger */}
        <div className="relative group">
          <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors font-semibold text-[#002a46]">
            Clinical
          </button>
          <div className="absolute left-0 mt-0 hidden group-hover:block bg-white border border-[#b0b0b0] text-[#333333] text-[12px] p-0 w-[180px] shadow-md rounded-none select-none overflow-y-auto max-h-[85vh] scrollbar-none z-50">
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

        <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors">Tools</button>
        
        {/* Top Notifications Trigger */}
        <button 
          onClick={() => selectOrOpenTab('Notifications', 'Notifications', 'notifications-tab')}
          className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors"
        >
          Notifications
        </button>

        <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors">Admin</button>
        <button className="hover:bg-[#dbe6ef] px-1.5 py-0.5 rounded-sm transition-colors">Help</button>
      </div>

      {/* Classic Toolbar Buttons (Ribbon 1) */}
      <div className="bg-white border-b border-[#bdcddc] px-2 py-1 flex items-center gap-1.5 flex-wrap">
        <button 
          onClick={() => selectOrOpenTab('MessageCenter', 'General Messages: JOHN DOE', 'msg-doe')}
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold"
        >
          💬 Message Center
        </button>
        <button 
          onClick={() => selectOrOpenTab('PatientList', 'Patient List', 'patient-list-tab')}
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm font-semibold text-[#0d7a86]"
        >
          👥 Patient List
        </button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">🔄 Physician Handoff</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">📋 Care Workflow</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">📈 Quality Measures</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">🛡️ MyExperience</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">📄 Reports</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">💡 UpToDate</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">🎗️ AxioCard</button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-sm">📚 Protocol Library</button>
      </div>

      {/* Navigation Shortcut Row (Ribbon 2) */}
      <div className="bg-[#eef2f5] border-b border-[#bdcddc] px-3 py-1 flex gap-3 text-[#4f5f6f] items-center text-[10.5px]">
        <button className="flex items-center gap-1 hover:text-black">📊 Dashboard</button>
        <button className="flex items-center gap-1 hover:text-black">📅 Scheduler</button>
        <button className="flex items-center gap-1 hover:text-black">💡 Clinical Decision Support</button>
        <button className="flex items-center gap-1 hover:text-black">🗂️ Order Sets</button>
        <button className="flex items-center gap-1 hover:text-black">🧬 Care Pathways</button>
        <button className="flex items-center gap-1 hover:text-black">🧪 Labs</button>
        <button className="flex items-center gap-1 hover:text-black">👁️ Imaging</button>
        <button className="flex items-center gap-1 hover:text-black">💊 Pharmacy</button>
        <button 
          onClick={() => selectOrOpenTab('Analytics', 'Analytics Overview', 'analytics-overview')}
          className="flex items-center gap-1 hover:text-black font-semibold"
        >
          📈 Analytics
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
          
          {/* Printer Icon downloads Medical Report locally */}
          <button 
            onClick={() => {
              const content = `MEDICAL REPORT\n\n` +
                `Name: ${editFirstName} ${editMiddleInitial} ${editLastName}\n` +
                `Date: 05/28/2025\n` +
                `When did problem start?: 11/25/2004\n` +
                `Describe Problem: Nasal polyps, Allergic rhinitis, Acute sinusitis\n` +
                `Cause: Gradual onset\n` +
                `Require Surgery: No\n\n` +
                `PAST MEDICAL HISTORY:\n` +
                `- Breathing Problems: Yes\n` +
                `- Stroke: No\n` +
                `- Depression: No\n` +
                `- Heart Problems: No\n` +
                `- Diabetes: No\n\n` +
                `ALLERGIES:\n` +
                `- Latex: No\n` +
                `- Iodine: Yes\n` +
                `- Bromine: No\n` +
                `- Other: Penicillin\n\n` +
                `Religious/Cultural Views: No\n` +
                `Additional Comments: None\n`;
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Medical_Report_${editLastName}_${editFirstName}.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
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
        <div className="bg-[#cbd8e3] border-b border-[#bdcddc] flex items-end px-2 pt-1.5 gap-1 select-none">
          {openTabs.map((t) => {
            const isActive = t.id === activeTabId;
            return (
              <div
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                className={`group relative flex items-center h-7 px-3 text-[10.5px] cursor-pointer rounded-t-md border-t border-x transition-all duration-150 ${
                  isActive 
                    ? 'bg-white border-[#bdcddc] font-bold text-gray-800 z-10' 
                    : 'bg-[#b6c7d6] hover:bg-[#c2d1dd] border-transparent text-gray-600'
                }`}
                style={{ width: '220px' }}
              >
                <span className="truncate pr-4 flex-1">
                  {t.type === 'MessageCenter' && '📬 '}
                  {t.type === 'Analytics' && '📈 '}
                  {t.type === 'PatientList' && '👥 '}
                  {t.type === 'Notifications' && '🔔 '}
                  {t.type === 'PatientProfile' && '👤 '}
                  {t.type === 'EditPatientProfile' && '✏️ '}
                  {t.type === 'MedicalReport' && '📄 '}
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

                <ScrollArea className="flex-1 text-gray-700">
                  <div className="p-1 space-y-2">
                    <div>
                      <div className="font-bold p-1 bg-[#cbd8e3]/40 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer">
                        <span>🗂️ Dashboards</span>
                        <span>▼</span>
                      </div>
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
                    </div>

                    <div>
                      <div className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer">
                        <span>🗂️ Clinical Analytics</span>
                        <span>▲</span>
                      </div>
                      <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Quality Measures</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Chronic Conditions</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Utilization</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Patient Outcomes</button>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer">
                        <span>🗂️ Operational Analytics</span>
                        <span>▲</span>
                      </div>
                      <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Provider Productivity</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Scheduling</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Care Workflow</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Resource Utilization</button>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer">
                        <span>🗂️ Financial Analytics</span>
                        <span>▲</span>
                      </div>
                      <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Payer Mix</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Revenue Cycle</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Cost Analysis</button>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer">
                        <span>🗂️ Custom Reports</span>
                        <span>▲</span>
                      </div>
                      <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Saved Reports</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Report Builder</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Scheduled Reports</button>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer">
                        <span>🗂️ Data Management</span>
                        <span>▲</span>
                      </div>
                      <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Data Extracts</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Data Quality</button>
                        <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Definitions</button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
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
                    onChange={(e) => setPdSearchText(e.target.value)}
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
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="p-2.5 border-r border-gray-200">{row.mrn}</td>
                          <td className="p-2.5 border-r border-gray-200 font-medium text-gray-500">{row.uhid}</td>
                          <td className="p-2.5 border-r border-gray-200 font-bold text-[#0d7a86] cursor-pointer hover:underline" onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe')}>{row.name}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.ageGender}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dob}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.phone}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.visit}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.dept}</td>
                          <td className="p-2.5 border-r border-gray-200">{row.physician}</td>
                          <td className="p-2.5 border-r border-gray-200">
                            <span className={`px-2 py-0.5 rounded-sm font-semibold text-[9px] ${row.statusBg}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-gray-200">{row.location}</td>
                          <td className="p-2.5 border-r border-gray-200 text-gray-500">{row.admitted}</td>
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
                          <td className="p-2.5 border-r border-gray-200 font-bold text-[#0d7a86] cursor-pointer hover:underline" onClick={() => selectOrOpenTab('PatientProfile', `Patient Profile: ${row.patient.toUpperCase()}`, 'patient-doe')}>{row.name}</td>
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
                        <div><span className="text-gray-400 font-semibold inline-block w-[50px]">MRN:</span> 1000245678</div>
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
                  {['Demographics', 'Insurance', 'Contacts', 'Clinical', 'Allergies', 'Medications', 'Documents', 'Visit History', 'Notes'].map((t) => (
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
                        
                        <span className="text-gray-500 font-medium">Medical Record Number (MRN)</span>
                        <span className="font-bold text-gray-900">{editMrn}</span>

                        <span className="text-gray-500 font-medium">Nationality</span>
                        <span className="font-semibold text-gray-900">{editNationality}</span>
                        
                        <span className="text-gray-500 font-medium">Social Security Number</span>
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
                  <div className="p-2 text-gray-800 h-[100px] overflow-y-auto text-[9.5px] leading-relaxed">
                    11/25/2004: Allergic rhinitis | Nasal polyps | Acute sinusitis.
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
                        <label className="text-gray-500 font-bold">Medical Record Number (MRN) *</label>
                        <input 
                          type="text" 
                          value={editMrn} 
                          onChange={(e) => setEditMrn(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Social Security Number</label>
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
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
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
                  <span className="border-b border-gray-400 font-bold px-1 text-[13px]">{editFirstName} {editMiddleInitial} {editLastName}</span>
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

    </div>
  );
}
