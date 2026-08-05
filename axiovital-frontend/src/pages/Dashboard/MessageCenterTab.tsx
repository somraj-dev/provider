import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown } from 'lucide-react';
import { patientDemographics } from '../_shared/constants';

interface MessageCenterTabProps {
  messageCenterView: 'list' | 'detail';
  setMessageCenterView: (val: 'list' | 'detail') => void;
  selectedMessage: any;
  setSelectedMessage: (val: any) => void;
  openMessagePopupCard: (row: any) => void;
  selectOrOpenTab: (type: any, title: string, id: string) => void;
  mockOrdersData: any[];
}

export const MessageCenterTab: React.FC<MessageCenterTabProps> = ({
  messageCenterView = 'list',
  setMessageCenterView = () => {},
  selectedMessage = null,
  setSelectedMessage = () => {},
  openMessagePopupCard = () => {},
  selectOrOpenTab = () => {},
  mockOrdersData = [],
}) => {
  const currentDemo = selectedMessage ? (patientDemographics[selectedMessage.patientName] || patientDemographics['JAMES, WILLIAM']) : patientDemographics['JAMES, WILLIAM'];
  return (
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
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Plan Name</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Action</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Comment</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Originator Name</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Create Date</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Date</th>
                          <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Stop Type</th>
                          <th className="p-1 px-2 border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(mockOrdersData || []).map((row, idx) => (
                          <tr
                            key={idx}
                            onClick={() => {
                              openMessagePopupCard?.(row);
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
                            <td className="p-1 px-2 border-r border-b border-[#e5edf5] whitespace-nowrap text-gray-800 text-[11px]">{row.action === 'Order' ? 'Plan' : row.action}</td>
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
                          setMessageCenterView?.('list');
                          setSelectedMessage?.(null);
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
                                setMessageCenterView?.('list');
                                setSelectedMessage?.(null);
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
                            <div className="p-0.5 hover:bg-blue-100/30 rounded-sm cursor-pointer">Items</div>
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
                          setMessageCenterView?.('list');
                          setSelectedMessage?.(null);
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
                      onClick={() => selectOrOpenTab?.('PatientProfile', `Patient Profile: ${selectedMessage?.patientName || 'JOHN DOE'}`, `patient-${selectedMessage ? (patientDemographics[selectedMessage.patientName]?.mrn || '1000245678') : '1000245678'}`)}
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
                          <span className="font-semibold">{selectedMessage?.action === 'Referral' ? 'Apollo' : 'System'}</span>
                          <span className="text-gray-500 font-semibold">To:</span>
                          <span>Axiovital Admin</span>
                          <span className="text-gray-500 font-semibold">Subject:</span>
                          <span className="font-semibold text-[#0f719b]">
                            {selectedMessage 
                              ? (selectedMessage.action === 'Referral'
                                ? `Patient Referral - ${selectedMessage.orderPlanName}`
                                : `Clinical Note Ready for Review - ${selectedMessage.orderPlanName}`)
                              : 'Clinical Note Ready for Review'}
                          </span>
                          <span className="text-gray-500 font-semibold">Date/Time:</span>
                          <span>{selectedMessage ? `${selectedMessage.createDate} PM` : '05/28/2025 03:42 PM'}</span>
                        </div>
                      </div>
                      <div className="space-y-3 leading-relaxed text-gray-800">
                        <div className="font-semibold border-b border-gray-100 pb-1">Message Content</div>
                        {selectedMessage?.action === 'Referral' ? (
                          <>
                            <p>
                              <strong>Apollo Hospital</strong> has initiated a patient referral for <strong>{selectedMessage.patientName}</strong> (MRN:{' '}
                              {patientDemographics[selectedMessage.patientName]?.mrn || '1000245678'}).
                            </p>
                            <p>
                              <strong>Referral Destination:</strong> {selectedMessage.orderPlanName.replace('Referral to ', '')}
                            </p>
                            <p>
                              <strong>Reason for Referral:</strong> {selectedMessage.detailsDesc}
                            </p>
                            <p>
                              Please review and accept this referral at your earliest convenience. The patient records and clinical history have been shared securely via the AxioVital interoperability platform.
                            </p>
                            <div className="py-2">
                              <button className="text-[#0f719b] font-semibold underline hover:text-[#0b5475]">View Referral Details</button>
                            </div>
                            <p className="text-gray-500 text-[10.5px]">Thank you,<br />Apollo Hospital — Referral Coordination Team</p>
                          </>
                        ) : (
                          <>
                            <p>
                              The clinical note for patient {selectedMessage?.patientName || 'JOHN DOE'} (MRN:{' '}
                              {selectedMessage ? (patientDemographics[selectedMessage.patientName]?.mrn || '1000245678') : '1000245678'}) is ready to review and sign in AxioNote.
                            </p>
                            <p>Please click the link below or use the Clinical menu &gt; AxioNote - Edge Platform from the top toolbar to launch the platform.</p>
                            <div className="py-2">
                              <button className="text-[#0f719b] font-semibold underline hover:text-[#0b5475]">Launch AxioNote - Edge Platform</button>
                            </div>
                            <p className="text-gray-500 text-[10.5px]">Thank you,<br />AxioVital Clinical System</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
  );
};

export default MessageCenterTab;
