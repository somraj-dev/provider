import React from 'react';

interface HelpCentreTabProps {
  isHelpDropdownOpen: boolean;
  setIsHelpDropdownOpen: (val: boolean) => void;
}

export const HelpCentreTab: React.FC<HelpCentreTabProps> = ({
  isHelpDropdownOpen,
  setIsHelpDropdownOpen,
}) => {
  return (
<div className="flex flex-1 overflow-auto bg-[#fafbfc] p-6 text-gray-800 text-[11px] select-text">
              <div className="max-w-[1200px] mx-auto w-full grid grid-cols-[1fr_280px] gap-6">
                
                {/* Left Area */}
                <div className="space-y-6">
                  
                  {/* Top Search bar */}
                  <div className="space-y-2">
                    <h1 className="text-xl font-bold text-[#0f4471] tracking-wide font-sans">Help Center</h1>
                    <p className="text-gray-500 text-[11px]">Find answers, learn how to use AxioVital, and get the support you need.</p>
                    <div className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="Search for help articles, guides, and more..." 
                        className="flex-1 bg-white border border-[#bdcddc] rounded px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0f4471]"
                      />
                      <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-4 py-1.5 rounded shadow-sm text-[11px]">Search</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600 pt-1">
                      <span className="font-semibold">Popular Searches:</span>
                      {['Patient Registration', 'Orders', 'Results', 'Dashboard', 'Reports', 'User Management'].map((term) => (
                        <button key={term} className="bg-[#eef2f5] hover:bg-[#cbd8e3]/50 border border-[#bdcddc] px-2 py-0.5 rounded-sm transition-colors">{term}</button>
                      ))}
                    </div>
                  </div>

                  {/* Browse Help Topics */}
                  <div className="space-y-3">
                    <h2 className="font-bold text-xs text-[#0f4471] border-b border-[#bdcddc]/50 pb-1">Browse Help Topics</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: 'Getting Started', desc: 'New to AxioVital? Learn the basics and get up to speed quickly.', count: '12 Articles', icon: '🚀' },
                        { title: 'Patient Management', desc: 'Manage patient information, registration, search, and demographics.', count: '28 Articles', icon: '👥' },
                        { title: 'Clinical Workflow', desc: 'Streamline clinical processes, orders, and documentation.', count: '35 Articles', icon: '📋' },
                        { title: 'Reports & Analytics', desc: 'Generate reports, dashboards, and analyze data.', count: '24 Articles', icon: '📊' },
                        { title: 'Administrative', desc: 'User management, settings, and system configuration.', count: '18 Articles', icon: '⚙️' },
                        { title: 'Billing & Finance', desc: 'Billing workflows, claims, payments, and financial reports.', count: '22 Articles', icon: '💵' },
                        { title: 'Integration & Interfaces', desc: 'External system integration, APIs, and data exchange.', count: '15 Articles', icon: '🔌' },
                        { title: 'System & Technical', desc: 'System requirements, troubleshooting, and technical support.', count: '20 Articles', icon: '💻' }
                      ].map((topic, i) => (
                        <div key={i} className="bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] rounded p-3 shadow-sm flex items-start gap-3 transition-colors cursor-pointer">
                          <span className="text-xl p-1.5 bg-gray-50 rounded border border-gray-100">{topic.icon}</span>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-gray-900 text-[11.5px]">{topic.title}</h4>
                            <p className="text-gray-500 leading-relaxed text-[10px]">{topic.desc}</p>
                            <div className="flex justify-between items-center text-[10px] text-blue-800 font-semibold pt-1">
                              <span>{topic.count}</span>
                              <span>❯</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequently Asked Questions */}
                  <div className="space-y-2">
                    <h2 className="font-bold text-xs text-[#0f4471] border-b border-[#bdcddc]/50 pb-1">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        'How do I register a new patient?',
                        'How do I generate a patient report?',
                        'How can I search for a patient?',
                        'How do I reset my password?',
                        'How do I place an order for lab tests?',
                        'How do I add a new user?',
                        'How do I view patient lab results?',
                        'Who do I contact for technical support?'
                      ].map((faq, i) => (
                        <div key={i} className="bg-white border border-[#e2e8f0] rounded px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                          <span className="font-semibold text-gray-800">❓ {faq}</span>
                          <span className="text-gray-400">❯</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 text-right">
                      <button className="text-blue-800 hover:underline font-semibold">View All FAQs ❯</button>
                    </div>
                  </div>

                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                  
                  {/* Need Immediate Help */}
                  <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                    <div className="bg-[#cbd8e3]/30 p-2 border-b border-[#bdcddc] font-bold text-[#0f4471]">
                      Need Immediate Help?
                    </div>
                    <div className="p-3 space-y-3.5">
                      {[
                        { title: 'Create Support Ticket', desc: 'Submit a ticket to our support team', icon: '🎫' },
                        { title: 'Live Chat', desc: 'Chat with our support team', tag: 'Available 24/7', icon: '💬' },
                        { title: 'Call Support', desc: '1800-AXIO-HELP (1800-2946-4357)', tag: '24/7 Support Line', icon: '📞' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2.5 cursor-pointer group pb-3 last:pb-0 last:border-b-0 border-b border-gray-100">
                          <span className="text-base">{item.icon}</span>
                          <div className="flex-1 space-y-0.5">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors">{item.title}</h4>
                            <p className="text-gray-500 text-[10px]">{item.desc}</p>
                            {item.tag && <div className="text-[9px] text-green-700 font-bold mt-0.5">{item.tag}</div>}
                          </div>
                          <span className="text-gray-400 pt-1">❯</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documentation */}
                  <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                    <div className="bg-[#cbd8e3]/30 p-2 border-b border-[#bdcddc] font-bold text-[#0f4471]">
                      Documentation
                    </div>
                    <div className="p-3 space-y-3">
                      {[
                        { title: 'User Manuals', desc: 'Comprehensive user guides', icon: '📖' },
                        { title: 'Quick Reference Guides', desc: 'Short guides for common tasks', icon: '📄' },
                        { title: 'Release Notes', desc: 'Latest updates and improvements', icon: '📋' },
                        { title: 'Training Videos', desc: 'Step-by-step video tutorials', icon: '🎥' }
                      ].map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center cursor-pointer group">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{doc.icon}</span>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors">{doc.title}</h4>
                              <p className="text-gray-500 text-[9.5px]">{doc.desc}</p>
                            </div>
                          </div>
                          <span className="text-gray-400">🔗</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                    <div className="bg-[#cbd8e3]/30 p-2 border-b border-[#bdcddc] font-bold text-[#0f4471]">
                      System Information
                    </div>
                    <div className="p-3 space-y-2 text-gray-800">
                      <div className="flex justify-between">
                        <span className="text-gray-500">System Version</span>
                        <span className="font-semibold">v5.12.3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Database Version</span>
                        <span className="font-semibold">v15.4.7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="font-semibold">28/05/2025 10:20 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Environment</span>
                        <span className="font-semibold text-blue-900 font-bold">PROD</span>
                      </div>
                      <div className="border-t border-gray-100 pt-2 text-right">
                        <button className="text-blue-800 hover:underline font-semibold text-[10px]">View System Status ❯</button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
  );
};

export default HelpCentreTab;
