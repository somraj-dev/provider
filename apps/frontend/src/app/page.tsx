'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, FileText, Search, User, Filter, Settings, Shield, Activity, 
  Layers, MessageSquare, BookOpen, ChevronDown, RefreshCw, Maximize2, Print,
  Calendar, CheckSquare, HardDrive, Thermometer, Inbox, FileSpreadsheet, Eye
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeAlertCategory, setActiveAlertCategory] = useState('Orders');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginError('');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  // Mock data matching the layout image
  const orders = [
    { name: 'JAMES, WILLIAM', type: 'CBC with Differential', action: 'Order', date: '05/28/17 08:30', detail: 'Routine blood test', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 08:30', stop: '05/28/2017 08:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'JAMES, WILLIAM', type: 'Comprehensive Metabolic Panel', action: 'Order', date: '05/28/17 08:30', detail: 'Kidney & liver function', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 08:30', stop: '05/28/2017 08:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'PATEL, RAHUL', type: 'MRI Brain W/O Contrast', action: 'Order', date: '05/28/17 09:15', detail: 'Headache evaluation', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 09:15', stop: '05/28/2017 09:15', stopType: 'Physician Stop', status: 'Open' },
    { name: 'PATEL, RAHUL', type: 'Neurology Consult', action: 'Order', date: '05/28/17 09:15', detail: 'Neuro assessment', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 09:15', stop: '05/28/2017 09:15', stopType: 'Physician Stop', status: 'Open' },
    { name: 'JOHNSON, MARIA', type: 'PT Evaluation', action: 'Order', date: '05/28/17 10:00', detail: 'Post-op rehab', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 10:00', stop: '05/28/2017 10:00', stopType: 'Physician Stop', status: 'Open' },
    { name: 'JOHNSON, MARIA', type: 'Pain Management Consult', action: 'Order', date: '05/28/17 10:00', detail: 'Pain control', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 10:00', stop: '05/28/2017 10:00', stopType: 'Physician Stop', status: 'Open' },
    { name: 'LEE, DAVID', type: 'Chest X-Ray', action: 'Order', date: '05/28/17 10:30', detail: 'Cough and fever', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 10:30', stop: '05/28/2017 10:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'LEE, DAVID', type: 'Sputum Culture', action: 'Order', date: '05/28/17 10:30', detail: 'Infection workup', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 10:30', stop: '05/28/2017 10:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'GARCIA, LUCIA', type: 'Echocardiogram', action: 'Order', date: '05/28/17 11:00', detail: 'Cardiac evaluation', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 11:00', stop: '05/28/2017 11:00', stopType: 'Physician Stop', status: 'Open' },
    { name: 'GARCIA, LUCIA', type: 'Cardiology Consult', action: 'Order', date: '05/28/17 11:00', detail: 'Heart failure eval', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 11:00', stop: '05/28/2017 11:00', stopType: 'Physician Stop', status: 'Open' },
    { name: 'KIM, JAMES', type: 'Hemoglobin A1C', action: 'Order', date: '05/28/17 11:30', detail: 'Diabetes monitoring', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 11:30', stop: '05/28/2017 11:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'KIM, JAMES', type: 'Diabetes Education', action: 'Order', date: '05/28/17 11:30', detail: 'Patient education', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 11:30', stop: '05/28/2017 11:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'BROWN, ELIZABETH', type: 'Urinalysis', action: 'Order', date: '05/28/17 12:00', detail: 'UTI symptoms', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 12:00', stop: '05/28/2017 12:00', stopType: 'Physician Stop', status: 'Open' },
    { name: 'BROWN, ELIZABETH', type: 'Urine Culture', action: 'Order', date: '05/28/17 12:00', detail: 'Confirm infection', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 12:00', stop: '05/28/2017 12:00', stopType: 'Physician Stop', status: 'Open' },
    { name: 'THOMAS, MICHAEL', type: 'CT Abdomen & Pelvis', action: 'Order', date: '05/28/17 12:30', detail: 'Abdominal pain', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 12:30', stop: '05/28/2017 12:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'THOMAS, MICHAEL', type: 'Surgery Consult', action: 'Order', date: '05/28/17 12:30', detail: 'Surgical evaluation', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 12:30', stop: '05/28/2017 12:30', stopType: 'Physician Stop', status: 'Open' },
    { name: 'ANDERSON, SUSAN', type: 'Lipid Panel', action: 'Order', date: '05/28/17 13:00', detail: 'Cholesterol check', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 13:00', stop: '05/28/2017 13:00', stopType: 'Physician Stop', status: 'Open' },
    { name: 'ANDERSON, SUSAN', type: 'Nutrition Consult', action: 'Order', date: '05/28/17 13:00', detail: 'Dietary counseling', comment: 'AXIO, MD', provider: 'AXIO, MD', start: '05/28/2017 13:00', stop: '05/28/2017 13:00', stopType: 'Physician Stop', status: 'Open' },
  ];

  const filteredOrders = orders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row bg-white select-none">
        {/* Left side: Accent pane with logo and illustration */}
        <div className="flex flex-col flex-1 bg-[#d0f4f0] p-8 justify-between min-h-[350px] md:min-h-screen">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="AxioVital Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-xl text-[#0d7a86] tracking-tight">AxioVital</span>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 my-8">
            <div className="relative w-full max-w-[320px] aspect-square md:max-w-[400px]">
              <Image
                src="/illustration.png"
                alt="Healthcare workspace illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right side: Login form */}
        <div className="flex flex-col flex-1 justify-center items-center p-8 md:p-16">
          <div className="w-full max-w-[400px] space-y-8">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                Workspace app required
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your administrator requires you to use the locally installed AxioVital Workspace app
                for secure authentication and local healthcare system access.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Workspace Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@provider.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-gray-300 focus:border-[#0d7a86] focus:ring-[#0d7a86] rounded-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Security Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-gray-300 focus:border-[#0d7a86] focus:ring-[#0d7a86] rounded-md"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {loginError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#0d7a86] hover:bg-[#085f68] text-white font-medium py-2.5 px-4 rounded-md transition-colors shadow-sm"
              >
                Open AxioVital Workspace
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render AxioVital Operating Environment Terminal
  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] text-[#1c2833] text-xs font-sans overflow-hidden select-none">
      
      {/* Title Bar */}
      <div className="bg-[#002a46] text-white px-3 py-2 flex justify-between items-center border-b border-[#001729]">
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4">
            <Image src="/logo.png" alt="Logo" fill className="object-contain filter invert" />
          </div>
          <span className="font-bold tracking-wide">AxioVital Operating Environment</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span>Axiovital Admin</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0d7a86] text-white font-bold text-[10px] hover:bg-[#085f68]">
                AV
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-white border-b border-[#d5dbdb] px-3 py-1 flex flex-wrap gap-4 text-[#4a5568]">
        {['Terminal', 'Session', 'View', 'Patient', 'Clinical', 'Tools', 'Notifications', 'Admin', 'Help'].map((item) => (
          <button key={item} className="hover:text-black font-semibold transition-colors">
            {item}
          </button>
        ))}
      </div>

      {/* Ribbon Bar */}
      <div className="bg-[#f8f9fa] border-b border-[#d5dbdb] px-3 py-1.5 flex flex-wrap gap-2 items-center">
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0d7a86] text-white font-semibold shadow-sm">
          <MessageSquare className="w-3.5 h-3.5" /> Message Center
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <User className="w-3.5 h-3.5 text-gray-500" /> Patient List
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" /> Physician Handoff
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <Layers className="w-3.5 h-3.5 text-gray-500" /> Care Workflow
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <Activity className="w-3.5 h-3.5 text-gray-500" /> Quality Measures
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <Shield className="w-3.5 h-3.5 text-gray-500" /> MyExperience
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <FileText className="w-3.5 h-3.5 text-gray-500" /> Reports
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <BookOpen className="w-3.5 h-3.5 text-gray-500" /> UpToDate
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <Layers className="w-3.5 h-3.5 text-gray-500" /> AxioCard
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors">
          <HardDrive className="w-3.5 h-3.5 text-gray-500" /> Protocol Library
        </button>
      </div>

      {/* Sub-Ribbon Dashboard Shortcuts */}
      <div className="bg-[#eef2f5] border-b border-[#d5dbdb] px-3 py-1 flex gap-4 text-[#4a5568] items-center">
        <button className="flex items-center gap-1 hover:text-black"><Layers className="w-3.5 h-3.5" /> Dashboard</button>
        <button className="flex items-center gap-1 hover:text-black"><Calendar className="w-3.5 h-3.5" /> Scheduler</button>
        <button className="flex items-center gap-1 hover:text-black"><Shield className="w-3.5 h-3.5" /> Clinical Decision Support</button>
        <button className="flex items-center gap-1 hover:text-black"><CheckSquare className="w-3.5 h-3.5" /> Order Sets</button>
        <button className="flex items-center gap-1 hover:text-black"><Activity className="w-3.5 h-3.5" /> Care Pathways</button>
        <button className="flex items-center gap-1 hover:text-black"><Thermometer className="w-3.5 h-3.5" /> Labs</button>
        <button className="flex items-center gap-1 hover:text-black"><Eye className="w-3.5 h-3.5" /> Imaging</button>
        <button className="flex items-center gap-1 hover:text-black"><HardDrive className="w-3.5 h-3.5" /> Pharmacy</button>
        <button className="flex items-center gap-1 hover:text-black"><Activity className="w-3.5 h-3.5" /> Analytics</button>
      </div>

      {/* Command & Filter Bar */}
      <div className="bg-[#0f4471] text-white px-3 py-1.5 flex justify-between items-center border-b border-[#001d36]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">Message Center</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Patient or Order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#00223b] border border-[#0d3455] rounded px-2.5 py-1 pl-7 text-white text-[11px] placeholder-gray-400 focus:outline-none focus:border-[#0d7a86] w-[200px]"
            />
          </div>
          <button className="bg-[#002a46] hover:bg-[#00375a] border border-[#0d3455] rounded px-2.5 py-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Recent <ChevronDown className="w-3 h-3" />
          </button>
          <button className="bg-[#002a46] hover:bg-[#00375a] border border-[#0d3455] rounded p-1"><Maximize2 className="w-3.5 h-3.5" /></button>
          <button className="bg-[#002a46] hover:bg-[#00375a] border border-[#0d3455] rounded p-1"><Print className="w-3.5 h-3.5" /></button>
          <span className="text-[10px] text-gray-300">3 minutes ago</span>
        </div>
      </div>

      {/* Main Workspace Body Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Summary Menu */}
        <div className="w-[220px] bg-[#dbe6ef] border-r border-[#bdcddc] flex flex-col">
          <div className="bg-[#789cbb] text-white font-bold p-2 flex justify-between items-center shadow-inner">
            <span>Axio Summary</span>
            <Badge variant="secondary" className="bg-[#002a46] text-white text-[9px] px-1.5 py-0.5">0</Badge>
          </div>
          
          <div className="bg-[#cbd8e3] p-1 flex gap-1 border-b border-[#bdcddc]">
            <button className="flex-1 bg-white border border-[#bdcddc] py-0.5 font-semibold text-center rounded-sm">Inbox</button>
            <button className="flex-1 hover:bg-white/50 py-0.5 text-center">Processes</button>
            <button className="flex-1 hover:bg-white/50 py-0.5 text-center">Pools</button>
          </div>

          <div className="p-2 border-b border-[#bdcddc] flex items-center gap-2">
            <span>Display:</span>
            <select className="bg-white border border-[#bdcddc] rounded px-1 py-0.5 flex-1 focus:outline-none">
              <option>Last 30 Days</option>
              <option>Last 15 Days</option>
              <option>All History</option>
            </select>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-gray-700 flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                  <span>- AxioVital Alerts</span>
                  <span className="text-[10px] font-bold text-gray-600">(12)</span>
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700 flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                  <span>- Results FYI</span>
                  <span className="text-[10px] font-bold text-gray-600">(21)</span>
                </div>
                <div className="pl-3 space-y-1 mt-1 text-gray-600">
                  <div className="flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer text-red-600 font-medium">
                    <span>Critical</span>
                    <span>(5/21)</span>
                  </div>
                  <div 
                    onClick={() => setActiveAlertCategory('Orders')}
                    className={`flex justify-between items-center p-1 rounded cursor-pointer ${activeAlertCategory === 'Orders' ? 'bg-[#007cc0] text-white font-semibold' : 'hover:bg-blue-100/50'}`}
                  >
                    <span>Orders</span>
                    <span>(32/32)</span>
                  </div>
                  <div className="flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                    <span>Consults & Referrals</span>
                    <span>(8/8)</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700 flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                  <span>- Documents</span>
                  <span className="text-[10px] font-bold text-gray-600">(9/9)</span>
                </div>
                <div className="pl-3 space-y-1 mt-1 text-gray-600">
                  <div className="flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                    <span>Sign</span>
                    <span>(3/3)</span>
                  </div>
                  <div className="flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                    <span>Review</span>
                    <span>(3/3)</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700 flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                  <span>- Messages</span>
                  <span className="text-[10px] font-bold text-gray-600">(7/7)</span>
                </div>
                <div className="pl-3 space-y-1 mt-1 text-gray-600">
                  <div className="flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                    <span>General Messages</span>
                    <span>(7/7)</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700 flex justify-between items-center hover:bg-blue-100/50 p-1 rounded cursor-pointer">
                  <span>- Work Items</span>
                  <span className="text-[10px] font-bold text-gray-600">(11)</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Side: Data Workspace Tab View */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          
          {/* Tab Headings */}
          <div className="bg-[#cbd8e3] border-b border-[#bdcddc] flex items-center">
            <button className="bg-white border-t border-x border-[#bdcddc] px-4 py-1.5 font-bold flex items-center gap-2 rounded-t-sm shadow-sm">
              Orders <span className="text-gray-400 hover:text-black cursor-pointer">x</span>
            </button>
            <div className="flex-1"></div>
          </div>

          {/* Sub Toolbar */}
          <div className="bg-[#fafbfc] border-b border-[#d5dbdb] px-3 py-1.5 flex gap-4 text-[#4a5568] items-center text-[11px]">
            <button className="hover:text-black flex items-center gap-1 font-semibold border-r border-[#d5dbdb] pr-4"><RefreshCw className="w-3 h-3" /> Communicate <ChevronDown className="w-3 h-3" /></button>
            <button className="hover:text-black flex items-center gap-1"><Eye className="w-3 h-3" /> Open</button>
            <button className="hover:text-black flex items-center gap-1"><FileText className="w-3 h-3" /> Message Journal</button>
            <button className="text-gray-400 flex items-center gap-1 cursor-not-allowed"><ChevronDown className="w-3 h-3" /> Forward Only</button>
            <button className="hover:text-black flex items-center gap-1"><User className="w-3 h-3" /> Select Patient</button>
            <button className="hover:text-black flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Select All</button>
          </div>

          {/* Table Container Grid */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#ecf0f1] text-[#2c3e50] border-b border-[#bdcddc] sticky top-0 font-bold">
                  {['Patient Name', 'Order/Plan Name', 'Order Action', 'Details', 'Details Comment', 'Originator Name', 'Create Date', 'Stop Date', 'Stop Type', 'Status'].map((head) => (
                    <th key={head} className="p-2 border-r border-[#bdcddc] font-bold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <tr key={idx} className={`border-b border-gray-100 hover:bg-blue-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                    <td className="p-2 border-r border-gray-200 text-[#0d7a86] font-semibold">{order.name}</td>
                    <td className="p-2 border-r border-gray-200 font-medium">{order.type}</td>
                    <td className="p-2 border-r border-gray-200">{order.action}</td>
                    <td className="p-2 border-r border-gray-200">{order.start}</td>
                    <td className="p-2 border-r border-gray-200 text-gray-500">{order.detail}</td>
                    <td className="p-2 border-r border-gray-200">{order.provider}</td>
                    <td className="p-2 border-r border-gray-200">{order.start}</td>
                    <td className="p-2 border-r border-gray-200">{order.stop}</td>
                    <td className="p-2 border-r border-gray-200">{order.stopType}</td>
                    <td className="p-2 text-green-700 font-bold">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-[#002a46] text-white px-3 py-2 flex justify-between items-center text-[10px] border-t border-[#001729]">
        <span>Ready</span>
        <span>AXIOVITAL HEALTHCARE SYSTEM</span>
        <span>PROD</span>
        <span>05/28/2017 03:45 PM</span>
      </div>
    </div>
  );
}
