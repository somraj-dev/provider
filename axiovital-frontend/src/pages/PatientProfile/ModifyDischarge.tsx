import React from 'react';

interface ModifyDischargeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModifyDischarge: React.FC<ModifyDischargeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-[#f0f4f9] border-[1px] border-[#a2c5eb] shadow-2xl rounded-[3px] flex flex-col select-none z-[99995] text-[11px] text-[#333333] font-sans"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        minHeight: '300px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
      }}
    >
      <div 
        className="text-[#1e395b] px-2 py-1.5 flex justify-between items-center cursor-move font-normal text-[12px] border-b border-[#96b4d3]"
        style={{ background: 'linear-gradient(to bottom, #ebf3fc 0%, #d2e4f9 100%)' }}
      >
        <span className="font-semibold text-gray-800">Modify Discharge</span>
        <button onClick={onClose} className="text-red-600 font-bold hover:text-red-800 text-[14px]">✕</button>
      </div>
      <div className="p-4 bg-white flex-1 space-y-4">
        <h3 className="text-blue-800 font-bold text-[13px] border-b pb-1">Modify Discharge Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Modified Discharge Disposition:</label>
            <select className="border p-1 w-full bg-white"><option>Home / Community Care</option></select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Discharge Date / Time:</label>
            <input type="text" className="border p-1 bg-white outline-none w-full" defaultValue="09-Sep-2023 10:47" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 p-3 bg-gray-50 border-t">
        <button onClick={() => { alert('Discharge modified successfully.'); onClose(); }} className="bg-[#2c5b96] hover:bg-[#1a4478] text-white px-6 py-1 rounded-sm font-bold">Save</button>
        <button onClick={onClose} className="border border-gray-400 hover:bg-gray-100 text-gray-800 px-6 py-1 rounded-sm bg-white font-bold">Cancel</button>
      </div>
    </div>
  );
};
export default ModifyDischarge;
