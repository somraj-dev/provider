import React from 'react';

interface LoginPageProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loginDomain: string;
  setLoginDomain: (val: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  auth: any;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loginDomain,
  setLoginDomain,
  handleLogin,
  auth,
}) => {
  return (
    <div className="w-screen h-screen bg-[#04608c] flex flex-col justify-between text-white font-sans overflow-hidden select-none relative p-8">
      {/* Top-Left Branding Header */}
      <div className="flex items-center gap-2 select-none">
        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <span className="text-xl font-bold tracking-tight text-white font-sans">AxioVital</span>
      </div>

      {/* Center Auth Panel */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        {/* Millennium Beveled Title */}
        <div className="mb-8 select-none text-center">
          <span 
            className="text-[38px] font-bold tracking-normal font-sans"
            style={{
              color: 'rgba(255, 255, 255, 0.45)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.5px'
            }}
          >
            AxioVital Environment<span className="text-[18px] align-super ml-1">™</span>
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 w-[280px]">
          {auth?.loginError && (
            <div className="bg-red-950/40 border border-red-800 text-red-300 p-2 text-center text-[10px] mb-2 font-medium">
              {auth?.loginError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium tracking-wide block">User Name :</label>
            <select 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[24px] border border-gray-400 bg-white text-black px-1.5 text-[11.5px] focus:outline-none rounded-none appearance-none"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")', 
                backgroundPosition: 'right 4px center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '16px' 
              }}
            >
              <option value="">Select User...</option>
              <option value="administrator">Administrator</option>
              <option value="dr_stewart">Dr. Herman Stewart</option>
              <option value="dr_sharma">Dr. R. Sharma</option>
              <option value="dr_iyer">Dr. K. Iyer</option>
              <option value="nurse_jenkins">Nurse Jenkins</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium tracking-wide block">Password :</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[24px] border border-gray-400 bg-white text-black px-2 text-[11.5px] focus:outline-none rounded-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium tracking-wide block">Domain :</label>
            <select 
              value={loginDomain}
              onChange={(e) => setLoginDomain(e.target.value)}
              className="w-full h-[24px] border border-gray-400 bg-white text-black px-1.5 text-[11.5px] focus:outline-none rounded-none appearance-none"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")', 
                backgroundPosition: 'right 4px center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '16px' 
              }}
            >
              <option value="PROD">PROD</option>
              <option value="PRODX">PRODX</option>
              <option value="TEST">TEST</option>
            </select>
          </div>

          {/* Buttons Row */}
          <div className="flex justify-center gap-4 pt-3 select-none">
            <button 
              type="submit"
              className="w-[100px] h-[25px] border border-[#7f7f7f] bg-[#cccccc] hover:bg-[#d8d8d8] text-black font-medium shadow-sm active:bg-[#b8b8b8] focus:outline-none text-[11px] transition-all"
              style={{
                borderWidth: '1.5px',
                borderStyle: 'outset',
                borderColor: '#eeeeee #555555 #555555 #eeeeee'
              }}
            >
              OK
            </button>
            <button 
              type="button"
              onClick={() => { setEmail(''); setPassword(''); }}
              className="w-[100px] h-[25px] border border-[#7f7f7f] bg-[#cccccc] hover:bg-[#d8d8d8] text-black font-medium shadow-sm active:bg-[#b8b8b8] focus:outline-none text-[11px] transition-all"
              style={{
                borderWidth: '1.5px',
                borderStyle: 'outset',
                borderColor: '#eeeeee #555555 #555555 #eeeeee'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Footer Area */}
      <div className="w-full shrink-0 flex flex-col justify-end text-left select-none">
        <div className="text-base font-bold text-white tracking-wide mb-1">Operating Environment</div>
        <div className="text-[9.5px] text-gray-300/80 leading-relaxed font-sans">
          <div>© 2026 AxioVital Corporation. All rights reserved.</div>
          <div className="mt-0.5">Access and use of this solution system (including components thereof) require, and are governed by, license(s) from AxioVital Corporation.</div>
          <div className="mt-0.5">Unauthorized use, access, reproduction, display or distribution of any portion of this solution or the data contained therein may result in severe civil damages and criminal penalties. Further information may be found in Help About.</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
