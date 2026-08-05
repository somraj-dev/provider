import React from 'react';
import { patientDemographics } from '../_shared/constants';

interface PatientNotesTabProps {
  activeTab: any;
  closeTab?: (id: string, e: any) => void;
}

export const PatientNotesTab: React.FC<PatientNotesTabProps> = ({ activeTab = { id: 'patient-notes-doe', title: 'Notes' }, closeTab }) => {
  const [patientNotesMap, setPatientNotesMap] = React.useState<Record<string, string>>({});
  const [assessmentItems, setAssessmentItems] = React.useState<string[]>([
    '1. ST elevation (STEMI) myocardial infarction involving right coronary artery',
    '2. Acute diverticulitis'
  ]);
  const [ordersItems, setOrdersItems] = React.useState<string[]>([
    'temazepam, 15 mg, = 1 cap, Oral, Cap, HS, PRN sleep, First Dose: 10/22/17 15:54:00 CDT'
  ]);
  const [noteSubjective, setNoteSubjective] = React.useState<string>('');
  const [noteRos, setNoteRos] = React.useState<string>('Review of Systems');
  const [notePe, setNotePe] = React.useState<string>(`Physical Exam\nVitals & Measurements`);
  const [noteIo, setNoteIo] = React.useState<string>(`Intake and Output\nNo qualifying data available.`);

  const [isEditingNote, setIsEditingNote] = React.useState<boolean>(false);
  const [newAssessmentInput, setNewAssessmentInput] = React.useState<string>('');
  const [newOrderInput, setNewOrderInput] = React.useState<string>('');

  // Note details panel states
  const [showNoteDetailsPanel, setShowNoteDetailsPanel] = React.useState<boolean>(true);
  const [selectedNoteTemplate, setSelectedNoteTemplate] = React.useState<string>('Office Visit Note');

  // Sign / Submit modal states
  const [showSignModal, setShowSignModal] = React.useState<boolean>(false);
  const [signType1, setSignType1] = React.useState<string>('Office/Clinic Note-Physician');
  const [signType2, setSignType2] = React.useState<string>('Personal Note Type List');
  const [signTitleVal, setSignTitleVal] = React.useState<string>('Office Visit Note');
  const [signDateVal, setSignDateVal] = React.useState<string>('18-Feb-2015');
  const [signTimeVal, setSignTimeVal] = React.useState<string>('11:11');
  const [signTimezoneVal, setSignTimezoneVal] = React.useState<string>('PST');
  const [signAuthorVal, setSignAuthorVal] = React.useState<string>('Patterson, Stanley C');
  const patientDirectoryData = [
    { mrn: '1000245601', name: 'JAMES, WILLIAM', sex: 'M', dob: '04/12/1974', age: '52', visit: 'Inpatient', admitted: '05/20/2026 08:30 AM', room: 'ICU-104', physician: 'Dr. Sarah Connor', fin: '2026-9901' },
    { mrn: '1000245679', name: 'PATEL, RAHUL', sex: 'M', dob: '11/14/1987', age: '38', visit: 'Outpatient', admitted: '04/10/2026 10:15 AM', room: 'CLIN-202', physician: 'Dr. David Lee', fin: '2026-9902' },
    { mrn: '1000245680', name: 'JOHNSON, MARIA', sex: 'F', dob: '08/22/1984', age: '41', visit: 'Emergency', admitted: '03/15/2026 11:45 PM', room: 'ER-08', physician: 'Dr. Herman Stewart', fin: '2026-9903' },
    { mrn: '1000245681', name: 'LEE, DAVID', sex: 'M', dob: '07/22/1969', age: '56', visit: 'Inpatient', admitted: '02/28/2026 02:00 PM', room: 'MED-305', physician: 'Dr. Sarah Connor', fin: '2026-9904' },
    { mrn: '1000245682', name: 'GARCIA, LUCIA', sex: 'F', dob: '09/25/1996', age: '29', visit: 'Outpatient', admitted: '05/01/2026 09:00 AM', room: 'CLIN-101', physician: 'Dr. David Lee', fin: '2026-9905' },
    { mrn: '1000245684', name: 'KIM, JAMES', sex: 'M', dob: '02/19/1977', age: '49', visit: 'Inpatient', admitted: '04/22/2026 04:30 PM', room: 'SURG-412', physician: 'Dr. Herman Stewart', fin: '2026-9906' },
    { mrn: '1000245685', name: 'BROWN, ELIZABETH', sex: 'F', dob: '07/06/1963', age: '62', visit: 'Outpatient', admitted: '01/18/2026 01:15 PM', room: 'CLIN-204', physician: 'Dr. Sarah Connor', fin: '2026-9907' },
    { mrn: '1000245683', name: 'THOMAS, MICHAEL', sex: 'M', dob: '01/10/1981', age: '45', visit: 'Emergency', admitted: '03/30/2026 07:20 AM', room: 'ER-02', physician: 'Dr. David Lee', fin: '2026-9908' },
    { mrn: '1000245688', name: 'ANDERSON, SUSAN', sex: 'F', dob: '05/16/1976', age: '50', visit: 'Inpatient', admitted: '05/10/2026 10:00 AM', room: 'MED-210', physician: 'Dr. Herman Stewart', fin: '2026-9909' },
    { mrn: '1000245689', name: 'MILLER, ROBERT', sex: 'M', dob: '12/03/1957', age: '68', visit: 'Outpatient', admitted: '04/05/2026 03:45 PM', room: 'CLIN-105', physician: 'Dr. Sarah Connor', fin: '2026-9910' },
    { mrn: '1000245690', name: 'DAVIS, PATRICIA', sex: 'F', dob: '03/28/1954', age: '72', visit: 'Inpatient', admitted: '02/14/2026 06:10 PM', room: 'ICU-108', physician: 'Dr. David Lee', fin: '2026-9911' }
  ];
const mrn = activeTab?.id ? activeTab.id.replace('patient-notes-', '') : '';
            const patient = patientDirectoryData.find(p => p.mrn === mrn) || {
              name: 'JOHN DOE',
              mrn: '1000245678',
              dob: '03/12/1979',
              ageGender: '45 Y / Male',
              visit: 'Inpatient',
              admitted: '28/05/2025 08:30 AM',
              location: '101 / A',
              physician: 'Dr. Herman Stewart'
            };

  const syncToTextMap = (
    assess: string[],
    orders: string[],
    subj: string,
    ros: string,
    pe: string,
    io: string
  ) => {
    const parts = [];
    if (subj) parts.push(`Subjective:\n${subj}`);
    if (ros) parts.push(`Review of Systems:\n${ros}`);
    if (pe) parts.push(`Physical Exam:\n${pe}`);
    if (io) parts.push(`Intake & Output:\n${io}`);
    if (assess.length > 0) parts.push(`Assessment/Plan:\n${assess.join('\n')}`);
    if (orders.length > 0) parts.push(`Orders:\n${orders.join('\n')}`);
    
    const text = parts.join('\n\n');
    setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: text }));
  };

            const noteText = patientNotesMap[patient.mrn] || `Assessment/Plan
1. ST elevation (STEMI) myocardial infarction involving right coronary artery
   
2. Acute diverticulitis

Orders:
temazepam, 15 mg, = 1 cap, Oral, Cap, HS, PRN sleep, First Dose: 10/22/17 15:54:00 CDT

Subjective

Review of Systems

Physical Exam
Vitals & Measurements

Intake and Output
No qualifying data available.`;

            return (
              <div className="flex flex-1 flex-col overflow-hidden bg-[#eef2f5] text-[11px] select-text">
                
                {/* clinical patient banner header */}
                <div className="bg-[#0b4369] text-white px-3 py-1 flex flex-col font-sans select-none shrink-0 text-[10px]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <span className="font-bold text-sm tracking-wide">{patient.name.toUpperCase()}</span>
                      <span>DOB: {patient.dob}</span>
                      <span>Age: {((patient as any).ageGender || (patient as any).age || '').split(' / ')[0]}</span>
                      <span>Dose Wt: 80.200 kg (07/24/2017)</span>
                      <span>Sex: {((patient as any).ageGender || '').split(' / ')[1] || (patient as any).gender || 'Male'}</span>
                      <span>MRN: {patient.mrn}</span>
                      <span>Attending: {(patient as any).physician || (patient as any).admittingPhysician}</span>
                    </div>
                    <div className="flex items-center gap-3">
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#115b8d] mt-1 pt-1 text-[9.5px] text-[#bde0f5]">
                    <div className="flex items-center gap-4">
                      <span>FIN: 1200290664</span>
                      <span>Admit: {(patient as any).admitted || (patient as any).admittedRequested}</span>
                      <span>Disch: &lt;None&gt;</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Workspace Grid */}
                <div className="flex-1 flex overflow-hidden">

                  {/* Middle Column - Editor workspace */}
                  <div className="flex-1 bg-white flex flex-col overflow-hidden">
                    
                    {/* Tabs row */}
                    <div className="bg-[#eef2f5] border-b border-[#cbd8e3] flex text-[10px] select-none shrink-0">
                      <div className="bg-white border-r border-t border-[#cbd8e3] px-3 py-1 font-bold text-gray-800 flex items-center gap-2">
                        <span>Progress Note</span>
                        <span className="text-gray-400 hover:text-red-600 cursor-pointer">×</span>
                      </div>
                      <div className="px-3 py-1 text-gray-500 hover:bg-gray-200/50 flex items-center cursor-pointer">
                        List
                      </div>
                    </div>

                    {/* Editor Toolbar */}
                    <div className="bg-[#fafbfc] border-b border-[#cbd8e3] p-1 flex flex-wrap items-center gap-1 select-none shrink-0">
                      <select className="bg-white border border-[#cbd8e3] rounded px-1.5 py-0.5 text-[9.5px]">
                        <option>Tahoma</option>
                        <option>Arial</option>
                        <option>Courier New</option>
                      </select>
                      <select className="bg-white border border-[#cbd8e3] rounded px-1.5 py-0.5 text-[9.5px] w-[50px]">
                        <option>Size</option>
                        <option>10</option>
                        <option>12</option>
                        <option>14</option>
                      </select>
                      <span className="text-gray-300 mx-0.5">|</span>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded font-bold">B</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded italic font-serif">I</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded underline">U</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded line-through">abc</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded text-amber-500 font-bold">A</button>
                      <span className="text-gray-300 mx-0.5">|</span>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded">📄 Align Left</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded">📄 Align Center</button>
                      <button className="hover:bg-gray-200 px-1.5 py-0.5 rounded">📄 Align Right</button>
                    </div>

                    {/* Text Editor area */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans select-none text-[11px]">
                      
                      {/* Section Header with edit (pencil) and clear (dustbin) actions */}
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-1.5 select-none">
                        <span className="font-bold text-[#0f4471] text-xs">Assessment/Plan</span>
                        <button 
                          onClick={() => setIsEditingNote(prev => !prev)}
                          className={`p-1 rounded hover:bg-gray-150 transition-colors text-[11.5px] ${isEditingNote ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500'}`}
                          title="Edit Sections"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Delete the complete note to start a new note?")) {
                              setAssessmentItems([]);
                              setOrdersItems([]);
                              setNoteSubjective('');
                              setNoteRos('Review of Systems');
                              setNotePe('Physical Exam\nVitals & Measurements');
                              setNoteIo('Intake and Output\nNo qualifying data available.');
                              syncToTextMap([], [], '', 'Review of Systems', 'Physical Exam\nVitals & Measurements', 'Intake and Output\nNo qualifying data available.');
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors text-[11.5px]"
                          title="Delete Note"
                        >
                          🗑️ Clear Note
                        </button>
                      </div>

                      {/* Editing View */}
                      {isEditingNote ? (
                        <div className="space-y-4">
                          
                          {/* Hide/Show Note Details collapsible options pallet */}
                          <div className="p-1 select-none mb-4 text-[11px] font-sans">
                            <div 
                              className="flex items-center gap-1 font-semibold text-gray-900 cursor-pointer text-[11px]"
                              onClick={() => setShowNoteDetailsPanel(prev => !prev)}
                            >
                              <span className="text-[9px]">{showNoteDetailsPanel ? '▲' : '▼'}</span>
                              <span className="hover:underline">{showNoteDetailsPanel ? 'Hide Note Details' : 'Show Note Details'}</span>
                            </div>

                            {showNoteDetailsPanel && (
                              <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                                
                                {/* *Type Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">*Type:</span>
                                  <div className="flex gap-2">
                                    <select 
                                      value={signType1}
                                      onChange={(e) => setSignType1(e.target.value)}
                                      className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] w-[280px] h-[22px] focus:outline-none focus:border-blue-500"
                                    >
                                      <option>Office/Clinic Note-Physician</option>
                                      <option>Progress Note-Generic</option>
                                    </select>
                                    <select 
                                      value={signType2}
                                      onChange={(e) => setSignType2(e.target.value)}
                                      className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] w-[280px] h-[22px] focus:outline-none focus:border-blue-500"
                                    >
                                      <option>Personal Note Type List</option>
                                      <option>System Note Type List</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Title Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">Title:</span>
                                  <input 
                                    type="text" 
                                    value={signTitleVal}
                                    onChange={(e) => setSignTitleVal(e.target.value)}
                                    className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] w-[568px] h-[22px] focus:outline-none focus:border-blue-500"
                                  />
                                </div>

                                {/* *Date Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">*Date:</span>
                                  <div className="flex gap-2 items-center">
                                    <div className="flex items-center border border-gray-400 rounded-none bg-white overflow-hidden h-[22px] w-[140px]">
                                      <input 
                                        type="text" 
                                        value={signDateVal}
                                        onChange={(e) => setSignDateVal(e.target.value)}
                                        className="px-1.5 py-0.5 text-[11px] focus:outline-none flex-1 border-none rounded-none"
                                      />
                                      <button className="bg-gray-150 hover:bg-gray-200 border-l border-gray-400 px-1 py-0.5 text-[9px] h-full rounded-none">📅</button>
                                    </div>
                                    <input 
                                      type="text" 
                                      value={signTimeVal}
                                      onChange={(e) => setSignTimeVal(e.target.value)}
                                      className="bg-white border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] text-center w-[120px] h-[22px] focus:outline-none focus:border-blue-500"
                                    />
                                    <span className="font-bold text-gray-700 text-[10px] ml-1">{signTimezoneVal}</span>
                                  </div>
                                </div>

                                {/* *Author Row */}
                                <div className="flex items-center text-[11px]">
                                  <span className="w-[75px] font-bold text-right pr-2 text-gray-700">*Author:</span>
                                  <input 
                                    type="text" 
                                    value={signAuthorVal}
                                    disabled
                                    className="bg-gray-100 border border-gray-400 rounded-none px-1.5 py-0.5 text-[11px] text-gray-500 focus:outline-none cursor-not-allowed w-[568px] h-[22px]"
                                  />
                                </div>

                                {/* Note Templates Section */}
                                <div className="space-y-1 pt-2 w-[800px]">
                                  <div className="font-bold text-gray-700 text-[11px]">*Note Templates</div>
                                  <div className="border border-gray-300 rounded-none bg-white max-h-[160px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                      <thead>
                                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300 select-none">
                                          <th className="p-1 px-2.5 w-[200px] border-r border-gray-200">Name</th>
                                          <th className="p-1 px-2.5">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {[
                                          { name: 'Admission H & P', desc: 'Admission History & Physical Note Template' },
                                          { name: 'Consult Note', desc: 'Consultation Note Template' },
                                          { name: 'Discharge Note', desc: 'Discharge Note Template' },
                                          { name: 'ED Note', desc: 'Emergency Department Note Template' },
                                          { name: 'Free Text Note', desc: 'Free Text Note Template' },
                                          { name: 'Inpatient Progress Note', desc: 'Inpatient Progress Note Template' },
                                          { name: 'Letter', desc: 'Letter Template' },
                                          { name: 'Office Visit Note', desc: 'Outpatient Office Visit Note Template' },
                                          { name: 'Op Note', desc: 'Operative Note Template' },
                                          { name: 'Peds Office Physical', desc: 'Pediatric Office Physical Note Template' },
                                          { name: 'Procedure Note', desc: 'Procedure Note Template' },
                                          { name: 'Progress/SOAP Note', desc: 'Daily Progress Note Template' },
                                          { name: 'Tertiary Trauma Survey (TTS)', desc: 'Tertiary Trauma Survey (TTS) Template' }
                                        ].map((tmpl, idx) => (
                                          <tr 
                                            key={idx} 
                                            onClick={() => {
                                              setSelectedNoteTemplate(tmpl.name);
                                              setSignTitleVal(tmpl.name);
                                            }}
                                            className={`border-b border-gray-200 cursor-pointer select-none transition-all ${
                                              selectedNoteTemplate === tmpl.name 
                                                ? 'bg-[#1e90ff] text-white hover:bg-[#1a80e5] font-semibold' 
                                                : 'hover:bg-gray-50 text-gray-800'
                                            }`}
                                          >
                                            <td className="p-1 px-2.5 font-sans border-r border-gray-150">{tmpl.name}</td>
                                            <td className={`p-1 px-2.5 font-sans ${selectedNoteTemplate === tmpl.name ? 'text-blue-100' : 'text-gray-500'}`}>{tmpl.desc}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                              </div>
                            )}
                          </div>
                          
                          {/* Assessment Items Badges */}
                          <div className="space-y-1.5">
                            <span className="text-gray-500 font-bold block">Assessment Items:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {assessmentItems.length === 0 ? (
                                <span className="text-gray-400 italic text-[10px]">No assessment items.</span>
                              ) : (
                                (assessmentItems || []).map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#f0f7ff] border border-[#d2e4ff] rounded text-blue-800 text-[10.5px]">
                                    <span>{item}</span>
                                    <span 
                                      onClick={() => {
                                        const updated = assessmentItems.filter((_, i) => i !== idx);
                                        setAssessmentItems(updated);
                                        syncToTextMap(updated, ordersItems, noteSubjective, noteRos, notePe, noteIo);
                                      }}
                                      className="text-red-500 hover:text-red-700 cursor-pointer font-bold ml-1 text-xs"
                                    >
                                      ×
                                    </span>
                                  </span>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <input 
                                type="text"
                                placeholder="Type a new assessment line and press Enter..."
                                value={newAssessmentInput}
                                onChange={(e) => setNewAssessmentInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newAssessmentInput.trim()) {
                                    const updated = [...assessmentItems, newAssessmentInput.trim()];
                                    setAssessmentItems(updated);
                                    setNewAssessmentInput('');
                                    syncToTextMap(updated, ordersItems, noteSubjective, noteRos, notePe, noteIo);
                                  }
                                }}
                                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Orders Badges */}
                          <div className="space-y-1.5">
                            <span className="text-gray-500 font-bold block">Orders:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {ordersItems.length === 0 ? (
                                <span className="text-gray-400 italic text-[10px]">No orders.</span>
                              ) : (
                                (ordersItems || []).map((item, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#f0f7ff] border border-[#d2e4ff] rounded text-blue-800 text-[10.5px]">
                                    <span>{item}</span>
                                    <span 
                                      onClick={() => {
                                        const updated = ordersItems.filter((_, i) => i !== idx);
                                        setOrdersItems(updated);
                                        syncToTextMap(assessmentItems, updated, noteSubjective, noteRos, notePe, noteIo);
                                      }}
                                      className="text-red-500 hover:text-red-700 cursor-pointer font-bold ml-1 text-xs"
                                    >
                                      ×
                                    </span>
                                  </span>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <input 
                                type="text"
                                placeholder="Type a new order line and press Enter..."
                                value={newOrderInput}
                                onChange={(e) => setNewOrderInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newOrderInput.trim()) {
                                    const updated = [...ordersItems, newOrderInput.trim()];
                                    setOrdersItems(updated);
                                    setNewOrderInput('');
                                    syncToTextMap(assessmentItems, updated, noteSubjective, noteRos, notePe, noteIo);
                                  }
                                }}
                                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Subjective */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Subjective:</span>
                            <textarea
                              value={noteSubjective}
                              onChange={(e) => {
                                setNoteSubjective(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, e.target.value, noteRos, notePe, noteIo);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[50px] text-[10.5px] resize-none"
                              placeholder="Type subjective details..."
                            />
                          </div>

                          {/* Review of Systems */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Review of Systems:</span>
                            <textarea
                              value={noteRos}
                              onChange={(e) => {
                                setNoteRos(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, noteSubjective, e.target.value, notePe, noteIo);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[50px] text-[10.5px] resize-none"
                              placeholder="Review of Systems..."
                            />
                          </div>

                          {/* Physical Exam */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Physical Exam:</span>
                            <textarea
                              value={notePe}
                              onChange={(e) => {
                                setNotePe(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, noteSubjective, noteRos, e.target.value, noteIo);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[60px] text-[10.5px] resize-none"
                            />
                          </div>

                          {/* Intake and Output */}
                          <div className="space-y-1">
                            <span className="text-gray-500 font-bold block">Intake and Output:</span>
                            <textarea
                              value={noteIo}
                              onChange={(e) => {
                                setNoteIo(e.target.value);
                                syncToTextMap(assessmentItems, ordersItems, noteSubjective, noteRos, notePe, e.target.value);
                              }}
                              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none h-[50px] text-[10.5px] resize-none"
                            />
                          </div>

                        </div>
                      ) : (
                        // Read / Text View matching standard note
                        <div className="space-y-4 text-gray-800 leading-relaxed select-text font-mono whitespace-pre-line text-[10.5px]">
                          {/* Assessment Section */}
                          <div>
                            {(assessmentItems || []).map((item, idx) => (
                              <div key={idx} className="pl-2">{item}</div>
                            ))}
                          </div>

                          {/* Orders Section */}
                          {ordersItems.length > 0 && (
                            <div>
                              <div className="font-bold mt-2">Orders:</div>
                              {(ordersItems || []).map((item, idx) => (
                                <div key={idx} className="pl-2">{item}</div>
                              ))}
                            </div>
                          )}

                          {/* Subjective Section */}
                          <div>
                            <div className="font-bold mt-2">Subjective</div>
                            <div className="pl-2 text-gray-600">{noteSubjective || "—"}</div>
                          </div>

                          {/* ROS Section */}
                          <div>
                            <div className="font-bold mt-2">{noteRos.split('\n')[0]}</div>
                            <div className="pl-2 text-gray-600">{noteRos.includes('\n') ? noteRos.substring(noteRos.indexOf('\n') + 1) : "—"}</div>
                          </div>

                          {/* PE Section */}
                          <div>
                            <div className="font-bold mt-2">{notePe.split('\n')[0]}</div>
                            <div className="pl-2 text-gray-600">{notePe.includes('\n') ? notePe.substring(notePe.indexOf('\n') + 1) : "—"}</div>
                          </div>

                          {/* IO Section */}
                          <div>
                            <div className="font-bold mt-2">{noteIo.split('\n')[0]}</div>
                            <div className="pl-2 text-gray-600">{noteIo.includes('\n') ? noteIo.substring(noteIo.indexOf('\n') + 1) : "—"}</div>
                          </div>

                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right Column - Clinical Info Sidebar (Meds, Allergies, Labs) */}
                  <div className="w-[280px] bg-white border-l border-[#cbd8e3] flex flex-col shrink-0 overflow-y-auto p-2.5 space-y-3.5">
                    
                    {/* Medications section */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#0f4471] border-b border-[#cbd8e3] pb-0.5">Medications</h4>
                      <div className="space-y-2 text-[9px] text-gray-700">
                        <div>
                          <span className="font-bold text-gray-900 block border-b border-gray-100 pb-0.2">Inpatient</span>
                          <ul className="list-disc pl-3.5 space-y-1 mt-1">
                            <li>albumin human 25% intravenous solution, 12.5 g, 50 mL, IV Piggyback, As Directed (see comments), PRN</li>
                            <li>aspirin buffered oral tablet, 325 mg, 1 tab, Oral, BID</li>
                            <li>D5W 250 mL + amiodarone IV additive 450 mg, Continuous, Daily</li>
                            <li>dextrose 5% with 0.45% NaCl and potassium chloride 20 mEq/L 1,000 mL, 1000 mL, IV</li>
                            <li>hydrogen peroxide 3% topical solution, 1 app, Topical, Daily</li>
                            <li>Lovenox, 40 mg, 0.4 mL, Subcutaneous, Daily</li>
                            <li>morphine, 2 mg, 1 mL, IV Push, every 3 hr, PRN</li>
                            <li>Procrit, 10000 units, 1 mL, IV Push, Mon/We/Fr</li>
                            <li>Restoril, 15 mg, 1 cap, Oral, HS, PRN</li>
                            <li>sodium chloride 0.9% bolus, 200 mL, IV Piggyback, As Directed (see comments), PRN</li>
                            <li>Tylenol, 650 mg, 2 tab, Oral, every 6 hr, PRN</li>
                            <li>Zemplar, 5 mcg, 1 mL, IV Push, Mon/We/Fr</li>
                            <li>Zofran, 4 mg, 1 tab, Oral, every 6 hr, PRN</li>
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block border-b border-gray-100 pb-0.2">Home</span>
                          <ul className="list-disc pl-3.5 space-y-1 mt-1">
                            <li>glimepiride 4 mg oral tablet, 4 mg, 1 tab, Oral, Daily</li>
                            <li>lisinopril 20 mg oral tablet, 20 mg, 1 tab, Oral, Daily</li>
                            <li>metFORMIN 500 mg oral tablet, 500 mg, 1 tab, Oral, BID</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Allergies section */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#0f4471] border-b border-[#cbd8e3] pb-0.5">Allergies</h4>
                      <p className="text-[9.5px] text-gray-500">No active allergies recorded.</p>
                    </div>

                    {/* Lab Results section */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#0f4471] border-b border-[#cbd8e3] pb-0.5">Lab Results (Last 24 Hours)</h4>
                      <p className="text-[9.5px] text-gray-500">No qualifying laboratory data available.</p>
                    </div>
                  </div>

                </div>

                {/* Bottom action buttons footer */}
                <div className="bg-[#f0f4f8] border-t border-[#cbd8e3] p-2 flex justify-between items-center shrink-0 select-none">
                  <div className="text-[10px] text-gray-500 font-sans">
                    Note Details: Progress Note Generic, Sanders MD, Michael Lawrence, 10/23/2017 10:46 CDT, Progress Note
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowSignModal(true);
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Sign/Submit
                    </button>
                    <button 
                      onClick={() => {
                        setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                        alert('Note saved successfully!');
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                        closeTab?.(activeTab.id, {} as any);
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Save & Close
                    </button>
                    <button 
                      onClick={(e) => closeTab?.(activeTab.id, e as any)}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 px-3 py-1 font-semibold rounded shadow-2xs active:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Sign/Submit Note Confirmation Modal */}
                {showSignModal && (
                  <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[99999]">
                    <div 
                      className="bg-[#f0f4f8] border-2 border-[#115b8d] w-[520px] shadow-2xl rounded-sm flex flex-col font-sans select-none text-[11px] text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Title bar */}
                      <div className="bg-[#0b4369] text-white px-3 py-1.5 flex justify-between items-center select-none font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">📄</span>
                          <span>Sign/Submit Note</span>
                        </div>
                        <button 
                          onClick={() => setShowSignModal(false)}
                          className="hover:bg-red-600 hover:text-white px-1.5 py-0.5 rounded text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Modal Body Form */}
                      <div className="p-4 space-y-3 bg-[#f8f9fa] border-b border-[#cbd8e3]">
                        
                        {/* Type row */}
                        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">*Type:</span>
                          <select 
                            value={signType1}
                            onChange={(e) => setSignType1(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                          >
                            <option>Office/Clinic Note-Physician</option>
                            <option>Progress Note-Generic</option>
                          </select>
                          <select 
                            value={signType2}
                            onChange={(e) => setSignType2(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                          >
                            <option>Personal Note Type List</option>
                            <option>System Note Type List</option>
                          </select>
                        </div>

                        {/* Title row */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">Title:</span>
                          <input 
                            type="text" 
                            value={signTitleVal}
                            onChange={(e) => setSignTitleVal(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                                setShowSignModal(false);
                                closeTab?.(activeTab.id, {} as any);
                              }
                            }}
                          />
                        </div>

                        {/* Date row */}
                        <div className="grid grid-cols-[80px_1.5fr_1fr_auto] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">*Date:</span>
                          <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                            <input 
                              type="text" 
                              value={signDateVal}
                              onChange={(e) => setSignDateVal(e.target.value)}
                              className="px-1.5 py-1 text-[11px] focus:outline-none flex-1 border-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                                  setShowSignModal(false);
                                  closeTab?.(activeTab.id, {} as any);
                                }
                              }}
                            />
                            <button className="bg-gray-100 hover:bg-gray-200 border-l border-gray-300 px-1.5 py-1 text-[10px]">📅</button>
                          </div>
                          <input 
                            type="text" 
                            value={signTimeVal}
                            onChange={(e) => setSignTimeVal(e.target.value)}
                            className="bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] focus:outline-none text-center"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                                  setShowSignModal(false);
                                  closeTab?.(activeTab.id, {} as any);
                              }
                            }}
                          />
                          <span className="font-bold text-gray-600">{signTimezoneVal}</span>
                        </div>

                        {/* Author row */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                          <span className="font-bold text-right pr-2 text-gray-700">*Author:</span>
                          <input 
                            type="text" 
                            value={signAuthorVal}
                            disabled
                            className="bg-gray-100 border border-gray-300 rounded px-1.5 py-1 text-[11px] text-gray-500 focus:outline-none cursor-not-allowed"
                          />
                        </div>

                      </div>

                      {/* Modal Footer actions */}
                      <div className="bg-[#cbd8e3]/45 p-2 flex justify-end gap-2 shrink-0 select-none">
                        <button 
                          onClick={() => {
                            setPatientNotesMap(prev => ({ ...prev, [patient.mrn]: noteText }));
                            setShowSignModal(false);
                            closeTab?.(activeTab.id, {} as any);
                          }}
                          className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-1 px-5 rounded-sm shadow-xs text-[11px] transition-all"
                        >
                          Sign
                        </button>
                        <button 
                          onClick={() => setShowSignModal(false)}
                          className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-1 px-5 rounded-sm shadow-xs text-[11px] transition-all"
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

export default PatientNotesTab;
