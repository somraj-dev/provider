import React from 'react';

interface CancelDischargeProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const CancelDischarge: React.FC<CancelDischargeProps> = ({ isOpen, onClose, title = "Cancel Discharge" }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-[#ece9d8] border-[2px] border-[#a0a0a0] shadow-2xl flex flex-col select-none z-[99995] text-[11px] text-black font-sans"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '500px',
        borderRightColor: '#404040',
        borderBottomColor: '#404040',
        borderTopColor: '#ffffff',
        borderLeftColor: '#ffffff'
      }}
    >
      {/* Title Bar */}
      <div 
        className="px-2 py-1 flex justify-between items-center cursor-move text-white"
        style={{
          background: 'linear-gradient(to right, #0A246A 0%, #A6CAF0 100%)',
        }}
      >
        <div className="flex items-center gap-1">
          <span className="text-red-500 font-bold text-[14px]">X</span>
          <span className="font-normal text-[12px]">{title}</span>
        </div>
        <div className="flex gap-1">
          <button className="bg-[#ece9d8] text-black border-2 border-white border-b-gray-500 border-r-gray-500 w-4 h-4 flex items-center justify-center font-bold text-[8px] leading-none">-</button>
          <button className="bg-[#ece9d8] text-black border-2 border-white border-b-gray-500 border-r-gray-500 w-4 h-4 flex items-center justify-center font-bold text-[8px] leading-none">☐</button>
          <button onClick={onClose} className="bg-[#ece9d8] text-black border-2 border-white border-b-gray-500 border-r-gray-500 w-4 h-4 flex items-center justify-center font-bold text-[10px] leading-none">✕</button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-3 bg-[#ece9d8] flex-1 overflow-y-auto">
        <div className="bg-white border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white p-3 space-y-4">
          
          {/* Top Section */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-0.5">
              <label>Complete Reg?:</label>
              <select className="border border-gray-400 p-0.5 bg-[#a3fba3] w-full"><option>Yes</option></select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label>Medical Record Number:</label>
              <input type="text" value="760010021" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label>Encounter Number:</label>
              <input type="text" value="7600000010104" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label>Full Name:</label>
              <input type="text" value="REG-FOUNDATION, SU!" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full text-black font-bold" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 relative mt-2">
            <span className="absolute -top-2 left-4 bg-white px-1 text-gray-600">Discharge Information</span>
          </div>

          {/* Discharge Information Section */}
          <div className="grid grid-cols-4 gap-4 pt-2">
            <div className="flex flex-col gap-0.5">
              <label>Discharge Disposition:</label>
              <select className="border border-gray-400 p-0.5 w-full font-bold text-gray-700 bg-white"><option>Discharged Home wit...</option></select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label>Discharge Date:</label>
              <input type="text" value="14-Feb-2018" readOnly className="border border-gray-400 p-0.5 bg-[#f0f0f0] w-full" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 relative mt-2">
            <span className="absolute -top-2 left-4 bg-white px-1 text-gray-600">Location</span>
          </div>

          {/* Location Section */}
          <div className="grid grid-cols-5 gap-4 pt-2 items-end">
            <div className="flex flex-col gap-0.5">
              <label>Building:</label>
              <select className="border border-gray-400 p-0.5 w-full bg-[#ffffcc]"><option>LGH Lions Gate</option></select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label>Unit/Clinic:</label>
              <select className="border border-gray-400 p-0.5 w-full bg-[#ffffcc]"><option>LGH Endoscopy</option></select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 p-2 bg-[#ece9d8]">
        <button 
          onClick={() => {
            alert('Action completed successfully.');
            onClose();
          }}
          className="bg-[#ece9d8] border-2 border-white border-b-gray-500 border-r-gray-500 px-6 py-0.5 shadow-sm min-w-[80px]"
        >
          Complete
        </button>
        <button 
          onClick={onClose}
          className="bg-[#ece9d8] border-2 border-white border-b-gray-500 border-r-gray-500 px-6 py-0.5 shadow-sm min-w-[80px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CancelDischarge;

export const CancelPendingDischarge = CancelDischarge;
