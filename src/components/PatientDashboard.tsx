import { useState } from 'react';
import { 
  Heart, Moon, Sparkles, Activity, FileText, CheckCircle, Clock, 
  AlertOctagon, AlertCircle, Share2, Shield, Calendar, ShieldCheck 
} from 'lucide-react';
import { User, MoodEntry, SleepEntry, Medication, Recommendation, EpisodePrediction } from '../types';

interface PatientDashboardProps {
  user: User;
  moods: MoodEntry[];
  sleepLogs: SleepEntry[];
  medications: Medication[];
  recommendations: Recommendation[];
  prediction: EpisodePrediction | null;
  adherencePercent: number;
  onNavigate: (tab: string) => void;
  onToggleConsent: (consent: boolean) => void;
  triggerSos: () => void;
  isSosPinging: boolean;
}

export default function PatientDashboard({
  user,
  moods,
  sleepLogs,
  medications,
  recommendations,
  prediction,
  adherencePercent,
  onNavigate,
  onToggleConsent,
  triggerSos,
  isSosPinging
}: PatientDashboardProps) {
  // Local active reminders list (simulated)
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Get latest logs
  const latestMood = moods[moods.length - 1];
  const latestSleep = sleepLogs[sleepLogs.length - 1];

  // Helper for mood label mapping
  const getMoodDetails = (score: number) => {
    switch (score) {
      case 5: return { label: "Very Happy (Mania Trigger Checked)", color: "text-amber-500 bg-amber-50 border-amber-200", emoji: "⚡" };
      case 4: return { label: "Happy / Energetic", color: "text-teal-600 bg-teal-50 border-teal-200", emoji: "☀️" };
      case 2: return { label: "Mild Depression", color: "text-indigo-600 bg-indigo-50 border-indigo-150", emoji: "🌧️" };
      case 1: return { label: "Very Sad / Depressed", color: "text-rose-600 bg-rose-50 border-rose-200", emoji: "⛈️" };
      default: return { label: "Stable / Balanced", color: "text-emerald-600 bg-emerald-50 border-emerald-150", emoji: "🟢" };
    }
  };

  const currentMood = latestMood ? getMoodDetails(latestMood.score) : { label: "Not Logged Today", color: "text-slate-500 bg-slate-50 border-slate-200", emoji: "⏳" };

  return (
    <div className="space-y-6">
      {/* Alert Header if SOS active */}
      {isSosPinging && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3 animate-pulse-slow">
          <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-900">Active SOS Distress Signal Pinging</h4>
            <p className="text-sm text-rose-700 mt-1">
              Transmitting secure coordinates to Dr. Helen Thorne & caregiver Sarah Evans. Local emergency response instructions have been activated below.
            </p>
          </div>
        </div>
      )}

      {/* Top Welcome Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">Patient Dashboard</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Hello, {user.name}</h2>
          <p className="text-slate-500 text-sm mt-1">
            MindGuard AI coordinates your medication alerts, sleep consistency, and tracks early manic or depressive episode risk metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowConsentModal(true)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            Consent: {user.caregiverConsent ? "Enabled Allowed" : "Restricted"}
          </button>
          <button 
            onClick={triggerSos}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-2 transition transform hover:-translate-y-0.5 ${
              isSosPinging ? 'bg-black animate-bounce' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {isSosPinging ? "SOS PINGING ACTIVE" : "EMERGENCY SOS"}
          </button>
        </div>
      </div>

      {/* Quick Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Mood Card */}
        <button 
          onClick={() => onNavigate('mood')}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-teal-200 text-left transition hover:shadow-xs group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition">
              <Heart className="w-5 h-5" />
            </span>
            <span className="text-2xl">{currentMood.emoji}</span>
          </div>
          <span className="block text-slate-400 text-xs mt-4">Current Mood Indicator</span>
          <span className="block text-base font-semibold text-slate-800 mt-1 truncate">{currentMood.label}</span>
          <span className="text-xs text-teal-600 mt-2 block font-medium group-hover:underline">Log today's mood →</span>
        </button>

        {/* Sleep Card */}
        <button 
          onClick={() => onNavigate('sleep')}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-violet-200 text-left transition hover:shadow-xs group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white transition">
              <Moon className="w-5 h-5" />
            </span>
            <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
              {latestSleep ? `${latestSleep.duration}h` : "N/A"}
            </span>
          </div>
          <span className="block text-slate-400 text-xs mt-4">Asleep Log Duration</span>
          <span className="block text-base font-semibold text-slate-800 mt-1">
            {latestSleep ? `${latestSleep.duration} Hours Logged` : "Not Registered"}
          </span>
          <span className="text-xs text-violet-600 mt-2 block font-medium group-hover:underline">Log bedroom hours →</span>
        </button>

        {/* Medication Adherence Card */}
        <button 
          onClick={() => onNavigate('meds')}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 text-left transition hover:shadow-xs group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition">
              <CheckCircle className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {adherencePercent.toFixed(0)}%
            </span>
          </div>
          <span className="block text-slate-400 text-xs mt-4">Medication Adherence</span>
          <span className="block text-base font-semibold text-slate-800 mt-1">Stable (7-Day Adherence)</span>
          <span className="text-xs text-emerald-600 mt-2 block font-medium group-hover:underline">Manage reminder plan →</span>
        </button>

        {/* Bipolar Episode Prediction Quick Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="p-2 bg-slate-800 rounded-lg text-amber-400">
                <Activity className="w-4 h-4" />
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                prediction?.riskLevel === 'Low Risk' ? 'bg-emerald-500/20 text-emerald-400' :
                prediction?.riskLevel === 'Moderate Risk' ? 'bg-amber-400/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {prediction?.riskLevel || "Calculating..."}
              </span>
            </div>
            <span className="block text-slate-400 text-[11px] mt-4">Calculated Risk Index</span>
            <span className="block text-sm font-bold mt-1 text-slate-100">Episode Prediction AI</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Depress Risk</span>
              <span className="font-semibold text-slate-200">{prediction?.depressiveRisk ?? 12}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Mania Risk</span>
              <span className="font-semibold text-slate-200">{prediction?.manicRisk ?? 8}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Assistant Quick Entry / Predictions details & Clinical notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Engine Detail Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Clinician Risk Assessment & Predictions</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">HIPAA Encrypted Store</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Depressive Risk Meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600">Depressive Phase Arousal Prospect</span>
                <span className="font-semibold text-indigo-600">{prediction?.depressiveRisk ?? 12}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${prediction?.depressiveRisk ?? 12}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Determined through journal sentiment logs and mood self-reported drops.
              </p>
            </div>

            {/* Manic Risk Meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600">Manic Peak / Elevated Arousal Prospect</span>
                <span className="font-semibold text-orange-600">{prediction?.manicRisk ?? 8}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${prediction?.manicRisk ?? 8}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Determined heavily through sleep hours volatility and activity spikes.
              </p>
            </div>
          </div>

          {/* AI Clinical Summary Report Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex gap-3.5">
            <Sparkles className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Synthesized Wellness Report</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{prediction?.notes}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                <span>Confidence Index: <strong className="text-slate-700">{prediction?.confidence ?? 85}%</strong></span>
                <span>•</span>
                <span>Calculated on: <strong className="text-slate-700">{new Date().toLocaleDateString()}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor clinical guidance suggestions column */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Psychiatrist Guidance notes</h3>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">No official specialist prescriptions uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
                    <p className="text-xs text-slate-755 leading-relaxed font-sans">{rec.content}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                      <span className="font-medium text-teal-700">{rec.doctorName}</span>
                      <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-4 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>HIPAA Notice</span>
            </div>
            <span>Records here comply strictly with clinical access paradigms. Sensitive notes remain end-to-end securely isolated.</span>
          </div>
        </div>
      </div>

      {/* Wellness interactive quick box */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="font-bold text-lg">Seeking a moment of stillness?</h3>
          <p className="text-teal-50 text-xs">
            Join the custom Box Breathing loop and progressive meditation courses to soothe nervous system responses.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('wellness')}
          className="px-5 py-2.5 bg-white hover:bg-teal-50 text-teal-700 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Enter Wellness Space →
        </button>
      </div>

      {/* Caregiver Consent settings modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center gap-2 text-teal-600 pb-2 border-b border-slate-100">
              <Share2 className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-lg">Caregiver Sync Permission</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enabling consent allows your designated caregiver, <strong>Sarah Evans (Mother)</strong>, to securely log into the MindGuard Caregiver Portal, review your weekly logs risk ratings, and get instant emergency SOS system text triggers.
            </p>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150">
              <div className="space-y-0.5">
                <span className="block text-xs font-semibold text-slate-800">Sarah Evans' Access rights</span>
                <span className="block text-[10px] text-slate-400">Can view sleep, mood trends, and receive SOS alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={user.caregiverConsent} 
                  onChange={(e) => onToggleConsent(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            <p className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-normal">
              🛡️ HIPAA Compliance Protocol: Access is fully revocable by the patient at any nanosecond. Every access event is appended to secure audit trails.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
