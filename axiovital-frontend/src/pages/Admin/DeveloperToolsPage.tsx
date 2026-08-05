import React from 'react';
import { extensionApps, getAppIcon } from '../_shared/constants';

interface DeveloperToolsPageProps {
  handleLogout: () => void;
  selectOrOpenTab: (type: any, title: string, id: string) => void;
  devSidebarExpanded: Record<string, boolean>;
  setDevSidebarExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const DeveloperToolsPage: React.FC<DeveloperToolsPageProps> = ({
  handleLogout = () => {},
  selectOrOpenTab = () => {},
  devSidebarExpanded = { MyContentServer: true, Administration: true },
  setDevSidebarExpanded = () => {},
}) => {
  const [devActiveSubPage, setDevActiveSubPage] = React.useState<string>('ComponentManager');
  const [selectedAutomationTool, setSelectedAutomationTool] = React.useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = React.useState<string>('details');
  const [oracleComponents, setOracleComponents] = React.useState<Record<string, boolean>>({
    Imaging: true,
    IpmRepository: false,
    LinkManager: true,
    MSOfficeHtmlConverterSupport: false,
    OracleDocumentsFolders: false,
    PDFWatermark: false,
    PortalVCRHelper: true,
    RedwoodUI: true,
    SESCrawlerExport: true,
    SharedLinks: true,
    SiebelEcmIntegration: false,
    SiebelFilter: false
  });
  return (
<div className="w-screen h-screen bg-[#fafbfc] text-[#333333] text-[10.5px] font-sans flex flex-col select-none overflow-hidden h-full">
        {/* Banner Header with Logo and Search */}
        <div 
          className="h-[36px] bg-gradient-to-r from-[#003366] via-[#005599] to-[#003366] text-white flex justify-between items-center px-2 select-none border-b border-[#002244]"
          style={{ backgroundImage: 'linear-gradient(to right, #00305a 0%, #005aa7 50%, #00305a 100%)' }}
        >
          <div className="flex items-center gap-2">
            {/* AxioVital Developer Panel Logo text styling */}
            <span className="font-extrabold text-[13px] tracking-tight text-white flex items-center">
              AxioVital Developer Panel
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <span onClick={handleLogout} className="cursor-pointer hover:underline">Logout</span>
            <span>|</span>
            <span 
              onClick={() => window.open('https://support.trackcodex.com/', '_blank')} 
              className="cursor-pointer hover:underline"
            >
              Help
            </span>
            <span>|</span>
            <span className="cursor-pointer hover:underline">Refresh Page</span>
          </div>
        </div>

        {/* Top Tab Bar Row */}
        <div className="bg-[#cbd8e3] border-b border-[#bdcddc] px-2 py-0.5 flex gap-1 text-[#002a46] font-bold text-[10px] select-none h-[22px] items-center">
          <button 
            onClick={() => selectOrOpenTab?.('PatientProfile', 'Patient Profile: JOHN DOE', 'patient-doe')}
            className="hover:bg-blue-100/50 px-2 py-0.5 rounded text-[#0f4471] font-semibold flex items-center gap-1"
          >
            ❮ Return to AxioVital
          </button>
          <div className="h-3 w-[1px] bg-gray-400 mx-1" />
          <button className="bg-white border-t border-x border-[#bdcddc] px-3 py-0.5 rounded-t-sm">Search</button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar navigation panel */}
          <div className="w-[220px] bg-[#f0f4f8] border-r border-[#bdcddc] flex flex-col select-none text-[10.5px]">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              
                {/* My Content Server */}
                <div 
                  onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, MyContentServer: !prev.MyContentServer }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.MyContentServer ? '➖' : '➕'}</span> <span>My Content Server</span>
                </div>
                {devSidebarExpanded.MyContentServer && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under My Content Server</div>
                )}

                {/* Browse Content */}
                <div 
                  onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, BrowseContent: !prev.BrowseContent }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.BrowseContent ? '➖' : '➕'}</span> <span>Browse Content</span>
                </div>
                {devSidebarExpanded.BrowseContent && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Browse Content</div>
                )}

                {/* Search */}
                <div 
                  onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, Search: !prev.Search }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.Search ? '➖' : '➕'}</span> <span>Search</span>
                </div>
                {devSidebarExpanded.Search && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Search</div>
                )}

                {/* Content Management */}
                <div 
                  onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, ContentManagement: !prev.ContentManagement }))}
                  className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                >
                  <span>{devSidebarExpanded.ContentManagement ? '➖' : '➕'}</span> <span>Content Management</span>
                </div>
                {devSidebarExpanded.ContentManagement && (
                  <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Content Management</div>
                )}

                {/* Administration */}
                <div className="pt-1">
                  <div 
                    onClick={() => setDevSidebarExpanded?.(prev => {
                      const isClosing = prev.Administration;
                      if (isClosing) {
                        return {
                          ...prev,
                          Administration: false,
                          LogFiles: false,
                          RefineryAdministration: false,
                          ScheduledJobsAdministration: false,
                          AdminServer: false,
                          FrameworkFolders: false,
                          ImagingMigration: false,
                          FoldersRetention: false,
                          SmartContent: false,
                          SiteStudio: false
                        };
                      }
                      return {
                        ...prev,
                        Administration: true
                      };
                    })}
                    className="flex items-center gap-1 p-1 font-bold text-[#003366] hover:bg-[#cbd8e3] rounded cursor-pointer"
                  >
                    <span>{devSidebarExpanded.Administration ? '➖' : '➕'}</span> <span>Administration</span>
                  </div>
                  
                  {devSidebarExpanded.Administration && (
                    <div className="pl-3 space-y-0.5 text-[#333333]">
                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, LogFiles: !prev.LogFiles }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.LogFiles ? '➖' : '➕'}</span> <span>Log Files</span>
                      </div>

                      {devSidebarExpanded.LogFiles && (
                        <div className="pl-4 space-y-0.5 border-l border-gray-300">
                          <div 
                            onClick={() => {
                              setDevActiveSubPage('ComponentManager');
                              setSelectedAutomationTool(null);
                            }}
                            className={`p-1 cursor-pointer hover:text-blue-900 ${devActiveSubPage === 'ComponentManager' ? 'text-blue-900 font-bold bg-[#cbd8e3]/50 border-y border-[#bdcddc]/50' : 'text-[#333333]'}`}
                          >
                            📄 Component Manager
                          </div>
                          <div className="p-1 hover:text-blue-900 cursor-pointer">📄 General Configuration</div>
                          <div className="p-1 hover:text-blue-900 cursor-pointer">📄 Content Security</div>
                          <div className="p-1 hover:text-blue-900 cursor-pointer">📄 Internet Configuration</div>
                        </div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, RefineryAdministration: !prev.RefineryAdministration }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.RefineryAdministration ? '➖' : '➕'}</span> <span>Refinery Administration</span>
                      </div>
                      {devSidebarExpanded.RefineryAdministration && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Refinery Administration</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, ScheduledJobsAdministration: !prev.ScheduledJobsAdministration }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.ScheduledJobsAdministration ? '➖' : '➕'}</span> <span>Scheduled Jobs Administration</span>
                      </div>
                      {devSidebarExpanded.ScheduledJobsAdministration && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Scheduled Jobs</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, AdminServer: !prev.AdminServer }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.AdminServer ? '➖' : '➕'}</span> <span>Admin Server</span>
                      </div>
                      {devSidebarExpanded.AdminServer && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Admin Server</div>
                      )}

                      <div className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">
                        <span>📄</span> <span>Environment Packager</span>
                      </div>

                      <div className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">
                        <span>📄</span> <span>Localization</span>
                      </div>

                      <div className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer">
                        <span>📄</span> <span>DataStoreDesign SQL Generation</span>
                      </div>

                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, FrameworkFolders: !prev.FrameworkFolders }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.FrameworkFolders ? '➖' : '➕'}</span> <span>FrameworkFolders Configuration</span>
                      </div>
                      {devSidebarExpanded.FrameworkFolders && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under FrameworkFolders</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, ImagingMigration: !prev.ImagingMigration }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.ImagingMigration ? '➖' : '➕'}</span> <span>Imaging Migration Administration</span>
                      </div>
                      {devSidebarExpanded.ImagingMigration && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Imaging Migration</div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, FoldersRetention: !prev.FoldersRetention }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.FoldersRetention ? '➖' : '➕'}</span> <span>Folders Retention Administration</span>
                      </div>
                      {devSidebarExpanded.FoldersRetention && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Folders Retention</div>
                      )}

                      <div 
                        onClick={() => {
                          setDevSidebarExpanded?.(prev => ({ ...prev, SmartContent: !prev.SmartContent }));
                          setDevActiveSubPage('SmartContent');
                          setSelectedAutomationTool(null);
                        }}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer font-bold text-[#003366]"
                      >
                        <span>{devSidebarExpanded.SmartContent ? '➖' : '➕'}</span> <span>SmartContent</span>
                      </div>
                      {devSidebarExpanded.SmartContent && (
                        <div className="pl-4 space-y-0.5 border-l border-gray-300">
                          <div 
                            onClick={() => {
                              setDevActiveSubPage('SmartContent');
                              setSelectedAutomationTool(null);
                            }}
                            className={`p-1 cursor-pointer hover:text-blue-900 ${devActiveSubPage === 'SmartContent' && !selectedAutomationTool ? 'text-blue-900 font-bold bg-[#cbd8e3]/50 border-y border-[#bdcddc]/50' : 'text-[#333333]'}`}
                          >
                            📄 Application Portal
                          </div>
                        </div>
                      )}

                      <div 
                        onClick={() => setDevSidebarExpanded?.(prev => ({ ...prev, SiteStudio: !prev.SiteStudio }))}
                        className="flex items-center gap-1 p-1 hover:bg-[#cbd8e3] rounded cursor-pointer"
                      >
                        <span>{devSidebarExpanded.SiteStudio ? '➖' : '➕'}</span> <span>Site Studio Administration</span>
                      </div>
                      {devSidebarExpanded.SiteStudio && (
                        <div className="pl-4 text-gray-500 italic text-[9.5px]">No items under Site Studio</div>
                      )}
                    </div>
                  )}
                </div>

              
            </div>
          </div>

          {/* Right Content Panel - Component list form */}
          <div className="flex-1 overflow-y-auto p-4 bg-white select-text">
            <div className="max-w-[1100px] mx-auto space-y-4">
              {devActiveSubPage === 'SmartContent' ? (
                <>
                                      <div className="space-y-4">
                      {/* SmartContent Portal Header */}
                      <div className="bg-[#cbd8e3]/30 p-3.5 border border-[#bdcddc] rounded-none text-[#002a46] select-none">
                        <div className="font-bold text-xs">SmartContent - Automation Platform Integration</div>
                        <div className="text-gray-600 text-[10px] mt-1 leading-relaxed">
                          Launch active mock services and system extensions. Below are the available automation integrations for the Axiovital platform. Click any application card to connect or configure its API extensions.
                        </div>
                      </div>

                      {/* App Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                        {[
                          { 
                            id: 'appbar-mock', 
                            name: 'Appbar - MOCK_', 
                            type: 'Cerner Appbar', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isCerner: true,
                            identifier: 'axiovital.cerner.appbar.mock',
                            version: '2.4.1',
                            lastUpdated: '2 days ago',
                            size: '1.84MB',
                            description: 'Provides the mock execution environment for Cerner Application Bar services inside the Axiovital orchestration layer. Allows developers to test automated token rotation and patient context synchronization APIs without deploying to active staging systems.',
                            features: '• Full JWT token validation\n• Session persistence hooks\n• Axiovital desktop bridging',
                            changelog: 'v2.4.1:\n- Fixed token expiry notification delay\n- Added support for India ABHA schema header translation'
                          },
                          { 
                            id: 'appbar-readonly', 
                            name: 'Appbar - READONLY', 
                            type: 'Cerner Appbar', 
                            iconBg: 'bg-[#d32f2f]', 
                            isRed: true, 
                            isCerner: true,
                            identifier: 'axiovital.cerner.appbar.readonly',
                            version: '1.2.0',
                            lastUpdated: '3 months ago',
                            size: '1.12MB',
                            description: 'A read-only mode wrapper for the Cerner Appbar. It ensures automation pipelines can monitor active workspaces, active users, and status flags without the permissions required to modify state or inject tokens.',
                            features: '• Zero-write permissions enforcement\n• Workstation status broadcast\n• Resource usage logging',
                            changelog: 'v1.2.0:\n- Implemented security hardening audit logging\n- Optimized frame refresh overhead'
                          },
                          { 
                            id: 'appbar-reg', 
                            name: 'AppBar_', 
                            type: 'Cerner Appbar', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isCerner: true,
                            identifier: 'axiovital.cerner.appbar.production',
                            version: '3.1.2',
                            lastUpdated: '1 week ago',
                            size: '2.45MB',
                            description: 'Production integration client for Cerner AppBar. Connects directly to local hospital workstations to synchronise patient context and launch clinical workflows with native ActiveX/Java adapters.',
                            features: '• Native OS API bridging\n• Active Directory credentials auto-link\n• Multi-workstation broadcast support',
                            changelog: 'v3.1.2:\n- Improved connection stability with legacy Citrix storefront environments'
                          },
                          { 
                            id: 'citrix', 
                            name: 'Citrix Storefront', 
                            type: 'Citrix Systems', 
                            iconBg: 'bg-white border-gray-200', 
                            isCitrix: true,
                            identifier: 'axiovital.citrix.storefront',
                            version: '4.8.0',
                            lastUpdated: '2 weeks ago',
                            size: '15.42MB',
                            description: 'Allows Axiovital smart extensions to communicate directly with Citrix Storefront virtual desktops. Handles automated application launching, credentials handoff, and virtual workspace session monitoring.',
                            features: '• Workspace App auto-detection\n• Active desktop resolution detection\n• Session failover automation client',
                            changelog: 'v4.8.0:\n- Added HDX protocol acceleration wrapper\n- Upgraded Citrix Receiver SDK'
                          },
                          { 
                            id: 'dragon', 
                            name: 'Dragon-DMO_', 
                            type: 'Nuance Dragon', 
                            iconBg: 'bg-[#0a2f5c]', 
                            isDragon: true,
                            identifier: 'axiovital.nuance.dragon.dmo',
                            version: '5.1.0',
                            lastUpdated: '5 days ago',
                            size: '8.90MB',
                            description: 'Integrates Nuance Dragon Medical One speech recognition dictation services with the Axiovital progress notes editor. Allows clinicians to dictate notes directly using automatic medical terminology vocabulary.',
                            features: '• Direct audio channel mapping\n• Auto-correction vocabulary sync\n• Voice command shortcut parser',
                            changelog: 'v5.1.0:\n- Enhanced voice command shortcuts mapping inside note editing grid'
                          },
                          { 
                            id: 'esm', 
                            name: 'ESM Scheduling_', 
                            type: 'Cerner Scheduling', 
                            iconBg: 'bg-white border-gray-200', 
                            isEsm: true,
                            identifier: 'axiovital.cerner.esm.scheduling',
                            version: '2.9.4',
                            lastUpdated: '1 month ago',
                            size: '4.20MB',
                            description: 'Cerner Enterprise Scheduling Management integration tool. Automatically pulls rescheduled appointments, pending requests, and assigns room queues for incoming patient check-ins.',
                            features: '• Real-time queue monitoring\n• Automatic reschedule push notifications\n• Doctor roster matching database',
                            changelog: 'v2.9.4:\n- Added check-in queue priority tags configuration panel'
                          },
                          { 
                            id: 'icare', 
                            name: 'iCare', 
                            type: 'iCare Platform', 
                            iconBg: 'bg-white border-gray-200', 
                            isIcare: true,
                            identifier: 'axiovital.icare.ehr',
                            version: '3.6.0',
                            lastUpdated: '12 days ago',
                            size: '6.75MB',
                            description: 'Electronic Health Record connector for iCare systems. Imports patient demographics, encounter timelines, and medication histories directly into Axiovital workspace pages.',
                            features: '• HL7 FHIR query parser\n• Allergy list cross-checking engine\n• Offline cache and sync database',
                            changelog: 'v3.6.0:\n- Migrated database connector to modern FHIR R4 schema interfaces'
                          },
                          { 
                            id: 'ipac', 
                            name: 'IPAC - MGH Cleaning Guidelines', 
                            type: 'Adobe Acrobat', 
                            iconBg: 'bg-[#f40f0f]', 
                            isPdf: true,
                            identifier: 'axiovital.pdf.mgh.cleaning',
                            version: '1.0.4',
                            lastUpdated: '6 months ago',
                            size: '2.58MB',
                            description: 'Interactive PDF guidelines manual for MGH cleaning and disinfection protocols. Fully searchable with hyperlinked chapters, quick reference cards, and index links.',
                            features: '• High-performance PDF renderer\n• Highlight and notes tool\n• Quick keyword index search bar',
                            changelog: 'v1.0.4:\n- Updated sanitization compound references lists'
                          },
                          { 
                            id: 'notepad', 
                            name: 'Notepad', 
                            type: 'System Tool', 
                            iconBg: 'bg-white border-gray-200', 
                            isNotepad: true,
                            identifier: 'axiovital.system.notepad',
                            version: '1.0.0',
                            lastUpdated: '8 months ago',
                            size: '340KB',
                            description: 'Standard notepad utility helper for copying text, cleaning formatting, and draft tracking. Supports auto-save to local workspace memory.',
                            features: '• Text cleanup filters\n• Temporary clipboard registers\n• Markdown draft preview option',
                            changelog: 'v1.0.0:\n- First stable release'
                          },
                          { 
                            id: 'powerchart-mock', 
                            name: 'Powerchart - MOCK_', 
                            type: 'Cerner Powerchart', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isPowerchart: true,
                            identifier: 'axiovital.cerner.powerchart.mock',
                            version: '5.2.0',
                            lastUpdated: '3 days ago',
                            size: '8.50MB',
                            description: 'Simulates the Oracle Cerner PowerChart runtime environment. Supports patient chart automation, progress note injection, and direct smart extension messaging protocols.',
                            features: '• Clinical notes injection emulator\n• Labs and vitals mock query service\n• Patient context listener interface',
                            changelog: 'v5.2.0:\n- Added mock laboratory result generator module'
                          },
                          { 
                            id: 'powerchart-readonly', 
                            name: 'Powerchart - READONLY', 
                            type: 'Cerner Powerchart', 
                            iconBg: 'bg-[#d32f2f]', 
                            isRed: true, 
                            isPowerchart: true,
                            identifier: 'axiovital.cerner.powerchart.readonly',
                            version: '2.1.0',
                            lastUpdated: '2 months ago',
                            size: '5.80MB',
                            description: 'A read-only mode wrapper for the PowerChart environment simulator. Allows automation tools to verify chart items, diagnostics, and patient summaries without modifying live records.',
                            features: '• Zero-write permissions security lock\n• Document export listener\n• XML reports parsing console',
                            changelog: 'v2.1.0:\n- Added automated chart contents export parser module'
                          },
                          { 
                            id: 'powerchart-reg', 
                            name: 'Powerchart_', 
                            type: 'Cerner Powerchart', 
                            iconBg: 'bg-[#005cbb]', 
                            isRed: false, 
                            isPowerchart: true,
                            identifier: 'axiovital.cerner.powerchart.production',
                            version: '6.3.4',
                            lastUpdated: '4 days ago',
                            size: '14.85MB',
                            description: 'Production integration client for Oracle Cerner PowerChart. Automatically links current patient encounters to active hospital workstation records.',
                            features: '• Native windows shell integration\n• High-performance SOAP/REST client\n• Patient safety context validation checks',
                            changelog: 'v6.3.4:\n- Enhanced support for high-DPI desktop scale factors'
                          },
                          { 
                            id: 'tech-remote', 
                            name: 'TECH Remote Support', 
                            type: 'TeamViewer Support', 
                            iconBg: 'bg-[#0080ff]', 
                            isTech: true,
                            identifier: 'axiovital.remote.support',
                            version: '12.0.4',
                            lastUpdated: '10 days ago',
                            size: '8.12MB',
                            description: 'Integrated TeamViewer Remote Support launcher. Allows system administrators to quickly connect to this workstation for diagnostic monitoring or configuration fixes.',
                            features: '• One-click support request trigger\n• Diagnostic logs export helper\n• Active connection status panel',
                            changelog: 'v12.0.4:\n- Upgraded TeamViewer client SDK version'
                          }
                        ].map((app) => (
                          <div 
                            key={app.id} 
                            onClick={() => {
                              setSelectedAutomationTool(app);
                              setActiveDetailTab('details');
                            }}
                            className="bg-white border border-[#bdcddc] hover:border-blue-500 hover:shadow-md transition-all p-3.5 flex flex-col items-center justify-between text-center cursor-pointer min-h-[140px] rounded-none group select-none relative"
                          >
                            {/* Application Icon */}
                            <div className="flex-1 flex items-center justify-center mb-2">
                              <div className={`w-[44px] h-[44px] rounded-sm flex items-center justify-center text-white font-extrabold shadow-sm ${app.iconBg}`}>
                                {app.isCerner && (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${app.isRed ? 'bg-red-650' : 'bg-blue-650'}`}>
                                    A
                                  </div>
                                )}
                                {app.isCitrix && (
                                  <div className="flex flex-wrap w-6 h-6 items-center justify-center gap-0.5">
                                    {[...Array(9)].map((_, i) => (
                                      <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    ))}
                                  </div>
                                )}
                                {app.isDragon && (
                                  <span className="text-[20px]">🐉</span>
                                )}
                                {app.isEsm && (
                                  <div className="w-7 h-7 bg-green-600 rounded-sm flex items-center justify-center text-[16px] text-white font-bold">
                                    S
                                  </div>
                                )}
                                {app.isIcare && (
                                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-[18px] font-serif text-white italic">
                                    i
                                  </div>
                                )}
                                {app.isPdf && (
                                  <span className="text-[14px] font-sans font-extrabold text-white">PDF</span>
                                )}
                                {app.isNotepad && (
                                  <span className="text-[24px]">📝</span>
                                )}
                                {app.isPowerchart && (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${app.isRed ? 'bg-red-750' : 'bg-blue-750'}`}>
                                    P
                                  </div>
                                )}
                                {app.isTech && (
                                  <span className="text-[22px]">🔄</span>
                                )}
                              </div>
                            </div>

                            {/* Text details */}
                            <div className="space-y-0.5 w-full">
                              <div className="font-bold text-[9px] text-gray-800 group-hover:text-blue-900 leading-snug w-full select-text" title={app.name}>
                                {app.name}
                              </div>
                            </div>

                            {/* Chevron at bottom */}
                            <div className="text-[8px] text-gray-300 mt-1 select-none">
                              ▼
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  {/* Tool Popup Modal */}
                  {selectedAutomationTool && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ zIndex: 99999 }}>
                      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col overflow-hidden font-sans text-gray-800" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                           <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded flex items-center justify-center text-white font-extrabold shadow-sm ${selectedAutomationTool.iconBg}`}>
                               {selectedAutomationTool.isCerner && <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${selectedAutomationTool.isRed ? 'bg-red-650' : 'bg-blue-650'}`}>A</div>}
                               {selectedAutomationTool.isCitrix && <div className="flex flex-wrap w-6 h-6 items-center justify-center gap-0.5">{[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full" />)}</div>}
                               {selectedAutomationTool.isDragon && <span className="text-[20px]">🐉</span>}
                               {selectedAutomationTool.isEsm && <div className="w-7 h-7 bg-green-600 rounded-sm flex items-center justify-center text-[16px] text-white font-bold">S</div>}
                               {selectedAutomationTool.isIcare && <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-[18px] font-serif text-white italic">i</div>}
                               {selectedAutomationTool.isPdf && <span className="text-[14px] font-sans font-extrabold text-white">PDF</span>}
                               {selectedAutomationTool.isNotepad && <span className="text-[24px]">📝</span>}
                               {selectedAutomationTool.isPowerchart && <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[18px] font-serif ${selectedAutomationTool.isRed ? 'bg-red-750' : 'bg-blue-750'}`}>P</div>}
                               {selectedAutomationTool.isTech && <span className="text-[22px]">🔄</span>}
                             </div>
                             <div>
                               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                 {selectedAutomationTool.name}
                               </h2>
                               <p className="text-sm text-gray-500">{selectedAutomationTool.description.length > 80 ? selectedAutomationTool.description.substring(0, 80) + '...' : selectedAutomationTool.description}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-3">
                             <button className="bg-[#1a1a1a] hover:bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
                               <span className="text-lg leading-none">+</span> Add connector
                             </button>
                             <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); setSelectedAutomationTool(null); }}
                               className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
                             >
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                             </button>
                           </div>
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 overflow-hidden">
                          {/* Left Column - Overview */}
                          <div className="w-[300px] border-r border-gray-100 p-6 overflow-y-auto flex flex-col gap-8 bg-gray-50/30">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-4">Overview</h3>
                              <ul className="space-y-4">
                                {selectedAutomationTool.features.split('\n').map((feature: string, idx: number) => (
                                  <li key={idx} className="flex gap-3 text-sm text-gray-600 leading-snug">
                                    <div className="mt-0.5 text-gray-400 bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px]">➔</div>
                                    <span>{feature.replace('• ', '')}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mt-auto pt-6">
                              <div>
                                <h3 className="text-xs font-semibold text-gray-900 mb-3">Links</h3>
                                <ul className="space-y-3">
                                  <li><a href="#" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Website</a></li>
                                  <li><a href="#" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> Documentation</a></li>
                                  <li><a href="#" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Support</a></li>
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold text-gray-900 mb-3">Developed by</h3>
                                <div className="text-gray-500">Axiovital</div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Tools */}
                          <div className="flex-1 p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-sm font-semibold text-gray-900">Tools</h3>
                              <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input type="text" placeholder="Search tools" className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-[240px]" />
                              </div>
                            </div>

                            {/* Section 1 */}
                            <div className="mb-6">
                              <div className="bg-gray-50 px-3 py-2 rounded-md flex justify-between items-center text-sm mb-2 border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                  Read-only tools
                                </div>
                                <button className="text-xs font-medium bg-white border border-gray-200 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-gray-50 text-gray-700 cursor-pointer">
                                  Allow <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between items-start py-3 px-2 border-b border-gray-50 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Read Configuration</h4>
                                    <p className="text-sm text-gray-500">Read system configuration for {selectedAutomationTool.name}.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-start py-3 px-2 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Search Logs</h4>
                                    <p className="text-sm text-gray-500">Search and read operational logs.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Section 2 */}
                            <div>
                              <div className="bg-gray-50 px-3 py-2 rounded-md flex justify-between items-center text-sm mb-2 border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                  Write / delete tools
                                </div>
                                <button className="text-xs font-medium bg-white border border-gray-200 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-gray-50 text-gray-700 cursor-pointer">
                                  Allow <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between items-start py-3 px-2 border-b border-gray-50 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Execute Workflows</h4>
                                    <p className="text-sm text-gray-500">Trigger automation workflows via this connector.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-start py-3 px-2 border-b border-gray-50 hover:bg-gray-50/50 rounded-sm">
                                  <div className="flex-1">
                                    <h4 className="text-sm text-gray-800 font-medium mb-1">Update Data</h4>
                                    <p className="text-sm text-gray-500">Modify external state via write API operations.</p>
                                  </div>
                                  <div className="flex bg-gray-100 rounded-md p-0.5 ml-4 shrink-0">
                                    <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 cursor-pointer">Disable</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-900 border border-gray-200/50 cursor-pointer">Allow</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="border border-blue-900/30 rounded-sm overflow-hidden bg-white shadow-sm">
                  {/* Header Title Section */}
                  <div className="bg-[#cbd8e3]/40 border-b border-[#bdcddc] p-2 font-bold text-xs text-[#002a46] flex justify-between items-center select-none">
                    <span>Component Manager - Core Application Settings</span>
                    <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 px-2 py-0.5 rounded text-[10px] text-gray-700">Refresh Settings</button>
                  </div>
                  
                  <div className="p-4 space-y-4 text-[11px] text-[#333333]">
                    {/* Informational description */}
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-sm text-blue-900 leading-relaxed select-none">
                      Select or deselect the options below to activate or deactivate the respective configuration elements across this environment. After making changes, click the "Save Changes" button to apply settings.
                    </div>

                    <div className="space-y-4 mt-2">
                      {[
                        { key: 'Imaging', name: 'Imaging', desc: 'This Component acts as the interface for any IPM Documents checked into Content Server and tools such as ADF Viewer use functionality and services provided by this component.' },
                        { key: 'IpmRepository', name: 'IpmRepository', desc: 'The IpmRepository component adds functionality to the content server to allow Oracle WebCenter Content: Imaging to store documents and metadata in the content server.' },
                        { key: 'LinkManager', name: 'LinkManager', desc: 'This component extracts URL links of indexed documents, evaluates, filters and parses the URLs according to a pattern engine and then stores the results in a database table. Since the link extraction happens during the indexing cycle, only the links of released documents are managed.' },
                        { key: 'MSOfficeHtmlConverterSupport', name: 'MSOfficeHtmlConverterSupport', desc: 'The MSOfficeHTMLConverter component requires the IBR be running on MS Windows and MS Office installed with IBR. This component allows the Inbound Refinery to convert native MS Office formats (Word, Excel, Powerpoint and Visio) to HTML using the Office application.' },
                        { key: 'OracleDocumentsFolders', name: 'OracleDocumentsFolders', desc: 'This component enables Content Server to seamlessly integrate with Oracle Content and Experience Cloud. It allows user to store and retrieve documents stored in Oracle Content and Experience Cloud. It also provides the ability to copy content stored in the Content Server to Oracle Content and Experience Cloud.' },
                        { key: 'PDFWatermark', name: 'PDFWatermark', desc: 'PDFWatermark enables watermarks to be applied to PDF files generated by the Inbound Refinery\'s PDFConverter component and returned to the Content Server. Existing PDF files, already residing on the Content Server can also be watermarked. Dynamic watermarks are generated on-the-fly and can contain variable information.' },
                        { key: 'PortalVCRHelper', name: 'PortalVCRHelper', desc: 'PortalVCRHelper is used to integrate SiteStudio into WebCenter Portal\'s Content Presenter component. PortalVCRHelper should be enabled in order to surface SiteStudio content within WebCenter Portal.' },
                        { key: 'RedwoodUI', name: 'RedwoodUI', desc: 'This component offers a modern, configurable user interface built with Oracle Redwood design principles. RedwoodUI requires that FrameworkFolders be installed and enabled.' },
                        { key: 'SESCrawlerExport', name: 'SESCrawlerExport', desc: 'The SESCrawlerExport component adds functionality to the content server to allow it to be searched via the Oracle SES.' },
                        { key: 'SharedLinks', name: 'SharedLinks', desc: 'This component supports sharing and managing public links on folders and files. Guest users can use public links to access folders and files without authentication.' },
                        { key: 'SiebelEcmIntegration', name: 'SiebelEcmIntegration', desc: 'This component is a required part of the Siebel Adapter for Oracle WebCenter Content. It allows Siebel CRM users to store and retrieve Siebel business entity attached documents managed in the Content Server repository. The SiebelIntegrationSearchDisplay component also needs to be enabled for this component to function correctly.' },
                        { key: 'SiebelFilter', name: 'SiebelFilter', desc: '[OPTIONAL] This component is an optional part of the Siebel Adapter for Oracle WebCenter Content. It enables filtering of attachments based on criteria before indexing.' }
                      ].map((comp) => (
                        <div key={comp.key} className="flex gap-2.5 items-start hover:bg-gray-50 p-2 rounded-sm border-b border-gray-100 pb-3 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={oracleComponents[comp.key] || false}
                            onChange={(e) => {
                              setOracleComponents(prev => ({
                                ...prev,
                                [comp.key]: e.target.checked
                              }));
                            }}
                            className="mt-0.5 rounded-sm w-3.5 h-3.5 border-gray-300 text-blue-900 focus:ring-blue-900 cursor-pointer" 
                            id={`ora-comp-${comp.key}`} 
                          />
                          <div className="space-y-1">
                            <label htmlFor={`ora-comp-${comp.key}`} className="font-bold text-blue-900 cursor-pointer hover:underline text-[11px] block">{comp.name}</label>
                            <p className="text-gray-600 text-[10px] leading-relaxed">{comp.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 select-none border-t border-gray-100">
                      <button className="bg-white border border-[#bdcddc] hover:bg-gray-50 text-gray-700 font-bold px-4 py-1.5 rounded-sm text-[10px] transition-all">
                        Reset Configuration
                      </button>
                      <button className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-1.5 rounded-sm text-[10px] shadow-sm transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DeveloperToolsPage;
