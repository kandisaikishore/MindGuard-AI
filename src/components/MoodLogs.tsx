import React, { useState } from 'react';
import { Heart, Library, Activity, Calendar, HelpCircle, Check, AlertTriangle } from 'lucide-react';
import { MoodEntry } from '../types';

interface MoodLogsProps {
  moods: MoodEntry[];
  onAddMood: (score: 1 | 2 | 3 | 4 | 5, notes: string) => void;
}

export default function MoodLogs({ moods, onAddMood }: MoodLogsProps) {
  const [selectedScore, setSelectedScore] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const moodButtons = [
    { score: 1, label: "Very Sad", emoji: "⛈️", color: "hover:bg-rose-50 border-rose-100 hover:border-rose-450 text-rose-600 bg-rose-50/20 active:bg-rose-100" },
    { score: 2, label: "Sad", emoji: "🌧️", color: "hover:bg-indigo-50 border-indigo-100 hover:border-indigo-400 text-indigo-600 bg-indigo-50/20 active:bg-indigo-100" },
    { score: 3, label: "Stable / Neutral", emoji: "🟢", color: "hover:bg-emerald-50 border-emerald-100 hover:border-emerald-450 text-emerald-600 bg-emerald-50/20 active:bg-emerald-100" },
    { score: 4, label: "Happy / Energetic", emoji: "☀️", color: "hover:bg-teal-50 border-teal-100 hover:border-teal-400 text-teal-600 bg-teal-50/20 active:bg-teal-100" },
    { score: 5, label: "Very Happy / Elated", emoji: "⚡", color: "hover:bg-amber-50 border-amber-100 hover:border-amber-450 text-amber-600 bg-amber-50/20 active:bg-amber-100" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScore) return;
    
    setSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onAddMood(selectedScore, notes);
      setSubmitting(false);
      setSuccess(true);
      setNotes('');
      setSelectedScore(null);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  // Compile last 7 days of mood entries for the SVG Weekly Graph
  const sortedMoods = [...moods].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const recentWeekMoods = sortedMoods.slice(-7);

  // Generate SVG path coordinates
  const svgWidth = 500;
  const svgHeight = 150;
  const padding = 30;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  const points = recentWeekMoods.map((entry, idx) => {
    const x = padding + (idx / (recentWeekMoods.length - 1 || 1)) * chartWidth;
    // score 1 to 5 mapped to chart height (inverted because SVG 0 is top)
    const y = padding + chartHeight - ((entry.score - 1) / 4) * chartHeight;
    return { x, y, entry };
  });

  const dPath = points.length > 1 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mood Tracking Submission Form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-1 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Heart className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-base">Mood Check-in</h3>
        </div>

        {success ? (
          <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-xl border border-emerald-200 text-center space-y-2 py-8">
            <Check className="w-8 h-8 mx-auto text-emerald-600 bg-emerald-100 p-1 rounded-full" />
            <h4 className="font-semibold text-sm">Mood Logged Successfully</h4>
            <p>Your mental health history has been updated under HIPAA security guidelines.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">How do you feel right now?</label>
            <div className="grid grid-cols-5 gap-2">
              {moodButtons.map((btn) => (
                <button
                  key={btn.score}
                  type="button"
                  onClick={() => setSelectedScore(btn.score as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-1 transition ${btn.color} ${
                    selectedScore === btn.score 
                      ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-950 hover:border-slate-950 scale-102 shadow-xs' 
                      : ''
                  }`}
                  title={btn.label}
                >
                  <span className="text-xl">{btn.emoji}</span>
                  <span className="text-[9px] font-medium text-center leading-tight truncate w-full">
                    {btn.score}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mood-notes" className="block text-xs font-semibold text-slate-700">Optional Notes / Cognitive Triggers</label>
              <textarea
                id="mood-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="List any stressors, events, or rapid thoughts encountered today..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition"
              />
            </div>

            {selectedScore === 5 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-[11px] text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <span>
                  Tip: Highly elevated or rapid thoughts can sometimes signal oncoming hypomania. Ensure you keep a stable sleep regimen of at least 8 hours tonight.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedScore || submitting}
              className={`w-full py-2.5 text-xs font-semibold text-white rounded-xl transition ${
                selectedScore 
                  ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-md cursor-pointer' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? "Analyzing entry..." : "Confirm Daily Mood"}
            </button>
          </form>
        )}
      </div>

      {/* Historical Trend Charts and analytics */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Weekly Mood Wave Graph</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-350" />
              <span>Bipolar Monitoring Loop</span>
            </div>
          </div>

          <div className="pt-4">
            {recentWeekMoods.length < 2 ? (
              <div className="bg-slate-50 border border-dashed rounded-xl py-12 text-center text-xs text-slate-400">
                Log at least 2 mood days to chart your cyclical bipolar wave.
              </div>
            ) : (
              <div className="relative">
                {/* SVG Graph */}
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  {[1, 2, 3, 4, 5].map((level) => {
                    const y = padding + chartHeight - ((level - 1) / 4) * chartHeight;
                    return (
                      <g key={level} className="opacity-15">
                        <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" />
                        <text x={10} y={y + 4} className="text-[10px] fill-slate-500 font-mono font-bold" textAnchor="start">
                          {level === 5 ? "⚡" : level === 4 ? "☀️" : level === 3 ? "🟢" : level === 2 ? "🌧️" : "⛈️"}
                        </text>
                      </g>
                    );
                  })}

                  {/* SVG Path line */}
                  <path d={dPath} fill="none" stroke="url(#mood-grad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

                  {/* Coordinates Markers */}
                  {points.map((p, i) => (
                    <g key={p.entry.id} className="group/dot">
                      <circle cx={p.x} cy={p.y} r={5} className="fill-teal-600 stroke-white stroke-2 group-hover/dot:r-7 transition cursor-pointer" />
                      <text x={p.x} y={p.y - 12} className="text-[9px] font-bold fill-teal-800 text-center opacity-0 group-hover/dot:opacity-100 transition duration-150" textAnchor="middle">
                        Mood {p.entry.score}
                      </text>
                    </g>
                  ))}

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="mood-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between px-7 mt-2 text-[10px] text-slate-400 font-medium">
                  {recentWeekMoods.map((entry) => (
                    <div key={entry.id} className="text-center">
                      <span className="block font-mono">
                        {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Journal Log details */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <Library className="w-4 h-4 text-slate-400" />
            Historic check-ins list ({moods.length} entries)
          </h4>
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {sortedMoods.slice().reverse().slice(0, 4).map((entry) => {
              const details = moodButtons.find(b => b.score === entry.score);
              return (
                <div key={entry.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-150 flex items-start gap-3 transition">
                  <span className="text-lg bg-white p-1 rounded-lg border border-slate-100 shadow-xs leading-none">
                    {details?.emoji || "🟢"}
                  </span>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">Mood score: {entry.score} • {details?.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.notes ? (
                      <p className="text-slate-500 text-xs italic line-clamp-2">{entry.notes}</p>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">No trigger notes added.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
