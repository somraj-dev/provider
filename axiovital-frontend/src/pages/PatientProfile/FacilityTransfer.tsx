import React from 'react';

interface FacilityTransferProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FacilityTransfer: React.FC<FacilityTransferProps> = ({ isOpen, onClose }) => {
  const [isRecipientTransferOpen, setIsRecipientTransferOpen] = React.useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Inter-Hospital Patient Transfer Screen */}
      {!isRecipientTransferOpen && (
        <div className="fixed inset-0 bg-white z-[99999] flex flex-col font-sans select-none overflow-hidden border-[3px] border-[#92bced]">
          {/* Title Bar */}
          <div 
            className="flex justify-between items-center px-2 py-1"
            style={{ background: 'linear-gradient(to bottom, #d6eaf8 0%, #a4cbf1 100%)', borderBottom: '1px solid #7eaadb' }}
          >
            <div className="text-[#204060] font-bold text-[14px] flex items-center gap-1">
              Inter-Hospital Patient Transfer
            </div>
            <button 
              onClick={onClose}
              className="bg-[#d9534f] hover:bg-[#c9302c] text-white w-[45px] h-[22px] flex items-center justify-center font-bold shadow-inner rounded-[2px] text-[12px] border border-[#b52b27]"
            >
              ✕
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f4f8fc] text-[12px] text-[#333333]">
            <div className="max-w-[1050px] mx-auto bg-white border border-[#a6c9e2] shadow-sm p-4">
              
              {/* Top Meta Info */}
              <div className="flex flex-col gap-3 pl-8 pb-4">
                <div className="flex items-center gap-1">
                  <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Transfer Date / Time :</span>
                  <div className="flex items-center ml-2">
                    <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[100px] outline-none bg-white text-center shadow-inner text-[11px]" />
                    <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] hover:bg-[#d5e4f2]">▼</button>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <input type="text" value="1414" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[60px] outline-none bg-white text-center shadow-inner text-[11px]" />
                    <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                      <button className="h-[11px] w-[16px] flex items-center justify-center text-[7px] hover:bg-[#d5e4f2]">▼</button>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Performed By :</span>
                  <div className="flex ml-2 shadow-inner border border-[#a9c6e2] bg-white">
                    <input type="text" value="TTP , Nurse" readOnly className="px-2 py-1 w-[200px] outline-none border-none text-[11px]" />
                    <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                      🔍
                    </button>
                  </div>
                </div>
              </div>

              {/* Current (Sending) Hospital Information */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Current (Sending) Hospital Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Name :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>City Care Multispeciality Hospital</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Code :</span>
                    <input type="text" value="CCH001" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Department :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>General Medicine</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-1 row-span-2">
                    <span className="w-[130px] text-right pt-1"><span className="text-red-600 font-bold">*</span> Address :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[55px] resize-none shadow-inner text-[11px]" readOnly defaultValue="123 Health Street,&#10;Chicago, IL 60601, USA"></textarea>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Contact Person :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Ramesh Sharma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Phone Number :</span>
                    <input type="text" value="+1 312 555 0198" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Email :</span>
                    <input type="text" value="transferdesk@citycarehospital.com" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                </div>
              </div>

              {/* Receiving Hospital Information */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Receiving Hospital Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Name :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>Metro Advanced Hospital</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Hospital Code :</span>
                    <input type="text" value="MAH002" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Department :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>Cardiology</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-1 row-span-2">
                    <span className="w-[130px] text-right pt-1"><span className="text-red-600 font-bold">*</span> Address :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[55px] resize-none shadow-inner text-[11px]" readOnly defaultValue="456 Wellness Avenue,&#10;Chicago, IL 60611, USA"></textarea>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Contact Person :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Anita Verma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Phone Number :</span>
                    <input type="text" value="+1 312 555 0456" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[130px] text-right"><span className="text-red-600 font-bold">*</span> Email :</span>
                    <input type="text" value="admissions@metrohospital.com" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" readOnly />
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Transfer Details</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Reason for Transfer :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                        <option>Advanced Level of Care Required</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Mode of Transfer :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                        <option>Ambulance - ALS</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Priority :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                        <option>High</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Accompanied By :</span>
                      <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                        <option>Nurse</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[150px] text-right">Accompanied Personnel :</span>
                      <input type="text" defaultValue="Nurse, Paramedic" className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px]" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      <span className="w-[160px] text-right"><span className="text-red-600 font-bold">*</span> Estimated Departure Time :</span>
                      <div className="flex items-center ml-2">
                        <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <input type="text" value="1500" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <span className="ml-2">CDT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-[160px] text-right"><span className="text-red-600 font-bold">*</span> Estimated Arrival Time :</span>
                      <div className="flex items-center ml-2">
                        <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <input type="text" value="1600" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                        <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                          <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                          <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                        </div>
                      </div>
                      <span className="ml-2">CDT</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="w-[160px] text-right pt-1">Comments :</span>
                      <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[70px] resize-none shadow-inner text-[11px]" defaultValue="Patient requires advanced cardiac&#10;intervention not available in current hospital."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Clinical Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[140px] text-right">Condition at Transfer :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>Stable</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-1 row-span-2">
                    <span className="w-[140px] text-right pt-1">Treatment Given :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[45px] resize-none shadow-inner text-[11px]" readOnly defaultValue="IV Fluids, Antibiotics, Oxygen Support,&#10;Pain Management"></textarea>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="w-[140px] text-right pt-1">Vital Signs Summary :</span>
                    <textarea className="border border-[#a9c6e2] px-2 py-1 flex-1 outline-none ml-2 h-[45px] resize-none shadow-inner text-[11px]" readOnly defaultValue="BP: 120/80 mmHg, Pulse: 88 bpm,&#10;SpO2: 96% (RA), Temp: 98.6°F"></textarea>
                  </div>
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="w-[140px] text-right">Special Precautions :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>Fall Risk</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transfer Authorization */}
              <div className="mt-2 pb-3">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Transfer Authorization</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Requested By :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Ramesh Sharma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Approved By :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Mehta, P." readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Requested Date / Time :</span>
                    <div className="flex items-center ml-2">
                      <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <input type="text" value="1200" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right"><span className="text-red-600 font-bold">*</span> Approved Date / Time :</span>
                    <div className="flex items-center ml-2">
                      <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <input type="text" value="1245" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                </div>
              </div>

              {/* Handover Information */}
              <div className="mt-2 pb-8">
                <div className="text-[#2a6496] font-bold mb-2 border-b border-[#d6eaf8] pb-1">Handover Information</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover Completed :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>Yes</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover To :</span>
                    <div className="flex border border-[#a9c6e2] shadow-inner bg-white flex-1 ml-2">
                      <input type="text" value="Dr. Anita Verma" readOnly className="px-2 py-1 w-full outline-none border-none text-[11px]" />
                      <button className="bg-[#eef3f8] border-l border-[#a9c6e2] px-2 hover:bg-[#d5e4f2] text-[#428bca] font-bold flex items-center justify-center">
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover Method :</span>
                    <select className="border border-[#a9c6e2] px-1 py-1 flex-1 outline-none ml-2 shadow-inner text-[11px] bg-white">
                      <option>Verbal</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-[150px] text-right">Handover Time :</span>
                    <div className="flex items-center ml-2">
                      <input type="text" value="07/10/2017" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[90px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <input type="text" value="1450" readOnly className="border border-[#a9c6e2] px-2 py-1 w-[55px] outline-none text-center shadow-inner text-[11px]" />
                      <div className="flex flex-col border border-[#a9c6e2] border-l-0 bg-[#eef3f8]">
                        <button className="h-[11px] w-[16px] text-[7px] border-b border-[#a9c6e2] hover:bg-[#d5e4f2]">▲</button>
                        <button className="h-[11px] w-[16px] text-[7px] hover:bg-[#d5e4f2]">▼</button>
                      </div>
                    </div>
                    <span className="ml-2">CDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="w-full p-2 bg-[#f4f8fc] flex justify-end gap-3 z-10 border-t border-gray-200">
            <button 
              onClick={() => {
                setIsRecipientTransferOpen(true);
              }}
              className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-1.5 rounded-[2px] outline-none font-bold text-[12px] border border-[#2e6da4] shadow-sm"
            >
              Save
            </button>
            <button 
              onClick={onClose}
              className="border border-[#ccc] hover:bg-[#e6e6e6] text-[#333333] px-8 py-1.5 rounded-[2px] outline-none bg-white font-bold text-[12px] shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recipient Transfer Screen */}
      {isRecipientTransferOpen && (
        <div className="fixed inset-0 bg-white z-[99999] flex flex-col font-sans select-none overflow-y-auto pt-2">
          {/* Main Content Area */}
          <div className="mx-4 mb-4 border border-[#c4c4c4] bg-white mt-1 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <div className="p-5 pt-3">
              <h2 className="text-[#0f4a86] text-[22px] font-bold mb-5 tracking-tight">Recipient Transfer</h2>
              
              <div className="grid grid-cols-[140px_1fr] gap-y-2.5 text-[14px] mb-5 text-black">
                <div>CRID:</div>
                <div className="filter blur-sm bg-gray-200 w-[200px] h-5 rounded"></div>
                
                <div>Date of Birth:</div>
                <div className="filter blur-sm bg-gray-200 w-[150px] h-5 rounded"></div>
                
                <div>FROM Center:</div>
                <div className="filter blur-sm bg-gray-200 w-[500px] h-5 rounded"></div>
                
                <div>TO Center:</div>
                <div className="filter blur-sm bg-gray-200 w-[500px] h-5 rounded"></div>
              </div>

              {/* TO Center Data Fieldset */}
              <fieldset className="border border-[#007a68] border-opacity-30 p-5 pt-3 mb-4 text-[14px] text-black">
                <legend className="text-[#007a68] px-2 bg-white font-normal ml-3">TO Center Data</legend>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-2">
                    <label>Confirmed recipient with transferring FROM Center:</label>
                    <input type="checkbox" className="w-[13px] h-[13px] border-gray-400" />
                  </div>

                  <div className="flex items-center gap-2">
                    <label>Agreed upon effective date: <span className="text-[13px]">(date the transferring TO center assumes responsibility for recipient)</span></label>
                    <div className="flex items-center">
                      <input type="text" className="border border-[#7c9bc0] px-2 py-1 w-[200px] h-[26px] outline-none shadow-inner bg-white" />
                      <button className="bg-[#e4ebf1] border border-l-0 border-[#7c9bc0] px-2 h-[26px] flex items-center justify-center hover:bg-[#d0dbe6]">
                        📅
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label>Was a duplicate CRID created at your center:</label>
                    <div className="flex items-center gap-3 ml-2">
                      <label className="flex items-center gap-1.5"><input type="radio" name="dup_crid" className="w-3.5 h-3.5" /> Yes</label>
                      <label className="flex items-center gap-1.5"><input type="radio" name="dup_crid" className="w-3.5 h-3.5" /> No</label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4">
                    <label className="text-gray-600">Duplicate CRID:</label>
                    <input type="text" className="border border-[#7c9bc0] px-2 py-1 w-[200px] h-[26px] outline-none shadow-inner bg-white" />
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <label>Reason for transfer:</label>
                    <div className="flex flex-col gap-1.5 pl-8 mt-1">
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Center closed</label>
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Center split / merged</label>
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Follow-up care</label>
                      <label className="flex items-center gap-2"><input type="radio" name="reason" className="w-[13px] h-[13px]" /> Subsequent infusion</label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-8 pt-1">
                    <label className="text-gray-500">Date of subsequent infusion:</label>
                    <div className="flex items-center">
                      <input type="text" className="border border-[#7c9bc0] bg-[#f0f0f0] px-2 py-1 w-[150px] h-[26px] outline-none shadow-inner" disabled />
                      <button className="bg-[#8db4e2] border border-l-0 border-[#7c9bc0] px-2 h-[26px] flex items-center justify-center opacity-60 cursor-not-allowed">
                        📅
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3">
                    <label>Data Manager agrees that their center will assume reporting responsibility:</label>
                    <input type="checkbox" className="w-[13px] h-[13px] border-gray-400" />
                  </div>
                </div>
              </fieldset>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-center gap-[18px] mt-6 pb-2 border-t border-gray-200 pt-5">
                <button 
                  onClick={() => {
                    alert('Submitted Successfully.');
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#eaf2f8] to-[#9dbce0] border border-[#6f90b2] px-10 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[130px] font-bold"
                >
                  ▶ Submit
                </button>
                <button 
                  onClick={() => setIsRecipientTransferOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#f8f8f8] to-[#d0d0d0] border border-[#999999] px-6 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[150px] font-semibold"
                >
                  ▶ Return to My Work
                </button>
                <div className="border-[3px] border-[#6b2c6b] p-[2px]">
                  <button 
                    onClick={() => setIsRecipientTransferOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#eaf2f8] to-[#9dbce0] border border-[#6f90b2] px-8 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[150px] font-semibold"
                  >
                    ▶ Cancel Transfer
                  </button>
                </div>
                <button 
                  onClick={() => setIsRecipientTransferOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#eaf2f8] to-[#9dbce0] border border-[#6f90b2] px-8 py-1.5 rounded-[12px] text-[13px] hover:brightness-95 shadow-[0_1px_2px_rgba(0,0,0,0.2)] text-black min-w-[150px] font-semibold"
                >
                  ▶ Decline Transfer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FacilityTransfer;

