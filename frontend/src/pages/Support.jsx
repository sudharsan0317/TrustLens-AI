// File: src/pages/Support.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Search, Clock, Settings, User, Crown, HelpCircle,
  ChevronRight, ChevronDown, Mail, MessageSquare, Send, CheckCircle2, LifeBuoy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Support() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formState, setFormState] = useState('idle'); // idle, loading, success
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: "How accurate is the AI Threat Engine?", a: "Our AI model is cross-referenced with global threat intelligence databases and achieves a 99.4% accuracy rate in detecting zero-day phishing attempts." },
    { q: "What counts as an 'API Scan'?", a: "Any target (URL, email, or text) sent to our engine through the dashboard or developer API counts as one scan. Bulk CSV uploads consume one scan per row." },
    { q: "Is my scanning data kept private?", a: "Yes. TrustLens never stores the content of your scans beyond the cryptographic hash used for analysis. We are GDPR compliant." },
    { q: "How do I setup Webhook alerts?", a: "Navigate to your Profile settings, and paste your endpoint URL into the Webhook section. We will dispatch a POST request the moment a critical threat is detected." }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState('loading');
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => setFormState('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              TrustLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Home className="w-5 h-5" /> Dashboard
            </a>
            <a onClick={() => navigate('/scan')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Search className="w-5 h-5" /> Scan
            </a>
            <a onClick={() => navigate('/history')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Clock className="w-5 h-5" /> History
            </a>
            <a onClick={() => navigate('/settings')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <Settings className="w-5 h-5" /> Settings
            </a>
            <a onClick={() => navigate('/profile')} className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50 rounded-xl font-medium transition-colors cursor-pointer">
              <User className="w-5 h-5" /> Profile
            </a>
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400 mb-3">
              <Crown className="w-5 h-5" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 leading-relaxed">Unlock advanced protection and real-time alerts.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
              Upgrade Now
            </button>
          </div>

          <a className="flex items-center justify-between px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-semibold border border-indigo-500/20 cursor-default">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">Need Help?</span>
                <span className="text-[10px]">Contact Support</span>
              </div>
            </div>
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 dark:from-slate-900 via-white dark:via-slate-950 to-white dark:to-slate-950">
        
        <header className="h-20 flex items-center justify-between px-8 z-20 flex-shrink-0 border-b border-slate-200/50 dark:border-slate-800/30">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <LifeBuoy className="w-6 h-6 text-indigo-500" /> Help & Support
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20 uppercase text-white">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CONTACT FORM */}
            <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Submit a Ticket</h2>
              <p className="text-sm text-slate-500 mb-8">Our enterprise response team will get back to you within 2 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">First Name</label>
                    <input type="text" required placeholder="John" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Last Name</label>
                    <input type="text" required placeholder="Doe" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" required defaultValue={user?.email || ''} placeholder="john@company.com" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Message</label>
                  <textarea required rows="4" placeholder="How can we help you today?" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={formState !== 'idle'}
                  className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg ${
                    formState === 'success' 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                  }`}
                >
                  {formState === 'loading' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {formState === 'success' && <><CheckCircle2 className="w-4 h-4" /> Message Sent</>}
                  {formState === 'idle' && <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            </div>

            {/* FAQS & QUICK CONTACT */}
            <div className="space-y-6">
              
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" /> Frequently Asked Questions
                </h2>
                
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div 
                      key={idx} 
                      className={`bg-white dark:bg-slate-950 border rounded-2xl overflow-hidden transition-all duration-300 ${
                        activeFaq === idx ? 'border-indigo-500/50 shadow-md' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <button 
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                      >
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
                      </button>
                      <div 
                        className={`px-4 text-sm text-slate-500 dark:text-slate-400 transition-all duration-300 overflow-hidden ${
                          activeFaq === idx ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {faq.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-500/20 transition-colors">
                  <Mail className="w-6 h-6 text-indigo-400 mb-2" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Email Us</span>
                  <span className="text-xs text-indigo-400/80">support@trustlens.ai</span>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-500/20 transition-colors">
                  <MessageSquare className="w-6 h-6 text-emerald-400 mb-2" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Live Chat</span>
                  <span className="text-xs text-emerald-400/80">Available 24/7</span>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Support;
