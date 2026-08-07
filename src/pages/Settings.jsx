import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Clock, Settings, Crown, HelpCircle, ChevronRight,
  Bell, Shield, Key, CreditCard, Smartphone, Monitor, Webhook, 
  CheckCircle2, AlertCircle, Copy, RefreshCw, Zap
} from 'lucide-react';

const BrandLogo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="url(#paint0_linear)" />
    <path d="M16 7L8 10.5V16C8 21.25 11.4 26.1 16 27.5C20.6 26.1 24 21.25 24 16V10.5L16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="2" />
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
  </svg>
);

const CustomToggle = ({ label, description, isOn, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors" onClick={onToggle}>
    <div className="flex flex-col pr-4">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <span className="text-[10px] text-slate-500 mt-0.5">{description}</span>
    </div>
    <div className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isOn ? 'bg-indigo-500' : 'bg-slate-700'}`}>
      <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOn ? 'translate-x-2' : '-translate-x-2'}`} />
    </div>
  </div>
);

function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('security');
  
  // State for mock interactivity
  const [twoFactor, setTwoFactor] = useState(true);
  const [apiKey, setApiKey] = useState('tl_live_99a8b7c6d5e4f3a2b1_secret');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = 'tl_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-50 overflow-hidden selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
            <BrandLogo className="w-7 h-7 shadow-lg shadow-indigo-500/20 mr-3" />
            <span className="font-extrabold text-lg tracking-tight text-white">
              TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Home className="w-5 h-5" /> Dashboard
            </a>
            <a onClick={() => navigate('/scan')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Search className="w-5 h-5" /> Scan
            </a>
            <a onClick={() => navigate('/history')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Clock className="w-5 h-5" /> History
            </a>
            {/* Active Tab */}
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 transition-colors">
              <Settings className="w-5 h-5" /> Settings
            </a>
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400 mb-3">
              <Crown className="w-5 h-5" />
            </div>
            <h4 className="text-white font-bold text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">Unlock advanced protection and real-time alerts.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-end px-8 z-20 flex-shrink-0">
          <div className="flex items-center gap-6 ml-auto">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 p-1.5 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                S
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-white leading-none mb-1">Sudharsan <ChevronRight className="w-3 h-3 inline rotate-90 opacity-50" /></p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">Free Plan</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
                Settings & Preferences
              </h1>
              <p className="text-slate-400 text-sm">Manage your account security, developer API access, and billing details.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              
              {/* VERTICAL TABS */}
              <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'security' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                >
                  <Shield className="w-5 h-5" /> Profile & Security
                </button>
                <button 
                  onClick={() => setActiveTab('api')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'api' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                >
                  <Key className="w-5 h-5" /> API & Webhooks
                </button>
                <button 
                  onClick={() => setActiveTab('billing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'billing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                >
                  <CreditCard className="w-5 h-5" /> Billing & Usage
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 space-y-6">
                
                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Profile Information */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-white font-bold text-lg mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Full Name</label>
                          <input type="text" defaultValue="Sudharsan" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-sm text-white transition-colors" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Email Address</label>
                          <input type="email" defaultValue="sudharsan@example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-sm text-slate-400 transition-colors cursor-not-allowed" disabled />
                        </div>
                      </div>
                      <button className="mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors">
                        Save Changes
                      </button>
                    </div>

                    {/* Authentication */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-white font-bold text-lg mb-4">Authentication</h3>
                      <div className="space-y-4">
                        <CustomToggle 
                          label="Two-Factor Authentication (2FA)" 
                          description="Require an authenticator app code when logging in." 
                          isOn={twoFactor} 
                          onToggle={() => setTwoFactor(!twoFactor)} 
                        />
                        <button className="text-indigo-400 text-sm font-semibold hover:underline">Change Password...</button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-lg">Active Sessions</h3>
                        <button className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">Revoke All</button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <Monitor className="w-6 h-6 text-indigo-400" />
                            <div>
                              <p className="text-sm font-bold text-white">MacBook Pro - Chrome</p>
                              <p className="text-[10px] text-slate-500">Chennai, India • IP: 103.44.22.1</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">Active Now</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <Smartphone className="w-6 h-6 text-slate-500" />
                            <div>
                              <p className="text-sm font-bold text-slate-300">iPhone 14 Pro - Safari</p>
                              <p className="text-[10px] text-slate-500">Chennai, India • IP: 49.32.11.89</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">Last active 2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- API & WEBHOOKS TAB --- */}
                {activeTab === 'api' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* API Keys */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-bold text-lg">Developer API Keys</h3>
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold">PRODUCTION</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-6">Use these keys to authenticate API requests from your backend servers.</p>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Secret Key</label>
                        <div className="bg-slate-950 p-1 pl-4 rounded-xl border border-slate-800 flex items-center justify-between focus-within:border-indigo-500/50 transition-colors">
                          <span className="text-sm text-slate-300 font-mono select-all">{apiKey}</span>
                          <div className="flex gap-2 p-1">
                            <button onClick={handleCopyKey} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors flex items-center gap-2">
                              {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={handleRegenerateKey} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors flex items-center gap-2" title="Regenerate Key">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-400/90 leading-relaxed font-medium">Do not share your API key in publicly accessible areas such as GitHub, client-side code, or public forums. If compromised, regenerate it immediately.</p>
                      </div>
                    </div>

                    {/* Webhooks */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                        Event Webhooks <Webhook className="w-5 h-5 text-indigo-400" />
                      </h3>
                      <p className="text-xs text-slate-400 mb-6">Send a JSON payload to your server whenever a Critical Threat is detected.</p>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Webhook URL</label>
                          <input type="text" placeholder="https://api.yourdomain.com/webhooks/trustlens" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-sm text-white transition-colors font-mono" />
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors">
                          Add Webhook Endpoint
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* --- BILLING & USAGE TAB --- */}
                {activeTab === 'billing' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Usage Stats */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-bold text-lg">Current Plan Usage</h3>
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700">Free Tier</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-6">Your API limits reset on the 1st of every month.</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-slate-300">API Scans</span>
                          <span className="text-indigo-400">248 <span className="text-slate-500 font-medium">/ 1,000</span></span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out" style={{ width: '24.8%' }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 text-right">~75% remaining</p>
                      </div>
                    </div>

                    {/* Upgrade Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Pro Plan Card */}
                      <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                        <Crown className="w-8 h-8 text-indigo-400 mb-4" />
                        <h3 className="text-2xl font-black text-white mb-1">Pro</h3>
                        <p className="text-indigo-400 text-xl font-bold mb-4">$49<span className="text-sm text-slate-400 font-medium">/mo</span></p>
                        
                        <ul className="space-y-2 mb-6 text-xs text-slate-300 font-medium">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 10,000 Scans / month</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Webhook Integrations</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Deep Dark Web tracing</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDF Report Exports</li>
                        </ul>
                        
                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/25">
                          Upgrade to Pro
                        </button>
                      </div>

                      {/* Enterprise Plan Card */}
                      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                        <Zap className="w-8 h-8 text-slate-400 mb-4" />
                        <h3 className="text-2xl font-black text-white mb-1">Enterprise</h3>
                        <p className="text-slate-200 text-xl font-bold mb-4">Custom</p>
                        
                        <ul className="space-y-2 mb-6 text-xs text-slate-400 font-medium">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Unlimited API Scans</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Dedicated Account Manager</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Custom AI Model Training</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> SLA Guarantee</li>
                        </ul>
                        
                        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl transition-colors border border-slate-700">
                          Contact Sales
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;