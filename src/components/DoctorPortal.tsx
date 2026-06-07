import React, { useState } from 'react';
import { 
  Users, Activity, Moon, FileText, CheckCircle, Plus, 
  Sparkles, Calendar, ArrowLeft, Send, ShieldAlert, Lock, CheckCircle2 
} from 'lucide-react';
import { User, MoodEntry, SleepEntry, JournalEntry, Medication, Recommendation, EpisodePrediction, AuditLog } from '../types';

interface DoctorPortalProps {
  doctor: User;
  patients: (User & { currentMoodScore: number; averageSleep: number; riskStatus: string })[];
  moods: MoodEntry[];
  sleepLogs: SleepEntry[];
  journals: JournalEntry[];
  medications: Medication[];
  recommendations: Recommendation[];
  prediction: EpisodePrediction | null;
  onAddRecommendation: (patientId: string, content: string) => void;
  auditLogs: AuditLog[];
}

export default function DoctorPortal({
  doctor,
  patients,
  moods,
  sleepLogs,
  journals,
  medications,
  recommendations,
  prediction,
  onAddRecommendation,
  auditLogs
}: DoctorPortalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [success, setSuccess] = useState(false);

  const activePatient = patients.find(p => p.id === selectedPatientId);

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !noteContent.trim()) return;

    onAddRecommendation(selectedPatientId, noteContent);
    setNoteContent('');
    setAddingNote(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Compile last 7 days of mood entries for the selected patient
  const sortedMoods = [...moods].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const recentWeekMoods = sortedMoods.slice(-7);

  // SVG parameters
  const svgWidth = 500;
  const svgHeight = 120;
  const padding = 25;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  const points = recentWeekMoods.map((entry, idx) => {
    const x = padding + (idx / (recentWeekMoods.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((entry.score - 1) / 4) * chartHeight;
    return { x, y, entry };
  });

  const dPath = points.length > 1 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="space-y-6">
      {/* Clinician stats banner */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded">
            Clinician Health Center
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Specialist Session: {doctor.name}</h2>
          <p className="text-slate-500 text-xs">
            Reviewing assigned high-profile Bipolar cases. Integrated HIPAA compliance shields sensitive columns automatically.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-slate-50 border p-2.5 rounded-xl text-center">
            <span className="block text-slate-400 text-[10px]">Registry caseload</span>
            <span className="font-bold text-slate-800 text-sm">1 Active Case</span>
          </div>
          <div className="bg-slate-50 border p-2.5 rounded-xl text-center">
            <span className="block text-slate-400 text-[10px]">HIPAA security class</span>
            <span className="font-bold text-teal-600 text-sm">Class 1 Shield</span>
          </div>
        </div>
      </div>

      {!selectedPatientId ? (
        /* Patient Case Board */
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Users className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Allocated Psychiatric Caseload</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((pat) => (
              <div 
                key={pat.id}
                className="p-5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-150 flex flex-col justify-between gap-4 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={pat.avatar} 
                      alt={pat.name} 
                      className="w-11 h-11 rounded-full border-2 border-white shadow-xs bg-slate-200" 
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{pat.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {pat.id}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    prediction?.riskLevel === 'Low Risk' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    prediction?.riskLevel === 'Moderate Risk' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-250 animate-pulse'
                  }`}>
                    {prediction?.riskLevel ?? pat.riskStatus}
                  </span>
                </div>

                {/* Patient Health Indicators */}
                <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-100 text-center text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Mood</span>
                    <strong className="text-slate-800">{pat.currentMoodScore}/5</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Avg Sleep</span>
                    <strong className="text-slate-800">{pat.averageSleep.toFixed(1)}h</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Consent permissions</span>
                    <strong className="text-teal-600">Active</strong>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPatientId(pat.id)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                >
                  Inspect Clinical Chart →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Detailed Patient Chart Study Screen */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPatientId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to allocated Caseboard
          </button>

          {activePatient && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Core parameters */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img src={activePatient.avatar} alt="PatientAvatar" className="w-10 h-10 rounded-full border bg-slate-100" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{activePatient.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">Case file: Clara Williams • Secure EHR node</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded border capitalize ${
                    prediction?.riskLevel === 'Low Risk' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-amber-50 text-amber-700 border-amber-250'
                  }`}>
                    Assessed Level: {prediction?.riskLevel ?? activePatient.riskStatus}
                  </span>
                </div>

                {/* SVG Graph Mood Chart inside Doctor view */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Patient Mood Swing Cycles (7-Day Period)
                  </span>
                  {recentWeekMoods.length > 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                        {[1, 2, 3, 4, 5].map((level) => {
                          const y = padding + chartHeight - ((level - 1) / 4) * chartHeight;
                          return (
                            <line key={level} x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                          );
                        })}
                        <path d={dPath} fill="none" stroke="#0f766e" strokeWidth={2.5} />
                        {points.map((p) => (
                          <circle key={p.entry.id} cx={p.x} cy={p.y} r={4} className="fill-white stroke-teal-700 stroke-2" />
                        ))}
                      </svg>
                      {/* Dates */}
                      <div className="flex justify-between px-6 text-[9px] text-slate-400 mt-1 font-mono">
                        {recentWeekMoods.map(e => (
                          <span key={e.id}>{new Date(e.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">No mood records synced.</div>
                  )}
                </div>

                {/* Bipolar prediction metrics */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    AI Clinical Diagnostics Inference
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Depressive Wave Probability</span>
                        <span className="font-bold text-indigo-700">{prediction?.depressiveRisk}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${prediction?.depressiveRisk}%` }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Manic Peak Wave Probability</span>
                        <span className="font-bold text-orange-700">{prediction?.manicRisk}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${prediction?.manicRisk}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400 block">Notes & Inference Advice</span>
                    <p className="leading-relaxed text-slate-300">{prediction?.notes}</p>
                  </div>
                </div>

                {/* Journal entries analysis detail */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Patient Encrypted Journals (Psychiatric AI Sentiment Analysis)
                  </span>
                  <div className="space-y-3 max-h-[160px] overflow-y-auto">
                    {journals.map((j) => (
                      <div key={j.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{new Date(j.timestamp).toLocaleString()}</span>
                          <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                            Emotion: {j.sentimentAnalysis?.sentiment || "Neutral"}
                          </span>
                        </div>
                        <p className="italic text-slate-655 font-sans">"{j.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specialist prescribing form */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Plus className="w-4 h-4 text-teal-700" />
                    <h3 className="font-bold text-slate-950 text-sm">Add Clinical Guidance notes</h3>
                  </div>

                  {success && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold text-center flex items-center gap-1.5 justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Prescription advice filed.
                    </div>
                  )}

                  <form onSubmit={handlePostNote} className="space-y-3">
                    <div>
                      <textarea
                        rows={4}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Write professional advice (e.g. adjust lithium intake times, request breathing loops before bedtime, etc.)..."
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Dispatch Clinical Advice
                    </button>
                  </form>
                </div>

                {/* Audit trail details for HIPAA compliance */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <h4 className="font-bold text-xs text-slate-900">EHR Cryptographic Access logs</h4>
                  </div>
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto text-[10px] font-mono">
                    {auditLogs.filter(log => log.userId === 'pat1' || log.details.includes('patient')).map((log) => (
                      <div key={log.id} className="p-2 bg-slate-50 rounded border border-slate-100 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{log.action}</span>
                          <span>{log.timestamp.split('T')[1].substring(0, 8)}</span>
                        </div>
                        <p className="text-slate-500 leading-normal">{log.details}</p>
                        <div className="flex justify-between text-slate-400">
                          <span>Operator: {log.userName}</span>
                          <span>IP: {log.ip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
