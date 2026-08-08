import React from 'react';

interface DischargeEncounterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DischargeEncounter: React.FC<DischargeEncounterProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-[#f0f0f0] border-[1px] border-[#a2c5eb] shadow-2xl flex flex-col select-none z-[99995] text-[11px] text-[#333333] font-sans"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '900px',
        height: '600px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
      }}
    >
      {/* Windows 8/10 Style Title Bar */}
      <div 
        className="text-black px-2 flex justify-between items-center cursor-move font-normal text-[13px] border-b border-gray-400"
        style={{ 
          background: 'linear-gradient(to bottom, #dceefc 0%, #a4d1f4 100%)',
          height: '30px' 
        }}
      >
        <div className="flex items-center gap-1.5 font-sans">
          <span className="font-semibold px-1 text-black text-[12px]">Nursing Discharge Checklist - PATIENT DEMO</span>
        </div>
        {/* Windows Style Control Box */}
        <div className="flex">
          <button className="flex items-center justify-center w-[30px] h-[30px] hover:bg-black/10 transition-colors text-[14px]">_</button>
          <button className="flex items-center justify-center w-[30px] h-[30px] hover:bg-black/10 transition-colors text-[14px]">☐</button>
          <button 
            onClick={onClose} 
            className="flex items-center justify-center w-[40px] h-[30px] hover:bg-[#e81123] hover:text-white transition-colors text-[14px]"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center border-b border-gray-300 bg-white p-1 gap-1">
        <button className="p-0.5 border-[2px] border-red-500 bg-white text-blue-600 hover:bg-blue-50 w-6 h-6 flex items-center justify-center font-bold shadow-sm"><span className="text-[14px]">✓</span></button>
        <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-[14px]">💾</button>
        <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 text-blue-800 font-bold w-6 h-6 flex items-center justify-center text-[14px]">↟</button>
        <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-[14px] text-purple-600">✎</button>
        <button className="p-0.5 border border-transparent hover:border-gray-300 hover:bg-gray-100 text-yellow-500 w-6 h-6 flex items-center justify-center text-[14px]">⚠</button>
      </div>

      {/* Context Banner */}
      <div className="flex items-center justify-between p-1 px-2 border-b border-gray-300 bg-white text-[11px]">
        <div className="flex items-center gap-1">
          <span className="text-black font-semibold">*Performed on:</span>
          <input type="text" value="09-Sep-2023" className="border border-gray-400 px-1 py-0.5 w-[90px] outline-none ml-1 shadow-inner bg-white" readOnly />
          <button className="border border-gray-400 px-1 bg-gray-100 flex items-center justify-center h-[22px] w-[20px] shadow-sm text-[10px]">▼</button>
          <input type="text" value="1047" className="border border-gray-400 px-1 py-0.5 w-[50px] outline-none ml-1 shadow-inner bg-white" readOnly />
          <button className="border border-gray-400 px-1 bg-gray-100 flex items-center justify-center h-[22px] w-[20px] shadow-sm text-[10px]">▼</button>
          <span className="ml-1 text-black font-semibold">PDT</span>
        </div>
        <div className="text-black">
          By: TestUser, Supervisor-Nurse
        </div>
      </div>

      {/* Main Body */}
      <div className="flex bg-[#f0f0f0] flex-1 min-h-[150px] overflow-hidden">
        {/* Left Menu */}
        <div className="w-[160px] bg-white border-r border-gray-300 flex flex-col pt-1 shrink-0">
          <div className="bg-[#428bca] text-white px-2 py-1 mx-1 border-[2px] border-red-500 cursor-pointer shadow-sm text-[12px] font-semibold">
            Discharge Checklist
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-2 bg-white flex flex-col gap-3 overflow-y-auto">
          <div 
            className="text-white font-bold text-[18px] px-2 py-1 shadow-sm"
            style={{ background: 'linear-gradient(to bottom, #459df5, #5eaafa)' }}
          >
            Discharge Checklist
          </div>

          {/* Checklist Table */}
          <div>
            <div className="font-bold text-[12px] mb-1 text-black">Discharge Checklist</div>
            <div className="border border-gray-400 bg-[#f8f8f8]">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-[#f0f0f0] border-b border-gray-300">
                    <th className="font-normal w-[50%] border-r border-gray-300 p-1"></th>
                    <th className="font-bold text-center w-[10%] border-r border-gray-300 p-1">N/A</th>
                    <th className="font-bold text-center w-[10%] border-r border-gray-300 p-1">Yes</th>
                    <th className="font-bold w-[30%] p-1">Other:</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b border-gray-300 bg-white">
                    <td className="p-1 border-r border-gray-300 font-semibold text-black">Follow Up Information Provided</td>
                    <td className="p-1 border-r border-gray-300 text-center"></td>
                    <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                    <td className="p-1"></td>
                  </tr>
                  <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                    <td className="p-1 border-r border-gray-300 font-semibold text-black">Discharge Education Provided</td>
                    <td className="p-1 border-r border-gray-300 text-center"></td>
                    <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                    <td className="p-1"></td>
                  </tr>
                  <tr className="border-b border-gray-300 bg-white">
                    <td className="p-1 border-r border-gray-300 font-semibold text-black">Patient Discharge Summary Provided</td>
                    <td className="p-1 border-r border-gray-300 text-center"></td>
                    <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                    <td className="p-1"></td>
                  </tr>
                  <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                    <td className="p-1 border-r border-gray-300 font-semibold text-black">Prescriptions Given</td>
                    <td className="p-1 border-r border-gray-300 text-center"></td>
                    <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                    <td className="p-1"></td>
                  </tr>
                  <tr className="border-b border-gray-300 bg-white">
                    <td className="p-1 border-r border-gray-300 font-semibold text-black">Medications Returned Per Inventory List</td>
                    <td className="p-1 border-r border-gray-300 text-center"></td>
                    <td className="p-1 border-r border-gray-300 text-center bg-[#428bca] text-white font-bold">X</td>
                    <td className="p-1"></td>
                  </tr>
                  <tr className="border-b border-gray-300 bg-[#f4f7fc]">
                    <td className="p-1 border-r border-gray-300 font-bold text-black bg-[#f0f4f9]">Valuables Returned Per Inventory List</td>
                    <td className="p-1 border-r border-gray-300 text-center bg-[#f0f4f9]"></td>
                    <td className="p-1 text-center bg-[#428bca] text-white font-bold border-[2px] border-orange-800 shadow-inner">X</td>
                    <td className="p-1 bg-[#f0f4f9]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section Layout */}
          <div className="flex gap-4 mt-2">
            {/* Accompanied By */}
            <div className="flex-1">
              <div className="font-bold text-[12px] mb-1 text-black">Accompanied By</div>
              <div className="border border-gray-400 p-2 min-h-[95px]">
                <div className="grid grid-cols-3 gap-y-1.5 gap-x-1">
                  {['None', 'Daughter', 'Ministry worker', 'Spouse', 'Son', 'Security', 'Friend', 'Parent/caregiver'].map((label) => (
                    <label key={label} className="flex items-center gap-1.5 cursor-pointer text-black">
                      <input type="checkbox" className="w-[11px] h-[11px] border-gray-500 rounded-none bg-white" /> {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Discharge Transportation */}
            <div className="flex-1">
              <div className="font-bold text-[12px] mb-1 text-black">Discharge Transportation</div>
              <div className="border border-gray-400 p-2 min-h-[95px]">
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-1">
                  {['Ambulance', 'Public transportation', 'Non-ambulance', 'Taxi', 'Personal vehicle'].map((label) => (
                    <label key={label} className="flex items-center gap-1.5 cursor-pointer text-black">
                      <input type="radio" name="trans" className="w-[11px] h-[11px]" /> {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Discharge Comments */}
          <div className="mt-2">
            <div className="font-bold text-[12px] mb-1 text-black">Discharge Comments</div>
            <textarea className="w-full border border-gray-400 h-[100px] outline-none p-1 resize-none bg-white"></textarea>
          </div>
          
          <div className="flex justify-end gap-2 pb-2">
            <button 
              onClick={() => {
                alert('Discharged Encounter successfully.');
                onClose();
              }}
              className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-1.5 rounded-[2px] font-bold"
            >
              Sign
            </button>
            <button 
              onClick={onClose}
              className="border border-[#ccc] hover:bg-[#e6e6e6] text-[#333333] px-8 py-1.5 rounded-[2px] bg-white font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DischargeEncounter;

