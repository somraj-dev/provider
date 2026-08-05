import React from 'react';
import { mockOrdersData } from '../_shared/constants';

interface LabsTabProps {
  selectOrOpenTab: (type: any, title: string, id: string) => void;
  openLabReportTab?: (row: any) => void;
}

export const LabsTab: React.FC<LabsTabProps> = ({ selectOrOpenTab, openLabReportTab }) => {
  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden text-[11px]">
      {/* Toolbar matching the second image's icons perfectly */}
      <div className="bg-[#fafbfc] border-b border-[#bdcddc] px-3 py-1 flex items-center gap-5 text-[#333333] text-[11px] select-none font-sans">
        <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 text-gray-700 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#d1154f" className="inline mr-0.5">
            <path d="M14 3.25c-.41 0-.75.34-.75.75v16c0 .41.34.75.75.75s.75-.34.75-.75V4c0-.41-.34-.75-.75-.75zM3 9v6h3l5 5V4L6 9H3zm17.5 3c0-1.8-1.04-3.36-2.5-4.13v8.26c1.46-.77 2.5-2.33 2.5-4.13z"/>
          </svg>
          <span className="text-[#333333]">Communicate</span>
          <span className="text-[8px] text-gray-400">▼</span>
        </button>
        <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
        <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffb300" className="inline">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
          <span className="text-[#333333]">Open</span>
        </button>
        <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#1e88e5" className="inline">
            <path d="M21 5c-1.11-.9-2.45-1-4-1-1.48 0-2.75.1-4 1-1.25-.9-2.52-1-4-1-1.55 0-2.89.1-4 1v14.5c1.11-.9 2.45-1 4-1 1.48 0 2.75.1 4 1 1.25-.9 2.52-1 4-1 1.55 0 2.89.1 4 1V5zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-3.4.25-5 1V6.5c1.6-.75 3.3-1 5-1 1.2 0 2.4.15 3.5.5v13z"/>
          </svg>
          <span className="text-[#333333]">Message Journal</span>
        </button>
        <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" className="inline">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#cbd8e3"/>
            <path d="M11 16v-3H8v-2h3V8l5 4-5 4z" fill="#d32f2f"/>
          </svg>
          <span className="text-[#333333]">Forward Only</span>
        </button>
        <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#311b92" className="inline">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span className="text-[#333333]">Select Patient</span>
        </button>
        <button className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1.5 text-gray-700 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#37474f" className="inline">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-[#333333]">Select All</span>
        </button>
      </div>

      {/* Table with custom font, high contrast text and border styles */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="bg-[#f0f4f8] text-[#333333] select-none sticky top-0 z-10 text-[11px]">
              <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Patient Name</th>
              <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Plan Name</th>
              <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Action</th>
              <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
              <th className="p-1 px-2 border-r border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Details</th>
              <th className="p-1 px-2 border-b border-[#bdcddc] font-normal text-gray-700 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {(mockOrdersData || []).map((row, idx) => (
              <tr
                key={idx}
                className={`hover:bg-[#eaf4fc] cursor-pointer transition-colors ${
                  idx % 2 === 1 ? 'bg-[#f4f8fb]' : 'bg-white'
                }`}
              >
                <td
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOrOpenTab?.('PatientProfile', `Patient Profile: ${row.patientName.toUpperCase()}`, 'patient-doe');
                  }}
                  className="p-1 px-2 border-r border-b border-[#e5edf5] font-bold text-black uppercase whitespace-nowrap text-[11px]"
                >
                  {row.patientName}
                </td>
                <td onClick={() => openLabReportTab?.(row)} className="p-1 px-2 border-r border-b border-[#e5edf5] text-[#004b87] hover:underline whitespace-nowrap text-[11px]">
                  {row.orderPlanName}
                </td>
                <td onClick={() => openLabReportTab?.(row)} className="p-1 px-2 border-r border-b border-[#e5edf5] whitespace-nowrap text-gray-800 text-[11px]">{row.action}</td>
                <td onClick={() => openLabReportTab?.(row)} className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-500 whitespace-nowrap text-[11px]">
                  {row.detailsDate}...
                </td>
                <td onClick={() => openLabReportTab?.(row)} className="p-1 px-2 border-r border-b border-[#e5edf5] text-gray-700 whitespace-nowrap text-[11px]">
                  {row.detailsDesc}
                </td>
                <td
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOrOpenTab?.('PatientProfile', `Patient Profile: ${row.patientName.toUpperCase()}`, 'patient-doe');
                  }}
                  className="p-1 px-2 border-b border-[#e5edf5] font-bold text-[#008000] whitespace-nowrap text-[11px]"
                >
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabsTab;
