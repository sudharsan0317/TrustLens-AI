import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { getScanHistory } from '../services/api';

function RecentScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const data = await getScanHistory();
        setScans(data);
      } catch (err) {
        console.error("Failed to load recent scans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const getStatusBadge = (label) => {
    switch (label?.toUpperCase()) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Safe
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Suspicious
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Malicious
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 text-sm">
        Loading recent scans...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" /> Recent Scans
        </h3>
      </div>

      {scans.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">
          No scan history available yet. Try running a scan on the dashboard!
        </p>
      ) : (
        <div className="space-y-3">
          {scans.slice(0, 5).map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/80 rounded-xl"
            >
              <div className="space-y-1">
                <p className="font-medium text-sm text-slate-200 truncate max-w-md">
                  {scan.input_data}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Type: {scan.scan_type}
                </p>
              </div>
              <div>{getStatusBadge(scan.threat_label)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentScans;