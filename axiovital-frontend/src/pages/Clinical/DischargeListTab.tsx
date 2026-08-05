import React from 'react';

interface DischargeListTabProps {
  selectOrOpenTab: (type: any, title: string, id: string) => void;
}

export const DischargeListTab: React.FC<DischargeListTabProps> = ({ selectOrOpenTab }) => {
  const [patientContextMenu, setPatientContextMenu] = React.useState<any>(null);
  return (
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
  );
};

export default DischargeListTab;
