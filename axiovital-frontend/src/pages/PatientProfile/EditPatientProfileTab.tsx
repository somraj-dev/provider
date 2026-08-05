import React from 'react';

interface EditPatientProfileTabProps {
  pdDob: string;
  setPdDob: (val: string) => void;
  pdPhone: string;
  setPdPhone: (val: string) => void;
  selectOrOpenTab?: (type: any, title: string, id: string) => void;
}

export const EditPatientProfileTab: React.FC<EditPatientProfileTabProps> = ({
  pdDob,
  setPdDob,
  pdPhone,
  setPdPhone,
  selectOrOpenTab,
}) => {
  const [editLastName, setEditLastName] = React.useState('Doe');
  const [editFirstName, setEditFirstName] = React.useState('John');
  const [editMiddleInitial, setEditMiddleInitial] = React.useState('A');
  const [editMrn, setEditMrn] = React.useState('1000245678');
  const [editSsn, setEditSsn] = React.useState('237-84-5988');
  const [editDob, setEditDob] = React.useState('03/12/1979');
  const [editAge, setEditAge] = React.useState('45 Yrs');
  const [editSex, setEditSex] = React.useState('Male');
  const [editMaritalStatus, setEditMaritalStatus] = React.useState('Married');
  const [editOccupation, setEditOccupation] = React.useState('Teacher');
  const [editEthnicity, setEditEthnicity] = React.useState('Not Hispanic or Latino');
  const [editLanguage, setEditLanguage] = React.useState('English');
  const [editNationality, setEditNationality] = React.useState('American');
  const [editPrimaryInsurance, setEditPrimaryInsurance] = React.useState('Blue Cross / Blue Shield');
  const [editInsuranceId, setEditInsuranceId] = React.useState('47815879');
  const [editAddress, setEditAddress] = React.useState('7235 SW 48th St');
  const [editCity, setEditCity] = React.useState('Miami');
  const [editState, setEditState] = React.useState('FL');
  const [editZip, setEditZip] = React.useState('33155');
  const [editCountry, setEditCountry] = React.useState('USA');
  const [editPhone, setEditPhone] = React.useState('(305) 666-5599');
  const [editMobile, setEditMobile] = React.useState('(305) 666-5015');
  const [editFax, setEditFax] = React.useState('(305) 666-5560');
  const [editEmail, setEditEmail] = React.useState('jenwatts@aol.net');
  const [editAlternateEmail, setEditAlternateEmail] = React.useState('');
  const [editReferringPhysician, setEditReferringPhysician] = React.useState('Dr. W. Garland');
  const [editAttendingPhysician, setEditAttendingPhysician] = React.useState('Dr. Herman Stewart');
  const [editFirstVisit, setEditFirstVisit] = React.useState('07/15/2004');
  const [editStatus, setEditStatus] = React.useState('Active');

  const handleSaveProfile = () => {
    selectOrOpenTab?.('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe');
  };

  return (
<div className="flex flex-1 overflow-hidden select-none">
              
              {/* Left Sidebar: Edit Patient Options */}
              <div className="w-[180px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
                <div className="bg-[#789cbb] text-white font-bold p-1.5 flex justify-between items-center">
                  <span>Clinical Options</span>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-3 py-1.5 bg-[#007cc0] text-white font-bold">Demographics</button>
                  {['Contacts', 'Clinical Chart', 'Allergies', 'Medications', 'Problems', 'Documents', 'Images', 'Lab Results', 'Immunizations', 'Vitals', 'Care Plans', 'Notes', 'Export Data', 'Backup', 'Audit Trail', 'Exit'].map((opt) => (
                    <button key={opt} className="w-full text-left px-3 py-1.5 hover:bg-[#cbd8e3]/50 text-gray-700 transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Panel Form container */}
              <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-auto text-[10px]">
                
                {/* Form Title & Top Sub-ribbon (Ribbon 3) */}
                <div className="bg-white border-b border-[#bdcddc] px-3 py-1 flex items-center gap-3 text-[#2c3e50] font-semibold">
                  <button className="flex items-center gap-1 hover:text-black">👤 New Patient</button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 hover:text-black">💾 Save</button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 hover:text-black">💾 Save & Close</button>
                  <button className="flex items-center gap-1 hover:text-black">🖨️ Print</button>
                  <button className="flex items-center gap-1 hover:text-red-600">❌ Delete</button>
                  <button className="flex items-center gap-1 hover:text-black">↩️ Undo</button>
                  <button className="flex items-center gap-1 hover:text-black">🔄 Refresh</button>
                  <span className="text-gray-300">|</span>
                  <button className="flex items-center gap-1 hover:text-black">📅 Appointments</button>
                  <button className="flex items-center gap-1 hover:text-black">📄 Documents</button>
                  <button onClick={() => selectOrOpenTab?.('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')} className="flex items-center gap-1 hover:text-black">❌ Close</button>
                </div>

                <div className="p-4 flex gap-4 overflow-auto">
                  
                  {/* Fields Block */}
                  <div className="flex-1 bg-white border border-[#bdcddc] p-4 rounded shadow-sm space-y-4">
                    <h3 className="font-bold text-xs text-[#0f4471] border-b border-[#bdcddc] pb-1.5">Edit Patient Profile</h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Last Name *</label>
                        <input 
                          type="text" 
                          value={editLastName} 
                          onChange={(e) => setEditLastName(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0f4471]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">First Name *</label>
                        <input 
                          type="text" 
                          value={editFirstName} 
                          onChange={(e) => setEditFirstName(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0f4471]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Middle Initial</label>
                        <input 
                          type="text" 
                          value={editMiddleInitial} 
                          onChange={(e) => setEditMiddleInitial(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">ABHA-ID *</label>
                        <input 
                          type="text" 
                          value={editMrn} 
                          onChange={(e) => setEditMrn(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                       <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Axio-ID</label>
                        <input 
                          type="text" 
                          value={editSsn} 
                          onChange={(e) => setEditSsn(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Date of Birth *</label>
                        <input 
                          type="text" 
                          value={editDob} 
                          onChange={(e) => setEditDob(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Age</label>
                        <input 
                          type="text" 
                          value={editAge} 
                          onChange={(e) => setEditAge(e.target.value)} 
                          className="w-full bg-[#f1f5f9] border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none" 
                          disabled
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Sex *</label>
                        <select 
                          value={editSex} 
                          onChange={(e) => setEditSex(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Marital Status</label>
                        <select 
                          value={editMaritalStatus} 
                          onChange={(e) => setEditMaritalStatus(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Married</option>
                          <option>Single</option>
                          <option>Divorced</option>
                        </select>
                      </div>

                      <div className="space-y-1 col-span-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Occupation</label>
                            <input 
                              type="text" 
                              value={editOccupation} 
                              onChange={(e) => setEditOccupation(e.target.value)} 
                              className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Ethnicity</label>
                            <select 
                              value={editEthnicity} 
                              onChange={(e) => setEditEthnicity(e.target.value)} 
                              className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                            >
                              <option>Not Hispanic or Latino</option>
                              <option>Hispanic or Latino</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Language</label>
                            <select 
                              value={editLanguage} 
                              onChange={(e) => setEditLanguage(e.target.value)} 
                              className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                            >
                              <option>English</option>
                              <option>Spanish</option>
                              <option>French</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Nationality</label>
                        <select 
                          value={editNationality} 
                          onChange={(e) => setEditNationality(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>American</option>
                          <option>Indian</option>
                          <option>British</option>
                        </select>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-gray-500 font-bold">Address</label>
                        <input 
                          type="text" 
                          value={editAddress} 
                          onChange={(e) => setEditAddress(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">City</label>
                        <input 
                          type="text" 
                          value={editCity} 
                          onChange={(e) => setEditCity(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">State / Province</label>
                        <input 
                          type="text" 
                          value={editState} 
                          onChange={(e) => setEditState(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">ZIP / Postal Code</label>
                        <input 
                          type="text" 
                          value={editZip} 
                          onChange={(e) => setEditZip(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Country</label>
                        <select 
                          value={editCountry} 
                          onChange={(e) => setEditCountry(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>USA</option>
                          <option>India</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Phone</label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Mobile / Pager</label>
                        <input 
                          type="text" 
                          value={editMobile} 
                          onChange={(e) => setEditMobile(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Fax</label>
                        <input 
                          type="text" 
                          value={editFax} 
                          onChange={(e) => setEditFax(e.target.value)} 
                          className="w-full bg-[#f1f5f9] border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-gray-500 font-bold">Email</label>
                        <input 
                          type="text" 
                          value={editEmail} 
                          onChange={(e) => setEditEmail(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Alternate Email</label>
                        <input 
                          type="text" 
                          value={editAlternateEmail} 
                          onChange={(e) => setEditAlternateEmail(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-gray-500 font-bold">Referring Physician</label>
                        <select 
                          value={editReferringPhysician} 
                          onChange={(e) => setEditReferringPhysician(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Dr. W. Garland</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Attending Physician</label>
                        <select 
                          value={editAttendingPhysician} 
                          onChange={(e) => setEditAttendingPhysician(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Dr. Herman Stewart</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Date of First Visit</label>
                        <input 
                          type="text" 
                          value={editFirstVisit} 
                          onChange={(e) => setEditFirstVisit(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 font-bold">Patient Status</label>
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)} 
                          className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 text-[10px] focus:outline-none"
                        >
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 text-[10.5px]">
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-red-600 font-semibold">Remove Patient</button>
                      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-gray-700">Print</button>
                      <button onClick={handleSaveProfile} className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1 rounded shadow-sm">Save</button>
                      <button onClick={() => selectOrOpenTab?.('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')} className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-gray-700">Cancel</button>
                    </div>
                  </div>

                  {/* Photo area + Diagnoses Codes Right Column */}
                  <div className="w-[260px] space-y-3">
                    
                    {/* Photo Box */}
                    <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col items-center">
                      <div className="w-[140px] h-[140px] relative bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 rounded mb-2">
                        <img 
                          src="/avatar.png" 
                          alt="Edit Patient Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-full grid grid-cols-1 gap-1 text-[9.5px]">
                        <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 font-semibold rounded text-center text-gray-700">📷 Add Photo</button>
                        <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 font-semibold rounded text-center text-gray-700">❌ Delete Photo</button>
                        <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 py-1 font-semibold rounded text-center text-gray-700">🔄 Change Photo</button>
                      </div>
                    </div>

                    {/* Diagnoses Panel */}
                    <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm space-y-2">
                      <span className="font-bold text-[#0f4471]">Diagnoses (ICD Codes)</span>
                      <div className="flex gap-1.5 text-[9.5px]">
                        <button className="bg-white border border-gray-300 px-2 py-0.5 rounded">ICD-10</button>
                        <button className="bg-white border border-gray-300 px-2 py-0.5 rounded">ICD-9-CM</button>
                        <button className="bg-white border border-gray-300 px-2 py-0.5 rounded">Paste</button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2 text-[9.5px] text-gray-700 space-y-1">
                        <div className="font-semibold">11/25/2004: Allergic rhinitis</div>
                        <div>J30.9 | Nasal polyps</div>
                        <div>J33.9 | Acute sinusitis</div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
  );
};

export default EditPatientProfileTab;
