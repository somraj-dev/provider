import React from 'react';

interface RescheduleRequestsTabProps {
  dbRescheduleRequests: any[];
  handleOpenRescheduleModal: (req: any) => void;
  selectOrOpenTab?: (type: any, title: string, id: string) => void;
}

export const RescheduleRequestsTab: React.FC<RescheduleRequestsTabProps> = ({
  dbRescheduleRequests = [],
  handleOpenRescheduleModal,
  selectOrOpenTab,
}) => {
  const [patientContextMenu, setPatientContextMenu] = React.useState<any>(null);
  const [rescheduleRequests, setRescheduleRequests] = React.useState([
    { id: 'REQ-2025-001245', name: 'Rahul Patel', mrn: '1000245679', current: '28/05/2025, 10:30 AM', dept: 'Dr. P. Singh (Neurology)', requested: '30/05/2025, 11:00 AM', reason: 'Reschedule: Patient Request', requestedOn: '28/05/2025, 09:15 AM by Rahul Patel (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001246', name: 'Maria Johnson', mrn: '1000245680', current: '28/05/2025, 11:00 AM', dept: 'Dr. S. Reddy (Cardiology)', requested: '31/05/2025, 09:30 AM', reason: 'Reschedule: Work Conflict', requestedOn: '28/05/2025, 09:20 AM by Maria Johnson (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001247', name: 'David Lee', mrn: '1000245681', current: '28/05/2025, 03:00 PM', dept: 'Dr. K. Iyer (Pulmonology)', requested: '29/05/2025, 04:00 PM', reason: 'Reschedule: Personal Emergency', requestedOn: '28/05/2025, 09:35 AM by David Lee (Patient)', priority: 'High', status: 'Reviewing', priorityColor: 'bg-red-50 text-red-800 border-red-200', statusColor: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'REQ-2025-001248', name: 'Lucia Garcia', mrn: '1000245682', current: '29/05/2025, 09:00 AM', dept: 'Dr. M. Desai (Oncology)', requested: '29/05/2025, 01:00 PM', reason: 'Reschedule: Travel', requestedOn: '28/05/2025, 10:05 AM by Lucia Garcia (Patient)', priority: 'Normal', status: 'Approved', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'REQ-2025-001249', name: 'Michael Thomas', mrn: '1000245683', current: '29/05/2025, 11:30 AM', dept: 'Dr. N. Verma (Dermatology)', requested: '30/05/2025, 10:00 AM', reason: 'Reschedule: Schedule Conflict', requestedOn: '28/05/2025, 10:12 AM by Michael Thomas (Patient)', priority: 'Normal', status: 'Declined', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'REQ-2025-001250', name: 'James Kim', mrn: '1000245684', current: '30/05/2025, 02:00 PM', dept: 'Dr. P. Nair (Diabetology)', requested: '02/06/2025, 11:00 AM', reason: 'Reschedule: Not Available', requestedOn: '28/05/2025, 10:25 AM by James Kim (Patient)', priority: 'Low', status: 'Pending', priorityColor: 'bg-green-50 text-green-800 border-green-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001251', name: 'Elizabeth Brown', mrn: '1000245685', current: '30/05/2025, 04:00 PM', dept: 'Dr. R. Menon (Nephrology)', requested: '31/05/2025, 04:30 PM', reason: 'Reschedule: Family Function', requestedOn: '28/05/2025, 10:45 AM by Elizabeth Brown (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'REQ-2025-001252', name: 'Charles White', mrn: '1000245686', current: '31/05/2025, 10:00 AM', dept: 'Dr. S. Malhotra (ENT)', requested: '02/06/2025, 09:00 AM', reason: 'Reschedule: Patient Request', requestedOn: '28/05/2025, 11:00 AM by Charles White (Patient)', priority: 'Normal', status: 'Pending', priorityColor: 'bg-blue-50 text-blue-800 border-blue-200', statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
  ]);
  return (
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
                      {(dbRescheduleRequests.length > 0 ? (dbRescheduleRequests || []).map((req: any) => ({
                        id: req.id,
                        appointmentId: req.appointmentId,
                        doctorId: req.appointment?.doctorId,
                        name: `${req.patient.firstName} ${req.patient.lastName}`,
                        mrn: req.patient.mrn,
                        current: req.appointment ? `${new Date(req.appointment.startTime).toLocaleDateString('en-GB')}, ${new Date(req.appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A',
                        dept: req.appointment?.doctor ? `Dr. ${req.appointment.doctor.user.lastName} (${req.appointment.department?.name || 'General'})` : 'Cardiology',
                        requested: req.requestedNewStart ? `${new Date(req.requestedNewStart).toLocaleDateString('en-GB')}, ${new Date(req.requestedNewStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '30/05/2025, 11:00 AM',
                        reason: req.reason || 'Reschedule Request',
                        requestedOn: `${new Date(req.createdAt).toLocaleDateString('en-GB')}, ${new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${req.patient.firstName} ${req.patient.lastName}`,
                        priority: req.priority || 'Normal',
                        status: req.status,
                        priorityColor: req.priority === 'HIGH' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200',
                        statusColor: req.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' : (req.status === 'DECLINED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'),
                      })) : rescheduleRequests).map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-[#d0dbe5] text-[10.5px] text-gray-800 font-sans cursor-pointer transition-colors ${
                            idx % 2 === 0 ? 'bg-white hover:bg-[#eef4f9]' : 'bg-[#f0f5fa] hover:bg-[#eef4f9]'
                          }`}
                          onClick={() => handleOpenRescheduleModal?.(row)}
                        >
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-mono">{row.mrn}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5] font-bold text-gray-700">{row.id}</td>
                          <td className="py-1 px-2 border-r border-[#d0dbe5]" onClick={(e) => e.stopPropagation()}>
                            <span 
                              className="font-bold text-[#0d7a86] cursor-pointer hover:underline" 
                              onClick={() => selectOrOpenTab?.('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe')}
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
  );
};

export default RescheduleRequestsTab;
