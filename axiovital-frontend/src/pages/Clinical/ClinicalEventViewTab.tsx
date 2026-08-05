import React from 'react';
import { formatEhrDate, formatEhrTime } from '../_shared/constants';

export const ClinicalEventViewTab: React.FC = () => {
  const [flowsheetLevel, setFlowsheetLevel] = React.useState('Clinical Event View');
  const [flowsheetView, setFlowsheetView] = React.useState<'Table' | 'Group' | 'List'>('Table');
  const [navigatorVisible, setNavigatorVisible] = React.useState(true);
  const [navigatorChecked, setNavigatorChecked] = React.useState({
    clinicalEventNotification: true,
    adverseReactionEvent: true,
    amaGuidelinesEvent: true,
    labRadDetailsEvent: true,
    clinicianNotification: true,
  });
  const [flowsheetSelectedCell, setFlowsheetSelectedCell] = React.useState<{row: string, col: number} | null>(null);
  
  // Search Criteria modal states
  const [showSearchCriteria, setShowSearchCriteria] = React.useState(false);
  const [searchCriteriaLookupMode, setSearchCriteriaLookupMode] = React.useState<'clinical' | 'posting' | 'count' | 'new' | 'admission'>('clinical');
  const [searchCriteriaFromDate, setSearchCriteriaFromDate] = React.useState('03/03/2009');
  const [searchCriteriaFromTime, setSearchCriteriaFromTime] = React.useState('0817');
  const [searchCriteriaToDate, setSearchCriteriaToDate] = React.useState('03/30/2014');
  const [searchCriteriaToTime, setSearchCriteriaToTime] = React.useState('1414');
  const [searchCriteriaRangeText, setSearchCriteriaRangeText] = React.useState('03 March 2009 08:17 EST - 30 March 2014 14:14 EDT (Clinical Range)');
  return (
<div className="flex-1 flex flex-col h-full bg-[#f4f4f4] text-black overflow-hidden select-none" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }}>
              {/* Flowsheet Top Toolbar */}
              <div className="h-[34px] bg-[#eef2f5] border-b border-[#bdcddc] flex items-center px-3 justify-between text-[11.5px] select-none shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">Flowsheet:</span>
                    <select 
                      value={flowsheetLevel} 
                      onChange={(e) => setFlowsheetLevel(e.target.value)}
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[22px] outline-none focus:border-blue-500 rounded-[1px] min-w-[150px]"
                    >
                      <option value="Clinical Event View">Clinical Event View</option>
                      <option value="Vital Signs View">Vital Signs View</option>
                      <option value="Lab Results View">Lab Results View</option>
                    </select>
                    <button 
                      onClick={() => setShowSearchCriteria(true)}
                      className="h-[22px] px-1 bg-gradient-to-b from-[#f9f9f9] to-[#e3e3e3] border border-[#7f9db9] hover:bg-gray-100 flex items-center justify-center font-bold text-[10px] rounded-[1px] active:bg-gray-200"
                    >
                      ...
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-700">Level:</span>
                    <select 
                      className="border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[22px] outline-none focus:border-blue-500 rounded-[1px] min-w-[150px]"
                      defaultValue="Clinical Event View"
                    >
                      <option value="Clinical Event View">Clinical Event View</option>
                      <option value="System View">System View</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="flowsheet_view_mode" 
                      checked={flowsheetView === 'Table'} 
                      onChange={() => setFlowsheetView('Table')}
                      className="accent-[#0f4471]" 
                    />
                    <span className="text-gray-800 font-medium">Table</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="flowsheet_view_mode" 
                      checked={flowsheetView === 'Group'} 
                      onChange={() => setFlowsheetView('Group')}
                      className="accent-[#0f4471]" 
                    />
                    <span className="text-gray-800 font-medium">Group</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="flowsheet_view_mode" 
                      checked={flowsheetView === 'List'} 
                      onChange={() => setFlowsheetView('List')}
                      className="accent-[#0f4471]" 
                    />
                    <span className="text-gray-800 font-medium">List</span>
                  </label>
                </div>
              </div>

              {/* Date/Time Range Banner */}
              <div className="h-[26px] bg-gradient-to-r from-[#8199ac] to-[#6d8498] border-b border-[#5f7486] flex items-center justify-between text-white text-[11px] px-2 select-none shrink-0 font-sans shadow-sm">
                <div className="flex items-center border border-[#687d90] bg-[#758ca0] rounded-[1px] overflow-hidden">
                  <button className="px-1.5 py-0.5 hover:bg-[#687d90] border-r border-[#687d90] active:bg-[#5b6f80]">◀</button>
                  <button className="px-1.5 py-0.5 hover:bg-[#687d90] active:bg-[#5b6f80]">▶</button>
                </div>
                <div className="font-bold tracking-wide">
                  {searchCriteriaRangeText}
                </div>
                <div className="flex items-center border border-[#687d90] bg-[#758ca0] rounded-[1px] overflow-hidden">
                  <button className="px-1.5 py-0.5 hover:bg-[#687d90] border-r border-[#687d90] active:bg-[#5b6f80]">◀</button>
                  <button className="px-1.5 py-0.5 hover:bg-[#687d90] active:bg-[#5b6f80]">▶</button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-1 overflow-hidden relative">
                
                {/* Left Sidebar: Navigator */}
                {navigatorVisible && (
                  <div className="w-[200px] bg-[#d9e4ef] border-r border-[#9bb5cb] flex flex-col select-none shrink-0">
                    <div className="h-[24px] bg-[#bfd2e6] border-b border-[#9bb5cb] px-2 flex items-center justify-between">
                      <span className="font-bold text-[11.5px] text-[#002a46]">Navigator</span>
                      <button 
                        onClick={() => setNavigatorVisible(false)}
                        className="text-[#555] hover:text-red-600 font-bold text-[10px] bg-transparent border-none cursor-pointer"
                        title="Close Navigator"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-2 space-y-2 text-[11px] text-[#333]">
                      <label className="flex items-start gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={navigatorChecked.clinicalEventNotification}
                          onChange={(e) => setNavigatorChecked(prev => ({ ...prev, clinicalEventNotification: e.target.checked }))}
                          className="mt-0.5 accent-[#0f4471]" 
                        />
                        <span>Clinical Event Notification</span>
                      </label>
                      <label className="flex items-start gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={navigatorChecked.adverseReactionEvent}
                          onChange={(e) => setNavigatorChecked(prev => ({ ...prev, adverseReactionEvent: e.target.checked }))}
                          className="mt-0.5 accent-[#0f4471]" 
                        />
                        <span>Adverse Reaction Event</span>
                      </label>
                      <label className="flex items-start gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={navigatorChecked.amaGuidelinesEvent}
                          onChange={(e) => setNavigatorChecked(prev => ({ ...prev, amaGuidelinesEvent: e.target.checked }))}
                          className="mt-0.5 accent-[#0f4471]" 
                        />
                        <span>AMA Guidelines Event</span>
                      </label>
                      <label className="flex items-start gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={navigatorChecked.labRadDetailsEvent}
                          onChange={(e) => setNavigatorChecked(prev => ({ ...prev, labRadDetailsEvent: e.target.checked }))}
                          className="mt-0.5 accent-[#0f4471]" 
                        />
                        <span>Lab/Rad Details Event</span>
                      </label>
                      <label className="flex items-start gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={navigatorChecked.clinicianNotification}
                          onChange={(e) => setNavigatorChecked(prev => ({ ...prev, clinicianNotification: e.target.checked }))}
                          className="mt-0.5 accent-[#0f4471]" 
                        />
                        <span>Clinician Notification</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Reopen Navigator tab button if closed */}
                {!navigatorVisible && (
                  <button 
                    onClick={() => setNavigatorVisible(true)}
                    className="absolute left-0 top-0 bg-[#d9e4ef] border border-[#9bb5cb] text-[#002a46] font-bold text-[10px] py-1 px-1.5 rounded-r-[3px] shadow-sm hover:bg-[#cde0f2] z-10 shrink-0 cursor-pointer"
                  >
                    ▶ Navigator
                  </button>
                )}

                {/* Right Flowsheet Area */}
                <div className="flex-1 bg-white overflow-auto">
                  <table className="w-full border-collapse table-fixed text-[11.5px] min-w-[1200px]">
                    <thead>
                      <tr className="bg-[#f0f4f8] text-gray-800">
                        {/* First Sticky Column Header */}
                        <th className="sticky left-0 top-0 z-20 bg-[#e6edf5] border-r border-b border-[#b5c7d9] text-[12px] font-bold text-[#003366] text-left p-2 w-[240px] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                          Clinical Event View
                        </th>
                        {/* 12 DateTime Column Headers */}
                        {[
                          { date: '11/15/2012', time: '12:02', tz: 'EST' },
                          { date: '05/28/2013', time: '15:53', tz: 'EDT' },
                          { date: '11/18/2013', time: '14:04', tz: 'EST' },
                          { date: '01/03/2014', time: '13:24', tz: 'EST' },
                          { date: '03/03/2014', time: '11:50', tz: 'EST' },
                          { date: '03/03/2014', time: '12:13', tz: 'EST' },
                          { date: '03/03/2014', time: '12:15', tz: 'EST' },
                          { date: '03/03/2014', time: '13:36', tz: 'EST' },
                          { date: '03/03/2014', time: '13:38', tz: 'EST' },
                          { date: '03/03/2014', time: '13:41', tz: 'EST' },
                          { date: '03/03/2014', time: '13:46', tz: 'EST' },
                          { date: '03/03/2014', time: '13:48', tz: 'EST' },
                        ].map((col, idx) => (
                          <th key={idx} className="sticky top-0 z-10 bg-[#e6edf5] border-r border-b border-[#b5c7d9] text-[10px] font-normal text-gray-700 p-1 text-center align-middle h-[45px] w-[80px]">
                            <div className="flex flex-col items-center justify-center leading-tight">
                              <span>{col.date}</span>
                              <span className="font-semibold text-black">{col.time}</span>
                              <span className="text-[8.5px] text-gray-500">{col.tz}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: 'clinicalEventNotification',
                          title: 'Clinical Event Notification',
                          rows: [
                            { label: 'Notified Date/Time-Contact 1', values: { 0: '* 11/15/2012 12:03', 5: '03/03/2014', 6: '03/03/2014', 7: '03/03/2014', 8: '03/03/2014', 9: '03/03/2014', 10: '03/03/2014', 11: '03/03/2014' }, blue: true },
                            { label: 'Notified-Contact 2', values: { 4: '* Manager/' }, blue: true },
                            { label: 'Notification Detail', values: { 0: 'test', 2: '(c) This was', 5: 'Testing Pov', 6: 'Testing Ivie' } },
                            { label: 'Physician/Provider Not Called', values: { 0: 'Existing condition', 2: 'Existing con', 5: 'Existing cor', 6: 'Existing ord' } },
                            { label: 'New Orders Received', values: { 0: 'Yes', 2: 'Yes', 5: 'Yes', 6: 'Not at this t' }, blue: true },
                            { label: 'Time Nurse Notified of Results', values: { 5: '12:10', 6: '03/03/2014' } },
                            { label: 'Time Physician/Provider Notified', values: { 5: '12:14', 6: '03/03/2014' } },
                            { label: 'Notification Interval', values: { 5: '4', 6: '7' } },
                            { label: 'Results Read Back and Verified', values: { 5: 'Yes', 6: 'Yes' }, blue: true }
                          ]
                        },
                        {
                          id: 'adverseReactionEvent',
                          title: 'Adverse Reaction Event',
                          rows: [
                            { label: 'Adverse Reaction Symptoms', values: { 4: 'Chills' } },
                            { label: 'Event Adverse Reaction Cause', values: { 4: 'Medication' } },
                            { label: 'Adverse Reaction Medications', values: { 4: 'morphine' } },
                            { label: 'Adverse Reaction Description', values: { 4: 'Adverse Re' } },
                            { label: 'Adverse Reaction Reported By', values: { 4: 'Caregiver c' } },
                            { label: 'Adverse Reaction Interventions', values: { 4: 'Adverse drug' } }
                          ]
                        },
                        {
                          id: 'amaGuidelinesEvent',
                          title: 'AMA Guidelines Event',
                          rows: [
                            { label: 'Reason for Refusing Exam/Tx', values: {} }
                          ]
                        },
                        {
                          id: 'labRadDetailsEvent',
                          title: 'Lab/Rad Details Event',
                          rows: [
                            { label: 'Critical Lab Results', values: { 1: 'Glucose, ca' }, blue: true }
                          ]
                        },
                        {
                          id: 'clinicianNotification',
                          title: 'Clinician Notification',
                          rows: [
                            { label: 'Name of Clinician Contacted', values: { 4: 'Canino MD,' } },
                            { label: 'Reason for Call', values: { 4: 'Test' } },
                            { label: 'Clinician Contacted Via', values: { 4: 'Personal co' } },
                            { label: 'Information Provided to Clinician', values: { 4: 'Testing' } }
                          ]
                        }
                      ].map((group) => {
                        // Skip rendering this section if disabled in Navigator
                        if (!navigatorChecked[group.id as keyof typeof navigatorChecked]) {
                          return null;
                        }

                        return (
                          <React.Fragment key={group.id}>
                            {/* Group Header Row */}
                            <tr className="bg-[#cbdcf0] select-none font-bold text-[#002a46]">
                              <td className="sticky left-0 bg-[#cbdcf0] border-r border-b border-[#9bb5cb] p-1.5 shadow-[2px_0_4px_rgba(0,0,0,0.05)] text-[12px]" colSpan={1}>
                                {group.title}
                              </td>
                              <td className="border-b border-[#9bb5cb]" colSpan={12}></td>
                            </tr>

                            {/* Group Member Rows */}
                            {(group.rows || []).map((row, rowIdx) => (
                              <tr key={rowIdx} className="hover:bg-gray-50 border-b border-[#e6edf5]">
                                {/* Sticky row header */}
                                <td className="sticky left-0 bg-white border-r border-[#d9e4ef] p-1.5 text-gray-700 select-none shadow-[2px_0_4px_rgba(0,0,0,0.05)] font-sans text-[11px] truncate">
                                  {row.label}
                                </td>

                                {/* Values for 12 columns */}
                                {Array.from({ length: 12 }).map((_, colIdx) => {
                                  const cellValue = (row.values as Record<number, string>)[colIdx] || '';
                                  const isSelected = flowsheetSelectedCell?.row === row.label && flowsheetSelectedCell?.col === colIdx;
                                  
                                  // Highlight clinician contacted via (personal co) in col 4 as focused by default if not set
                                  const showFocusBorder = isSelected || (!flowsheetSelectedCell && row.label === 'Clinician Contacted Via' && colIdx === 4);

                                  return (
                                    <td 
                                      key={colIdx} 
                                      onClick={() => setFlowsheetSelectedCell({ row: row.label, col: colIdx })}
                                      className={`border-r border-[#e6edf5] p-1.5 text-[11px] align-middle text-left font-sans cursor-pointer transition-all ${
                                        showFocusBorder ? 'ring-1 ring-inset ring-black outline-1 outline-black bg-[#edf3f8]' : ''
                                      }`}
                                    >
                                      {cellValue && (
                                        <span className={'blue' in row && row.blue ? 'text-blue-700 font-semibold' : 'text-gray-900'}>
                                          {cellValue}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Search Criteria Modal Dialog */}
              {showSearchCriteria && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-50">
                  <div className="w-[560px] bg-[#ece9d8] border-2 border-[#0054e3] shadow-lg flex flex-col font-sans select-none rounded-[4px] overflow-hidden" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }}>
                    {/* XP Style Header */}
                    <div className="h-[28px] bg-gradient-to-r from-[#0058e6] to-[#3a93ff] px-2 flex items-center justify-between text-white font-bold text-[12px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-[#0055d4] border border-white flex items-center justify-center text-[10px] font-extrabold text-white rounded-[2px]">P</span>
                        <span className="tracking-wide">Search Criteria</span>
                      </div>
                      <button 
                        onClick={() => setShowSearchCriteria(false)}
                        className="w-[21px] h-[21px] bg-gradient-to-b from-[#e04030] to-[#b01000] border border-[#a00000] hover:from-[#f05040] hover:to-[#d02010] flex items-center justify-center font-bold text-white text-[11px] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)] rounded-[3px] active:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.5)]"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Body content */}
                    <div className="p-3 flex gap-3 text-[11.5px] text-black">
                      
                      {/* Left: Result Lookup fieldset */}
                      <fieldset className="w-[220px] border border-[#aca899] rounded-[3px] p-2.5 flex flex-col gap-2">
                        <legend className="text-[#003366] font-semibold px-1">Result Lookup</legend>
                        
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="radio" 
                            name="result_lookup_mode" 
                            checked={searchCriteriaLookupMode === 'clinical'} 
                            onChange={() => setSearchCriteriaLookupMode('clinical')} 
                            className="accent-[#0054e3]" 
                          />
                          <span>Clinical range</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="radio" 
                            name="result_lookup_mode" 
                            checked={searchCriteriaLookupMode === 'posting'} 
                            onChange={() => setSearchCriteriaLookupMode('posting')} 
                            className="accent-[#0054e3]" 
                          />
                          <span>Posting range</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="radio" 
                            name="result_lookup_mode" 
                            checked={searchCriteriaLookupMode === 'count'} 
                            onChange={() => setSearchCriteriaLookupMode('count')} 
                            className="accent-[#0054e3]" 
                          />
                          <span>Result count</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="radio" 
                            name="result_lookup_mode" 
                            checked={searchCriteriaLookupMode === 'new'} 
                            onChange={() => setSearchCriteriaLookupMode('new')} 
                            className="accent-[#0054e3]" 
                          />
                          <span>New results</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="radio" 
                            name="result_lookup_mode" 
                            checked={searchCriteriaLookupMode === 'admission'} 
                            onChange={() => setSearchCriteriaLookupMode('admission')} 
                            className="accent-[#0054e3]" 
                          />
                          <span>Admission date to current date</span>
                        </label>
                      </fieldset>

                      {/* Right side form */}
                      <div className="flex-1 flex flex-col gap-2.5 pt-1.5">
                        {/* From Date/Time row */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-[35px] text-right text-gray-700">From:</span>
                          <input 
                            type="text" 
                            value={searchCriteriaFromDate} 
                            onChange={(e) => setSearchCriteriaFromDate(e.target.value)}
                            className="w-[85px] border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[21px] rounded-[1px] text-center" 
                          />
                          {/* Spinners */}
                          <div className="flex flex-col border border-[#7f9db9] rounded-[1px] overflow-hidden bg-gradient-to-b from-white to-[#ece9d8]">
                            <button onClick={() => {
                              const parts = searchCriteriaFromDate.split('/');
                              if(parts.length === 3) {
                                const d = new Date(parseInt(parts[2]), parseInt(parts[0])-1, parseInt(parts[1])+1);
                                setSearchCriteriaFromDate(`${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`);
                              }
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 border-b border-[#7f9db9] active:bg-gray-200">▲</button>
                            <button onClick={() => {
                              const parts = searchCriteriaFromDate.split('/');
                              if(parts.length === 3) {
                                const d = new Date(parseInt(parts[2]), parseInt(parts[0])-1, parseInt(parts[1])-1);
                                setSearchCriteriaFromDate(`${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`);
                              }
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 active:bg-gray-200">▼</button>
                          </div>

                          <input 
                            type="text" 
                            value={searchCriteriaFromTime} 
                            onChange={(e) => setSearchCriteriaFromTime(e.target.value)}
                            className="w-[45px] border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[21px] rounded-[1px] text-center ml-1" 
                          />
                          {/* Spinners */}
                          <div className="flex flex-col border border-[#7f9db9] rounded-[1px] overflow-hidden bg-gradient-to-b from-white to-[#ece9d8]">
                            <button onClick={() => {
                              let val = parseInt(searchCriteriaFromTime, 10) + 1;
                              if(val > 2359) val = 0;
                              setSearchCriteriaFromTime(String(val).padStart(4, '0'));
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 border-b border-[#7f9db9] active:bg-gray-200">▲</button>
                            <button onClick={() => {
                              let val = parseInt(searchCriteriaFromTime, 10) - 1;
                              if(val < 0) val = 2359;
                              setSearchCriteriaFromTime(String(val).padStart(4, '0'));
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 active:bg-gray-200">▼</button>
                          </div>

                          <span className="text-[10px] text-gray-600 font-semibold ml-1.5">EDT</span>
                        </div>

                        {/* To Date/Time row */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-[35px] text-right text-gray-700">To:</span>
                          <input 
                            type="text" 
                            value={searchCriteriaToDate} 
                            onChange={(e) => setSearchCriteriaToDate(e.target.value)}
                            className="w-[85px] border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[21px] rounded-[1px] text-center" 
                          />
                          {/* Spinners */}
                          <div className="flex flex-col border border-[#7f9db9] rounded-[1px] overflow-hidden bg-gradient-to-b from-white to-[#ece9d8]">
                            <button onClick={() => {
                              const parts = searchCriteriaToDate.split('/');
                              if(parts.length === 3) {
                                const d = new Date(parseInt(parts[2]), parseInt(parts[0])-1, parseInt(parts[1])+1);
                                setSearchCriteriaToDate(`${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`);
                              }
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 border-b border-[#7f9db9] active:bg-gray-200">▲</button>
                            <button onClick={() => {
                              const parts = searchCriteriaToDate.split('/');
                              if(parts.length === 3) {
                                const d = new Date(parseInt(parts[2]), parseInt(parts[0])-1, parseInt(parts[1])-1);
                                setSearchCriteriaToDate(`${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`);
                              }
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 active:bg-gray-200">▼</button>
                          </div>

                          <input 
                            type="text" 
                            value={searchCriteriaToTime} 
                            onChange={(e) => setSearchCriteriaToTime(e.target.value)}
                            className="w-[45px] border border-[#7f9db9] bg-white px-1.5 py-0.5 text-[11px] h-[21px] rounded-[1px] text-center ml-1" 
                          />
                          {/* Spinners */}
                          <div className="flex flex-col border border-[#7f9db9] rounded-[1px] overflow-hidden bg-gradient-to-b from-white to-[#ece9d8]">
                            <button onClick={() => {
                              let val = parseInt(searchCriteriaToTime, 10) + 1;
                              if(val > 2359) val = 0;
                              setSearchCriteriaToTime(String(val).padStart(4, '0'));
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 border-b border-[#7f9db9] active:bg-gray-200">▲</button>
                            <button onClick={() => {
                              let val = parseInt(searchCriteriaToTime, 10) - 1;
                              if(val < 0) val = 2359;
                              setSearchCriteriaToTime(String(val).padStart(4, '0'));
                            }} className="px-1 text-[7px] leading-[8px] hover:bg-gray-100 active:bg-gray-200">▼</button>
                          </div>

                          <span className="text-[10px] text-gray-600 font-semibold ml-1.5">EDT</span>
                        </div>

                        {/* Number of results & Year limit row */}
                        <div className="h-[0.5px] bg-[#d0cfc9] my-1"></div>
                        <div className="grid grid-cols-2 gap-2 text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <span>Number of results:</span>
                            <input 
                              type="text" 
                              value="100" 
                              disabled 
                              className="w-[45px] bg-[#f0f0ea] border border-[#aca899] text-gray-400 text-center text-[11px] h-[21px]" 
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>Year Result Limit:</span>
                            <input 
                              type="text" 
                              value="3" 
                              disabled 
                              className="w-[30px] bg-[#f0f0ea] border border-[#aca899] text-gray-400 text-center text-[11px] h-[21px]" 
                            />
                          </div>
                        </div>

                        {/* Hours previous limit */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-700">Number of Hours Previous to the Admit Date:</span>
                          <input 
                            type="text" 
                            defaultValue="0" 
                            className="w-[40px] border border-[#7f9db9] bg-white px-1 text-center text-[11px] h-[21px]" 
                          />
                        </div>
                      </div>

                    </div>

                    {/* Bottom Action Bar */}
                    <div className="bg-[#ece9d8] border-t border-[#d0cfc9] p-3 flex justify-end gap-2 shrink-0">
                      <button 
                        onClick={() => {
                          const formattedFrom = `${formatEhrDate(searchCriteriaFromDate)} ${formatEhrTime(searchCriteriaFromTime)}`;
                          const formattedTo = `${formatEhrDate(searchCriteriaToDate)} ${formatEhrTime(searchCriteriaToTime)}`;
                          setSearchCriteriaRangeText(`${formattedFrom} EST - ${formattedTo} EDT (Clinical Range)`);
                          setShowSearchCriteria(false);
                        }}
                        className="bg-gradient-to-b from-[#ffffff] to-[#e0dfd6] hover:from-[#e5f1fb] hover:to-[#cce4f7] border-2 border-double border-[#0054e3] hover:border-[#003366] px-5 py-0.5 min-w-[75px] text-[11.5px] font-sans text-black rounded-[3px] shadow-[inset_1px_1px_0_white] active:bg-[#cce4f7]"
                      >
                        OK
                      </button>
                      <button 
                        onClick={() => setShowSearchCriteria(false)}
                        className="bg-gradient-to-b from-[#ffffff] to-[#e0dfd6] hover:from-[#e5f1fb] hover:to-[#cce4f7] border border-[#7f9db9] hover:border-[#0054e3] px-5 py-0.5 min-w-[75px] text-[11.5px] font-sans text-black rounded-[3px] shadow-[inset_1px_1px_0_white] active:bg-[#cce4f7]"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
  );
};

export default ClinicalEventViewTab;
