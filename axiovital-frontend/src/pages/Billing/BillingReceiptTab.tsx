import React from 'react';

export const BillingReceiptTab: React.FC = () => {
  return (
<div className="flex-1 overflow-y-auto bg-[#f4f7f9] p-6 select-text text-gray-800">
              <div className="max-w-[1200px] mx-auto space-y-6">
                
                {/* Top Patient Banner */}
                <div className="bg-[#0f4471] text-white p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold tracking-wide">Araceli Test</span>
                      <span className="bg-[#1b7a2a] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active Encounter</span>
                    </div>
                    <div className="text-[11.5px] text-blue-100 flex gap-4">
                      <span><strong>MRN:</strong> MRN-98203</span>
                      <span><strong>DOB:</strong> 01/04/1985 (39 Y)</span>
                      <span><strong>Encounter:</strong> ENC-40291 (OBV)</span>
                      <span><strong>Guarantor:</strong> Araceli Test (Self)</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[18px] font-black tracking-wider text-emerald-300">RECEIPT #RCP-2026-88492</div>
                    <div className="text-[11px] text-blue-100">Date Issued: 17/07/2026 03:30 PM</div>
                  </div>
                </div>

                {/* Action Strip & Status */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg p-3.5 shadow-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => alert('Printing official patient receipt...')} className="bg-[#0f4471] hover:bg-[#0b3355] text-white text-[11px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
                      <span>🖨️</span> Print Official Receipt
                    </button>
                    <button onClick={() => alert('Receipt emailed to patient securely.')} className="bg-white border border-[#0f4471] text-[#0f4471] hover:bg-blue-50 text-[11px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                      <span>📧</span> Email Receipt
                    </button>
                    <button onClick={() => alert('PDF Statement downloaded.')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer">
                      <span>📥</span> Download PDF Statement
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500 font-bold uppercase">Account Status:</span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded text-[11.5px] tracking-wide">
                      ✔ PAID / SETTLED IN FULL
                    </span>
                  </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Charges</span>
                    <span className="text-[22px] font-black text-gray-900">$1,450.00</span>
                    <span className="text-[10px] text-gray-400 block">4 Clinical & Diagnostic Services</span>
                  </div>
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1 border-l-4 border-l-blue-600">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Insurance Payment</span>
                    <span className="text-[22px] font-black text-blue-700">-$1,150.00</span>
                    <span className="text-[10px] text-blue-600 font-medium block">Blue Cross Blue Shield (PPO)</span>
                  </div>
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1 border-l-4 border-l-emerald-600">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Patient Paid / Copay</span>
                    <span className="text-[22px] font-black text-emerald-700">$300.00</span>
                    <span className="text-[10px] text-emerald-600 font-medium block">Visa ending in 4092 (Auth #88412)</span>
                  </div>
                  <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs space-y-1 bg-gray-50">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Balance Due</span>
                    <span className="text-[22px] font-black text-gray-500">$0.00</span>
                    <span className="text-[10px] text-gray-400 font-medium block">No further payments required</span>
                  </div>
                </div>

                {/* Itemized Services Table */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                    <span>Itemized Statement & Service Breakdown</span>
                    <span className="text-[10.5px] text-gray-600 font-normal">Encounter Date: 01/04/2017</span>
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#eaeaea] text-gray-700 font-bold border-b border-gray-300">
                      <tr>
                        <th className="p-2.5">Service Date</th>
                        <th className="p-2.5">CPT / Code</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Department</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">99214</td>
                        <td className="p-2.5 font-medium">Office Visit - Level 4 (Established Patient)</td>
                        <td className="p-2.5 text-gray-600">Outpatient Clinic</td>
                        <td className="p-2.5 text-right font-mono">$250.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$250.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">76805</td>
                        <td className="p-2.5 font-medium">Ultrasound : (OB) Complete After First Trimester</td>
                        <td className="p-2.5 text-gray-600">Diagnostic Imaging</td>
                        <td className="p-2.5 text-right font-mono">$450.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$450.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">80050</td>
                        <td className="p-2.5 font-medium">General Health Panel (CBC & Comprehensive Metabolic)</td>
                        <td className="p-2.5 text-gray-600">Laboratory</td>
                        <td className="p-2.5 text-right font-mono">$350.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$350.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017</td>
                        <td className="p-2.5 font-mono font-bold text-[#0f4471]">90471</td>
                        <td className="p-2.5 font-medium">Immunization Administration & Consultation</td>
                        <td className="p-2.5 text-gray-600">Preventive Med</td>
                        <td className="p-2.5 text-right font-mono">$400.00</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-mono font-bold">$400.00</td>
                        <td className="p-2.5 text-center"><span className="bg-blue-100 text-blue-800 text-[9.5px] px-2 py-0.5 rounded font-bold">Covered</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Transaction & Payment Audit Trail */}
                <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] px-4 py-2.5 font-bold text-xs text-[#002a46] flex justify-between items-center">
                    <span>Payment & Transaction History</span>
                    <span className="text-[10.5px] text-emerald-700 font-bold">Total Received: $1,450.00</span>
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#eaeaea] text-gray-700 font-bold border-b border-gray-300">
                      <tr>
                        <th className="p-2.5">Date & Time</th>
                        <th className="p-2.5">Payment Method</th>
                        <th className="p-2.5">Reference / TXN</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5">Processed By</th>
                        <th className="p-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">01/04/2017 04:15 PM</td>
                        <td className="p-2.5 font-bold text-emerald-800">Credit Card (Visa ending 4092)</td>
                        <td className="p-2.5 font-mono">TXN-99812401</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">$300.00</td>
                        <td className="p-2.5 text-gray-600">Cashier / Billing Dept</td>
                        <td className="p-2.5 text-gray-600">Copay & co-insurance settled at discharge</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">15/04/2017 10:00 AM</td>
                        <td className="p-2.5 font-bold text-blue-800">Electronic Remittance (BCBS)</td>
                        <td className="p-2.5 font-mono">ERA-88210344</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-700">$1,150.00</td>
                        <td className="p-2.5 text-gray-600">Auto-Posting / Clearinghouse</td>
                        <td className="p-2.5 text-gray-600">Claim #CLM-2017-901 adjudicated and paid in full</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
  );
};

export default BillingReceiptTab;
