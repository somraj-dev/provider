import React from 'react';

interface NotificationsTabProps {
  notifType: string;
  setNotifType: (val: string) => void;
  notifPriority: string;
  setNotifPriority: (val: string) => void;
  notifStatus: string;
  setNotifStatus: (val: string) => void;
  notifFromDate: string;
  setNotifFromDate: (val: string) => void;
  notifToDate: string;
  setNotifToDate: (val: string) => void;
  notifSearch: string;
  setNotifSearch: (val: string) => void;
  openMessagePopupCard?: (row: any) => void;
  selectOrOpenTab?: (type: any, title: string, id: string) => void;
}

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

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifType,
  setNotifType,
  notifPriority,
  setNotifPriority,
  notifStatus,
  setNotifStatus,
  notifFromDate,
  setNotifFromDate,
  notifToDate,
  setNotifToDate,
  notifSearch,
  setNotifSearch,
  openMessagePopupCard,
  selectOrOpenTab,
}) => {
  return (
<div className="flex flex-1 flex-col overflow-auto p-4 space-y-4 bg-[#f8f9fa] text-[11px]">

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
                      {(notificationRows || []).map((row, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => openMessagePopupCard?.(row)}
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
                              selectOrOpenTab?.('PatientProfile', `Patient Profile: ${row.patient.toUpperCase()}`, `patient-${row.mrn}`);
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
  );
};

export default NotificationsTab;
