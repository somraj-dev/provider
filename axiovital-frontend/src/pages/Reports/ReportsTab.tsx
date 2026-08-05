import React from 'react';

interface ReportsTabProps {
  reportsSubTab: string;
  setReportsSubTab: (val: string) => void;
  reportsNavigator: any;
  setReportsNavigator: React.Dispatch<React.SetStateAction<any>>;
  selectedReportsCell: { row: string; col: number } | null;
  setSelectedReportsCell: (val: { row: string; col: number } | null) => void;
  showReportsContextMenu: boolean;
  setShowReportsContextMenu: (val: boolean) => void;
  reportsContextMenuPosition: { x: number; y: number };
  setReportsContextMenuPosition: (val: { x: number; y: number }) => void;
}

const defaultReportsNavigator = {
  lytesMetabolites: true,
  carbTolerance: true,
  extendedChemistry: true,
  hepatic: true,
  cardiacMarkers: true,
  lipids: true,
  routineCoagulation: true,
  hemogram: true,
  leukocytes: true,
  redCells: true
};

export const ReportsTab: React.FC<ReportsTabProps> = ({
  reportsSubTab = 'lab-extended',
  setReportsSubTab = () => {},
  reportsNavigator = defaultReportsNavigator,
  setReportsNavigator = () => {},
  selectedReportsCell = null,
  setSelectedReportsCell = () => {},
  showReportsContextMenu = false,
  setShowReportsContextMenu = () => {},
  reportsContextMenuPosition = { x: 0, y: 0 },
  setReportsContextMenuPosition = () => {},
}) => {
  return (
<div className="flex-1 flex flex-col h-full bg-[#f4f4f4] text-black overflow-hidden select-none font-sans relative" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }} onClick={() => setShowReportsContextMenu(false)}>
              
              {/* Horizontal Sub-tabs bar */}
              <div className="h-[28px] bg-[#eef2f5] border-b border-[#bdcddc] flex items-end px-2 shrink-0 select-none">
                {[
                  { id: 'lab-extended', label: 'Lab - Extended' },
                  { id: 'lab-recent', label: 'Lab - Recent' },
                  { id: 'results-recent', label: 'Results - Recent' },
                  { id: 'results-extended', label: 'Results - Extended' },
                  { id: 'microbiology', label: 'Microbiology' },
                  { id: 'diagnostics', label: 'Diagnostics' },
                  { id: 'vitals-recent', label: 'Vitals - Recent' },
                  { id: 'vitals-extended', label: 'Vitals - Extended' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setReportsSubTab(tab.id);
                    }}
                    className={`px-3 py-1 text-[11px] border-t border-x rounded-t-[3px] mr-[2px] transition-colors cursor-pointer ${reportsSubTab === tab.id ? 'bg-white border-[#bdcddc] border-b-white font-semibold text-[#002a46] z-10 -mb-[1px]' : 'bg-[#e3ecf5]/60 hover:bg-[#d9e6f2] border-transparent text-gray-600'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Flowsheet Filter Toolbar */}
              <div className="h-[34px] bg-[#eef2f5] border-b border-[#bdcddc] flex items-center px-3 justify-between text-[11.5px] select-none shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">Flowsheet:</span>
                    <select 
                      defaultValue="Labs View"
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[22px] outline-none focus:border-blue-500 rounded-[1px] min-w-[130px]"
                    >
                      <option value="Labs View">Labs View</option>
                      <option value="Standard Labs">Standard Labs</option>
                      <option value="All Results">All Results</option>
                    </select>
                  </div>
                  
                  <button className="h-[22px] px-2.5 bg-gradient-to-b from-[#f9f9f9] to-[#e3e3e3] border border-[#7f9db9] hover:bg-gray-100 flex items-center justify-center text-[11px] rounded-[1px] active:bg-gray-200 text-gray-800">
                    Procedure Selection
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">Level:</span>
                    <select 
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[22px] outline-none focus:border-blue-500 rounded-[1px] min-w-[130px]"
                      defaultValue="Labs View"
                    >
                      <option value="Labs View">Labs View</option>
                      <option value="Extended View">Extended View</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="reports_view" defaultChecked className="accent-[#0f4471]" />
                    <span className="text-gray-800 font-medium">Table</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="reports_view" className="accent-[#0f4471]" />
                    <span className="text-gray-800 font-medium">Group</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="reports_view" className="accent-[#0f4471]" />
                    <span className="text-gray-800 font-medium">List</span>
                  </label>
                </div>
              </div>

              {/* Date Header bar */}
              <div className="h-[26px] bg-[#97a9b9] border-b border-[#7e95a9] flex items-center justify-between text-white text-[11px] font-bold select-none shrink-0 font-sans shadow-sm px-3">
                <div className="flex items-center border border-[#7e95a9] bg-[#a8b8c7] rounded-[1px] overflow-hidden">
                  <button className="px-1 py-0.5 hover:bg-[#8da0b1] active:bg-[#7d91a3]">◀</button>
                  <button className="px-1 py-0.5 hover:bg-[#8da0b1] active:bg-[#7d91a3]">▶</button>
                </div>
                <span>December 23, 2024 0:00</span>
                <div className="flex items-center border border-[#7e95a9] bg-[#a8b8c7] rounded-[1px] overflow-hidden">
                  <button className="px-1 py-0.5 hover:bg-[#8da0b1] active:bg-[#7d91a3]">◀</button>
                  <button className="px-1 py-0.5 hover:bg-[#8da0b1] active:bg-[#7d91a3]">▶</button>
                </div>
              </div>

              {/* Split layout: Navigator (Left) and Grid (Right) */}
              <div className="flex flex-1 overflow-hidden relative">
                {/* Left Navigator Pane */}
                <div className="w-[180px] bg-[#eef2f5] border-r border-[#bdcddc] flex flex-col shrink-0 overflow-y-auto select-none">
                  <div className="bg-[#cbd8e3] p-1.5 font-bold border-b border-[#bdcddc] text-[10.5px] text-[#0f4471] flex justify-between items-center">
                    <span>Navigator</span>
                    <span className="text-gray-400 font-mono text-[9px] cursor-pointer">✕</span>
                  </div>
                  <div className="flex flex-col text-[11px] text-gray-700">
                    {[
                      { key: 'lytesMetabolites', label: 'Lytes-Metabolites' },
                      { key: 'carbTolerance', label: 'Carbohydrate Tolerance' },
                      { key: 'extendedChemistry', label: 'Extended Chemistry' },
                      { key: 'hepatic', label: 'Hepatic' },
                      { key: 'cardiacMarkers', label: 'Cardiac Markers' },
                      { key: 'lipids', label: 'LIPIDS' },
                      { key: 'routineCoagulation', label: 'Routine Coagulation' },
                      { key: 'hemogram', label: 'Hemogram' },
                      { key: 'leukocytes', label: 'Leukocytes' },
                      { key: 'redCells', label: 'Red Cells' }
                    ].map((item) => (
                      <label 
                        key={item.key} 
                        className={`flex items-center gap-2 px-2 py-1.5 border-b border-gray-200 cursor-pointer hover:bg-[#d5e1eb]/60 ${reportsNavigator[item.key as keyof typeof reportsNavigator] ? 'bg-white font-semibold text-[#002a46]' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={reportsNavigator[item.key as keyof typeof reportsNavigator]}
                          onChange={(e) => setReportsNavigator((prev: any) => ({ ...prev, [item.key]: e.target.checked }))}
                          className="rounded-sm accent-[#0f4471] w-3 h-3"
                        />
                        <span className="truncate">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right Flowsheet grid */}
                <div className="flex-1 bg-white overflow-auto flex flex-col">
                  {/* Show more results banner */}
                  <div className="p-2 border-b border-gray-200 bg-[#f7f9fa] shrink-0">
                    <button className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded shadow-sm text-[10.5px] cursor-pointer font-medium">
                      Show more results
                    </button>
                  </div>

                  <table className="w-full text-left border-collapse text-[10.5px] font-sans border-r border-[#bdcddc] flex-1">
                    <thead>
                      <tr className="bg-[#eef2f5] text-gray-700 font-bold border-b border-[#bdcddc] sticky top-0 z-10">
                        <th className="p-2 border-r border-[#bdcddc] min-w-[220px] w-[220px] bg-[#eef2f5]">Labs View</th>
                        <th className="p-1.5 border-r border-[#bdcddc] text-center font-normal whitespace-pre-line text-[10px] leading-tight bg-[#eef2f5]">
                          12/23/2024<br/>0:00
                        </th>
                        {/* Dummy columns to pad layout */}
                        <th className="p-1.5 border-r border-[#bdcddc] bg-[#eef2f5] w-[100px]"></th>
                        <th className="p-1.5 border-r border-[#bdcddc] bg-[#eef2f5] w-[100px]"></th>
                        <th className="p-1.5 bg-[#eef2f5]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Category: Lytes-Metabolites */}
                      {reportsNavigator.lytesMetabolites && (
                        <>
                          <tr className="bg-[#d2e2f2] text-[#003366] font-bold border-b border-[#bdcddc]">
                            <td colSpan={5} className="p-1 px-2.5 text-[11px]">Lytes-Metabolites</td>
                          </tr>
                          {[
                            { key: 'sodium', name: 'Sodium Level, External', val: '34.1 [2](L)' },
                            { key: 'potassium', name: 'Potassium Level, External', val: '13.33 - 50.34' },
                            { key: 'chloride', name: 'Chloride Level, External', val: '34.1 - 47.9' },
                            { key: 'anion', name: 'Anion Gap, External', val: '13.5 - 34.1' },
                            { key: 'urea', name: 'Urea Nitrogen, External', val: '7.8 - 45.1' },
                            { key: 'creatinine', name: 'Creatinine, External', val: '39 - 50.3' },
                            { key: 'egfr', name: 'eGFR, External', val: '39 - 50.3' },
                            { key: 'hgbA1c', name: 'Hemoglobin A1C, External', val: '(L) 13.33' },
                            { key: 'co2', name: 'CO2, External', val: '10.3 - 34.1' }
                          ].map((row) => {
                            const isSelected = selectedReportsCell?.row === row.key;
                            const isLow = row.val.includes('(L)') || row.val.includes('34.1 [2](L)');
                            const isPotassium = row.key === 'potassium';
                            const textClass = isLow ? 'text-blue-600 font-semibold' : isPotassium ? 'text-[#e67e22] font-semibold' : 'text-gray-900';
                            return (
                              <tr key={row.key} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-1.5 px-3 border-r border-gray-200 text-gray-800 font-medium">{row.name}</td>
                                <td 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReportsCell({ row: row.key, col: 0 });
                                  }}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedReportsCell({ row: row.key, col: 0 });
                                    setReportsContextMenuPosition({ x: e.clientX, y: e.clientY });
                                    setShowReportsContextMenu(true);
                                  }}
                                  className={`p-1.5 border-r border-gray-200 text-center cursor-pointer select-none min-w-[120px] ${textClass} ${isSelected ? 'outline outline-[1.5px] outline-black outline-offset-[-1.5px] bg-[#eef5fc]' : ''}`}
                                >
                                  {row.val}
                                </td>
                                <td className="border-r border-gray-100"></td>
                                <td className="border-r border-gray-100"></td>
                                <td></td>
                              </tr>
                            );
                          })}
                        </>
                      )}

                      {/* Category: Carbohydrate Tolerance */}
                      {reportsNavigator.carbTolerance && (
                        <>
                          <tr className="bg-[#d2e2f2] text-[#003366] font-bold border-b border-[#bdcddc]">
                            <td colSpan={5} className="p-1 px-2.5 text-[11px]">Carbohydrate Tolerance Test</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-1.5 px-3 border-r border-gray-200 text-gray-800 font-medium">Estimated Average Glucose, External</td>
                            <td 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReportsCell({ row: 'glucose', col: 0 });
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedReportsCell({ row: 'glucose', col: 0 });
                                setReportsContextMenuPosition({ x: e.clientX, y: e.clientY });
                                setShowReportsContextMenu(true);
                              }}
                              className={`p-1.5 border-r border-gray-200 text-center cursor-pointer select-none text-blue-600 font-semibold ${selectedReportsCell?.row === 'glucose' ? 'outline outline-[1.5px] outline-black outline-offset-[-1.5px] bg-[#eef5fc]' : ''}`}
                            >
                              (L) 7.8
                            </td>
                            <td className="border-r border-gray-100"></td>
                            <td className="border-r border-gray-100"></td>
                            <td></td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Context Menu Overlay */}
              {showReportsContextMenu && (
                <div 
                  className="fixed z-50 bg-[#f0f0f0] border border-[#979797] shadow-lg text-[11px] py-1 text-black font-sans min-w-[140px] select-none"
                  style={{ 
                    top: `${reportsContextMenuPosition.y}px`, 
                    left: `${reportsContextMenuPosition.x}px`,
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.15)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    'View Details...',
                    'View Comments...',
                    'Modify...',
                    'Unchart...',
                    'Change Date/Time...',
                    'Forward/Refuse...'
                  ].map((menuItem) => (
                    <div 
                      key={menuItem}
                      onClick={() => setShowReportsContextMenu(false)}
                      className="px-4 py-1 hover:bg-[#0078d7] hover:text-white cursor-pointer transition-colors"
                    >
                      {menuItem}
                    </div>
                  ))}
                </div>
              )}

            </div>
  );
};

export default ReportsTab;
