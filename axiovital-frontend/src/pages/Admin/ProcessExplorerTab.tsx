import React from 'react';
import { extensionApps, getAppIcon } from '../_shared/constants';

export const ProcessExplorerTab: React.FC = () => {
  return (
    <div className="flex-1 bg-white p-6 overflow-auto font-sans select-none">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-bold text-[#0f4471] mb-1">Process Explorer & Extensions Support</h1>
          <p className="text-gray-500 text-[10.5px]">Select any active process or extension from the registry below to launch it within the operating environment.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-4 pt-2">
          {(extensionApps || []).map((app) => (
            <div 
              key={app.key}
              onClick={() => alert(`Launching ${app.name}...`)}
              className="flex flex-col items-center p-3 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer text-center group"
            >
              <div className="transform group-hover:scale-105 transition-transform">
                {getAppIcon(app.key)}
              </div>
              <span className="mt-2.5 text-[10.5px] font-medium text-gray-700 leading-tight break-words max-w-[110px] group-hover:text-blue-900 group-hover:font-semibold font-sans">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessExplorerTab;
