import React from 'react';

function StatsCard({ title, value, icon: Icon, trend, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
    },
  };

  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <h4 className="text-2xl font-extrabold text-white">{value}</h4>
        {trend && (
          <p className="text-xs font-medium text-slate-500 mt-1">
            {trend}
          </p>
        )}
      </div>

      {Icon && (
        <div className={`p-3 rounded-xl border ${theme.bg} ${theme.border} ${theme.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}

export default StatsCard;