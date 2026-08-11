import React from 'react';
import { Shield, Bell, User } from 'lucide-react';

function TopNav() {
  // Pulls the dynamic name saved during signup/login
  const userName = localStorage.getItem("user_name") || "Sudharsan";

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-indigo-400" />
        <span className="font-bold text-lg text-white">
          TrustLens <span className="text-indigo-400">AI</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
            <User className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm text-slate-200">{userName}</span>
        </div>
      </div>
    </header>
  );
}

export default TopNav;