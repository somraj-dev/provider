import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export const AdmitPatientTab: React.FC = () => {
    const [admitSearchBy, setAdmitSearchBy] = useState<'Aadhaar' | 'Name'>('Name');
  const [admitSearchFirst, setAdmitSearchFirst] = useState('');
  const [admitSearchLast, setAdmitSearchLast] = useState('');
  const [admitSearchAadhaar, setAdmitSearchAadhaar] = useState('');
  const [admitSearchDob, setAdmitSearchDob] = useState('');
  const [admitTitle, setAdmitTitle] = useState('Select');
  const [admitFirst, setAdmitFirst] = useState('');
  const [admitMiddle, setAdmitMiddle] = useState('');
  const [admitLast, setAdmitLast] = useState('');
  const [admitDobVal, setAdmitDobVal] = useState('');
  const [admitAgeVal, setAdmitAgeVal] = useState('');
  const [admitGender, setAdmitGender] = useState('Select');
  const [admitMarital, setAdmitMarital] = useState('Select');
  const [admitAadhaarVal, setAdmitAadhaarVal] = useState('');
  const [admitMobileVal, setAdmitMobileVal] = useState('');
  const [admitEmailVal, setAdmitEmailVal] = useState('');
  const [admitAltMobile, setAdmitAltMobile] = useState('');
  const [admitBlood, setAdmitBlood] = useState('Select');
  const [admitNation, setAdmitNation] = useState('Select');
  const [admitReligion, setAdmitReligion] = useState('Select');
  const [admitLang, setAdmitLang] = useState('Select');
  const [admitAddr1, setAdmitAddr1] = useState('');
  const [admitAddr2, setAdmitAddr2] = useState('');
  const [admitLandmark, setAdmitLandmark] = useState('');
  const [admitCityVal, setAdmitCityVal] = useState('');
  const [admitStateVal, setAdmitStateVal] = useState('Select');
  const [admitZipVal, setAdmitZipVal] = useState('');
  const [admitCountryVal, setAdmitCountryVal] = useState('India');
  const [admitTypeVal, setAdmitTypeVal] = useState('Select');
  const [admitVisitVal, setAdmitVisitVal] = useState('Select');
  const [admitDateVal, setAdmitDateVal] = useState('28/05/2025');
  const [admitTimeVal, setAdmitTimeVal] = useState('03:45 PM');
  const [admitReferredBy, setAdmitReferredBy] = useState('');
  const [admitRefDoctor, setAdmitRefDoctor] = useState('');
  const [admitDeptVal, setAdmitDeptVal] = useState('Select');
  const [admitBedRoom, setAdmitBedRoom] = useState('');
  const [admitInsPrimary, setAdmitInsPrimary] = useState('Select');
  const [admitInsIdVal, setAdmitInsIdVal] = useState('');
  const [admitPolicyId, setAdmitPolicyId] = useState('');
  const [admitDoctorVal, setAdmitDoctorVal] = useState('Dr. Herman Stewart (General Medicine)');
  const [admitWardVal, setAdmitWardVal] = useState('General Ward A');
  const [admitBedVal, setAdmitBedVal] = useState('Bed 102');
  const [admitReasonVal, setAdmitReasonVal] = useState('');
  const [admitPayerVal, setAdmitPayerVal] = useState('Self Pay');
  const [admitPolicyVal, setAdmitPolicyVal] = useState('');
  const [isSearchingAdmit, setIsSearchingAdmit] = useState(false);
  const [admitSearchResults, setAdmitSearchResults] = useState<any[]>([]);
  const [isSubmittingAdmit, setIsSubmittingAdmit] = useState(false);

  const handleSearchExistingPatient = async () => {
    try {
      let query = '';
      if (admitSearchBy === 'Aadhaar' && admitSearchAadhaar) {
        query = admitSearchAadhaar;
      } else if (admitSearchFirst || admitSearchLast) {
        query = `${admitSearchFirst} ${admitSearchLast}`.trim();
      }
      if (!query) {
        alert('Please enter a search term (First Name, Last Name, or Aadhaar Number).');
        return;
      }

      setIsSearchingAdmit(true);
      const res = await apiClient.get('/patients?q=' + encodeURIComponent(query));
      const results = res?.data || res || [];
      setAdmitSearchResults(Array.isArray(results) ? results : []);
      if (!Array.isArray(results) || results.length === 0) {
        alert('No matching patient records found in hospital database.');
      } else {
        const p = results[0];
        setAdmitTitle(p.title || 'Select');
        setAdmitFirst(p.firstName || '');
        setAdmitMiddle(p.middleName || '');
        setAdmitLast(p.lastName || '');
        setAdmitDobVal(p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-GB') : '');
        setAdmitGender(p.gender ? p.gender.charAt(0) + p.gender.slice(1).toLowerCase() : 'Select');
        setAdmitMobileVal(p.phone || '');
        setAdmitEmailVal(p.email || '');
        setAdmitAddr1(p.addressLine1 || '');
        setAdmitCityVal(p.city || '');
        alert();
      }
    } catch (err: any) {
      alert();
    } finally {
      setIsSearchingAdmit(false);
    }
  };

  const handleSaveAndAdmit = async () => {
    if (!admitFirst || !admitLast || !admitDobVal || !admitMobileVal) {
      alert('Please fill out all mandatory fields (First Name, Last Name, DOB, Mobile Number).');
      return;
    }

    try {
      setIsSubmittingAdmit(true);
      const payload = {
        title: admitTitle !== 'Select' ? admitTitle : undefined,
        firstName: admitFirst,
        middleName: admitMiddle || undefined,
        lastName: admitLast,
        dateOfBirth: admitDobVal,
        gender: admitGender !== 'Select' ? admitGender.toUpperCase() : 'OTHER',
        phone: admitMobileVal,
        email: admitEmailVal || undefined,
        addressLine1: admitAddr1 || undefined,
        city: admitCityVal || undefined,
        state: admitStateVal !== 'Select State' ? admitStateVal : undefined,
        postalCode: admitZipVal || undefined,
        admissionType: admitTypeVal,
        department: admitDeptVal,
        attendingPhysician: admitDoctorVal,
        ward: admitWardVal,
        bedNumber: admitBedVal,
        admissionReason: admitReasonVal || undefined,
        payer: admitPayerVal,
        policyNumber: admitPolicyVal || undefined
      };

      await apiClient.post('/patients/admit', payload);
      alert();
      
      // Reset form
      setAdmitFirst(''); setAdmitLast(''); setAdmitDobVal(''); setAdmitMobileVal(''); setAdmitReasonVal('');
    } catch (err: any) {
      alert();
    } finally {
      setIsSubmittingAdmit(false);
    }
  };

  return (
<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] text-[10.5px] select-text h-full">
              
              {/* Card 1: Search Existing Patient */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#0f4471] text-white px-3 py-2 font-bold font-sans">
                  Search Existing Patient
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-[1.2fr_1.5fr_1.5fr_auto_1.8fr_auto_1.8fr_auto] gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold">Search By <span className="text-red-600">*</span></label>
                      <select 
                        value={admitSearchBy} 
                        onChange={(e) => setAdmitSearchBy(e.target.value as 'Aadhaar' | 'Name')}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      >
                        <option>Name</option>
                        <option>Aadhaar</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">First Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter First Name" 
                        value={admitSearchFirst}
                        onChange={(e) => setAdmitSearchFirst(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter Last Name" 
                        value={admitSearchLast}
                        onChange={(e) => setAdmitSearchLast(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <div className="font-bold text-gray-500 text-center pb-1">OR</div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">Aadhaar Number</label>
                      <input 
                        type="text" 
                        placeholder="Enter Aadhaar Number" 
                        value={admitSearchAadhaar}
                        onChange={(e) => setAdmitSearchAadhaar(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <div className="font-bold text-gray-500 text-center pb-1">OR</div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-semibold">Date of Birth</label>
                      <input 
                        type="text" 
                        placeholder="DD/MM/YYYY" 
                        value={admitSearchDob}
                        onChange={(e) => setAdmitSearchDob(e.target.value)}
                        className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <button onClick={handleSearchExistingPatient} className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1.5 rounded shadow-sm">
                      Search
                    </button>
                  </div>

                  <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded p-2 text-blue-800 text-[10px] flex items-center gap-2 select-none">
                    <span className="text-xs">ℹ️</span>
                    <span>Search to verify if the patient already exists in the system before creating a new record.</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Patient Details */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#cbd8e3]/30 px-3 py-2 border-b border-[#bdcddc] font-bold text-[#0f4471] font-sans">
                  Patient Details
                </div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Title</label>
                    <select value={admitTitle} onChange={(e) => setAdmitTitle(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">First Name <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter First Name" value={admitFirst} onChange={(e) => setAdmitFirst(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Middle Name</label>
                    <input type="text" placeholder="Enter Middle Name" value={admitMiddle} onChange={(e) => setAdmitMiddle(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Last Name <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter Last Name" value={admitLast} onChange={(e) => setAdmitLast(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Date of Birth <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="DD/MM/YYYY" value={admitDobVal} onChange={(e) => setAdmitDobVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Age</label>
                    <input type="text" placeholder="--" value={admitAgeVal} onChange={(e) => setAdmitAgeVal(e.target.value)} className="w-full bg-gray-50 border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Gender <span className="text-red-600">*</span></label>
                    <select value={admitGender} onChange={(e) => setAdmitGender(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Marital Status</label>
                    <select value={admitMarital} onChange={(e) => setAdmitMarital(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Aadhaar Number</label>
                    <input type="text" placeholder="Enter Aadhaar Number" value={admitAadhaarVal} onChange={(e) => setAdmitAadhaarVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Mobile Number <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter Mobile Number" value={admitMobileVal} onChange={(e) => setAdmitMobileVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Email</label>
                    <input type="text" placeholder="Enter Email ID" value={admitEmailVal} onChange={(e) => setAdmitEmailVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Alternate Mobile</label>
                    <input type="text" placeholder="Enter Alternate Number" value={admitAltMobile} onChange={(e) => setAdmitAltMobile(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Blood Group</label>
                    <select value={admitBlood} onChange={(e) => setAdmitBlood(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Nationality</label>
                    <select value={admitNation} onChange={(e) => setAdmitNation(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Indian</option>
                      <option>American</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Religion</label>
                    <select value={admitReligion} onChange={(e) => setAdmitReligion(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Hindu</option>
                      <option>Christian</option>
                      <option>Muslim</option>
                      <option>Sikh</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Language</label>
                    <select value={admitLang} onChange={(e) => setAdmitLang(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Hindi</option>
                      <option>English</option>
                      <option>Spanish</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Address Information */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#cbd8e3]/30 px-3 py-2 border-b border-[#bdcddc] font-bold text-[#0f4471] font-sans">
                  Address Information
                </div>
                <div className="p-4 grid grid-cols-[2fr_2fr_1.5fr] gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Address Line 1 <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter Address Line 1" value={admitAddr1} onChange={(e) => setAdmitAddr1(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Address Line 2</label>
                    <input type="text" placeholder="Enter Address Line 2" value={admitAddr2} onChange={(e) => setAdmitAddr2(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Landmark</label>
                    <input type="text" placeholder="Enter Landmark" value={admitLandmark} onChange={(e) => setAdmitLandmark(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                </div>
                <div className="px-4 pb-4 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">City <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter City" value={admitCityVal} onChange={(e) => setAdmitCityVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">State / Province <span className="text-red-600">*</span></label>
                    <select value={admitStateVal} onChange={(e) => setAdmitStateVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>West Bengal</option>
                      <option>Delhi</option>
                      <option>Maharashtra</option>
                      <option>Florida</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">ZIP / Postal Code <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="Enter ZIP / Postal Code" value={admitZipVal} onChange={(e) => setAdmitZipVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Country <span className="text-red-600">*</span></label>
                    <select value={admitCountryVal} onChange={(e) => setAdmitCountryVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>India</option>
                      <option>USA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 4: Admission Information */}
              <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                <div className="bg-[#cbd8e3]/30 px-3 py-2 border-b border-[#bdcddc] font-bold text-[#0f4471] font-sans">
                  Admission Information
                </div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Admission Type <span className="text-red-600">*</span></label>
                    <select value={admitTypeVal} onChange={(e) => setAdmitTypeVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Emergency</option>
                      <option>Routine</option>
                      <option>Transfer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Visit Type <span className="text-red-600">*</span></label>
                    <select value={admitVisitVal} onChange={(e) => setAdmitVisitVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Inpatient</option>
                      <option>Outpatient</option>
                      <option>Day Care</option>
                    </select>
                  </div>
                   <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Date of Admission <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="DD/MM/YYYY" value={admitDateVal} readOnly disabled className="w-full bg-gray-50 border border-[#bdcddc] rounded px-2 py-1 focus:outline-none cursor-not-allowed select-none text-gray-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Time of Admission <span className="text-red-600">*</span></label>
                    <input type="text" placeholder="00:00 AM/PM" value={admitTimeVal} readOnly disabled className="w-full bg-gray-50 border border-[#bdcddc] rounded px-2 py-1 focus:outline-none cursor-not-allowed select-none text-gray-500" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Referred By</label>
                    <input type="text" placeholder="Enter Referring Doctor / Source" value={admitReferredBy} onChange={(e) => setAdmitReferredBy(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Referring Doctor</label>
                    <div className="flex gap-1">
                      <input type="text" placeholder="" value={admitRefDoctor} onChange={(e) => setAdmitRefDoctor(e.target.value)} className="flex-1 bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                      <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 rounded font-semibold text-gray-500">...</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold">Department <span className="text-red-600">*</span></label>
                    <select value={admitDeptVal} onChange={(e) => setAdmitDeptVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                      <option>Select</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Pulmonology</option>
                      <option>Oncology</option>
                      <option>ENT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Bed / Room</label>
                    <input type="text" placeholder="Enter Bed / Room" value={admitBedRoom} onChange={(e) => setAdmitBedRoom(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Primary Insurance</label>
                    <div className="flex gap-1">
                      <select value={admitInsPrimary} onChange={(e) => setAdmitInsPrimary(e.target.value)} className="flex-1 bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none">
                        <option>Select</option>
                        <option>Blue Cross / Blue Shield</option>
                        <option>Medicare</option>
                      </select>
                      <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 rounded font-semibold text-gray-500">...</button>
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-gray-500 font-semibold">Insurance ID</label>
                    <input type="text" placeholder="Enter Insurance ID" value={admitInsIdVal} onChange={(e) => setAdmitInsIdVal(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 font-semibold">Policy / Member ID</label>
                    <input type="text" placeholder="Enter Policy / Member ID" value={admitPolicyId} onChange={(e) => setAdmitPolicyId(e.target.value)} className="w-full bg-white border border-[#bdcddc] rounded px-2 py-1 focus:outline-none" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 p-4 select-none">
                  <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-gray-700 font-bold">Clear</button>
                  <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-[#0f4471] font-bold">Save & Continue</button>
                  <button onClick={handleSaveAndAdmit} disabled={isSubmittingAdmit} className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-5 py-1.5 rounded shadow-sm disabled:opacity-50">
                    {isSubmittingAdmit ? 'Admitting...' : 'Save & Admit'}
                  </button>
                </div>
              </div>

            </div>
  );
};

export default AdmitPatientTab;
