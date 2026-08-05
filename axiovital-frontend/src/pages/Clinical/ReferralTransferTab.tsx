import React from 'react';

interface ReferralTransferTabProps {
  selectOrOpenTab: (type: any, title: string, id: string) => void;
}

export const ReferralTransferTab: React.FC<ReferralTransferTabProps> = ({ selectOrOpenTab }) => {
  const [patientContextMenu, setPatientContextMenu] = React.useState<any>(null);
  return (
<div className="flex-1 flex flex-col bg-[#f0f3f6] text-[10.5px] font-sans select-none overflow-hidden h-full">
              {/* Top Cerner Toolbar */}
              <div className="bg-[#f4f7fa] border-b border-[#bccada] px-2 py-1 flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-1.5 text-[13px] text-[#2c5282]">
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded flex items-center gap-1 text-[11px] font-semibold text-[#1c4d78] transition-colors" title="Add Patient / Referral">
                    <span>👤+</span>
                  </button>
                  <span className="text-gray-300">|</span>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Remove">🗑️</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Properties">📋</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Transfer / Move">⏭️</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Search List">🔍</button>
                  <span className="text-gray-300">|</span>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Schedule">🗓️</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Clinical Notes">📝</button>
                  <button className="p-1 hover:bg-[#d9ecff] hover:border hover:border-[#90cdf4] rounded text-[12px] transition-colors" title="Print List">🖨️</button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                  <span className="font-semibold">View Mode:</span>
                  <select className="bg-white border border-[#bccada] rounded px-1.5 py-0.5 text-[#1c4d78] font-bold focus:outline-none">
                    <option>All Active Referrals & Transfers</option>
                    <option>Inbound Transfers Only</option>
                    <option>Outbound Referrals Only</option>
                  </select>
                </div>
              </div>

              {/* Sub-Header Filter Description Bar */}
              <div className="bg-white px-3 py-1 border-b border-[#bccada] text-[10px] text-gray-600 shrink-0 truncate font-sans italic">
                Admitting Physician, Attending Physician, Consulting Physician - Emergency, Inpatient, Observation, Referral & Transfer Requests...
              </div>

              {/* Scrollable Cerner Grid Container */}
              <div className="flex-1 m-2 bg-white border border-[#a8b8c8] overflow-auto shadow-inner select-text">
                <table className="w-full text-left border-collapse text-[10.5px] font-sans">
                  <thead>
                    <tr className="bg-[#e6ecf2] border-b border-[#a8b8c8] text-[#1c4d78] font-bold sticky top-0 z-10 select-none whitespace-nowrap shadow-xs">
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Location</th>
                      <th className="py-1.5 px-1 border-r border-[#bccada] text-center w-[26px]">📁</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Name</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Length of Stay</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">MRN</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">FIN / Req ID</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Age</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">DOB</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Admitted / Requested</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Admitting / Referring Physician</th>
                      <th className="py-1.5 px-2 border-r border-[#bccada]">Visit Reason / Transfer Type</th>
                      <th className="py-1.5 px-2 text-[#1c4d78]">Primary Care Physician / Target Dept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { loc: '2C CVH 2304 0', icon: '📁', name: 'TEST, NEWMERGE ONE', los: '46.7 Days', mrn: '64802090', fin: '1200209389', age: '56 years', dob: '01/01/61', adm: '05/29/17 20:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'TESTING MERGE ACCOUNTS', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2E Card Interm 2416 0', icon: '📄', name: 'PHARMDRC, EIGHTMONTH', los: '43.0 Days', mrn: '64802042', fin: '1200209310', age: '9 months', dob: '09/22/16', adm: '05/22/17 17:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pain', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2E Card Interm 2420 0', icon: '📁', name: 'UCTEST, CPABBLINGCOMB', los: '120.0 Days', mrn: '64801201', fin: '1200208114', age: '8 years', dob: '03/14/09', adm: '03/06/17 15:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'headache', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2E Card Interm 2422 0', icon: '📄', name: 'PHARMDRC, EIGHTYEAR', los: '43.0 Days', mrn: '64802043', fin: '1200209311', age: '8 years', dob: '05/22/09', adm: '05/22/17 17:12 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pain', pcp: 'Dr. A. Verma (Cardiology)' },
                      { loc: '2E Card Interm 2424 0', icon: '📄', name: 'PHARMDRC, EIGHTYEARCP', los: '43.0 Days', mrn: '64802044', fin: '1200209312', age: '8 years', dob: '05/22/09', adm: '05/22/17 17:17 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pain', pcp: 'Dr. M. Roy (Oncology)' },
                      { loc: '2E Card Interm 2429 0', icon: '📁', name: 'TESTRODNEY, INPATIENT', los: '18.2 Days', mrn: '64802647', fin: '1200209259', age: '39 years', dob: '05/25/78', adm: '05/24/17 08:30 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'lkj / Transfer Req', pcp: 'Dr. S. Nair (Neurology)' },
                      { loc: '2N Cardiology 2212 0', icon: '📄', name: 'MEDTEST, JR', los: '16.1 Days', mrn: '64801906', fin: '1200209168', age: '41 years', dob: '09/24/75', adm: '06/19/17 09:15 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'chest pain', pcp: 'Moulder MD, Rebekah Wilbourn' },
                      { loc: '2N Cardiology 2220 0', icon: '📁', name: 'UCTEST, CPADEFECTTVVO', los: '117.9 Days', mrn: '64801227', fin: '1200208168', age: '25 years', dob: '10/14/91', adm: '03/09/17 13:18 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'headache', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '2S Telemetry 2505 0', icon: '📄', name: 'ZZZTEST, BRADADMISSIONTWO', los: '173.9 Days', mrn: '64802066', fin: '1200207523', age: '26 years', dob: '11/11/90', adm: '01/12/17 14:10 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'chest pain', pcp: 'Shekoni MD, Nurudeen Areliku' },
                      { loc: '2S Telemetry 2514 0', icon: '📁', name: 'AWESOMEDUDEONE, MEME', los: '42.9 Days', mrn: '64802086', fin: '1200209374', age: '54 years', dob: '12/23/62', adm: '05/23/17 16:20 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'CHEST PAIN', pcp: 'LayneTEST MD, Scott Christopher' },
                      { loc: '3E Renal/Urol 3403 0', icon: '📄', name: 'QUALITYCONNECT, AMY', los: '225.0 Days', mrn: '64800472', fin: '1200206758', age: '29 years', dob: '02/10/88', adm: '11/22/16 10:54 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'abnormal lab', pcp: 'Sanders MD, Michael Lawrence' },
                      { loc: '3E Renal/Urol 3406 0', icon: '📁', name: 'NURSING, RENAL', los: '49.9 Days', mrn: '64801954', fin: '1200209175', age: '65 years', dob: '02/02/52', adm: '05/16/17 14:04 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'UTI', pcp: 'Dr. P. Das (ENT)' },
                      { loc: '3E Renal/Urol 3416 0', icon: '📄', name: 'PHARMDRC, THIRTEEN', los: '43.9 Days', mrn: '64802029', fin: '1200209277', age: '13 years', dob: '05/21/04', adm: '05/22/17 14:53 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'NAUSEA/VOMITING', pcp: 'City Hospital Referral' },
                      { loc: '3S PostOp Surg 3502 0', icon: '📁', name: 'QUALITYCONNECT, OMNICELL ONE', los: '217.9 Days', mrn: '64800575', fin: '1200207186', age: '43 years', dob: '06/23/74', adm: '11/28/16 13:33 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'back pain', pcp: 'Apex Clinic Referral' },
                      { loc: '3S PostOp Surg 3503 0', icon: '📄', name: 'QUALITYCONNECT, SENTRE SEVEN', los: '217.9 Days', mrn: '64800576', fin: '1200207187', age: '71 years', dob: '05/33/46', adm: '11/28/16 13:46 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'surgery', pcp: 'Dr. D. Patel (Oncology)' },
                      { loc: '3S PostOp Surg 3512 0', icon: '📁', name: 'PHARMDRC, ONEMONTH', los: '43.9 Days', mrn: '64802036', fin: '1200209284', age: '2 months', dob: '04/22/17', adm: '05/22/17 15:35 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'HIGH FEVER', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '3W-W ICU 3611 0', icon: '📄', name: 'NURSING, ICUWEST', los: '49.8 Days', mrn: '64801364', fin: '1200209187', age: '65 years', dob: '02/02/52', adm: '05/16/17 18:00 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'trouble breathing', pcp: 'ICU Transfer Bed Req' },
                      { loc: '4E Med Surg 4402 0', icon: '📁', name: 'TESTANGY, DONOTDISCHARGE', los: '132.0 Days', mrn: '64800761', fin: '1200207454', age: '25 years', dob: '01/04/92', adm: '01/04/17 11:23 CST', doc: 'Sanders MD, Michael Lawrence', reason: 'Chest Pain', pcp: 'LayneTEST MD, Scott Christopher' },
                      { loc: '4E Med Surg 4403 0', icon: '📄', name: 'TEST, ALLERGY', los: '47.9 Days', mrn: '64801995', fin: '1200209224', age: '22 years', dob: '06/04/95', adm: '05/18/17 15:47 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'testing', pcp: 'Dr. G. Jones' },
                      { loc: '4E Med Surg 4404 0', icon: '📁', name: 'QUALITYCONNECT, SUSAN', los: '29.9 Days', mrn: '64800983', fin: '1200207673', age: '38 years', dob: '10/08/78', adm: '06/05/17 08:14 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'test / Second Opinion', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '4E Med Surg 4407 0', icon: '📄', name: 'WBTPATIENT, TESTFIVE', los: '32.9 Days', mrn: '64801314', fin: '1200209043', age: '27 years', dob: '05/27/90', adm: '06/02/17 13:42 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'pace maker checkup', pcp: 'Cardiology Referral' },
                      { loc: '4E Med Surg 4416 0', icon: '📁', name: 'SOFTBALL, TEST HC', los: '29.5 Days', mrn: '64801114', fin: '1200209529', age: '46 years', dob: '10/31/70', adm: '06/05/17 23:29 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'Pain', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '4N Observation 4210 0', icon: '📄', name: 'MEDTEST, XR', los: '16.1 Days', mrn: '64802557', fin: '1200209170', age: '58 years', dob: '06/27/58', adm: '06/19/17 09:21 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'Abdominal pain', pcp: 'Torrey MD, Brian Scott' },
                      { loc: '4S Oncology 4503 0', icon: '📁', name: 'ITFIVE, PATIENTONE DIRECTADMIT', los: '38.2 Days', mrn: '64802325', fin: '1200209054', age: '35 years', dob: '02/18/62', adm: '06/05/17 08:14 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'ILL / Direct Admit Req', pcp: 'LayneTEST MD, Scott Christopher' },
                      { loc: '4S Oncology 4504 0', icon: '📄', name: 'NURSING, ONC', los: '49.7 Days', mrn: '64801367', fin: '1200209190', age: '52 years', dob: '01/15/65', adm: '05/16/17 18:10 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'tumor / Transfer Req', pcp: 'Oncology Consult' },
                      { loc: '4W-S ICU 4602 0', icon: '📁', name: 'WBTPATIENT, TESTFOUR', los: '32.9 Days', mrn: '64802315', fin: '1200209042', age: '36 years', dob: '07/27/80', adm: '06/02/17 13:34 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'MVA', pcp: 'ICU Critical Care' },
                      { loc: '5E Womens 5405 0', icon: '📄', name: 'SMITH-WILLIAMS, AMANDA', los: '64.9 Days', mrn: '645017808', fill: '1200209535', age: '30 years', dob: '04/04/87', adm: '05/01/17 13:50 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'testing / OB Transfer', pcp: 'Womens Specialty Req' },
                      { loc: '5E Womens 5406 0', icon: '📁', name: 'REGISTER, PENNY', los: '97.9 Days', mrn: '64801434', fin: '1200208444', age: '31 years', dob: '01/01/86', adm: '03/29/17 13:47 CDT', doc: 'Sanders MD, Michael Lawrence', reason: 'Pain', pcp: 'Sanders MD, Michael Lawrence' }
                    ].map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-[#d9ecff] cursor-pointer transition-colors whitespace-nowrap ${
                          idx % 2 === 1 ? 'bg-[#fcfdfe]' : 'bg-white'
                        }`}
                      >
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.loc}</td>
                        <td className="py-1 px-1 border-r border-[#e2e8f0] text-center">
                          <span className="text-[12px]" title="View Record">{row.icon}</span>
                        </td>
                        <td 
                          className="py-1 px-2 border-r border-[#e2e8f0] font-bold text-[#1c4d78] hover:underline"
                          onClick={() => selectOrOpenTab?.('PatientProfile', `Patient Profile: ${row.name.split(',')[0]}`, 'patient-doe')}
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
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.los}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-600 font-mono">{row.mrn}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-600 font-mono">{row.mrn}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.age}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-600">{row.dob}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-700">{row.adm}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-800">{row.doc}</td>
                        <td className="py-1 px-2 border-r border-[#e2e8f0] text-gray-800">{row.reason}</td>
                        <td className="py-1 px-2 text-gray-700">{row.pcp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Cerner Status/Footer Bar */}
              <div className="bg-[#f0f3f6] border-t border-[#bccada] px-3 py-1 flex items-center justify-between text-[10px] text-gray-600 shrink-0 font-sans">
                <div className="flex items-center gap-3">
                  <span>List: <b>Referrals & Transfers (19)</b></span>
                  <span>|</span>
                  <span>Sort Order: <b>Location, ascending</b></span>
                  <span>|</span>
                  <span>Filter: <b>Active</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Showing 28 of 28 records</span>
                  <button className="bg-white border border-[#bccada] hover:bg-gray-100 px-2 py-0.5 rounded text-[9.5px]">Refresh List</button>
                </div>
              </div>
            </div>
  );
};

export default ReferralTransferTab;
