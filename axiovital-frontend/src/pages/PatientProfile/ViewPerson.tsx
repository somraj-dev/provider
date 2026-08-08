import React from 'react';

interface ViewPersonProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ViewPerson: React.FC<ViewPersonProps> = ({ isOpen, onClose }) => {
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
        <span className="font-semibold text-gray-800">View Person</span>
        <button onClick={onClose} className="text-red-600 font-bold hover:text-red-800 text-[14px]">✕</button>
      </div>
      <div className="p-4 bg-white flex-1 space-y-4">
        <h3 className="text-blue-800 font-bold text-[13px] border-b pb-1">Person Profile Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Full Name:</span>
            <p className="text-[12px] text-black">BUILD, SALLY</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Date of Birth:</span>
            <p className="text-[12px] text-black">02-Feb-1982</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Gender:</span>
            <p className="text-[12px] text-black">Female</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Primary Language:</span>
            <p className="text-[12px] text-black">English</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end p-3 bg-gray-50 border-t">
        <button onClick={onClose} className="border border-gray-400 hover:bg-gray-100 text-gray-800 px-6 py-1 rounded-sm bg-white font-bold">Close</button>
      </div>
    </div>
  );
};
export default ViewPerson;
