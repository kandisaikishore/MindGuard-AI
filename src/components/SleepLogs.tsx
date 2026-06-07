import React, { useState } from 'react';
import { Moon, AlertTriangle, CheckCircle, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { SleepEntry } from '../types';

interface SleepLogsProps {
  sleepLogs: SleepEntry[];
  onAddSleep: (bedtime: string, wakeupTime: string, duration: number) => void;
}

export default function SleepLogs({ sleepLogs, onAddSleep }: SleepLogsProps) {
  const [beddate, setBeddate] = useState('2026-06-06');
  const [bedtime, setBedtime] = useState('22:00');
  const [wakedate, setWakedate] = useState('2026-06-07');
  const [waketime, setWaketime] = useState('06:30');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Consistency Score formula (100 - standard deviation of duration from 8h, or simple variability score)
  const calcConsistencyScore = () => {
    if (sleepLogs.length === 0) return 100;
    const durations = sleepLogs.map(s => s.duration);
    const avg = durations.reduce((acc, c) => acc + c, 0) / durations.length;
    let sumSqrDiff = durations.reduce((acc, c) => acc + Math.pow(c - avg, 2), 0);
    const variance = sumSqrDiff / durations.length;
    const score = Math.max(0, Math.min(100, Math.round(100 - (variance * 12))));
    return score;
  };

  const consistencyScore = calcConsistencyScore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const bedStr = `${beddate} ${bedtime}`;
    const wakeStr = `${wakedate} ${waketime}`;

    // Calculate duration in hours
    const bedMs = new Date(bedStr).getTime();
    const wakeMs = new Date(wakeStr).getTime();
    
    if (isNaN(bedMs) || isNaN(wakeMs)) {
      alert("Invalid bedtime or wakeup date format.");
      setSubmitting(false);
      return;
    }

    let diffMs = wakeMs - bedMs;
    if (diffMs <= 0) {
      alert("Wake up time must be later than bedtime!");
      setSubmitting(false);
      return;
    }

    const hrs = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    setTimeout(() => {
      onAddSleep(bedStr, wakeStr, hrs);
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 700);
  };

  const sortedLogs = [...sleepLogs].sort((a,b) => new Date(a.bedtime).getTime() - new Date(b.bedtime).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Logger Panel Form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Moon className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-900 text-base font-sans">Sleep Logger</h3>
        </div>

        {success ? (
          <div className="bg-violet-50 text-violet-850 p-4 rounded-xl border border-violet-150 text-center py-10 space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto text-violet-600" />
            <h4 className="font-bold text-sm">Sleep Entry Logged</h4>
            <p className="text-xs">MindGuard calculated your duration, updated predictions, and synced health alerts.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bedtime selection */}
            <div className="space-y-2 border-b border-slate-50 pb-3">
              <span className="block text-xs font-bold text-slate-700">Bedtime details</span>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={beddate}
                  onChange={(e) => setBeddate(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-xs" 
                />
                <input 
                  type="time" 
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-xs" 
                />
              </div>
            </div>

            {/* Wake up selection */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700">Wake up details</span>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={wakedate}
                  onChange={(e) => setWakedate(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-xs" 
                />
                <input 
                  type="time" 
                  value={waketime}
                  onChange={(e) => setWaketime(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-xs" 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-violet-650 hover:bg-violet-700 text-white hover:shadow-md py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              {submitting ? "Processing sleep calculations..." : "Submit Sleep Log"}
            </button>
          </form>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 leading-normal">
          💡 <strong>Mania Warning Rule:</strong> Sleep duration consistently dropping below 4 hours in bipolar individuals is one of the strongest pre-indicators of manic episodes. Maintain strict bedtime triggers.
        </div>
      </div>

      {/* Sleep Statistics Summary & Consistency charts */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-slate-900 text-base">Sleep Pattern Trends</h3>
          </div>
          <div className="bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-3 py-1 text-xs font-bold flex items-center gap-1.5 self-start">
            <Sparkles className="w-3.5 h-3.5" />
            Consistency Index score: {consistencyScore}%
          </div>
        </div>

        {/* Custom Sleep bar log charts */}
        <div>
          <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 tracking-wide">Last 7 Sleep Entries</h4>
          <div className="space-y-3">
            {sortedLogs.slice(-7).reverse().map((log) => {
              const isShortSleep = log.duration < 4;
              const dateObj = new Date(log.bedtime);
              const percent = Math.min(100, (log.duration / 12) * 100);

              return (
                <div key={log.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600 font-mono">
                      {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">
                        ({log.bedtime.split(' ')[1]} - {log.wakeupTime.split(' ')[1]})
                      </span>
                      <span className={`font-semibold ${isShortSleep ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                        {log.duration} h
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isShortSleep ? 'bg-rose-500 animate-pulse' : 'bg-violet-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {isShortSleep && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-600 font-medium">
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>Manic Episode Alarm Triggered: sleep fell under 4 hours. Notify clinician Sarah Thorne.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
