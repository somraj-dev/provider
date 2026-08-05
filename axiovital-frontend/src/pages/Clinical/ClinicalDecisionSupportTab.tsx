import React from 'react';

interface ClinicalDecisionSupportTabProps {
  cdsDrugDrug: boolean;
  setCdsDrugDrug: (val: boolean) => void;
  cdsDrugAllergy: boolean;
  setCdsDrugAllergy: (val: boolean) => void;
  cdsDuplicateTherapy: boolean;
  setCdsDuplicateTherapy: (val: boolean) => void;
  cdsRenalDosing: boolean;
  setCdsRenalDosing: (val: boolean) => void;
  cdsGeriatric: boolean;
  setCdsGeriatric: (val: boolean) => void;
  cdsSeverityThreshold: string;
  setCdsSeverityThreshold: (val: string) => void;
  cdsSepsisRule: boolean;
  setCdsSepsisRule: (val: boolean) => void;
  cdsRetinopathyRule: boolean;
  setCdsRetinopathyRule: (val: boolean) => void;
  cdsFluVaccineRule: boolean;
  setCdsFluVaccineRule: (val: boolean) => void;
  cdsInterruptiveAlerts: boolean;
  setCdsInterruptiveAlerts: (val: boolean) => void;
  cdsBannerAlerts: boolean;
  setCdsBannerAlerts: (val: boolean) => void;
  cdsSidebarAlerts: boolean;
  setCdsSidebarAlerts: (val: boolean) => void;
  cdsAuditLogs: any[];
}

export const ClinicalDecisionSupportTab: React.FC<ClinicalDecisionSupportTabProps> = ({
  cdsDrugDrug,
  setCdsDrugDrug,
  cdsDrugAllergy,
  setCdsDrugAllergy,
  cdsDuplicateTherapy,
  setCdsDuplicateTherapy,
  cdsRenalDosing,
  setCdsRenalDosing,
  cdsGeriatric,
  setCdsGeriatric,
  cdsSeverityThreshold,
  setCdsSeverityThreshold,
  cdsSepsisRule,
  setCdsSepsisRule,
  cdsRetinopathyRule,
  setCdsRetinopathyRule,
  cdsFluVaccineRule,
  setCdsFluVaccineRule,
  cdsInterruptiveAlerts,
  setCdsInterruptiveAlerts,
  cdsBannerAlerts,
  setCdsBannerAlerts,
  cdsSidebarAlerts,
  setCdsSidebarAlerts,
  cdsAuditLogs,
}) => {
  return (
<div className="flex-1 overflow-y-auto bg-[#f4f7f9] p-6 select-text text-gray-800">
              <div className="max-w-[1200px] mx-auto space-y-6">
                
                {/* Page Title & Intro */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-xs flex justify-between items-center">
                  <div className="space-y-1">
                    <h2 className="text-[16px] font-bold text-[#002a46] flex items-center gap-2">
                      🛡️ Clinical Decision Support System (CDSS)
                    </h2>
                    <p className="text-[11px] text-gray-600">
                      Configure real-time clinical warnings, order interaction checks, diagnostic alerts, and notification preferences.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#e0f2fe] text-[#0369a1] text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wide border border-[#bae6fd]">
                      Engine Status: Active
                    </span>
                  </div>
                </div>

                {/* Main Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Core CDSS Rule Engines & Severities */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Core Rules Panel */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                        <span>Core Decision Engines & Verification Checks</span>
                        <span className="text-[10px] text-gray-500 font-normal">Runs during Order Entry and Charting</span>
                      </div>
                      
                      <div className="p-4 space-y-3.5">
                        
                        {/* Drug-Drug */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Drug-Drug Interactions</span>
                            <p className="text-[10.5px] text-gray-500">Cross-checks newly ordered medications against patient's active medication list.</p>
                          </div>
                          <button 
                            onClick={() => setCdsDrugDrug(!cdsDrugDrug)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsDrugDrug ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsDrugDrug ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Drug-Allergy */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Drug-Allergy Interactions</span>
                            <p className="text-[10.5px] text-gray-500">Cross-checks medication orders against documented patient allergies and drug classes.</p>
                          </div>
                          <button 
                            onClick={() => setCdsDrugAllergy(!cdsDrugAllergy)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsDrugAllergy ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsDrugAllergy ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Duplicate Therapy */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Duplicate Therapy Alert</span>
                            <p className="text-[10.5px] text-gray-500">Triggers if ordered medication belongs to the same therapeutic class as an active medication.</p>
                          </div>
                          <button 
                            onClick={() => setCdsDuplicateTherapy(!cdsDuplicateTherapy)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsDuplicateTherapy ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsDuplicateTherapy ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Renal Dosing */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Renal Clearance Dosage Warning</span>
                            <p className="text-[10.5px] text-gray-500">Flags dosage adjustments when patient eGFR or Creatinine Clearance falls below threshold.</p>
                          </div>
                          <button 
                            onClick={() => setCdsRenalDosing(!cdsRenalDosing)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsRenalDosing ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsRenalDosing ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Geriatric warning */}
                        <div className="flex items-start justify-between pb-1">
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-bold text-gray-900">Geriatric Contraindications (Beers Criteria)</span>
                            <p className="text-[10.5px] text-gray-500">Flags potentially inappropriate medication use in older adults (65 years and older).</p>
                          </div>
                          <button 
                            onClick={() => setCdsGeriatric(!cdsGeriatric)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cdsGeriatric ? 'bg-[#0f4471]' : 'bg-gray-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cdsGeriatric ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Best Practice Alerts list */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46]">
                        Best Practice Alerts & Screenings (BPA)
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div className="border border-[#e2e8f0] rounded p-3 flex justify-between items-start bg-gray-50/50">
                            <div className="space-y-1 pr-4">
                              <span className="text-[11.5px] font-bold text-gray-900 block">Sepsis Early Warning Alert</span>
                              <p className="text-[10px] text-gray-500">Triggers clinical bundle order suggestions when systemic inflammatory response (SIRS) is suspected.</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={cdsSepsisRule} 
                              onChange={(e) => setCdsSepsisRule(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471] cursor-pointer"
                            />
                          </div>

                          <div className="border border-[#e2e8f0] rounded p-3 flex justify-between items-start bg-gray-50/50">
                            <div className="space-y-1 pr-4">
                              <span className="text-[11.5px] font-bold text-gray-900 block">Diabetic Retinopathy Screening</span>
                              <p className="text-[10px] text-gray-500">Triggers an alert during review if diabetic patient has not had a documented eye exam in past 12 months.</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={cdsRetinopathyRule} 
                              onChange={(e) => setCdsRetinopathyRule(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471] cursor-pointer"
                            />
                          </div>

                          <div className="border border-[#e2e8f0] rounded p-3 flex justify-between items-start bg-gray-50/50 md:col-span-2">
                            <div className="space-y-1 pr-4">
                              <span className="text-[11.5px] font-bold text-gray-900 block">Preventive Care: Annual Influenza Vaccine Reminder</span>
                              <p className="text-[10px] text-gray-500">Prompts clinician to order or log influenza vaccination status for all patients during autumn/winter admission.</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={cdsFluVaccineRule} 
                              onChange={(e) => setCdsFluVaccineRule(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471] cursor-pointer"
                            />
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Severity Thresholds & Notification Settings */}
                  <div className="space-y-6">
                    
                    {/* Severity Panel */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46]">
                        Alert Sensitivity & Severity Thresholds
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-bold text-gray-700 block">Minimum Trigger Threshold</label>
                          <select 
                            value={cdsSeverityThreshold} 
                            onChange={(e) => setCdsSeverityThreshold(e.target.value)}
                            className="w-full text-[11px] border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-800 focus:outline-none focus:border-[#0f4471] font-medium"
                          >
                            <option value="Critical Only">Critical Only (Interruptive alerts only for severe risks)</option>
                            <option value="Medium & Critical">Warning & Critical (Default recommended settings)</option>
                            <option value="All (Informational, Warning, Critical)">All (Informational, Warning, Critical)</option>
                          </select>
                          <p className="text-[9.5px] text-gray-400">
                            Setting a lower threshold increases clinical alerts but may contribute to warning fatigue.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notification Channels */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                      <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46]">
                        Delivery & Notification Channels
                      </div>
                      <div className="p-4 space-y-3.5">
                        
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={cdsInterruptiveAlerts} 
                            onChange={(e) => setCdsInterruptiveAlerts(e.target.checked)}
                            className="w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[11.5px] font-bold text-gray-900 block">Interruptive Pop-up Dialogs</span>
                            <span className="text-[10px] text-gray-500 block">Requires clinician to acknowledge or provide override reason to proceed.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={cdsBannerAlerts} 
                            onChange={(e) => setCdsBannerAlerts(e.target.checked)}
                            className="w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[11.5px] font-bold text-gray-900 block">Inline Banner Alerts</span>
                            <span className="text-[10px] text-gray-500 block">Non-interruptive color banner displayed directly inside patient flowsheets.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={cdsSidebarAlerts} 
                            onChange={(e) => setCdsSidebarAlerts(e.target.checked)}
                            className="w-3.5 h-3.5 text-[#0f4471] border-gray-300 rounded focus:ring-[#0f4471]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[11.5px] font-bold text-gray-900 block">CDSS Sidebar Dock</span>
                            <span className="text-[10px] text-gray-500 block">Consolidates active warnings inside a collateral sidebar tray.</span>
                          </div>
                        </label>

                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setCdsDrugDrug(true);
                          setCdsDrugAllergy(true);
                          setCdsDuplicateTherapy(true);
                          setCdsRenalDosing(true);
                          setCdsGeriatric(false);
                          setCdsSeverityThreshold('Medium & Critical');
                          setCdsSepsisRule(true);
                          setCdsRetinopathyRule(true);
                          setCdsFluVaccineRule(false);
                          setCdsInterruptiveAlerts(true);
                          setCdsBannerAlerts(true);
                          setCdsSidebarAlerts(false);
                          alert('Decision Support settings reset to hospital defaults.');
                        }}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-4 py-1.5 rounded transition-all"
                      >
                        Reset Defaults
                      </button>
                      <button 
                        onClick={() => alert('Clinical Decision Support configurations successfully updated.')}
                        className="bg-[#0f4471] hover:bg-[#0b3355] text-white text-[11px] font-bold px-4 py-1.5 rounded shadow-sm transition-all"
                      >
                        Save Configuration
                      </button>
                    </div>

                  </div>

                </div>

                {/* Bottom Audit Log Table */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                    <span>CDSS Alert History & Clinician Override Audit Log</span>
                    <span className="text-[10px] text-gray-500 font-normal">Recent 5 alerts logged</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#eaeaea] text-gray-700 font-bold border-b border-gray-300 select-none">
                        <tr>
                          <th className="p-2.5">Date / Time</th>
                          <th className="p-2.5">Rule / Interaction</th>
                          <th className="p-2.5">Patient</th>
                          <th className="p-2.5 text-center">Severity</th>
                          <th className="p-2.5">Alert Text</th>
                          <th className="p-2.5">Action Taken</th>
                          <th className="p-2.5">Clinician</th>
                          <th className="p-2.5">Override/Action Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(cdsAuditLogs || []).map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="p-2.5 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                            <td className="p-2.5 font-bold text-[#0f4471]">{log.ruleName}</td>
                            <td className="p-2.5 font-medium text-gray-900 uppercase">{log.patientName}</td>
                            <td className="p-2.5 text-center">
                              <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold ${
                                log.severity === 'Critical' 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {log.severity}
                              </span>
                            </td>
                            <td className="p-2.5 text-gray-600 max-w-[280px] break-words">{log.alertText}</td>
                            <td className="p-2.5 font-medium whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                                log.action === 'Overridden' 
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                  : log.action === 'Accepted'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-2.5 text-gray-700 font-medium whitespace-nowrap">{log.clinician}</td>
                            <td className="p-2.5 text-gray-500 italic max-w-[240px] break-words">{log.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
  );
};

export default ClinicalDecisionSupportTab;
