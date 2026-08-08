import React from 'react';
import { patientDirectoryData } from '../_shared/constants';

interface PatientListTabProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  apiPatients: any[];
  selectOrOpenTab: (type: any, title: string, id: string) => void;
}

export const PatientListTab: React.FC<PatientListTabProps> = ({
  searchQuery,
  setSearchQuery,
  apiPatients,
  selectOrOpenTab,
}) => {
  const [selectedPatientMrns, setSelectedPatientMrns] = React.useState<string[]>([]);
  const [patientContextMenu, setPatientContextMenu] = React.useState<any>(null);
  return (
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
                       {patientDirectoryData.filter((row: any) => {
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
                       }).map((row: any, index: number) => (
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
                              selectOrOpenTab?.('PatientProfile', `Patient Profile: ${row.name.toUpperCase()}`, 'patient-doe');
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
  );
};

export default PatientListTab;
