import React from 'react';

interface ProcessAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProcessAlert: React.FC<ProcessAlertProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white border-[4px] border-[#a2c5eb] shadow-2xl rounded-[3px] flex flex-col select-none z-[99995] text-[12px] text-black font-sans"
      style={{ 
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '720px',
        minHeight: '200px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
      }}
    >
      {/* Title Bar */}
      <div 
        className="text-[#1e395b] px-2 py-1 flex justify-between items-center cursor-move font-normal text-[11.5px] border-b border-[#96b4d3]"
        style={{
          background: 'linear-gradient(to bottom, #ebf3fc 0%, #d2e4f9 40%, #c1dbf6 50%, #b1d0f4 100%)',
          textShadow: '0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        <div className="flex items-center gap-1.5 font-sans">
          <span className="font-semibold text-gray-800 text-[11.5px]">Process Alert: Clozapine Hematological Monitoring Report</span>
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

      {/* Content Body */}
      <div className="p-5 bg-white text-[12.5px] font-sans text-black overflow-y-auto max-h-[72vh] space-y-4">
        {/* Email Header Info */}
        <div className="space-y-1 text-[12.5px] border-b border-gray-200 pb-3">
          <div>
            <strong>From:</strong> <span className="text-[#0066cc] hover:underline cursor-pointer">do.not.reply@phsacdapp3.cerncd.com</span>
          </div>
          <div>
            <strong>Sent:</strong> Wednesday, September 27, 2023 9:15 AM
          </div>
          <div>
            <strong>To:</strong> <span className="text-[#0066cc] hover:underline cursor-pointer">VA Pharmacy MHSU</span>
          </div>
          <div>
            <strong>Subject:</strong> P0783 -- PROBLEM -- RRD Fax Monitor -- Clozapine Hematological Monitoring Report
          </div>
        </div>

        {/* Warning Text */}
        <div className="space-y-3 pt-1">
          <p className="font-bold">
            WARNING: 1 RRD Fax with "Error" status was found based on the following qualifying criteria:
          </p>
          <ul className="list-disc pl-8 space-y-1">
            <li><strong>RRD Station Name:</strong> "Pharmacy Ops"</li>
            <li><strong>Freetext report title match:</strong> "*VGH/VGH Willow Pavillion/VGH S4*"</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="bg-[#f0f0f0] border-t border-[#dfdfdf] px-3 py-2 flex justify-end gap-2 rounded-b-[3px]">
        <button 
          onClick={() => {
            alert('Alert Acknowledged. Retrying fax...');
            onClose();
          }}
          className="px-4 py-1 bg-white hover:bg-gray-150 border border-[#acacac] rounded-[3px] text-gray-800 font-semibold shadow-xs transition-all active:scale-[0.98] text-[11px]"
        >
          Retry Fax
        </button>
        <button 
          onClick={onClose}
          className="px-4 py-1 bg-white hover:bg-gray-150 border border-[#bcbcbc] rounded-[3px] text-gray-600 shadow-xs transition-all active:scale-[0.98] text-[11px]"
        >
          Close
        </button>
      </div>
    </div>
  );
};
export default ProcessAlert;
