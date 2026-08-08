import React from 'react';

interface BedTransferProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BedTransfer: React.FC<BedTransferProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-[#f0f4f9] border-[1px] border-[#a2c5eb] shadow-2xl rounded-[3px] flex flex-col select-none z-[99995] text-[11px] text-[#333333] font-sans overflow-hidden"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '550px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
      }}
    >
      {/* Title Bar */}
      <div 
        className="text-[#1e395b] px-2 py-1.5 flex justify-between items-center cursor-move font-normal text-[12px] border-b border-[#96b4d3]"
        style={{
          background: 'linear-gradient(to bottom, #ebf3fc 0%, #d2e4f9 40%, #c1dbf6 50%, #b1d0f4 100%)',
          textShadow: '0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        <div className="flex items-center gap-1.5 font-sans">
          <span className="font-semibold text-gray-800 text-[12px]">Bed Transfer</span>
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
      <div className="p-4 space-y-4 bg-white flex-1 overflow-y-auto relative">
        <div className="space-y-4">
          {/* Top Section */}
          <div className="flex gap-4 p-2 bg-[#f8fafd] border border-gray-200">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-[120px] text-right"><span className="text-red-500">*</span> Transfer Date / Time :</div>
              <input type="text" value="07/10/2017" readOnly className="border border-gray-400 px-2 py-1 w-[100px] outline-none bg-white" />
              <span>•</span>
              <input type="text" value="1414" readOnly className="border border-gray-400 px-2 py-1 w-[60px] outline-none bg-white" />
              <span>• CDT</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 pt-0 pb-3">
            <div className="w-[120px] text-right"><span className="text-red-500">*</span> Performed By :</div>
            <div className="flex items-center border border-gray-400 bg-white">
              <input type="text" value="TTP , Nurse" readOnly className="px-2 py-1 w-[200px] outline-none border-none" />
              <div className="px-2 border-l border-gray-400 bg-gray-100 cursor-pointer">🔍</div>
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="border border-gray-200 p-3 pt-4 relative mt-4">
            <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">Patient Information</div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex items-center gap-2">
                <div className="w-[100px] text-right"><span className="text-red-500">*</span> Patient ID :</div>
                <div className="flex items-center border border-gray-400 bg-white">
                  <input type="text" value="TTPTEST" readOnly className="px-2 py-1 w-[120px] outline-none border-none" />
                  <div className="px-2 border-l border-gray-400 bg-gray-100 cursor-pointer">🔍</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[100px] text-right"><span className="text-red-500">*</span> Patient Name :</div>
                <input type="text" value="PATIENT02" readOnly className="border border-gray-400 px-2 py-1 w-[200px] outline-none bg-white" />
              </div>
            </div>
          </div>

          {/* Current Bed Information */}
          <div className="border border-gray-200 p-3 pt-4 relative mt-4">
            <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">Current Bed Information</div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex items-center gap-2">
                <div className="w-[120px] text-right"><span className="text-red-500">*</span> Current Department :</div>
                <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                  <option>General Medicine</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[120px] text-right"><span className="text-red-500">*</span> Transfer Type :</div>
                <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                  <option>Within Hospital</option>
                </select>
              </div>
            </div>
          </div>

          {/* New Bed Information */}
          <div className="border border-gray-200 p-3 pt-4 relative mt-4">
            <div className="absolute -top-2.5 left-2 bg-white px-1 font-semibold text-[#164d6e]">New Bed Information</div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex items-center gap-2">
                <div className="w-[120px] text-right"><span className="text-red-500">*</span> New Department :</div>
                <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                  <option>Cardiology</option>
                </select>
              </div>
              <div className="col-start-1 flex items-center gap-2">
                <div className="w-[120px] text-right"><span className="text-red-500">*</span> New Ward :</div>
                <select className="border border-gray-400 px-1 py-1 w-[200px] outline-none bg-white">
                  <option>Cardiac Ward - 1</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end gap-3 mt-4 pt-2 pb-2">
          <button 
            onClick={() => {
              alert('Bed Transferred Successfully.');
              onClose();
            }}
            className="bg-[#2c5b96] hover:bg-[#1a4478] text-white px-6 py-1.5 rounded-sm outline-none font-bold shadow-xs"
          >
            Save
          </button>
          <button 
            onClick={onClose}
            className="border border-gray-400 hover:bg-gray-100 text-gray-800 px-6 py-1.5 rounded-sm outline-none bg-white font-bold shadow-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BedTransfer;

