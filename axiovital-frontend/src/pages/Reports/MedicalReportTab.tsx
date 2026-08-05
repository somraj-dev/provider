import React from 'react';

export const MedicalReportTab: React.FC = () => {
  const editFirstName = 'John';
  const editMiddleInitial = 'A';
  const editLastName = 'Doe';
  return (
<div className="flex flex-1 flex-col overflow-auto p-6 bg-gray-100 items-center select-text">
              
              {/* Paper Document Wrapper */}
              <div id="medical-report-sheet" className="w-[800px] bg-white border border-gray-300 shadow-lg p-10 font-serif text-gray-800 text-[12px] leading-relaxed relative">
                
                {/* Print/Download floating controls */}
                <div className="absolute right-4 top-4 flex gap-2 select-none no-print">
                  <button 
                    onClick={() => window.print()}
                    className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-sans font-bold px-4 py-1.5 rounded shadow flex items-center gap-1 text-[11px]"
                  >
                    🖨️ Print Report
                  </button>
                </div>

                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body * { visibility: hidden; }
                    #medical-report-sheet, #medical-report-sheet * { visibility: visible; }
                    #medical-report-sheet { position: absolute; left: 0; top: 0; width: 100%; border: none; shadow: none; padding: 0; }
                    .no-print { display: none !important; }
                  }
                `}} />

                <div className="text-center space-y-1 mb-8">
                  <h1 className="text-3xl font-bold tracking-wide uppercase font-sans border-b-2 border-gray-900 pb-2">Medical Report</h1>
                </div>

                {/* Demographics Block */}
                <div className="grid grid-cols-[80px_1fr_60px_180px] gap-y-3 mb-6 border-b pb-4">
                  <span className="font-bold">Name:</span>
                  <span className="border-b border-gray-400 font-bold px-1 text-[13px]">{editFirstName} ${editMiddleInitial} ${editLastName}</span>
                  <span className="font-bold pl-3">Date:</span>
                  <span className="border-b border-gray-400 px-1 text-[13px]">05/28/2025</span>

                  <span className="font-bold col-span-2">When did your problem start?:</span>
                  <span className="border-b border-gray-400 col-span-2 px-1">11/25/2004</span>

                  <span className="font-bold col-span-2">Describe Problem:</span>
                  <span className="border-b border-gray-400 col-span-2 px-1">Nasal polyps, Allergic rhinitis, Acute sinusitis</span>
                </div>

                {/* Problem Causes */}
                <div className="mb-6 space-y-2">
                  <div className="font-bold">Cause of Current Problem:</div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Car Accident</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Work injury</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> Gradual onset</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Other</label>
                  </div>
                </div>

                {/* Surgery Requirements */}
                <div className="mb-6 space-y-2">
                  <div className="font-bold">Did this Problem require Surgery:</div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> No</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" disabled /> Yes</label>
                    <span className="text-gray-400">Yes Date of Surgery: ______________________</span>
                  </div>
                </div>

                {/* Medical History Grid */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="font-bold border-b border-gray-300 pb-1.5 mb-3">Past Medical History <span className="font-normal text-gray-500 text-[11px]">(Do you have a history of the following problems?)</span></div>
                  <div className="grid grid-cols-3 gap-y-2.5">
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked disabled /> Breathing Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Stroke</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Depression</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Pregnant</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Bone/joint Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Bowel/Bladder</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Heart Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Kidney Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> History of heavy alcohol use</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Current Wound/Skin Problems</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Gallbladder/Liver</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Drug use</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Pacemaker</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Electrical implants</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Smoking</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Tumor/Cancer</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Anxiety attacks</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Headaches</label>

                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Diabetes</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Sleep Apnea</label>
                  </div>
                </div>

                {/* Surgeries / Hospitalizations */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-1.5 mb-2 font-bold">
                    <span>Surgeries/Hospitalizations</span>
                    <label className="flex items-center gap-1.5 font-normal"><input type="checkbox" defaultChecked disabled /> No Surgeries</label>
                  </div>
                  <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 text-center text-gray-500 font-bold border-b pb-1 mb-2">
                    <span>Surgeries/Hospitalizations</span>
                    <span>Year</span>
                    <span>Complications</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 border-b border-gray-100 pb-1 text-center">
                      <span>—</span>
                      <span>—</span>
                      <span>—</span>
                    </div>
                  </div>
                </div>

                {/* Medications List */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-1.5 mb-2 font-bold">
                    <span>Medications <span className="font-normal text-gray-500 text-[11px]">(Please list Medications that you are taking)</span></span>
                    <label className="flex items-center gap-1.5 font-normal"><input type="checkbox" defaultChecked disabled /> No Medication</label>
                  </div>
                  <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 text-center text-gray-500 font-bold border-b pb-1 mb-2">
                    <span>Medication(s)</span>
                    <span>Dose</span>
                    <span>Reason for Medication</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 border-b border-gray-100 pb-1 text-center">
                      <span>—</span>
                      <span>—</span>
                      <span>—</span>
                    </div>
                  </div>
                </div>

                {/* Allergies Block */}
                <div className="border border-gray-400 p-4 mb-6 rounded-sm">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-1.5 mb-2 font-bold">
                    <span>Allergies</span>
                    <label className="flex items-center gap-1.5 font-normal"><input type="checkbox" disabled /> No Known allergies</label>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Latex</span>
                      <label className="flex items-center gap-1"><input type="radio" name="latex" disabled /> Yes</label>
                      <label className="flex items-center gap-1"><input type="radio" name="latex" defaultChecked disabled /> No</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-700">Iodine</span>
                      <label className="flex items-center gap-1"><input type="radio" name="iodine" defaultChecked disabled /> Yes</label>
                      <label className="flex items-center gap-1"><input type="radio" name="iodine" disabled /> No</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Bromine</span>
                      <label className="flex items-center gap-1"><input type="radio" name="bromine" disabled /> Yes</label>
                      <label className="flex items-center gap-1"><input type="radio" name="bromine" defaultChecked disabled /> No</label>
                    </div>
                    <div className="col-span-3 flex gap-2 items-center mt-1">
                      <span className="font-bold">Other:</span>
                      <span className="border-b border-gray-400 flex-1 px-1 font-semibold">Penicillin (Severe Hives)</span>
                    </div>
                  </div>
                </div>

                {/* Footer and Signatures */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-4">
                    <span className="font-bold">Do you have any religious/cultural views that will affect your treatment?</span>
                    <label className="flex items-center gap-1"><input type="checkbox" defaultChecked disabled /> No</label>
                    <label className="flex items-center gap-1"><input type="checkbox" disabled /> Yes</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold">Additional comment(Reading or Memory Problem):</span>
                    <span className="border-b border-gray-400 flex-1"></span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr_60px_200px] gap-x-4 pt-6">
                    <span className="font-bold">Signature:</span>
                    <span className="border-b border-gray-400"></span>
                    <span className="font-bold pl-4">Date:</span>
                    <span className="border-b border-gray-400"></span>
                  </div>
                </div>

              </div>

            </div>
  );
};

export default MedicalReportTab;
