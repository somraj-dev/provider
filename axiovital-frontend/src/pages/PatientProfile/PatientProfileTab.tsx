import React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { patientDemographics } from '../_shared/constants';

interface PatientProfileTabProps {
  activeTab: any;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  profileSidebarOption: string;
  setProfileSidebarOption: (val: string) => void;
  isDetailedOrderActive: boolean;
  setIsDetailedOrderActive: (val: boolean) => void;
  isReconcileOpen: boolean;
  setIsReconcileOpen: (val: boolean) => void;
  profileTab: string;
  setProfileTab: (val: string) => void;
  selectedDocIndex: number;
  setSelectedDocIndex: (val: number) => void;
  selectOrOpenTab: (type: any, title: string, id: string) => void;
  ordersSearchQuery: string;
  setOrdersSearchQuery: (val: string) => void;
  isOrdersDropdownOpen: boolean;
  setIsOrdersDropdownOpen: (val: boolean) => void;
  setIsNewOrderModalOpen: (val: boolean) => void;
}

export const PatientProfileTab: React.FC<PatientProfileTabProps> = ({
  activeTab = { id: 'patient-doe', title: 'Patient Profile: JOHN DOE' },
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  profileSidebarOption,
  setProfileSidebarOption,
  isDetailedOrderActive,
  setIsDetailedOrderActive,
  isReconcileOpen,
  setIsReconcileOpen,
  profileTab,
  setProfileTab,
  selectedDocIndex,
  setSelectedDocIndex,
  selectOrOpenTab,
  ordersSearchQuery,
  setOrdersSearchQuery,
  isOrdersDropdownOpen,
  setIsOrdersDropdownOpen,
  setIsNewOrderModalOpen,
}) => {
  const [isCareTeamOpen, setIsCareTeamOpen] = React.useState(false);
  const [isPrintLabelsOpen, setIsPrintLabelsOpen] = React.useState(false);
  const [isProcessAlertOpen, setIsProcessAlertOpen] = React.useState(false);
  const [isViewEncounterOpen, setIsViewEncounterOpen] = React.useState(false);
  const [isBedTransferOpen, setIsBedTransferOpen] = React.useState(false);
  const [isCancelWarningOpen, setIsCancelWarningOpen] = React.useState(false);
  const [cancelWarningData, setCancelWarningData] = React.useState({ title: '', message: '' });
  const [isCancelDischargeFormOpen, setIsCancelDischargeFormOpen] = React.useState(false);
  const [isDischargeEncounterOpen, setIsDischargeEncounterOpen] = React.useState(false);
  const [isFacilityTransferOpen, setIsFacilityTransferOpen] = React.useState(false);
    const [editLastName, setEditLastName] = React.useState('Doe');
  const [editFirstName, setEditFirstName] = React.useState('John');
  const [editMiddleInitial, setEditMiddleInitial] = React.useState('A');
  const [editMrn, setEditMrn] = React.useState('1000245678');
  const [editSsn, setEditSsn] = React.useState('237-84-5988');
  const [editDob, setEditDob] = React.useState('03/12/1979');
  const [editSex, setEditSex] = React.useState('Male');
  const [editMaritalStatus, setEditMaritalStatus] = React.useState('Married');
  const [editOccupation, setEditOccupation] = React.useState('Teacher');
  const [editEthnicity, setEditEthnicity] = React.useState('Not Hispanic or Latino');
  const [editLanguage, setEditLanguage] = React.useState('English');
  const [editNationality, setEditNationality] = React.useState('American');
  const [editAddress, setEditAddress] = React.useState('7235 SW 48th St');
  const [editCity, setEditCity] = React.useState('Miami');
  const [editState, setEditState] = React.useState('FL');
  const [editZip, setEditZip] = React.useState('33155');
  const [editPhone, setEditPhone] = React.useState('(305) 666-5599');
  const [editMobile, setEditMobile] = React.useState('(305) 666-5015');
  const [editFax, setEditFax] = React.useState('(305) 666-5560');
  const [editEmail, setEditEmail] = React.useState('jenwatts@aol.net');
  const [editReferringPhysician, setEditReferringPhysician] = React.useState('Dr. W. Garland');
  const [editAttendingPhysician, setEditAttendingPhysician] = React.useState('Dr. Herman Stewart');
  const [editFirstVisit, setEditFirstVisit] = React.useState('07/15/2004');
  const displayName = activeTab?.title?.includes('Patient Profile:') 
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
                      <div 
                        onClick={() => setIsCareTeamOpen(true)}
                        className="text-[9.5px] text-[#80c0ff] hover:underline cursor-pointer"
                      >
                        Care Team: View Details
                      </div>
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
                      <div><span className="text-gray-300">LTD:</span></div>
                      <div><span className="text-gray-300">Clinic:</span> O1XTQ</div>
                    </div>
                    <div className="space-y-0.5">
                      <div><span className="text-gray-300">Sex:</span> Female</div>
                      <div><span className="text-gray-300">Code Status:</span> Active</div>
                      <div><span className="text-gray-300">Loc:</span> GLW-01</div>
                    </div>
                    <div className="space-y-0.5">
                      <div><span className="text-gray-300">MRN:</span> AVX-SL-A1H4XE</div>
                      <div><span className="text-gray-300">Nominee:</span> Mr. Ajan singh</div>
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
                                setIsProcessAlertOpen(true);
                              } else if (item === 'View Encounter') {
                                setIsViewEncounterOpen(true);
                              } else if (item === 'Update Patient Information') {
                                selectOrOpenTab?.('EditPatientProfile', 'Edit Patient Profile: ' + displayName, 'edit-patient-doe');
                              } else if (item === 'Print Labels') {
                                setIsPrintLabelsOpen(true);
                              } else if (item === 'Bed Transfer') {
                                setIsBedTransferOpen(true);
                              } else if (item === 'Discharge Encounter') {
                                setIsDischargeEncounterOpen(true);
                              } else if (item === 'Facility Transfer') {
                                setIsFacilityTransferOpen(true);
                              } else if (item === 'Cancel Discharge' || item === 'Cancel Pending Discharge') {
                                setIsCancelDischargeFormOpen(true);
                              } else if (item === 'Cancel Transfer' || item === 'Cancel Pending Transfer') {
                                setCancelWarningData({
                                  title: 'Facility Transfer',
                                  message: 'This patient currently has a pending transfer to LGH HOPE Centre/LGH HOPE Centre/LGH MIU//\nwith an estimated complete date and time of .\nWould you like to complete the pending transfer?'
                                });
                                setIsCancelWarningOpen(true);
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
};

export default PatientProfileTab;
