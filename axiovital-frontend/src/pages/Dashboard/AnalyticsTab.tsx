import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { mockChartData as defaultMockChartData } from '../_shared/constants';

interface AnalyticsTabProps {
  mockChartData?: any[];
}

const trendData = [
  { name: 'Apr 28', Actual: 14, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'May 5', Actual: 15.8, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'May 12', Actual: 13.2, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'May 19', Actual: 13, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'May 26', Actual: 12, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'Jun 2', Actual: 14, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'Jun 9', Actual: 12.8, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'Jun 16', Actual: 12.4, Target: 12, Benchmark: 10, TopPerformer: 7.5 },
  { name: 'Jun 23', Actual: 10.2, Target: 12, Benchmark: 10, TopPerformer: 7.5 }
];

const departmentData = [
  { name: 'Cardiology', count: '2,842', pct: '15.2%', los: '3.6', readmit: '10.2%', mortality: '0.8%', sat: '92.1%', trend: 'up' },
  { name: 'Orthopedics', count: '2,156', pct: '11.5%', los: '2.9', readmit: '8.7%', mortality: '0.5%', sat: '93.4%', trend: 'stable' },
  { name: 'Pulmonology', count: '1,842', pct: '9.8%', los: '4.8', readmit: '12.4%', mortality: '1.1%', sat: '90.2%', trend: 'down' },
  { name: 'Neurology', count: '1,624', pct: '8.7%', los: '5.2', readmit: '13.6%', mortality: '1.3%', sat: '89.7%', trend: 'up' },
  { name: 'General Medicine', count: '3,645', pct: '19.5%', los: '4.1', readmit: '11.8%', mortality: '1.0%', sat: '91.3%', trend: 'stable' },
  { name: 'Emergency Medicine', count: '3,920', pct: '21.0%', los: '2.3', readmit: '9.6%', mortality: '0.7%', sat: '88.4%', trend: 'stable' },
  { name: 'Critical Care', count: '1,663', pct: '8.9%', los: '6.7', readmit: '15.2%', mortality: '2.1%', sat: '87.1%', trend: 'down' }
];

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ mockChartData = defaultMockChartData }) => {
  const [analyticsTimeframe, setAnalyticsTimeframe] = React.useState('Last 30 Days');
  const [analyticsMenu, setAnalyticsMenu] = React.useState('Overview');
  const [expandedAnalyticsSections, setExpandedAnalyticsSections] = React.useState<Record<string, boolean>>({
    Dashboards: true,
    StandardReports: true,
    CustomReports: true,
    ScheduledReports: true,
  });
  return (
<div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar: Analytics Categories */}
              <div className="w-[200px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
                <div className="bg-[#789cbb] text-white font-bold p-1.5">
                  Analytics
                </div>

                <div 
                  className="flex-1 overflow-y-auto text-gray-700 [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="p-1 space-y-2">
                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Dashboards: !prev.Dashboards }))}
                        className="font-bold p-1 bg-[#cbd8e3]/40 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Dashboards</span>
                        <span>{expandedAnalyticsSections.Dashboards ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Dashboards && (
                        <div className="mt-0.5 space-y-0.5">
                          <button 
                            onClick={() => setAnalyticsMenu('Overview')}
                            className={`w-full text-left p-1 rounded-sm px-2 ${analyticsMenu === 'Overview' ? 'bg-[#007cc0] text-white font-bold' : 'hover:bg-blue-100/30'}`}
                          >
                            Overview
                          </button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Patient Population</button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Quality Measures</button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Operational Metrics</button>
                          <button className="w-full text-left p-1 hover:bg-blue-100/30 rounded-sm px-2">Financial Performance</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Clinical: !prev.Clinical }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Clinical Analytics</span>
                        <span>{expandedAnalyticsSections.Clinical ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Clinical && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Quality Measures</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Chronic Conditions</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Utilization</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Patient Outcomes</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Operational: !prev.Operational }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Operational Analytics</span>
                        <span>{expandedAnalyticsSections.Operational ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Operational && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Provider Productivity</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Scheduling</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Care Workflow</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Resource Utilization</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, Financial: !prev.Financial }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Financial Analytics</span>
                        <span>{expandedAnalyticsSections.Financial ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.Financial && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Payer Mix</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Revenue Cycle</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Cost Analysis</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, CustomReports: !prev.CustomReports }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Custom Reports</span>
                        <span>{expandedAnalyticsSections.CustomReports ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.CustomReports && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Saved Reports</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Report Builder</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Scheduled Reports</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div 
                        onClick={() => setExpandedAnalyticsSections(prev => ({ ...prev, DataManagement: !prev.DataManagement }))}
                        className="font-bold p-1 bg-[#cbd8e3]/20 border-b border-[#bdcddc]/50 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>🗂️ Data Management</span>
                        <span>{expandedAnalyticsSections.DataManagement ? '▼' : '▲'}</span>
                      </div>
                      {expandedAnalyticsSections.DataManagement && (
                        <div className="pl-2 mt-0.5 space-y-0.5 text-gray-600">
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Data Extracts</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Data Quality</button>
                          <button className="w-full text-left p-0.5 hover:bg-blue-100/30 rounded-sm">Definitions</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane: Analytics Dashboard Overview */}
              <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-auto text-[11px] p-4 space-y-4">
                <div className="bg-[#cbd8e3] border-b border-[#bdcddc] flex items-center px-1">
                  <button className="bg-white border-t border-x border-[#bdcddc] px-3.5 py-1 font-bold text-[10.5px] flex items-center gap-2 rounded-t-sm">
                    Analytics Overview
                  </button>
                </div>

                <div className="bg-[#fafbfc] border border-[#bdcddc] p-2 flex flex-wrap gap-4 items-center text-[10.5px] rounded-sm shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Date Range:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>Last 30 Days</option>
                      <option>Last 15 Days</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Facility:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>All Facilities</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Department:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>All Departments</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Provider:</span>
                    <select className="bg-white border border-[#bdcddc] rounded px-1.5 py-0.5 text-[10px] focus:outline-none">
                      <option>All Providers</option>
                    </select>
                  </div>
                  <button className="bg-[#0f4471] hover:bg-[#0b3355] text-white font-bold px-3 py-1 rounded shadow-sm">Apply</button>
                  <div className="flex-1"></div>
                  <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2.5 py-1 rounded text-[10px]">Export ▼</button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: 'Total Patients', value: '12,842', change: '▲ 8.4%', changeColor: 'text-green-600', sub: 'vs. Prior 30 Days', icon: '👥' },
                    { label: 'Encounters', value: '18,729', change: '▲ 6.7%', changeColor: 'text-green-600', sub: 'vs. Prior 30 Days', icon: '📈' },
                    { label: 'Average LOS (Days)', value: '4.6', change: '▼ 5.2%', changeColor: 'text-red-600', sub: 'vs. Prior 30 Days', icon: '📅' },
                    { label: 'Readmission Rate', value: '11.3%', change: '▼ 1.4%', changeColor: 'text-green-600', sub: 'vs. Prior 30 Days', icon: '🔄' },
                    { label: 'Mortality Rate', value: '1.2%', change: '▲ 0.3%', changeColor: 'text-red-600', sub: 'vs. Prior 30 Days', icon: '📉' }
                  ].map((card, i) => (
                    <div key={i} className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col justify-between h-[100px]">
                      <div className="flex justify-between items-center text-gray-500 font-bold text-[10px]">
                        <span>{card.label}</span>
                        <span className="text-sm">{card.icon}</span>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-gray-900">{card.value}</div>
                        <div className="flex items-center gap-1 mt-1 text-[9.5px]">
                          <span className={`font-bold ${card.changeColor}`}>{card.change}</span>
                          <span className="text-gray-400">{card.sub}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[280px_1fr] gap-4">
                  <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col justify-between text-[10.5px]">
                    <div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5 mb-2">
                        <span className="font-bold">Customize</span>
                        <span className="text-xs text-gray-400">ℹ️</span>
                      </div>
                      <div className="flex gap-1 mb-3 text-[10px]">
                        <button className="flex-1 bg-[#eef2f5] border border-[#bdcddc] py-0.5 text-center font-bold">Target</button>
                        <button className="flex-1 py-0.5 text-center hover:bg-gray-50">Metric</button>
                        <button className="flex-1 py-0.5 text-center hover:bg-gray-50">Outcome</button>
                      </div>
                      <p className="text-gray-500 mb-3 text-[9.5px]">Select a metric and set targets to monitor performance.</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-gray-500 font-bold">Metric</label>
                          <select className="w-full bg-white border border-[#bdcddc] rounded px-1.5 py-1 text-[10px]">
                            <option>30-Day Readmission Rate</option>
                          </select>
                        </div>
                        <div className="space-y-1 bg-gray-50 p-2 rounded border border-[#bdcddc]/50">
                          <div className="flex justify-between"><span>Target</span><span className="font-bold">&lt;= 12.0%</span></div>
                          <div className="flex justify-between mt-1"><span>Predicted</span><span className="font-bold text-blue-900">10.8%</span></div>
                          <div className="flex justify-between mt-1"><span>Current</span><span className="font-bold">11.3%</span></div>
                        </div>
                        <div className="space-y-0.5 text-[9.5px] border-t border-gray-100 pt-2 text-gray-600">
                          <div className="flex justify-between"><span>Benchmark</span><span>9.6%</span></div>
                          <div className="flex justify-between"><span>Top Performer</span><span>7.2%</span></div>
                        </div>
                      </div>
                    </div>
                    <button className="w-full border border-[#bdcddc] hover:bg-gray-50 py-1 font-bold rounded mt-3">✏️ Edit Target</button>
                  </div>

                  <div className="bg-white border border-[#bdcddc] p-3 rounded shadow-sm flex flex-col h-[280px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">Trend Analysis</span>
                      <div className="flex gap-2 text-[10px] items-center text-gray-600">
                        <div>Metric: <select className="bg-white border border-[#bdcddc] px-1 py-0.5"><option>30-Day Readmission Rate</option></select></div>
                        <div>View: <select className="bg-white border border-[#bdcddc] px-1 py-0.5"><option>Weekly</option></select></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full text-[9px] -ml-6 mt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#a0a0a0" />
                          <YAxis stroke="#a0a0a0" domain={[0, 25]} tickCount={6} />
                          <Tooltip />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                          <Line type="monotone" dataKey="Actual" stroke="#007cc0" strokeWidth={2} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Target" stroke="#27ae60" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="Benchmark" stroke="#7f8c8d" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="TopPerformer" stroke="#8e44ad" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#bdcddc] rounded shadow-sm overflow-hidden">
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] p-2 font-bold text-xs">
                    Performance by Department
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#bdcddc]">
                          <th className="p-2 border-r border-[#bdcddc]">Department</th>
                          <th className="p-2 border-r border-[#bdcddc]">Encounters</th>
                          <th className="p-2 border-r border-[#bdcddc]">% of Total</th>
                          <th className="p-2 border-r border-[#bdcddc]">Avg LOS (Days)</th>
                          <th className="p-2 border-r border-[#bdcddc]">Readmission Rate (%)</th>
                          <th className="p-2 border-r border-[#bdcddc]">Mortality Rate (%)</th>
                          <th className="p-2 border-r border-[#bdcddc]">Patient Satisfaction (%)</th>
                          <th className="p-2 font-bold text-center">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(departmentData || []).map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="p-2 border-r border-gray-200 font-bold text-[#0d7a86]">{row.name}</td>
                            <td className="p-2 border-r border-gray-200">{row.count}</td>
                            <td className="p-2 border-r border-gray-200">{row.pct}</td>
                            <td className="p-2 border-r border-gray-200">{row.los}</td>
                            <td className="p-2 border-r border-gray-200 font-semibold">{row.readmit}</td>
                            <td className="p-2 border-r border-gray-200">{row.mortality}</td>
                            <td className="p-2 border-r border-gray-200 font-bold text-blue-900">{row.sat}</td>
                            <td className="p-2 font-bold text-center">
                              {row.trend === 'up' && <span className="text-green-600">📈</span>}
                              {row.trend === 'down' && <span className="text-red-600">📉</span>}
                              {row.trend === 'stable' && <span className="text-gray-500">➡️</span>}
                            </td>
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

export default AnalyticsTab;
