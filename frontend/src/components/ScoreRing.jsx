// File: src/components/ScoreRing.jsx

import React from 'react';

function ScoreRing({ score }) {
  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-400 border-emerald-500';
    if (val >= 40) return 'text-amber-400 border-amber-500';
    return 'text-red-400 border-red-500';
  };

  return (
    <div className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center font-bold font-mono text-sm bg-slate-900 ${getScoreColor(score)}`}>
      <span>{score}</span>
      <span className="text-[8px] font-sans font-normal text-slate-400 uppercase -mt-1">Trust</span>
    </div>
  );
}

export default ScoreRing;