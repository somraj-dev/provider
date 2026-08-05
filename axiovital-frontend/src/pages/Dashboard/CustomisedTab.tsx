import React from 'react';

export const CustomisedTab: React.FC = () => {
  return (
<div className="flex-1 flex flex-col h-full bg-white font-sans text-black overflow-hidden" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif' }}>
              {/* Tertiary Icon Toolbar */}
              <div className="h-[28px] bg-white border-b border-[#e0e0e0] flex items-center px-2 gap-2 text-[11px] text-gray-700">
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">🔍</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">📑</span>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">↖</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">🔍</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm">100% ▾</span>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm text-gray-400">●</span>
                <span className="cursor-pointer hover:bg-[#e5f1fb] p-0.5 border border-transparent hover:border-[#99c8e9] rounded-sm text-orange-500">🏠</span>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-1 bg-white overflow-hidden m-2 border border-[#828790]">
                {/* Left Pane */}
                <div className="w-[280px] border-r border-[#828790] flex flex-col bg-white">
                  <div className="p-4">
                    <h3 className="font-bold text-[13px] text-[#003366] mb-4 font-sans tracking-wide">My Default Organizer View</h3>
                    <div className="flex flex-col gap-1.5 pl-2">
                      {['Message Centre', 'Patient Overview', 'Ambulatory Organizer', 'MyExperience', 'Patient List', 'Dynamic Worklist', 'LearningLIVE'].map((item, i) => (
                        <label key={i} className="flex items-center gap-1.5 cursor-pointer text-[12px] text-black">
                          <input type="radio" name="default_organizer" defaultChecked={item === 'Message Centre'} className="w-3.5 h-3.5 m-0 p-0 accent-blue-600" />
                          <span className="leading-none pt-px">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Right Pane */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                  <div className="p-4 flex flex-col h-full">
                    <h3 className="font-bold text-[13px] text-[#003366] mb-3 font-sans tracking-wide">My MPages Selection</h3>
                    <div className="mb-3 text-[12px] text-black space-y-1">
                      <div>For Tab: Provider View</div>
                      <div>For Role: Provider</div>
                    </div>
                    <div className="flex flex-col gap-1.5 pl-2 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      {[
                        'Anesthesiologist Workflow', 'Cardiology Workflow', 'Critical Care Workflow',
                        'Dermatology Workflow', 'Endocrinology Workflow', 'Gastroenterology Workflow',
                        'General Medicine Workflow', 'General Surgery Workflow', 'Gerontology Workflow',
                        'Infectious Disease Workflow', 'Laboratory Medicine Workflow', 'Medical Microbiologist Workflow',
                        'Mental Health Workflow', 'Nephrology Workflow', 'Neurology Workflow',
                        'Neurosurgery Workflow', 'Oncology Workflow', 'Ophthalmology Workflow',
                        'Oral and Maxillofacial Surgery Workflow'
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-1.5 cursor-pointer text-[12px] text-black">
                          <input type="radio" name="mpages_selection" defaultChecked={item === 'General Medicine Workflow'} className="w-3.5 h-3.5 m-0 p-0 accent-blue-600" />
                          <span className="leading-none pt-px">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Action Bar */}
              <div className="flex justify-between items-center px-4 pb-3 pt-1">
                {/* Info Icon */}
                <div className="w-[20px] h-[20px] bg-[#0055d4] rounded-full flex items-center justify-center text-white font-serif font-bold italic text-[13px] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)] cursor-help border border-[#003366]" title="Information">
                  i
                </div>
                {/* Buttons */}
                <div className="flex gap-2">
                  <button className="bg-gradient-to-b from-[#f5f5f5] to-[#e1e1e1] hover:from-[#e5f1fb] hover:to-[#cce4f7] border border-[#adadad] hover:border-[#0078d7] px-6 min-w-[85px] h-[26px] flex items-center justify-center text-[12px] text-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] active:bg-[#cce4f7] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] outline-none focus:border-[#0078d7] rounded-[2px]">
                    Reset
                  </button>
                  <button className="bg-gradient-to-b from-[#f5f5f5] to-[#e1e1e1] hover:from-[#e5f1fb] hover:to-[#cce4f7] border border-[#adadad] hover:border-[#0078d7] px-6 min-w-[85px] h-[26px] flex items-center justify-center text-[12px] text-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] active:bg-[#cce4f7] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] outline-none focus:border-[#0078d7] rounded-[2px]">
                    Save
                  </button>
                </div>
              </div>
            </div>
  );
};

export default CustomisedTab;
