import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const QualityMeasuresTab: React.FC = () => {
  const [qualityMeasuresSubTab, setQualityMeasuresSubTab] = React.useState<'age_sex_diagnoses' | 'concept_explode' | 'summary_count'>('age_sex_diagnoses');
  const [diagnosisCodeParent, setDiagnosisCodeParent] = React.useState('All values');
  const [drugRelatedDiagnosis, setDrugRelatedDiagnosis] = React.useState('All values');
  const [restrictedDiagnosis, setRestrictedDiagnosis] = React.useState('Traumatic injury');
  const [headFinding, setHeadFinding] = React.useState('All values');
  return (
<div className="flex-1 flex flex-col h-full bg-[#f4f4f4] text-black overflow-hidden select-none font-sans" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }}>
              {/* Main Content Pane */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Pane: Input Controls */}
                <div className="w-[280px] border-r border-[#828790] flex flex-col bg-[#e4e2de]" style={{ boxShadow: 'inset -1px 0px 0px #fff' }}>
                  {/* Panel Header */}
                  <div className="bg-[#cbd8e3] border-b border-[#bdcddc] px-2 py-1 flex justify-between items-center text-[10px] font-bold text-[#002a46]">
                    <span>Input Controls - A&E Attendances by Age, Sex and Diagnoses</span>
                    <button className="text-[9px] hover:bg-white/40 p-0.5 rounded">▲</button>
                  </div>
                  
                  {/* Toolbar Row */}
                  <div className="px-2 py-1 bg-[#efebde] border-b border-[#c0c0c0] flex justify-between items-center shrink-0">
                    <button 
                      onClick={() => {
                        setDiagnosisCodeParent('All values');
                        setDrugRelatedDiagnosis('All values');
                        setRestrictedDiagnosis('Traumatic injury');
                        setHeadFinding('All values');
                      }}
                      className="px-2 py-0.5 text-[10px] text-black bg-[#efebde] active:bg-[#dfdbce] flex items-center gap-1"
                      style={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#fff #808080 #808080 #fff',
                        boxShadow: '0.5px 0.5px 0px #000'
                      }}
                    >
                      <span>🗎</span> New
                    </button>
                    <button 
                      onClick={() => {
                        setDiagnosisCodeParent('All values');
                        setDrugRelatedDiagnosis('All values');
                        setRestrictedDiagnosis('Traumatic injury');
                        setHeadFinding('All values');
                      }}
                      className="px-3 py-0.5 text-[10px] text-black bg-[#efebde] active:bg-[#dfdbce]"
                      style={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#fff #808080 #808080 #fff',
                        boxShadow: '0.5px 0.5px 0px #000'
                      }}
                    >
                      Reset
                    </button>
                  </div>

                  {/* Input controls container */}
                  <div className="p-2.5 space-y-3.5 overflow-y-auto flex-1 text-[10.5px]">
                    {/* Diagnosis Code Parent Concept */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[#333]">
                        <span className="font-semibold truncate pr-1">Diagnosis Code Parent Concept Description Ex...</span>
                        <span className="cursor-help text-gray-500 text-[9px] bg-white border border-[#7f9db9] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">i</span>
                      </div>
                      <select 
                        value={diagnosisCodeParent}
                        onChange={(e) => setDiagnosisCodeParent(e.target.value)}
                        className="w-full h-5 border border-[#7f9db9] bg-white text-[10.5px] px-1 focus:outline-none"
                      >
                        <option value="All values">All values</option>
                        <option value="Concept A">Concept A</option>
                        <option value="Concept B">Concept B</option>
                      </select>
                    </div>

                    {/* Drug-related Diagnosis Concept */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[#333]">
                        <span className="font-semibold truncate pr-1">Drug-related Diagnosis Concept Ind</span>
                        <span className="cursor-help text-gray-500 text-[9px] bg-white border border-[#7f9db9] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">i</span>
                      </div>
                      <select 
                        value={drugRelatedDiagnosis}
                        onChange={(e) => setDrugRelatedDiagnosis(e.target.value)}
                        className="w-full h-5 border border-[#7f9db9] bg-white text-[10.5px] px-1 focus:outline-none"
                      >
                        <option value="All values">All values</option>
                        <option value="Ind 1">Ind 1</option>
                        <option value="Ind 2">Ind 2</option>
                      </select>
                    </div>

                    {/* Restricted Diagnosis Ancestor */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[#333]">
                        <span className="font-semibold truncate pr-1">Restricted Diagnosis Ancestor Concept Descr...</span>
                        <span className="cursor-help text-gray-500 text-[9px] bg-white border border-[#7f9db9] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">i</span>
                      </div>
                      <select 
                        value={restrictedDiagnosis}
                        onChange={(e) => setRestrictedDiagnosis(e.target.value)}
                        className="w-full h-5 border border-[#7f9db9] bg-white text-[10.5px] px-1 focus:outline-none"
                      >
                        <option value="Traumatic injury">Traumatic injury</option>
                        <option value="All values">All values</option>
                        <option value="Accidental fall">Accidental fall</option>
                        <option value="Poisoning">Poisoning</option>
                      </select>
                    </div>

                    {/* Head Finding Concept Ind */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[#333]">
                        <span className="font-semibold truncate pr-1">Head Finding Concept Ind</span>
                        <span className="cursor-help text-gray-500 text-[9px] bg-white border border-[#7f9db9] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">i</span>
                      </div>
                      <select 
                        value={headFinding}
                        onChange={(e) => setHeadFinding(e.target.value)}
                        className="w-full h-5 border border-[#7f9db9] bg-white text-[10.5px] px-1 focus:outline-none"
                      >
                        <option value="All values">All values</option>
                        <option value="Head injury only">Head injury only</option>
                        <option value="No head injury">No head injury</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Pane: Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden p-5">
                  {qualityMeasuresSubTab === 'age_sex_diagnoses' && (
                    <div className="flex-1 flex flex-col overflow-y-auto space-y-5 min-h-0">
                      {/* Document Header */}
                      <div>
                        <h2 className="text-[13px] font-bold text-black pb-1 border-b border-[#a0a0a0] tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                          A&E Attendances for the period DD/MM/YYYY to DD/MM/YYYY with a Diagnoses descendent concept of {restrictedDiagnosis}
                        </h2>
                      </div>

                      {/* Chart Section */}
                      <div className="flex bg-[#fcfdfa] border border-[#e2e2e2] p-3 items-center justify-between h-[280px] shrink-0">
                        <div className="flex-1 h-full flex flex-col justify-between">
                          <div className="h-[230px] w-full flex">
                            {/* Y-axis label */}
                            <div className="w-8 shrink-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-black -rotate-90 whitespace-nowrap">Count of Attendances</span>
                            </div>
                            {/* Recharts Bar Chart */}
                            <div className="flex-1 h-full relative">
                              <ResponsiveContainer width="95%" height="100%">
                                <BarChart
                                  data={[
                                    { name: '00', Female: 2, Male: 20 },
                                    { name: '01-04', Female: 88, Male: 105 },
                                    { name: '05-09', Female: 60, Male: 78 },
                                    { name: '10-14', Female: 110, Male: 108 },
                                    { name: '15-19', Female: 88, Male: 146 },
                                    { name: '20-24', Female: 92, Male: 132 },
                                    { name: '25-29', Female: 95, Male: 126 },
                                    { name: '30-34', Female: 88, Male: 80 },
                                    { name: '35-39', Female: 52, Male: 68 },
                                    { name: '40-44', Female: 60, Male: 80 },
                                    { name: '45-49', Female: 78, Male: 75 },
                                    { name: '50-54', Female: 72, Male: 70 },
                                    { name: '55-59', Female: 60, Male: 48 },
                                    { name: '60-64', Female: 52, Male: 35 },
                                    { name: '65-69', Female: 32, Male: 30 },
                                    { name: '70-74', Female: 38, Male: 30 },
                                    { name: '80-84', Female: 48, Male: 33 },
                                    { name: '85+', Female: 60, Male: 18 }
                                  ]}
                                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                  barGap={2}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 8, fill: '#333' }} 
                                    axisLine={{ stroke: '#828790' }} 
                                    tickLine={{ stroke: '#828790' }}
                                    label={{ value: 'Age Band', position: 'bottom', offset: 0, fontSize: 10, fontWeight: 'bold', fill: '#000' }}
                                  />
                                  <YAxis 
                                    domain={[0, 160]} 
                                    ticks={[0, 20, 40, 60, 80, 100, 120, 140, 160]}
                                    tick={{ fontSize: 8, fill: '#333' }}
                                    axisLine={{ stroke: '#828790' }} 
                                    tickLine={{ stroke: '#828790' }}
                                  />
                                  <Tooltip />
                                  <Bar dataKey="Female" fill="#ffff99" stroke="#cccc00" strokeWidth={1} />
                                  <Bar dataKey="Male" fill="#3366ff" stroke="#000099" strokeWidth={1} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        {/* Chart Legend */}
                        <div className="w-[100px] shrink-0 text-[9.5px] border border-gray-300 p-2 bg-white flex flex-col gap-0.5 select-none leading-tight font-sans">
                          <div className="text-gray-600 font-semibold">Patient</div>
                          <div className="text-gray-600 font-semibold">Gender</div>
                          <div className="text-gray-600 font-semibold">Current</div>
                          <div className="text-gray-600 font-semibold">NHS</div>
                          <div className="text-gray-600 font-semibold">Code</div>
                          <div className="text-gray-600 font-semibold mb-2">Desc</div>
                          
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block w-2.5 h-2.5 bg-[#ffff99] border border-[#cccc00]" />
                            <span>Female</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 bg-[#3366ff] border border-[#000099]" />
                            <span>Male</span>
                          </div>
                        </div>
                      </div>

                      {/* Table Section */}
                      <div className="flex-1 border border-gray-300 overflow-hidden flex flex-col min-h-[140px]">
                        <div className="overflow-y-auto flex-1">
                          <table className="w-full border-collapse text-[10.5px] font-sans text-[#333]">
                            <thead>
                              <tr className="bg-[#4f5fc1] text-white border-b border-gray-300 text-left sticky top-0 z-10 leading-normal">
                                <th className="p-1.5 font-bold border-r border-[#cbd8e3]/45 w-[20%]">A&E Attendance Number</th>
                                <th className="p-1.5 font-bold border-r border-[#cbd8e3]/45 w-[25%]">Patient Gender Current NHS Code Desc</th>
                                <th className="p-1.5 font-bold border-r border-[#cbd8e3]/45 w-[30%]">Diagnosis Code Description 1</th>
                                <th className="p-1.5 font-bold border-r border-[#cbd8e3]/45 w-[15%]">Diagnosis Code Description 2</th>
                                <th className="p-1.5 font-bold w-[10%]">Diagnosis Code Description 3</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { num: '759556', gender: 'Female', desc1: 'Alleged victim of physical assault', desc2: 'Soft tissue injury', desc3: '' },
                                { num: '759562', gender: 'Male', desc1: 'Laceration of head', desc2: 'Soft tissue injury', desc3: '' },
                                { num: '759565', gender: 'Male', desc1: 'Laceration of hand', desc2: '', desc3: '' },
                                { num: '759570', gender: 'Female', desc1: 'Fall from height', desc2: 'Fracture of radius', desc3: 'Soft tissue injury' },
                                { num: '759572', gender: 'Female', desc1: 'Assault with blunt object', desc2: 'Contusion of face', desc3: '' },
                                { num: '759578', gender: 'Male', desc1: 'Accidental puncture', desc2: 'Open wound of finger', desc3: '' },
                                { num: '759580', gender: 'Male', desc1: 'Traumatic sprain of ankle', desc2: 'Soft tissue injury', desc3: '' }
                              ].map((row, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]'}>
                                  <td className="p-1.5 border-r border-b border-gray-200">{row.num}</td>
                                  <td className="p-1.5 border-r border-b border-gray-200">{row.gender}</td>
                                  <td className="p-1.5 border-r border-b border-gray-200">{row.desc1}</td>
                                  <td className="p-1.5 border-r border-b border-gray-200">{row.desc2}</td>
                                  <td className="p-1.5 border-b border-gray-200">{row.desc3}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {qualityMeasuresSubTab === 'concept_explode' && (
                    <div className="flex-1 flex flex-col justify-center items-center text-gray-500 italic">
                      <div>Diagnosis Concept Explode View - Concept Hierarchy & Details</div>
                      <div className="text-[10px] mt-1 text-gray-400">Concept tree analysis loading...</div>
                    </div>
                  )}

                  {qualityMeasuresSubTab === 'summary_count' && (
                    <div className="flex-1 flex flex-col justify-center items-center text-gray-500 italic">
                      <div>Summary Count View - Numerical aggregation of attendances</div>
                      <div className="text-[10px] mt-1 text-gray-400">Total Count: 1,324 attendances compiled.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Tab Bar Selector */}
              <div className="h-[26px] bg-[#dce7f0] border-t border-[#bdcddc] flex items-center px-1 shrink-0 select-none text-[11px] gap-0.5">
                {[
                  { key: 'age_sex_diagnoses', label: 'A&E Attendances by Age, Sex and Diagnoses' },
                  { key: 'concept_explode', label: 'Diagnosis Concept Explode' },
                  { key: 'summary_count', label: 'Summary Count' }
                ].map((st) => {
                  const isSelected = qualityMeasuresSubTab === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setQualityMeasuresSubTab(st.key as any)}
                      className={`h-[22px] px-3 flex items-center gap-1.5 rounded-t-sm transition-all focus:outline-none ${
                        isSelected 
                          ? 'bg-white border-t border-x border-[#828790] text-black font-semibold shadow-sm' 
                          : 'hover:bg-white/40 text-gray-700'
                      }`}
                    >
                      <span className="text-[10px]">{st.key === 'age_sex_diagnoses' ? '📊' : '📋'}</span>
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
  );
};

export default QualityMeasuresTab;
