import React from 'react';

export const PhysicianHandoffTab: React.FC = () => {
  const [handoffNavigator, setHandoffNavigator] = React.useState({
    sampleInfo: true,
    cbcSmear: true,
    coagulation: true,
    chemistry: true,
    serology: false,
    dischargeDoc: false
  });
  const [selectedHandoffCell, setSelectedHandoffCell] = React.useState<{row: string, col: number} | null>({ row: 'specimen', col: 0 });
  return (
<div className="flex-1 flex flex-col h-full bg-[#f4f4f4] text-black overflow-hidden select-none" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }}>
              {/* Flowsheet Top Toolbar */}
              <div className="h-[34px] bg-[#eef2f5] border-b border-[#bdcddc] flex items-center px-3 justify-between text-[11.5px] select-none shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">Flowsheet:</span>
                    <select 
                      defaultValue="All Results Flowsheet"
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[22px] outline-none focus:border-blue-500 rounded-[1px] min-w-[150px]"
                    >
                      <option value="All Results Flowsheet">All Results Flowsheet</option>
                      <option value="Critical Results Only">Critical Results Only</option>
                      <option value="Standard Labs View">Standard Labs View</option>
                    </select>
                    <button className="h-[22px] px-1 bg-gradient-to-b from-[#f9f9f9] to-[#e3e3e3] border border-[#7f9db9] hover:bg-gray-100 flex items-center justify-center font-bold text-[10px] rounded-[1px] active:bg-gray-200">
                      ...
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">Level:</span>
                    <select 
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[22px] outline-none focus:border-blue-500 rounded-[1px] min-w-[150px]"
                      defaultValue="ALLRESULTSECT"
                    >
                      <option value="ALLRESULTSECT">ALLRESULTSECT</option>
                      <option value="SUMMARYSECT">SUMMARYSECT</option>
                      <option value="DETAILSECT">DETAILSECT</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="handoff_view" defaultChecked className="accent-[#0f4471]" />
                    <span className="text-gray-800 font-medium">Table</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="handoff_view" className="accent-[#0f4471]" />
                    <span className="text-gray-800 font-medium">Group</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="handoff_view" className="accent-[#0f4471]" />
                    <span className="text-gray-800 font-medium">List</span>
                  </label>
                </div>
              </div>

              {/* Date range banner */}
              <div className="h-[26px] bg-[#97a9b9] border-b border-[#7e95a9] flex items-center justify-center text-white text-[11px] font-bold select-none shrink-0 font-sans shadow-sm">
                <span>Last 300 Results in the Past 5 Years</span>
              </div>

              {/* Main Workspace Split Layout */}
              <div className="flex flex-1 overflow-hidden relative">
                {/* Left Navigator Sidebar */}
                <div className="w-[180px] bg-[#eef2f5] border-r border-[#bdcddc] flex flex-col shrink-0 overflow-y-auto select-none">
                  <div className="bg-[#cbd8e3] p-1.5 font-bold border-b border-[#bdcddc] text-[10.5px] text-[#0f4471]">
                    Navigator
                  </div>
                  <div className="flex flex-col text-[11px] text-gray-700">
                    {[
                      { key: 'sampleInfo', label: 'Sample Information' },
                      { key: 'cbcSmear', label: 'CBC and Peripheral Smear' },
                      { key: 'coagulation', label: 'Coagulation' },
                      { key: 'chemistry', label: 'General Chemistry' },
                      { key: 'serology', label: 'Bacterial Serology and Molecul...' },
                      { key: 'dischargeDoc', label: 'Discharge Documentation' }
                    ].map((item) => (
                      <label 
                        key={item.key} 
                        className={`flex items-center gap-2 px-2 py-1.5 border-b border-gray-200 cursor-pointer hover:bg-[#d5e1eb]/60 ${handoffNavigator[item.key as keyof typeof handoffNavigator] ? 'bg-white font-semibold text-[#002a46]' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={handoffNavigator[item.key as keyof typeof handoffNavigator]}
                          onChange={(e) => setHandoffNavigator(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="rounded-sm accent-[#0f4471] w-3 h-3"
                        />
                        <span className="truncate">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right Grid Flowsheet Pane */}
                <div className="flex-1 bg-white overflow-auto">
                  <table className="w-full text-left border-collapse text-[10.5px] font-sans border-r border-[#bdcddc]">
                    <thead>
                      <tr className="bg-[#eef2f5] text-gray-700 font-bold border-b border-[#bdcddc] sticky top-0 z-10">
                        <th className="p-2 border-r border-[#bdcddc] min-w-[200px] w-[200px] bg-[#eef2f5]">Results</th>
                        {[
                          '05-Jun-2013\n08:10 PDT',
                          '09-Jun-2013\n12:10 PDT',
                          '03-Jun-2013\n15:00 PDT',
                          '03-Jun-2013\n12:43 PDT',
                          '03-Jun-2013\n11:30 PDT',
                          '27-May-2013\n13:24 PDT',
                          '27-May-2013\n04:40 PDT',
                          '29-May-2013\n03:30 PDT'
                        ].map((dt, idx) => (
                          <th key={idx} className="p-1.5 border-r border-[#bdcddc] min-w-[95px] text-center font-normal whitespace-pre-line text-[10px] leading-tight bg-[#eef2f5]">
                            {dt}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Section 1: Sample Information */}
                      {handoffNavigator.sampleInfo && (
                        <>
                          <tr className="bg-[#d2e2f2] text-[#003366] font-bold border-b border-[#bdcddc]">
                            <td colSpan={9} className="p-1 px-2.5 text-[11px]">Sample Information</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-1.5 px-3 border-r border-gray-200 text-gray-800 font-medium">Type of Specimen Collection</td>
                            {[
                              { val: 'Capillary' },
                              { val: 'Unknown' },
                              { val: '' },
                              { val: 'Unknown' },
                              { val: 'Line' },
                              { val: 'Line' },
                              { val: '' },
                              { val: '' }
                            ].map((cell, idx) => {
                              const isSelected = selectedHandoffCell?.row === 'specimen' && selectedHandoffCell?.col === idx;
                              return (
                                <td 
                                  key={idx} 
                                  onClick={() => setSelectedHandoffCell({ row: 'specimen', col: idx })}
                                  className={`p-1.5 border-r border-gray-200 text-center cursor-pointer select-none ${isSelected ? 'outline outline-[1.5px] outline-black outline-offset-[-1.5px] bg-[#eef5fc]' : ''}`}
                                >
                                  {cell.val}
                                </td>
                              );
                            })}
                          </tr>
                        </>
                      )}

                      {/* Section 2: CBC and Peripheral Smear */}
                      {handoffNavigator.cbcSmear && (
                        <>
                          <tr className="bg-[#d2e2f2] text-[#003366] font-bold border-b border-[#bdcddc]">
                            <td colSpan={9} className="p-1 px-2.5 text-[11px]">CBC and Peripheral Smear</td>
                          </tr>
                          {[
                            { key: 'wbc', name: 'White Blood Cells', values: ['4.5', '', '', '4.9', '0.7', '1.7', '', ''] },
                            { key: 'rbc', name: 'Red Blood Cells', values: ['4.14', '', '', '4.12', 'L 3.56', '4.10', '', ''] },
                            { key: 'hgb', name: 'Hemoglobin', values: ['L 107', '', '', 'L 119', 'L 103', 'L 107', '', ''] },
                            { key: 'hct', name: 'Hematocrit', values: ['L 0.318', '', '', 'L 0.352', 'L 0.303', 'L 0.313', '', ''] },
                            { key: 'mcv', name: 'Mean Corpuscular Volume', values: ['L 77.1', '', '', 'L 78.2', 'L 78.7', 'L 76.3', '', ''] },
                            { key: 'mch', name: 'Mean Corpuscular Hemoglobin', values: ['25.8', '', '', '26.7', '26.1', '26.1', '', ''] },
                            { key: 'rdw', name: 'RDW-CV', values: ['H 0.183', '', '', 'H 0.182', 'H 0.189', '0.147', '', ''] },
                            { key: 'plt', name: 'Platelet Count', values: ['L 158', '', '', '291', 'L 152', 'L 151', '', ''] },
                            { key: 'mpv', name: 'Mean Platelet Volume', values: ['9.8', '', '', '9.3', '9.9', '9.8', '', ''] },
                            { key: 'neut', name: 'Neutrophils', values: ['2.04', '', '', '1.88', '4.73', '3.07', '', ''] },
                            { key: 'lymph', name: 'Lymphocytes', values: ['1.54', '', '', '1.88', '2.89', '1.93', '', ''] },
                            { key: 'mono', name: 'Monocytes', values: ['0.44', '', '', '0.57', '0.50', '0.33', '', ''] },
                            { key: 'eos', name: 'Eosinophils', values: ['0.26', '', '', 'H 0.32', '0.47', '0.31', '', ''] },
                            { key: 'baso', name: 'Basophils', values: ['0.05', '', '', '0.07', '0.08', '0.10', '', ''] },
                            { key: 'film', name: 'Blood Film Screen', values: ['', '', '', 'Automated diff', '', 'Automated diff', '', ''] },
                            { key: 'morph', name: 'RBC Morphology', values: ['Non-specific poi', '', '', 'Non-specific poi', '', 'Non-specific poi', 'Non-specific poi', ''] },
                            { key: 'comments', name: 'Platelet Comments', values: ['', '', '', '', '', '', '', ''] }
                          ].map((row) => (
                            <tr key={row.key} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-1.5 px-3 border-r border-gray-200 text-gray-800">{row.name}</td>
                              {(row.values || []).map((val, idx) => {
                                const isSelected = selectedHandoffCell?.row === row.key && selectedHandoffCell?.col === idx;
                                const isLow = val.startsWith('L');
                                const isHigh = val.startsWith('H');
                                const textClass = isLow ? 'text-blue-600 font-semibold' : isHigh ? 'text-red-500 font-semibold' : 'text-gray-900';
                                return (
                                  <td 
                                    key={idx} 
                                    onClick={() => setSelectedHandoffCell({ row: row.key, col: idx })}
                                    className={`p-1.5 border-r border-gray-200 text-center cursor-pointer select-none ${textClass} ${isSelected ? 'outline outline-[1.5px] outline-black outline-offset-[-1.5px] bg-[#eef5fc]' : ''}`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </>
                      )}

                      {/* Section 3: Coagulation */}
                      {handoffNavigator.coagulation && (
                        <>
                          <tr className="bg-[#d2e2f2] text-[#003366] font-bold border-b border-[#bdcddc]">
                            <td colSpan={9} className="p-1 px-2.5 text-[11px]">Coagulation</td>
                          </tr>
                          {[
                            { key: 'dose', name: 'Heparin LMW Time of Last Dose', values: ['', 'Unknown', '', '', '', '', '', ''] },
                            { key: 'lmw', name: 'Heparin Low Molecular Weight', values: ['', 'L 0.41', '', '', '', '', '', ''] }
                          ].map((row) => (
                            <tr key={row.key} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-1.5 px-3 border-r border-gray-200 text-gray-800">{row.name}</td>
                              {(row.values || []).map((val, idx) => {
                                const isSelected = selectedHandoffCell?.row === row.key && selectedHandoffCell?.col === idx;
                                const isLow = val.startsWith('L');
                                const textClass = isLow ? 'text-blue-600 font-semibold' : 'text-gray-900';
                                return (
                                  <td 
                                    key={idx} 
                                    onClick={() => setSelectedHandoffCell({ row: row.key, col: idx })}
                                    className={`p-1.5 border-r border-gray-200 text-center cursor-pointer select-none ${textClass} ${isSelected ? 'outline outline-[1.5px] outline-black outline-offset-[-1.5px] bg-[#eef5fc]' : ''}`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </>
                      )}

                      {/* Section 4: General Chemistry */}
                      {handoffNavigator.chemistry && (
                        <>
                          <tr className="bg-[#d2e2f2] text-[#003366] font-bold border-b border-[#bdcddc]">
                            <td colSpan={9} className="p-1 px-2.5 text-[11px]">General Chemistry</td>
                          </tr>
                          {[
                            { key: 'na', name: 'Sodium', values: ['H 146', '140', '', '139', '', '141', '144', ''] },
                            { key: 'k', name: 'Potassium', values: ['4.2', '* 4.4', '', '4.4', '', 'L 3.4', '3.8', ''] },
                            { key: 'ca', name: 'Calcium Total', values: ['2.24', '2.38', '', 'L 2.21', '', 'L 2.10', '', ''] },
                            { key: 'mg', name: 'Magnesium', values: ['L 0.67', '* L 0.72', '', '0.77', '', 'L 0.67', 'L 0.71', ''] },
                            { key: 'phos', name: 'Phosphate', values: ['H 1.64', '* H 1.58', '', 'H 1.28', '', 'H 1.88', 'H 1.72', ''] },
                            { key: 'urea', name: 'Urea', values: ['2.9', '* 4.0', '', '4.0', '', 'L 2.7', 'L 1.8', ''] },
                            { key: 'cr', name: 'Creatinine', values: ['* 90', '* 95', '', '* H 108', '', '* 81', '* 72', ''] },
                            { key: 'bil_un', name: 'Bilirubin Unconjugated', values: ['L <2', '* L <2', '', 'L <2', '', 'L <2', '', ''] },
                            { key: 'bil_co', name: 'Bilirubin Conjugated', values: ['< 2', '* < 2', '', '< 2', '', '< 2', '', ''] },
                            { key: 'alt', name: 'Alanine Aminotransferase', values: ['H 58', '* H 43', '', 'H 37', '', 'H 52', '', ''] },
                            { key: 'ast', name: 'Aspartate Aminotransferase', values: ['H 72', '* H 55', '', '41', '', 'H 44', '', ''] },
                            { key: 'alp', name: 'Alkaline Phosphatase', values: ['80', '76', '', '64', '', '78', '', ''] },
                            { key: 'ggt', name: 'Gamma Glutamyltransferase', values: ['H 60', '* H 50', '', 'H 50', '', 'H 48', '', ''] },
                            { key: 'ldh', name: 'Lactate Dehydrogenase', values: ['585', '* 660', '', '594', '', '503', '', ''] }
                          ].map((row) => (
                            <tr key={row.key} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-1.5 px-3 border-r border-gray-200 text-gray-800">{row.name}</td>
                              {(row.values || []).map((val, idx) => {
                                const isSelected = selectedHandoffCell?.row === row.key && selectedHandoffCell?.col === idx;
                                const isLow = val.includes('L');
                                const isHigh = val.includes('H');
                                const textClass = isLow ? 'text-blue-600 font-semibold' : isHigh ? 'text-red-500 font-semibold' : 'text-gray-900';
                                return (
                                  <td 
                                    key={idx} 
                                    onClick={() => setSelectedHandoffCell({ row: row.key, col: idx })}
                                    className={`p-1.5 border-r border-gray-200 text-center cursor-pointer select-none ${textClass} ${isSelected ? 'outline outline-[1.5px] outline-black outline-offset-[-1.5px] bg-[#eef5fc]' : ''}`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
  );
};

export default PhysicianHandoffTab;
