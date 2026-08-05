import React from 'react';
import { Download, Printer, Share2 } from 'lucide-react';

interface LabReportDetailTabProps {
  activeTab: any;
  openedLabReports: Record<string, any>;
}

export const LabReportDetailTab: React.FC<LabReportDetailTabProps> = ({
  activeTab = { id: 'report-1', title: 'Lab Report' },
  openedLabReports = {},
}) => {
const reportData = (openedLabReports && activeTab?.id ? openedLabReports[activeTab.id] : null) || { patientName: 'JAMES, WILLIAM', orderPlanName: 'CBC with Differential' };
            const activePatient = {
              name: (() => {
                const name = reportData?.patientName || 'JAMES, WILLIAM';
                if (name && name.includes(',')) {
                  const parts = name.split(',');
                  const first = (parts[1] || '').trim();
                  const last = (parts[0] || '').trim();
                  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                  const isFemale = ['MARIA', 'LUCIA', 'ELIZABETH', 'SUSAN', 'PATRICIA', 'BETTY', 'GARCIA', 'BROWN', 'DAVIS', 'WILSON', 'JOHNSON', 'ANDERSON'].some(n => last.toUpperCase().includes(n) || first.toUpperCase().includes(n));
                  const prefix = isFemale ? 'Ms.' : 'Mr.';
                  return `${prefix} ${capitalize(first)} ${capitalize(last)}`;
                }
                return name;
              })(),
              age: ['JAMES', 'KIM', 'LEE', 'PATEL'].some(n => (reportData?.patientName || '').includes(n)) ? '27 YRS' : '39 YRS',
              sex: ['MARIA', 'LUCIA', 'ELIZABETH', 'SUSAN', 'PATRICIA', 'BETTY', 'GARCIA', 'BROWN', 'DAVIS', 'WILSON', 'JOHNSON', 'ANDERSON'].some(n => (reportData?.patientName || '').includes(n)) ? 'F' : 'M',
              referredBy: 'Self',
              regNo: '1001',
              uhid: 'UHID-98203',
            };
            return (
              <div className="flex-1 overflow-y-auto bg-gray-200 p-8 flex flex-col items-center select-text [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-gray-200 h-full">
                {/* Print/Download Toolbar */}
                <div className="w-[820px] bg-[#fafbfc] border border-[#bdcddc] px-4 py-2 flex items-center justify-between text-[#333333] text-[12px] font-medium select-none mb-4 rounded-md shadow-xs shrink-0">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-sm">{activePatient.name}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">UHID: {activePatient.uhid}</span>
                    <span className="text-gray-400">|</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => alert(`Downloading ${activePatient.name}_Report.pdf...`)}
                      className="hover:bg-gray-100 p-1.5 rounded flex items-center gap-1 text-gray-700 font-semibold"
                    >
                      <Download size={15} />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        const printContent = document.getElementById(`printable-report-area-${activeTab.id}`);
                        if (!printContent) return;
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Lab Report - ${activePatient.name}</title>
                                <style>
                                  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
                                </style>
                                <script src="https://cdn.tailwindcss.com"></script>
                              </head>
                              <body>
                                <div class="w-full max-w-[800px] mx-auto bg-white p-4">
                                  ${printContent.innerHTML}
                                </div>
                                <script>
                                  window.onload = function() { window.print(); window.close(); }
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="hover:bg-gray-100 p-1.5 rounded flex items-center gap-1 text-gray-700 font-semibold"
                    >
                      <Printer size={15} />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => alert(`Sharing link generated for ${activePatient.name}'s Report.`)}
                      className="hover:bg-gray-100 p-1.5 rounded flex items-center gap-1 text-gray-700 font-semibold"
                    >
                      <Share2 size={15} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Report Sheet */}
                <div
                  id={`printable-report-area-${activeTab.id}`}
                  className="w-[820px] min-h-[1050px] bg-white shadow-lg p-8 relative flex flex-col justify-between border border-gray-300 select-text mb-8 shrink-0"
                  style={{ boxSizing: 'border-box' }}
                >
                  <div>
                    {/* Header */}
                    <div className="bg-[#005c97] text-white p-5 rounded-t-sm relative flex justify-between items-center select-none overflow-hidden min-h-[100px]">
                      <div className="absolute top-2.5 right-4 text-[9.5px] font-mono tracking-wider font-semibold opacity-90">
                        Regd. No.: XXXX54826XX
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1.5 shadow-md">
                          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#005c97" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18h8" />
                            <path d="M3 22h18" />
                            <path d="M12 6h7" />
                            <path d="M12 2h2" />
                            <path d="M14 9h-4" />
                            <path d="M9 4h3v5c0 1.66-1.34 3-3 3s-3-1.34-3-3V4z" />
                            <path d="M17 12a5 5 0 0 1-5 5" />
                          </svg>
                        </div>
                        <div>
                          <h1 className="text-[25px] font-bold leading-none tracking-tight">
                            Labsmart Software
                          </h1>
                          <p className="text-[19px] font-light tracking-wide opacity-90 mt-1">
                            Sample Letterhead
                          </p>
                        </div>
                      </div>

                      <div className="text-[11.5px] space-y-1.5 text-right font-sans mt-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>📞</span> <span className="font-semibold">+91 12345 67890</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <span>✉️</span> <span className="font-medium">yourlabname@gmail.com</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <span>🌐</span> <span className="font-medium">https://www.yourlabname.in/</span>
                        </div>
                      </div>
                    </div>

                    {/* Patient & Reg Info */}
                    <div className="border-y-2 border-gray-400 py-3 mt-4 grid grid-cols-12 gap-2 text-[11px] font-sans text-gray-800 leading-normal">
                      <div className="col-span-5 space-y-1 font-medium">
                        <div className="flex text-[12.5px]">
                          <span className="font-bold text-black uppercase">{activePatient.name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-600">Age / Sex</span>
                          <span className="text-black">: {activePatient.age} / {activePatient.sex}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-600">Referred by</span>
                          <span className="text-black">: {activePatient.referredBy}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-600">Reg. no.</span>
                          <span className="text-black">: {activePatient.regNo}</span>
                        </div>
                      </div>

                      <div className="col-span-4 border-l border-gray-300 pl-4 space-y-1 flex flex-col justify-between">
                        <div className="flex flex-col items-center">
                          <div className="flex flex-col items-center select-none opacity-85">
                            <div className="flex items-end h-8 gap-[1px]">
                              {[2,1,3,1,2,4,1,2,1,3,1,2,3,1,1,2,2,4,1,1,3,2,1,2,1,1,2,3,1,2].map((w, i) => (
                                <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                              ))}
                            </div>
                            <span className="text-[9px] font-mono tracking-widest mt-0.5">{activePatient.regNo}</span>
                          </div>
                        </div>
                        <div className="text-[10px] space-y-0.5 text-gray-900">
                          <div><span className="text-gray-500">Registered on:</span> <span className="font-semibold">{reportData?.createDate || '28/05/2025 09:30 AM'}</span></div>
                          <div><span className="text-gray-500">Collected on:</span> <span className="font-semibold">{(reportData?.createDate || '28/05/2025 09:30 AM').split(' ')[0]}</span></div>
                          <div><span className="text-gray-500">Received on:</span> <span className="font-semibold">{(reportData?.createDate || '28/05/2025 09:30 AM').split(' ')[0]}</span></div>
                          <div><span className="text-gray-500">Reported on:</span> <span className="font-semibold">{reportData?.createDate || '28/05/2025 09:30 AM'}</span></div>
                        </div>
                      </div>

                      <div className="col-span-3 border-l border-gray-300 pl-4 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-gray-500 font-sans mb-1 uppercase tracking-wider font-bold">Scan to download</span>
                        <div className="w-16 h-16 bg-white border border-gray-300 p-1 flex items-center justify-center shadow-xs">
                          <svg width="56" height="56" viewBox="0 0 29 29" fill="black">
                            <path d="M0 0h7v7H0zm1 1v5h5V1zm8 0h3v1H9zm4 0h1v1h-1zm2 0h1v2h-1zm2 0h3v3h-3zm4 0h3v7h-7v-3h1v2h2v-5h-3v-1zm-6 2h1v1h-1zm1 1h2v1h-2zm-3 1h1v1H9zm1 1h1v2h-1zm-7 3h2v1H3zm6 0h1v1H9zm2 0h1v1h-1zm4 0h2v1h-2zm-12 1h1v2H0v-1h2zm13 0h1v1h-1zm3 0h1v2h-1zm2 0h2v2h-2zm-15 1h1v1H3zm6 0h3v1H9zm6 0h1v1h-1zm4 0h1v1h-1zm-13 1h1v1H6zm11 0h1v1h-1zm5 0h1v1h-1zm-21 1h7v7H0zm1 1v5h5V15zm8 0h1v1h-1zm2 0h2v1h-2zm3 0h1v2h-1zm4 0h1v1h-1zm1 0h2v2h-2zm-9 2h1v1H9zm1 1h1v1h-1zm5 0h2v1h-2zm-4 1h1v1h-1zm6 0h1v1h-1zm-5 1h1v1H9zm4 0h1v1h-1zm2 0h2v1h-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Test Title */}
                    <div className="text-center my-6 space-y-1 select-none">
                      <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">HAEMATOLOGY</h2>
                      <h3 className="text-[12px] font-bold text-black uppercase tracking-wide underline">
                        {reportData.orderPlanName}
                      </h3>
                    </div>

                    {/* Results Table */}
                    <div className="border-y-2 border-black overflow-hidden font-sans">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-black text-black font-bold uppercase select-none">
                            <th className="p-1.5 pl-2 w-[50%]">TEST</th>
                            <th className="p-1.5 w-[15%] text-center">VALUE</th>
                            <th className="p-1.5 pl-4 w-[15%]">UNIT</th>
                            <th className="p-1.5 pl-2 w-[20%]">REFERENCE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'HEMOGLOBIN', value: '15', unit: 'g/dl', reference: '13 - 17' },
                            { name: 'TOTAL LEUKOCYTE COUNT', value: '5,100', unit: 'cumm', reference: '4,800 - 10,800' },
                            { name: 'DIFFERENTIAL LEUCOCYTE COUNT', value: '', unit: '', reference: '', isHeader: true },
                            { name: 'NEUTROPHILS', value: '79', unit: '%', reference: '40 - 80', indent: true },
                            { name: 'LYMPHOCYTE', value: '18', unit: '%', reference: '20 - 40', flag: 'L', indent: true, boldReference: true },
                            { name: 'EOSINOPHILS', value: '1', unit: '%', reference: '1 - 6', indent: true },
                            { name: 'MONOCYTES', value: '1', unit: '%', reference: '2 - 10', flag: 'L', indent: true, boldReference: true },
                            { name: 'BASOPHILS', value: '1', unit: '%', reference: '< 2', indent: true },
                            { name: 'PLATELET COUNT', value: '3.5', unit: 'lakhs/cumm', reference: '1.5 - 4.1' },
                            { name: 'TOTAL RBC COUNT', value: '5', unit: 'million/cumm', reference: '4.5 - 5.5' },
                            { name: 'HEMATOCRIT VALUE, HCT', value: '42', unit: '%', reference: '40 - 50' },
                            { name: 'MEAN CORPUSCULAR VOLUME, MCV', value: '84.0', unit: 'fL', reference: '83 - 101' },
                            { name: 'MEAN CELL HEMOGLOBIN, MCH', value: '30.0', unit: 'Pg', reference: '27 - 32' },
                            { name: 'MEAN CELL HEMOGLOBIN CON, MCHC', value: '35.7', unit: '%', reference: '31.5 - 34.5', flag: 'H', boldReference: true },
                          ].map((r, rIdx) => {
                            if (r.isHeader) {
                              return (
                                <tr key={rIdx} className="border-b border-gray-200">
                                  <td colSpan={4} className="p-1.5 pl-2 font-bold text-black uppercase tracking-wide">
                                    {r.name}
                                  </td>
                                </tr>
                              );
                            }
                            const hasFlag = r.flag === 'L' || r.flag === 'H';
                            return (
                              <tr key={rIdx} className="border-b border-gray-150 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className={`p-1.5 text-black ${r.indent ? 'pl-6 font-medium text-gray-700' : 'pl-2 font-bold'}`}>
                                  {r.name}
                                </td>
                                <td className="p-1.5 text-center text-black font-medium">
                                  {hasFlag ? (
                                    <span className="font-bold">
                                      <span className="mr-2">{r.flag}</span>
                                      <span>{r.value}</span>
                                    </span>
                                  ) : (
                                    <span>{r.value}</span>
                                  )}
                                </td>
                                <td className="p-1.5 pl-4 text-gray-600">{r.unit}</td>
                                <td className={`p-1.5 pl-2 text-black ${r.boldReference ? 'font-bold' : ''}`}>{r.reference}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Clinical Notes */}
                    <div className="mt-6 text-[11px] font-sans text-gray-800 leading-relaxed">
                      <div className="font-bold text-black pb-1 mb-1">Clinical Notes:</div>
                      <p>
                        A complete blood count (CBC) is used to evaluate overall health and detect a wide range of disorders, including anemia, infection, and leukemia. There have been some reports of WBC and platelet counts being lower in venous blood than in capillary blood samples, although still within these reference ranges.
                      </p>

                      <div className="mt-3 border border-dotted border-gray-400 rounded-xs p-2 bg-gray-50/40">
                        <div className="font-bold text-gray-900 mb-1 select-none text-[10px]">Possible causes of abnormal parameters:</div>
                        <table className="w-full text-left text-[9.5px] border-collapse">
                          <thead>
                            <tr className="border-b border-gray-300 text-gray-700 font-bold select-none">
                              <th className="pb-1 w-[20%]">Parameter</th>
                              <th className="pb-1 w-[40%]">High</th>
                              <th className="pb-1 w-[40%]">Low</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="py-1 font-bold text-black">RBC, Hb, or HCT</td>
                              <td className="py-1 pr-2 text-gray-600">Dehydration, polycythemia, shock, chronic hypoxia</td>
                              <td className="py-1 text-gray-600">Anemia, thalassemia, and other hemoglobinopathies</td>
                            </tr>
                            <tr>
                              <td className="py-1 font-bold text-black">MCV</td>
                              <td className="py-1 pr-2 text-gray-600">Macrocytic anemia, liver disease</td>
                              <td className="py-1 text-gray-600">Microcytic anemia</td>
                            </tr>
                            <tr>
                              <td className="py-1 font-bold text-black">WBC</td>
                              <td className="py-1 pr-2 text-gray-600">Acute stress, infection, malignancies</td>
                              <td className="py-1 text-gray-600">Sepsis, marrow hypoplasia</td>
                            </tr>
                            <tr>
                              <td className="py-1 font-bold text-black">Platelets</td>
                              <td className="py-1 pr-2 text-gray-600">Risk of thrombosis</td>
                              <td className="py-1 text-gray-600">Risk of bleeding</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & Footer */}
                  <div className="mt-8 select-none">
                    <div className="flex justify-between items-end border-t border-gray-300 pt-5 px-2">
                      <div className="text-center">
                        <div className="h-8 flex items-end justify-center mb-1 text-blue-900/50 font-serif italic text-[16px]">
                          Sachin Sharma
                        </div>
                        <div className="font-bold text-[10.5px] text-black">Mr. Sachin Sharma</div>
                        <div className="text-[9.5px] text-gray-500">DMLT, Lab Incharge</div>
                      </div>

                      <div className="text-[10px] text-gray-400 font-mono">Page 1 of 2</div>

                      <div className="text-center">
                        <div className="h-8 flex items-end justify-center mb-1 text-blue-900/50 font-serif italic text-[16px]">
                          Ak Asthana
                        </div>
                        <div className="font-bold text-[10.5px] text-black">Dr. A. K. Asthana</div>
                        <div className="text-[9.5px] text-gray-500">MBBS, MD Pathologist</div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-gray-300 pt-3 text-center text-[9.5px] text-gray-500 font-sans space-y-1">
                      <div className="font-bold text-black uppercase tracking-wider">
                        NOT VALID FOR MEDICO LEGAL PURPOSE
                      </div>
                      <div>Work timings: Monday to Sunday, 8 am to 8 pm</div>
                      <div className="text-gray-400 max-w-[650px] mx-auto leading-normal">
                        Please correlate clinically. Although the test results are checked thoroughly, in case of any unexpected test results which could be due to machine error or typing error or any other reason please contact the lab immediately for a free evaluation.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
};

export default LabReportDetailTab;
