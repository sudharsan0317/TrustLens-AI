// File: src/components/ReasonChip.jsx

import React from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

function ReasonChip({ text }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 text-slate-300 text-xs px-3 py-1.5 rounded-full shadow-sm">
      <AlertTriangle size={14} className="text-amber-400" />
      <span>{text}</span>
    </div>
  );
}

export default ReasonChip;