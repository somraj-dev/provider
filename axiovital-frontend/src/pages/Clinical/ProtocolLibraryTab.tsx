import React from 'react';

export const ProtocolLibraryTab: React.FC = () => {
  const [protocolLibraryListSelection, setProtocolLibraryListSelection] = React.useState('Holding in Recovery Room');
  return (
<div className="flex-1 flex flex-col h-full bg-[#f4f4f4] text-black overflow-hidden select-none font-sans" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }}>
              
              {/* Mini Toolbar */}
              <div className="h-[30px] bg-white border-b border-[#bdcddc] flex items-center justify-between px-2 shrink-0 select-none">
                {/* Left controls */}
                <div className="flex items-center gap-2 text-[11px]">
                  {/* Patient List label and dropdown selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-700">Patient List:</span>
                    <select 
                      value={protocolLibraryListSelection}
                      onChange={(e) => setProtocolLibraryListSelection(e.target.value)}
                      className="border border-[#7f9db9] bg-white text-[11px] px-1.5 py-0.5 h-[20px] rounded-[1px] focus:outline-none min-w-[200px]"
                    >
                      <option value="Holding in Recovery Room">Holding in Recovery Room</option>
                      <option value="Emergency Department">Emergency Department</option>
                      <option value="ICU Ward">ICU Ward</option>
                      <option value="Surgery Suite A">Surgery Suite A</option>
                    </select>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 text-[11px]">
                  <button className="text-blue-700 hover:underline font-semibold flex items-center gap-1">
                    Physician Contact | 👤
                  </button>
                  <button className="text-gray-700 hover:text-black" title="Print List">
                    🖨️
                  </button>
                </div>
              </div>

              {/* Patient List Table */}
              <div className="flex-1 overflow-auto bg-white">
                <table className="w-full border-collapse table-fixed text-[11px] font-sans">
                  <thead>
                    <tr className="bg-gradient-to-b from-[#fbfbfb] to-[#ecebeb] border-b border-[#bdcddc] select-none text-gray-700 text-left">
                      <th className="border-r border-[#cbdcf0] p-1.5 w-[160px] font-normal cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center justify-between">
                          <span>Location</span>
                        </div>
                      </th>
                      <th className="border-r border-[#cbdcf0] p-1.5 font-normal cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center justify-between">
                          <span>Patient</span>
                        </div>
                      </th>
                      <th className="border-r border-[#cbdcf0] p-1.5 w-[200px] font-normal cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center justify-between">
                          <span>Physician Contact</span>
                        </div>
                      </th>
                      <th className="p-1.5 w-[220px] font-normal cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center justify-between">
                          <span>Diagnosis</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { loc: 'HPAR OLL 940 01', patient: 'CERNER, DTTESTONE', age: '62 Years Male', fin: 'FIN NBR: 991...', doctor: 'Gupta_Test , Hemant', diag: 'Pneumonia', hasAdd: false },
                      { loc: 'HPAR OLL 940 02', patient: 'CERNER, ESMHCTONE', age: '50 Years FEMALE', fin: 'FIN NBR:...', doctor: 'Gupta_Test , Hemant', diag: 'Add', hasAdd: true },
                      { loc: 'HPAR OLL 940 03', patient: 'CERNER, HEMTRNFOUR', age: '14 Years FEMALE', fin: 'FIN NBR:...', doctor: 'TEST , ABSP2', diag: 'Add', hasAdd: true },
                      { loc: 'HPAR OLL 940 04', patient: 'CERNER, FEMALETWOMON', age: '4 Years FEMALE', fin: 'FIN...', doctor: 'TEST , ABSP2', diag: 'Add', hasAdd: true },
                      { loc: 'HPAR OLL 940 05', patient: 'CERNER, MALEFOURYEAR', age: '8 Years Male', fin: 'FIN NBR:...', doctor: 'Assign', diag: 'Add', hasAdd: true, isDoctorLink: true },
                      { loc: 'HPAR OLL 940 06', patient: 'CERNER, MOB', age: '51 Years Male', fin: 'FIN NBR: 9914544714', doctor: 'Gupta_Test , Hemant', diag: 'Add', hasAdd: true },
                      { loc: 'HPAR OLL 940 08', patient: 'Name,;', age: '34 Years Male', fin: 'FIN NBR: PHARMACYONLY2', doctor: 'Gupta_Test , Hemant', diag: 'Add', hasAdd: true },
                      { loc: 'HPAR OLL 940', patient: 'CERNER, PREADMITMB', age: '51 Years Male', fin: 'FIN NBR: 90...', doctor: 'Hardi, Umar M, MD', diag: 'Aspiration pneumonia...', hasAdd: false },
                      { loc: 'HPAR OLL 940', patient: 'cerner, motestnew', age: '32 Years Male', fin: 'FIN NBR: 9000682...', doctor: 'Comeno_Test , Catherine', diag: 'Add', hasAdd: true }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#edf3f8] border-b border-[#e1e9f1] h-[34px] group">
                        {/* Location */}
                        <td className="p-2 text-gray-800 font-sans border-r border-[#e1e9f1] truncate">
                          {row.loc}
                        </td>
                        
                        {/* Patient Name + Demographics */}
                        <td className="p-2 border-r border-[#e1e9f1] font-sans">
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2 truncate">
                              <span className="font-bold text-[#003366] text-[11.5px] cursor-pointer hover:underline">
                                {row.patient}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {row.age}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {row.fin}
                              </span>
                            </div>
                            <span className="text-gray-300 group-hover:text-gray-500 text-[10px] px-1 select-none">▶</span>
                          </div>
                        </td>

                        {/* Physician Contact */}
                        <td className="p-2 border-r border-[#e1e9f1] font-sans text-gray-800 truncate">
                          {row.isDoctorLink ? (
                            <button className="text-blue-600 hover:underline bg-transparent border-none text-[11px] font-sans text-left">
                              {row.doctor}
                            </button>
                          ) : (
                            row.doctor
                          )}
                        </td>

                        {/* Diagnosis */}
                        <td className="p-2 font-sans truncate">
                          {row.hasAdd ? (
                            <button className="text-blue-600 hover:underline bg-transparent border-none text-[11px] font-sans text-left">
                              Add
                            </button>
                          ) : (
                            <span className="text-gray-800">{row.diag}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
  );
};

export default ProtocolLibraryTab;
