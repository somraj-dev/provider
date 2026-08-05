import React from 'react';
import { CHART_OPTIONS, getChartDataForSelection, mockChartData as defaultMockChartData } from '../_shared/constants';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface HomePageProps {
  selectOrOpenTab: (type: any, title: string, id: string) => void;
  openDropdownChart: string | null;
  setOpenDropdownChart: (val: string | null) => void;
  chartSelections: Record<string, string>;
  setChartSelections: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mockChartData: any[];
}

export const HomePage: React.FC<HomePageProps> = ({
  selectOrOpenTab = () => {},
  openDropdownChart = null,
  setOpenDropdownChart = () => {},
  chartSelections = {},
  setChartSelections = () => {},
  mockChartData = defaultMockChartData,
}) => {
  return (
    <div className="w-screen h-screen bg-[#f4f7f6] text-[#333333] text-[10.5px] font-sans flex flex-col select-none overflow-hidden">
      {/* Header Banner */}
      <div 
        className="h-[36px] bg-gradient-to-r from-[#003366] via-[#005599] to-[#003366] text-white flex justify-between items-center px-3 select-none border-b border-[#002244]"
        style={{ backgroundImage: 'linear-gradient(to right, #00305a 0%, #005aa7 50%, #00305a 100%)' }}
      >
        <span className="font-extrabold text-[13px] tracking-tight text-white flex items-center">
          AxioVital Home Portal
        </span>
        <button 
          onClick={() => selectOrOpenTab?.('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-3 py-1 rounded-sm text-[10px] transition-colors"
        >
          ❮ Return to AxioVital
        </button>
      </div>

      {/* Content Pane showing charts */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 select-text">
        <div className="grid grid-cols-2 gap-4 max-w-[1400px] mx-auto w-full">
          {[
            { title: 'HTTP(S) DNS Lookup Time', key: 'dns', unit: 'ms', color: '#1070ca', fill: 'url(#colorDns)' },
            { title: 'HTTP(S) Connection Duration', key: 'conn', unit: 'ms', color: '#005a9c', fill: 'url(#colorConn)' },
            { title: 'HTTP(S) Secure Connection Duration', key: 'secure', unit: 'ms', color: '#0d7a86', fill: 'url(#colorSecure)' },
            { title: 'HTTP(S) Request Duration', key: 'req', unit: 'ms', color: '#d14343', fill: 'url(#colorReq)' },
            { title: 'HTTP(S) Response Duration', key: 'resp', unit: 'ms', color: '#e69800', fill: 'url(#colorResp)' },
            { title: 'HTTP(S) Total Duration', key: 'total', unit: 'ms', color: '#6845a7', fill: 'url(#colorTotal)' },
            { title: 'HTTP(S) Response Status Code', key: 'status', unit: 'count', color: '#32805b', fill: 'url(#colorStatus)' },
            { title: 'HTTP(S) Success Rate', key: 'success', unit: '%', color: '#1d8c00', fill: 'url(#colorSuccess)' }
          ].map((chart) => (
            <div key={chart.key} className="bg-white border border-[#bdcddc] rounded-sm p-3 shadow-sm flex flex-col h-[280px]">
              <div className="flex justify-between items-center border-b border-gray-150 pb-2 mb-2 select-none relative">
                <span className="font-bold text-[11px] text-[#2c3e50] flex items-center gap-1">
                  {chart.title} <span className="text-gray-400 text-[10px] cursor-help">ⓘ</span>
                </span>
                <div>
                  <button 
                    onClick={() => setOpenDropdownChart(openDropdownChart === chart.key ? null : chart.key)}
                    className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-[10px] text-gray-700 px-2 py-0.5 rounded-sm flex items-center gap-1 font-semibold"
                  >
                    {chartSelections[chart.key] || 'Quick View'} <span className="text-[8px] text-gray-400">▼</span>
                  </button>
                  {openDropdownChart === chart.key && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownChart(null)} />
                      <div className="absolute right-0 mt-1 bg-white border border-[#b0b0b0] text-[#333333] text-[11px] p-0 w-[200px] shadow-md rounded-none select-none z-50 max-h-[220px] overflow-y-auto">
                        <div className="py-0.5">
                          {(CHART_OPTIONS || []).map((option) => (
                            <div
                              key={option}
                              onClick={() => {
                                setChartSelections(prev => ({ ...prev, [chart.key]: option }));
                                setOpenDropdownChart(null);
                              }}
                              className={`px-3 py-1 cursor-pointer outline-none ${
                                (chartSelections[chart.key] || 'Quick View') === option 
                                  ? 'bg-[#0f4471] text-white font-semibold' 
                                  : 'hover:bg-[#0f4471] hover:text-white text-[#333333]'
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-[9.5px] text-gray-500 mb-2 select-none">
                <div>
                  Interval: <span className="font-bold text-gray-700">1 minute ▾</span>
                </div>
                <div>
                  Statistic: <span className="font-bold text-gray-700">Mean ▾</span>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartDataForSelection(mockChartData, chartSelections[chart.key] || 'Quick View', chart.key)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`color${chart.key.charAt(0).toUpperCase() + chart.key.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chart.color} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={chart.color} stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f2" />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#7f8c8d' }} stroke="#bdc3c7" tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#7f8c8d' }} stroke="#bdc3c7" tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={1.5} fill={chart.fill} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
