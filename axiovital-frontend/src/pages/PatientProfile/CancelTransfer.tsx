import React from 'react';

interface CancelTransferProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const CancelTransfer: React.FC<CancelTransferProps> = ({ 
  isOpen, 
  onClose, 
  title = "Facility Transfer", 
  message = "This patient currently has a pending transfer to LGH HOPE Centre/LGH HOPE Centre/LGH MIU//\nwith an estimated complete date and time of .\nWould you like to complete the pending transfer?" 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-[#f0f0f0] border-[1px] border-[#a0a0a0] shadow-xl flex flex-col select-none z-[99995] text-[12px] text-gray-800 font-sans"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        height: '200px'
      }}
    >
      {/* Title Bar */}
      <div 
        className="px-2 py-1 flex justify-between items-center cursor-move text-black"
        style={{
          background: 'linear-gradient(to bottom, #d6e2f1 0%, #b8cde4 100%)',
          borderBottom: '1px solid #99b4d1'
        }}
      >
        <span className="font-normal">{title}</span>
        <button 
          onClick={onClose}
          className="flex items-center justify-center font-bold text-[10px] bg-red-600 text-white w-6 h-4 border border-[#8a2924] hover:bg-red-500 rounded-sm outline-none"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex p-4 gap-4 bg-white flex-1 overflow-y-auto">
        <div className="shrink-0 pt-1">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" fill="url(#blue-grad)" stroke="#1c4779" strokeWidth="1" />
            <path d="M12 6c-2.2 0-3.5 1.5-3.5 3 h2c0-1 1-1.5 1.5-1.5 c.8 0 1.5.5 1.5 1.5 c0 1.5-2 1.5-2 3.5 v.5 h2 v-.3 c0-1.5 2-2 2-3.7 C15.5 7 14 6 12 6zm-1.5 10 h3 v3 h-3 v-3z" fill="white" />
            <defs>
              <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#679be0" />
                <stop offset="1" stopColor="#1a5399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex-1 text-[12px] whitespace-pre-line text-[#333]">
          {message}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center gap-2 p-3 bg-[#f0f0f0] border-t border-[#dfdfdf]">
        <button 
          onClick={() => {
            alert('Action completed successfully.');
            onClose();
          }}
          className="min-w-[75px] px-4 py-1 bg-white border border-[#0060a6] text-black hover:bg-[#e6f0fa] hover:border-[#003c74] rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0060a6] font-bold"
        >
          Yes
        </button>
        <button 
          onClick={onClose}
          className="min-w-[75px] px-4 py-1 bg-white border border-[#8f8f8f] text-black hover:bg-[#e5f1fb] hover:border-[#0078d7] rounded shadow-sm outline-none font-semibold"
        >
          No
        </button>
        <button 
          onClick={onClose}
          className="min-w-[75px] px-4 py-1 bg-white border border-[#8f8f8f] text-black hover:bg-[#e5f1fb] hover:border-[#0078d7] rounded shadow-sm outline-none font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CancelTransfer;

