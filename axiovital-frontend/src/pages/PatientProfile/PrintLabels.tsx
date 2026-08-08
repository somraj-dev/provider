import React from 'react';

interface PrintLabelsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintLabels: React.FC<PrintLabelsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white border-[4px] border-[#a2c5eb] shadow-2xl rounded-[3px] flex flex-col select-none z-[99995] text-[11px] text-gray-800 font-sans"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        minHeight: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
      }}
    >
      {/* Windows 7 Style Title Bar */}
      <div 
        className="text-[#1e395b] px-1.5 py-1 flex justify-between items-center cursor-move font-normal text-[11.5px] border-b border-[#96b4d3]"
        style={{
          background: 'linear-gradient(to bottom, #ebf3fc 0%, #d2e4f9 40%, #c1dbf6 50%, #b1d0f4 100%)',
          textShadow: '0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        <div className="flex items-center gap-1.5 font-sans">
          <span className="font-semibold text-gray-800 text-[11px]">Charting for: PATIENT DEMO</span>
        </div>
        <button 
          onClick={onClose} 
          className="flex items-center justify-center font-bold text-[10px] text-white transition-all shadow-sm outline-none"
          style={{
            background: 'linear-gradient(to bottom, #f18d7f 0%, #d85040 50%, #c63322 51%, #d74e3c 100%)',
            border: '1px solid #992c1e',
            borderRadius: '3px',
            width: '45px',
            height: '18px',
            textShadow: '0 -1px 0 rgba(0,0,0,0.4)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 1px rgba(0,0,0,0.2)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Form Body */}
      <div className="p-3.5 space-y-3.5 bg-white text-[11px] overflow-y-auto">
        <div className="space-y-3 font-sans text-gray-800">
          {/* Performed Date/Time */}
          <div className="flex items-center">
            <span className="w-[140px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Performed date / time :</span>
            <input type="text" defaultValue="07/10/2017" className="border border-[#7f9db9] px-1 py-0.5 w-[90px] text-center text-[10.5px] outline-none bg-white" />
            <span className="text-gray-700 font-normal ml-2">CDT</span>
          </div>

          {/* Performed By */}
          <div className="flex items-center">
            <span className="w-[140px] text-right pr-2 font-normal"><span className="text-red-600 mr-0.5">*</span>Performed by :</span>
            <div className="flex items-center max-w-[280px] flex-1 bg-white">
              <input type="text" defaultValue="TTP , Nurse" className="border border-[#7f9db9] px-1.5 py-0.5 w-full outline-none text-[10.5px]" />
              <button className="border-y border-r border-[#7f9db9] bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 flex items-center justify-center">🔍</button>
            </div>
          </div>

          {/* Lot Number & Manufacturer */}
          <div className="border border-[#cb7a75] p-3 bg-white space-y-2.5 rounded-xs shadow-3xs" style={{ outline: '1px solid #cb7a75' }}>
            <div className="flex items-center">
              <span className="w-[140px] text-right pr-2 font-normal text-gray-700"><span className="text-red-600 mr-0.5">*</span>Lot Number :</span>
              <input type="text" className="border border-[#7f9db9] bg-[#ffffd0] px-1.5 py-0.5 w-[160px] outline-none text-[10.5px]" />
            </div>
            <div className="flex items-center">
              <span className="w-[140px] text-right pr-2 font-normal text-gray-700"><span className="text-red-600 mr-0.5">*</span>Manufacturer :</span>
              <select className="border border-[#7f9db9] bg-[#ffffd0] px-0.5 py-0.5 w-[250px] outline-none text-[10.5px]">
                <option></option>
                <option>GlaxoSmithKline Biologicals</option>
                <option>Sanofi Pasteur</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 p-3 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={() => {
            alert('Labels printed successfully.');
            onClose();
          }}
          className="bg-[#2c5b96] hover:bg-[#1a4478] text-white px-6 py-1 rounded-sm font-bold"
        >
          Print
        </button>
        <button 
          onClick={onClose}
          className="border border-gray-400 hover:bg-gray-100 text-gray-800 px-6 py-1 rounded-sm bg-white font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PrintLabels;

