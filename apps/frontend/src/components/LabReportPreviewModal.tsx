'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Download, Printer, Share2, Maximize2, Minimize2 } from 'lucide-react';

interface LabReportPreviewModalProps {
  patient?: {
    name: string;
    age: string;
    sex: string;
    referredBy?: string;
    regNo?: string;
    uhid?: string;
  };
  report?: {
    testName: string;
    status: 'Verified' | 'Pending';
    collectionTime: string;
    reportTime: string;
    receivedTime?: string;
    registeredTime?: string;
    clinicalNotes?: string;
    results?: Array<{
      name: string;
      value: string;
      unit: string;
      reference: string;
      flag?: 'L' | 'H' | null;
      isHeader?: boolean;
      indent?: boolean;
      boldReference?: boolean;
    }>;
  };
  labData?: {
    labName: string;
    regdNo: string;
    phone: string;
    email: string;
    website: string;
    pathologistName: string;
    pathologistCredentials: string;
    labInchargeName: string;
    labInchargeCredentials: string;
  };
  reportType?: string;
  onClose: () => void;
}

export default function LabReportPreviewModal({
  patient,
  report,
  labData,
  reportType = 'CBC',
  onClose
}: LabReportPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [barcodeLoaded, setBarcodeLoaded] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const activePatient = {
    name: patient?.name || 'Mr. Saubhik Bhaumik',
    age: patient?.age || '27 YRS',
    sex: patient?.sex || 'M',
    referredBy: patient?.referredBy || 'Self',
    regNo: patient?.regNo || '1001',
    uhid: patient?.uhid || 'UHID-54826901'
  };

  const activeLab = {
    labName: labData?.labName || 'Labsmart Software',
    regdNo: labData?.regdNo || 'Regd. No.: XXXX54826XX',
    phone: labData?.phone || '+91 12345 67890',
    email: labData?.email || 'yourlabname@gmail.com',
    website: labData?.website || 'https://www.yourlabname.in/',
    pathologistName: labData?.pathologistName || 'Dr. A. K. Asthana',
    pathologistCredentials: labData?.pathologistCredentials || 'MBBS, MD Pathologist',
    labInchargeName: labData?.labInchargeName || 'Mr. Sachin Sharma',
    labInchargeCredentials: labData?.labInchargeCredentials || 'DMLT, Lab Incharge'
  };

  const activeReport = {
    testName: report?.testName || 'COMPLETE BLOOD COUNT (CBC)',
    status: report?.status || 'Verified',
    collectionTime: report?.collectionTime || '17/10/2024 04:55 PM',
    reportTime: report?.reportTime || '17/10/2024 04:55 PM',
    receivedTime: report?.receivedTime || '17/10/2024 04:55 PM',
    registeredTime: report?.registeredTime || '17/10/2024 04:55 PM',
    results: report?.results || [
      { name: 'HEMOGLOBIN', value: '15', unit: 'g/dl', reference: '13 - 17' },
      { name: 'TOTAL LEUKOCYTE COUNT', value: '5,100', unit: 'cumm', reference: '4,800 - 10,800' },
      { name: 'DIFFERENTIAL LEUCOCYTE COUNT', value: '', unit: '', reference: '', isHeader: true },
      { name: 'NEUTROPHILS', value: '79', unit: '%', reference: '40 - 80', indent: true },
      { name: 'LYMPHOCYTE', value: '18', unit: '%', reference: '20 - 40', flag: 'L', indent: true, boldReference: true },
      { name: 'EOSINOPHILS', value: '1', unit: '%', reference: '1 - 6', indent: true },
      { name: 'MONOCYTES', value: '1', unit: '%', reference: '2 - 10', flag: 'L', indent: true, boldReference: true },
      { name: 'BASOPHILS', value: '1', unit: '%', reference: '< 2', indent: true },
      { name: 'PLATELET COUNT', value: '3.5', unit: 'lakhs/cumm', reference: '1.5 - 4.1' },
      { name: 'TOTAL RBC COUNT', value: '5', unit: 'million/cumm', reference: '4.5 - 5.5' },
      { name: 'HEMATOCRIT VALUE, HCT', value: '42', unit: '%', reference: '40 - 50' },
      { name: 'MEAN CORPUSCULAR VOLUME, MCV', value: '84.0', unit: 'fL', reference: '83 - 101' },
      { name: 'MEAN CELL HEMOGLOBIN, MCH', value: '30.0', unit: 'Pg', reference: '27 - 32' },
      { name: 'MEAN CELL HEMOGLOBIN CON, MCHC', value: '35.7', unit: '%', reference: '31.5 - 34.5', flag: 'H', boldReference: true },
    ]
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsOpen(true);
    });
    document.body.style.overflow = 'hidden';

    const lazyTimer = setTimeout(() => {
      setBarcodeLoaded(true);
      setQrLoaded(true);
      setLogoLoaded(true);
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(lazyTimer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-report-area');
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Lab Report Preview - ${activePatient.name}</title>
            <style>
              body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
              }
              .no-print { display: none; }
              @media print {
                body { padding: 0; }
              }
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div class="w-full max-w-[800px] mx-auto bg-white p-4">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 transform font-sans ${
          isFullScreen ? 'w-full h-full rounded-none' : 'w-[1000px] max-w-[95vw] h-[88vh]'
        } ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* Sticky Toolbar */}
        <div className="bg-[#fafbfc] border-b border-[#bdcddc] px-4 py-2 flex items-center justify-between text-[#333333] text-[12px] font-medium select-none shrink-0 z-20">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900 text-sm">{activePatient.name}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">UHID: {activePatient.uhid}</span>
            <span className="text-gray-400">|</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeReport.status === 'Verified'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {activeReport.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => alert(`Downloading ${activePatient.name}_Report.pdf...`)}
              className="hover:bg-gray-100 p-1.5 rounded flex items-center gap-1 text-gray-700 font-semibold"
            >
              <Download size={15} />
              <span>PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="hover:bg-gray-100 p-1.5 rounded flex items-center gap-1 text-gray-700 font-semibold"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
            <button
              onClick={() => alert(`Sharing link generated for ${activePatient.name}'s Report.`)}
              className="hover:bg-gray-100 p-1.5 rounded flex items-center gap-1 text-gray-700 font-semibold"
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>
            <button
              onClick={toggleFullScreen}
              className="hover:bg-gray-100 p-1.5 rounded flex items-center gap-1 text-gray-700 font-semibold"
            >
              {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
            <button
              onClick={handleClose}
              className="bg-gray-100 hover:bg-red-100 hover:text-red-700 p-1.5 rounded text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Report Sheet Area */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-8 flex justify-center [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-gray-200">
          <div
            id="printable-report-area"
            className="w-[820px] min-h-[1050px] bg-white shadow-lg p-8 relative flex flex-col justify-between border border-gray-300 select-text"
            style={{ boxSizing: 'border-box' }}
          >
            <div>
              {/* Report Header: Letterhead matching second image exactly */}
              <div className="bg-[#005c97] text-white p-5 rounded-t-sm relative flex justify-between items-center select-none overflow-hidden min-h-[100px]">
                <div className="absolute top-2.5 right-4 text-[9.5px] font-mono tracking-wider font-semibold opacity-90">
                  {activeLab.regdNo}
                </div>
                
                {/* Microscope Logo and Lab Name */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1.5 shadow-md">
                    {logoLoaded ? (
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#005c97" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {/* High-fidelity microscope SVG */}
                        <path d="M6 18h8" />
                        <path d="M3 22h18" />
                        <path d="M12 6h7" />
                        <path d="M12 2h2" />
                        <path d="M14 9h-4" />
                        <path d="M9 4h3v5c0 1.66-1.34 3-3 3s-3-1.34-3-3V4z" />
                        <path d="M17 12a5 5 0 0 1-5 5" />
                      </svg>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-[25px] font-bold leading-none tracking-tight">
                      {activeLab.labName}
                    </h1>
                    <p className="text-[19px] font-light tracking-wide opacity-90 mt-1">
                      Sample Letterhead
                    </p>
                  </div>
                </div>

                {/* Contact details */}
                <div className="text-[11.5px] space-y-1.5 text-right font-sans mt-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>📞</span> <span className="font-semibold">{activeLab.phone}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>✉️</span> <span className="font-medium">{activeLab.email}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>🌐</span> <span className="font-medium">{activeLab.website}</span>
                  </div>
                </div>
              </div>

              {/* Patient and Registration Info */}
              <div className="border-y-2 border-gray-400 py-3 mt-4 grid grid-cols-12 gap-2 text-[11px] font-sans text-gray-800 leading-normal">
                <div className="col-span-5 space-y-1 font-medium">
                  <div className="flex text-[12.5px]">
                    <span className="font-bold text-black uppercase">{activePatient.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-600">Age / Sex</span>
                    <span className="text-black">: {activePatient.age} / {activePatient.sex}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-600">Referred by</span>
                    <span className="text-black">: {activePatient.referredBy}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-600">Reg. no.</span>
                    <span className="text-black">: {activePatient.regNo}</span>
                  </div>
                </div>

                {/* Barcode and Registration Dates */}
                <div className="col-span-4 border-l border-gray-300 pl-4 space-y-1 flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    {barcodeLoaded ? (
                      <div className="flex flex-col items-center select-none opacity-85">
                        <div className="flex items-end h-8 gap-[1px]">
                          {[2,1,3,1,2,4,1,2,1,3,1,2,3,1,1,2,2,4,1,1,3,2,1,2,1,1,2,3,1,2].map((w, i) => (
                            <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono tracking-widest mt-0.5">{activePatient.regNo}</span>
                      </div>
                    ) : (
                      <div className="w-32 h-8 bg-gray-200 animate-pulse rounded" />
                    )}
                  </div>
                  <div className="text-[10px] space-y-0.5 text-gray-900">
                    <div><span className="text-gray-500">Registered on:</span> <span className="font-semibold">{activeReport.registeredTime}</span></div>
                    <div><span className="text-gray-500">Collected on:</span> <span className="font-semibold">{activeReport.collectionTime}</span></div>
                    <div><span className="text-gray-500">Received on:</span> <span className="font-semibold">{activeReport.receivedTime}</span></div>
                    <div><span className="text-gray-500">Reported on:</span> <span className="font-semibold">{activeReport.reportTime}</span></div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="col-span-3 border-l border-gray-300 pl-4 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-gray-500 font-sans mb-1 uppercase tracking-wider font-bold">Scan to download</span>
                  <div className="w-16 h-16 bg-white border border-gray-300 p-1 flex items-center justify-center shadow-xs">
                    {qrLoaded ? (
                      <svg width="56" height="56" viewBox="0 0 29 29" fill="black">
                        <path d="M0 0h7v7H0zm1 1v5h5V1zm8 0h3v1H9zm4 0h1v1h-1zm2 0h1v2h-1zm2 0h3v3h-3zm4 0h3v7h-7v-3h1v2h2v-5h-3v-1zm-6 2h1v1h-1zm1 1h2v1h-2zm-3 1h1v1H9zm1 1h1v2h-1zm-7 3h2v1H3zm6 0h1v1H9zm2 0h1v1h-1zm4 0h2v1h-2zm-12 1h1v2H0v-1h2zm13 0h1v1h-1zm3 0h1v2h-1zm2 0h2v2h-2zm-15 1h1v1H3zm6 0h3v1H9zm6 0h1v1h-1zm4 0h1v1h-1zm-13 1h1v1H6zm11 0h1v1h-1zm5 0h1v1h-1zm-21 1h7v7H0zm1 1v5h5V15zm8 0h1v1h-1zm2 0h2v1h-2zm3 0h1v2h-1zm4 0h1v1h-1zm1 0h2v2h-2zm-9 2h1v1H9zm1 1h1v1h-1zm5 0h2v1h-2zm-4 1h1v1h-1zm6 0h1v1h-1zm-5 1h1v1H9zm4 0h1v1h-1zm2 0h2v1h-2z" />
                      </svg>
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 animate-pulse rounded" />
                    )}
                  </div>
                </div>
              </div>

              {/* Test Title */}
              <div className="text-center my-6 space-y-1 select-none">
                <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">HAEMATOLOGY</h2>
                <h3 className="text-[12px] font-bold text-black uppercase tracking-wide">
                  {activeReport.testName}
                </h3>
              </div>

              {/* Results Table */}
              <div className="border-y-2 border-black overflow-hidden font-sans">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black text-black font-bold uppercase select-none">
                      <th className="p-1.5 pl-2 w-[50%]">TEST</th>
                      <th className="p-1.5 w-[15%] text-center">VALUE</th>
                      <th className="p-1.5 pl-4 w-[15%]">UNIT</th>
                      <th className="p-1.5 pl-2 w-[20%]">REFERENCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.results.map((row, idx) => {
                      if (row.isHeader) {
                        return (
                          <tr key={idx} className="border-b border-gray-200">
                            <td colSpan={4} className="p-1.5 pl-2 font-bold text-black uppercase tracking-wide">
                              {row.name}
                            </td>
                          </tr>
                        );
                      }
                      
                      const hasFlag = row.flag === 'L' || row.flag === 'H';
                      
                      return (
                        <tr
                          key={idx}
                          className="border-b border-gray-150 last:border-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className={`p-1.5 text-black ${row.indent ? 'pl-6 font-medium text-gray-700' : 'pl-2 font-bold'}`}>
                            {row.name}
                          </td>
                          <td className="p-1.5 text-center text-black font-medium">
                            {hasFlag ? (
                              <span className="font-bold">
                                <span className="mr-2">{row.flag}</span>
                                <span>{row.value}</span>
                              </span>
                            ) : (
                              <span>{row.value}</span>
                            )}
                          </td>
                          <td className="p-1.5 pl-4 text-gray-600">
                            {row.unit}
                          </td>
                          <td className={`p-1.5 pl-2 text-black ${row.boldReference ? 'font-bold' : ''}`}>
                            {row.reference}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Clinical Notes Section */}
              <div className="mt-6 text-[11px] font-sans text-gray-800 leading-relaxed">
                <div className="font-bold text-black pb-1 mb-1">
                  Clinical Notes:
                </div>
                <p>
                  A complete blood count (CBC) is used to evaluate overall health and detect a wide range of disorders, including anemia, infection, and leukemia. There have been some reports of WBC and platelet counts being lower in venous blood than in capillary blood samples, although still within these reference ranges.
                </p>

                {/* Possible Causes table */}
                <div className="mt-3 border border-dotted border-gray-400 rounded-xs p-2 bg-gray-50/40">
                  <div className="font-bold text-gray-900 mb-1 select-none text-[10px]">Possible causes of abnormal parameters:</div>
                  <table className="w-full text-left text-[9.5px] border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300 text-gray-700 font-bold select-none">
                        <th className="pb-1 w-[20%]">Parameter</th>
                        <th className="pb-1 w-[40%]">High</th>
                        <th className="pb-1 w-[40%]">Low</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-1 font-bold text-black">RBC, Hb, or HCT</td>
                        <td className="py-1 pr-2 text-gray-600">Dehydration, polycythemia, shock, chronic hypoxia</td>
                        <td className="py-1 text-gray-600">Anemia, thalassemia, and other hemoglobinopathies</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-black">MCV</td>
                        <td className="py-1 pr-2 text-gray-600">Macrocytic anemia, liver disease</td>
                        <td className="py-1 text-gray-600">Microcytic anemia</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-black">WBC</td>
                        <td className="py-1 pr-2 text-gray-600">Acute stress, infection, malignancies</td>
                        <td className="py-1 text-gray-600">Sepsis, marrow hypoplasia</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-black">Platelets</td>
                        <td className="py-1 pr-2 text-gray-600">Risk of thrombosis</td>
                        <td className="py-1 text-gray-600">Risk of bleeding</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Signature, Page, and Legal Disclaimer */}
            <div className="mt-8 select-none">
              <div className="flex justify-between items-end border-t border-gray-300 pt-5 px-2">
                <div className="text-center">
                  <div className="h-8 flex items-end justify-center mb-1 text-blue-900/50 font-serif italic text-[16px]">
                    Sachin Sharma
                  </div>
                  <div className="font-bold text-[10.5px] text-black">{activeLab.labInchargeName}</div>
                  <div className="text-[9.5px] text-gray-500">{activeLab.labInchargeCredentials}</div>
                </div>

                <div className="text-[10px] text-gray-400 font-mono">
                  Page 1 of 2
                </div>

                <div className="text-center">
                  <div className="h-8 flex items-end justify-center mb-1 text-blue-900/50 font-serif italic text-[16px]">
                    Ak Asthana
                  </div>
                  <div className="font-bold text-[10.5px] text-black">{activeLab.pathologistName}</div>
                  <div className="text-[9.5px] text-gray-500">{activeLab.pathologistCredentials}</div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-300 pt-3 text-center text-[9.5px] text-gray-500 font-sans space-y-1">
                <div className="font-bold text-black uppercase tracking-wider">
                  NOT VALID FOR MEDICO LEGAL PURPOSE
                </div>
                <div>Work timings: Monday to Sunday, 8 am to 8 pm</div>
                <div className="text-gray-400 max-w-[650px] mx-auto leading-normal">
                  Please correlate clinically. Although the test results are checked thoroughly, in case of any unexpected test results which could be due to machine error or typing error or any other reason please contact the lab immediately for a free evaluation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
