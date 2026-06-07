import { useState } from 'react';
import { 
  Users, Activity, Heart, Moon, ShieldAlert, Sparkles, 
  MapPin, Bell, Radio, FileDown, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { User, MoodEntry, SleepEntry, EpisodePrediction, SosAlert } from '../types';

interface CaregiverPortalProps {
  caregiver: User;
  patient: User | null;
  moods: MoodEntry[];
  sleepLogs: SleepEntry[];
  prediction: EpisodePrediction | null;
  sosAlerts: SosAlert[];
  onResolveSos: (id: string) => void;
}

export default function CaregiverPortal({
  caregiver,
  patient,
  moods,
  sleepLogs,
  prediction,
  sosAlerts,
  onResolveSos
}: CaregiverPortalProps) {
  const [downloading, setDownloading] = useState(false);

  const hasConsent = patient?.caregiverConsent;

  const handleDownloadPdf = () => {
    setDownloading(true);
    // Simulate standard browser printing or styled sheet download
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 1000);
  };

  const activeAlerts = sosAlerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Caregiver Welcome Center */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-2.5 py-1 rounded">
            Caregiver Monitor Station
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Welcome, {caregiver.name}</h2>
          <p className="text-slate-500 text-xs">
            Viewing Bipolar risk alarms for Clara Williams (Mother / Contact relationship).
          </p>
        </div>
        {hasConsent && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            {downloading ? "Preparing clinical PDF..." : "Export Assessment Record"}
          </button>
        )}
      </div>

      {!hasConsent ? (
        /* Consent Restricted Warning Module */
        <div className="bg-white rounded-2xl border border-rose-100 p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-rose-50 text-rose-600 rounded-full animate-pulse-slow">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Psychiatric Consent Restricted</h3>
          <p className="text-slate-550 text-xs leading-relaxed">
            In compliance with HIPAA privacy standards, patient <strong>Clara Williams</strong> has disabled electronic health sharing options.
            Clinician records, sleep durations, and episode predictions remain encrypted.
          </p>
          <div className="bg-slate-50 rounded-xl p-3 text-[10px] text-slate-400 border text-left leading-normal space-y-1">
            <span className="font-bold text-slate-700 block">How to enable access?</span>
            <span>The patient must log into their MindGuard account, open the dashboard settings, and enable the Consent Toggle to share metrics with Sarah Evans.</span>
          </div>
        </div>
      ) : (
        /* Authorized Caregiver view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Active Alert triggers */}
            {activeAlerts.length > 0 && (
              <div className="p-5 bg-rose-50 border-l-4 border-rose-600 rounded-r-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                  <Radio className="w-5 h-5 text-rose-600 animate-ping" />
                  <span>ACTIVE DISTRESS PING RECEIVED</span>
                </div>
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="text-xs space-y-2 text-rose-800 bg-white p-3.5 rounded-xl border border-rose-100 shadow-xs">
                    <p className="font-semibold text-slate-900 leading-normal">"{alert.message}"</p>
                    {alert.location && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Coords: {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)} ({alert.location.address})</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t text-[10px] text-slate-400">
                      <span>Received: {new Date(alert.timestamp).toLocaleTimeString()}</span>
                      <button
                        onClick={() => onResolveSos(alert.id)}
                        className="px-3 py-1 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg font-bold btn transition cursor-pointer"
                      >
                        Acknowledge & Mark Safe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Weekly trends overview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-600" />
                Clara Williams' Biological Trends Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Last Mood logs */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                    <Heart className="w-4 h-4 text-rose-555" />
                    Bipolar Mood logs
                  </span>
                  <div className="space-y-2 text-xs">
                    {moods.slice(-3).reverse().map((m) => (
                      <div key={m.id} className="flex justify-between bg-white p-2.5 rounded-lg border">
                        <span className="font-mono text-slate-500">{new Date(m.timestamp).toLocaleDateString()}</span>
                        <strong className="text-slate-800">Score: {m.score}/5</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sleep duration logs */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                    <Moon className="w-4 h-4 text-violet-600" />
                    Sleep Log Volatility
                  </span>
                  <div className="space-y-2 text-xs font-medium">
                    {sleepLogs.slice(-3).reverse().map((s) => (
                      <div key={s.id} className="flex justify-between bg-white p-2.5 rounded-lg border items-center">
                        <span className="font-mono text-slate-555">{new Date(s.wakeupTime).toLocaleDateString()}</span>
                        <span className={`font-bold ${s.duration < 4 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {s.duration} hours
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Episode forecasting */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-950 text-base border-b pb-3 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-violet-600 animate-pulse" />
                Clinician Risk Forecasting
              </h3>

              <div className="text-center py-4 bg-violet-50 rounded-xl border border-violet-100 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-violet-700">Calculated overall risk</span>
                <h4 className="text-xl font-black text-violet-900">{prediction?.riskLevel || "Low Risk"}</h4>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-655 font-sans">
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Incipient Depressive risk</span>
                    <span>{prediction?.depressiveRisk ?? 12}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${prediction?.depressiveRisk ?? 12}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Incipient Manic risk</span>
                    <span>{prediction?.manicRisk ?? 8}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${prediction?.manicRisk ?? 8}%` }} />
                  </div>
                </div>
              </div>

              {prediction?.sleepWarning && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-[11px] leading-relaxed flex gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600 mt-0.5 shrink-0" />
                  <span>
                    Clinician warning: Patient registered sleep hours below 4 hours consecutively. Volatile manic episode trigger is extremely high.
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] text-slate-450 leading-normal mt-4">
              🛡️ HIPAA Electronic access: Caregiver entries undergo immediate audit logging. Viewing detailed records requires active consent credentials.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
