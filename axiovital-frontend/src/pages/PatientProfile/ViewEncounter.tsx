import React from 'react';

interface ViewEncounterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ViewEncounter: React.FC<ViewEncounterProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-[#ece9d8] border-[3px] border-[#3b80e8] shadow-2xl flex flex-col select-none z-[99995] text-[11px] text-black"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '870px',
        minHeight: '350px',
        fontFamily: 'Tahoma, sans-serif',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        borderRadius: '4px 4px 0 0'
      }}
    >
      {/* Title Bar */}
      <div 
        className="text-white px-2 py-1 flex justify-between items-center cursor-move font-semibold text-[11.5px] rounded-t-[1px]"
        style={{
          background: 'linear-gradient(to bottom, #76a5ee 0%, #4c87e3 10%, #1e5ac8 50%, #1852c1 70%, #205fd0 90%, #5c93e6 100%)',
          borderBottom: '1px solid #1a3c75'
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-white border border-gray-400 text-blue-700 px-0.5 font-bold scale-90">📄</span>
          <span>Medical Record Request - PATIENT ENCOUNTER DEMO</span>
        </div>
        <button 
          onClick={onClose} 
          className="flex items-center justify-center font-bold text-[10px] text-white hover:bg-[#e43c16] active:bg-[#b02b0c] transition-all outline-none"
          style={{
            background: 'linear-gradient(to bottom, #f37d5f 0%, #e64522 45%, #c52906 50%, #b82300 100%)',
            border: '1px solid #7d1802',
            borderRadius: '3px',
            width: '21px',
            height: '17px',
            textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Form Content Area */}
      <div className="p-3 bg-[#f0f0f0] border-t border-white space-y-3.5">
        {/* Dropdowns */}
        <div className="grid grid-cols-3 gap-x-5 gap-y-3 text-[11px]">
          <div className="flex flex-col space-y-1">
            <span>Event Status</span>
            <select className="border border-[#7f9db9] bg-white px-1 py-0.5 outline-none h-[20px] rounded-none">
              <option>Verified and Pending</option>
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <span>Template</span>
            <select className="border border-[#7f9db9] bg-white px-1 py-0.5 outline-none h-[20px] rounded-none">
              <option>Inpatient/General Transfer Template</option>
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <span>Purpose</span>
            <select className="border border-[#7f9db9] bg-white px-1 py-0.5 outline-none h-[20px] rounded-none">
              <option>Patient Transfer</option>
            </select>
          </div>
        </div>

        {/* Middle Block */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col space-y-3">
            <fieldset className="border border-gray-300 rounded px-2.5 pb-2 pt-1.5 space-y-2 relative">
              <legend className="text-[11px] px-1 text-gray-800">Date Range</legend>
              <div className="flex items-center space-x-1.5">
                <span className="w-[35px] text-right">From:</span>
                <input type="text" defaultValue="09-Sep-2023" className="border border-[#7f9db9] bg-white px-1.5 py-0.5 w-[110px] h-[20px] outline-none text-center" />
              </div>
            </fieldset>
          </div>
          <div className="w-[340px] flex flex-col space-y-3.5 text-[11px]">
            <div className="flex flex-col space-y-1">
              <span>Destination</span>
              <input type="text" defaultValue="VGH Transplant Clinic" className="border border-[#7f9db9] bg-white px-1.5 py-0.5 w-full h-[20px] outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <span>Comment</span>
              <textarea className="border border-[#7f9db9] bg-white px-1.5 py-1 w-full h-[65px] outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2">
          <div className="w-1/2 flex justify-center">
            <button 
              onClick={() => alert('Opening preview...')}
              className="px-8 py-1 bg-gradient-to-b from-[#ffffff] to-[#eaeaea] hover:to-[#dfdfdf] border border-[#7f9db9] text-[11px] font-medium"
              style={{ width: '130px' }}
            >
              Preview
            </button>
          </div>
          <div className="w-1/2 flex justify-center">
            <button 
              onClick={() => {
                alert('Request Sent.');
                onClose();
              }}
              className="px-8 py-1 bg-gradient-to-b from-[#ffffff] to-[#eaeaea] hover:to-[#dfdfdf] border border-[#7f9db9] text-[11px] font-semibold"
              style={{ width: '130px' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ViewEncounter;
