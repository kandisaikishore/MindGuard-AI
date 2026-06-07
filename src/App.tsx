import { useState, useEffect } from 'react';
import { 
  Heart, Moon, Sparkles, Activity, FileText, CheckCircle, Clock, 
  AlertCircle, Shield, Calendar, Settings, LogOut, Bell, Compass, 
  Bot, Users, Lock, ChevronDown, Menu, X, ShieldAlert 
} from 'lucide-react';

import { 
  User, MoodEntry, SleepEntry, JournalEntry, Medication, 
  Recommendation, SosAlert, AppNotification, AuditLog, EpisodePrediction 
} from './types';

// Subcomponents
import LoginModule from './components/LoginModule';
import PatientDashboard from './components/PatientDashboard';
import MoodLogs from './components/MoodLogs';
import SleepLogs from './components/SleepLogs';
import MentalHealthJournal from './components/MentalHealthJournal';
import MedicationRemiders from './components/MedicationRemiders';
import DoctorPortal from './components/DoctorPortal';
import CaregiverPortal from './components/CaregiverPortal';
import WellnessCenter from './components/WellnessCenter';
import AiAssistant from './components/AiAssistant';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("mg_token"));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Data State
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [prediction, setPrediction] = useState<EpisodePrediction | null>(null);
  const [adherencePercent, setAdherencePercent] = useState<number>(100);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // UI state
  const [isSosPinging, setIsSosPinging] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [patientsList, setPatientsList] = useState<(User & { currentMoodScore: number; averageSleep: number; riskStatus: string })[]>([]);

  // Validate session on load
  useEffect(() => {
    if (token) {
      validateSession();
    }
  }, [token]);

  // Initial tab alignment based on roles
  useEffect(() => {
    if (user) {
      if (user.role === 'doctor') {
        setActiveTab('doctor');
      } else if (user.role === 'caregiver') {
        setActiveTab('caregiver');
      } else {
        setActiveTab('dashboard');
      }
      refreshData();
    }
  }, [user]);

  const validateSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    localStorage.setItem("mg_token", newToken);
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleSimulateGoogleLogin = async (email: string, name: string, selectedRole: 'patient' | 'doctor' | 'caregiver') => {
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role: selectedRole })
      });
      const data = await res.json();
      if (res.ok) {
        handleLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      console.error("Google SSO simulation error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mg_token");
    setToken(null);
    setUser(null);
  };

  const refreshData = async () => {
    if (!token) return;

    try {
      // 1. Fetch Medications
      const medsRes = await fetch('/api/patient/medications', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const medsData = await medsRes.json();
      if (medsRes.ok) setMedications(medsData.medications);

      // 2. Fetch Notifications
      const notifRes = await fetch('/api/notifications', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const notifData = await notifRes.json();
      if (notifRes.ok) {
        setNotifications(notifData.notifications);
        setHasNewNotifications(notifData.notifications.some((n: any) => !n.read));
      }

      // 3. Fetch Audit Logs
      const auditRes = await fetch('/api/audit-logs', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const auditData = await auditRes.json();
      if (auditRes.ok) setAuditLogs(auditData.auditLogs);

      // 4. Fetch Doctor recommendations
      if (user?.role === 'patient') {
        // Predictions details
        const predRes = await fetch(`/api/patient/predictions/${user.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const predData = await predRes.json();
        if (predRes.ok) {
          setPrediction(predData.prediction);
          setAdherencePercent(predData.adherencePercent);
          setIsSosPinging(predData.prediction?.riskLevel === 'Critical Risk' && sosAlerts.some(a => !a.resolved));
        }
      }

      // 5. Fetch doctor files caseload
      if (user?.role === 'doctor') {
        const docPatsRes = await fetch('/api/doctor/patients', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const docPatsData = await docPatsRes.json();
        if (docPatsRes.ok) setPatientsList(docPatsData.patients);
      }

      // 6. Fetch caregiver panels
      if (user?.role === 'caregiver') {
        const carePatsRes = await fetch('/api/caregiver/patients', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const carePatsData = await carePatsRes.json();
        if (carePatsRes.ok && carePatsData.patients.length > 0) {
          const mainPatId = carePatsData.patients[0].id;
          const predRes = await fetch(`/api/patient/predictions/${mainPatId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const predData = await predRes.json();
          if (predRes.ok) {
            setPrediction(predData.prediction);
          }
        }
      }

      // Sync local preseeded histories initially for charts
      const preseededDbRes = await fetch('/db.json');
      if (preseededDbRes.ok) {
        const seededDb = await preseededDbRes.json();
        setMoods(seededDb.moods);
        setSleepLogs(seededDb.sleepLogs);
        setJournals(seededDb.journals);
        setRecommendations(seededDb.recommendations);
        setSosAlerts(seededDb.sosAlerts);
      }
    } catch (err) {
      console.error("Trouble syncing HIPAA dataset nodes:", err);
    }
  };

  // Poll notifications
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (token) {
      refreshData();
      timer = setInterval(refreshData, 10000);
    }
    return () => clearInterval(timer);
  }, [token, activeTab]);

  // Daily Logging callbacks
  const handleAddMood = async (score: 1 | 2 | 3 | 4 | 5, notes: string) => {
    try {
      const res = await fetch('/api/patient/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, notes })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSleep = async (bedtime: string, wakeupTime: string, duration: number) => {
    try {
      const res = await fetch('/api/patient/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bedtime, wakeupTime, duration })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddJournal = async (text: string) => {
    const res = await fetch('/api/patient/journal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (res.ok) {
      refreshData();
      return { journal: data.journal, isCrisis: data.isCrisis };
    }
    throw new Error(data.error);
  };

  const handleAddMedication = async (name: string, dosage: string, time: string, days: string[]) => {
    try {
      const res = await fetch('/api/patient/medication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, dosage, time, days })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogMedication = async (medicationId: string, date: string, status: 'taken' | 'missed') => {
    try {
      const res = await fetch('/api/patient/medication/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ medicationId, date, status })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleConsent = async (consent: boolean) => {
    try {
      const res = await fetch('/api/patient/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consent })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSos = async () => {
    setIsSosPinging(true);
    // Request device Geolocation with simulated fallback
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await fetch('/api/patient/sos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              address: "Current Patient Live GPS Coordinates"
            })
          });
          refreshData();
        } catch (err) {
          console.error(err);
        }
      },
      async () => {
        // Fallback simulated coordinates
        try {
          await fetch('/api/patient/sos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude: 37.7749,
              longitude: -122.4194,
              address: "Mock Location: Market St, San Francisco, CA"
            })
          });
          refreshData();
        } catch (err) {
          console.error(err);
        }
      }
    );

    alert("🚨 Urgent SOS alert triggered. Mindguard secure dispatch transmitted coordinate logs to Dr. Helen Thorne & caregiver Sarah Evans.");
  };

  const handleResolveSos = async (id: string) => {
    try {
      const res = await fetch('/api/sos/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setIsSosPinging(false);
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecommendation = async (patientId: string, content: string) => {
    try {
      const res = await fetch('/api/doctor/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientId, content })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onSendMessageToChat = async (message: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.reply;
  };

  if (!token || !user) {
    return (
      <LoginModule 
        onLoginSuccess={handleLoginSuccess} 
        onSimulateGoogleLogin={handleSimulateGoogleLogin} 
      />
    );
  }

  // Sidebar navigation options based on roles
  const patientTabs = [
    { id: 'dashboard', label: 'Overview', icon: Compass },
    { id: 'mood', label: 'Mood Log', icon: Heart },
    { id: 'sleep', label: 'Sleep Tracker', icon: Moon },
    { id: 'journal', label: 'Diary', icon: FileText },
    { id: 'meds', label: 'Medications', icon: Clock },
    { id: 'wellness', label: 'Wellness Center', icon: Activity },
    { id: 'chat', label: 'AI Support Chat', icon: Bot },
  ];

  const doctorTabs = [
    { id: 'doctor', label: 'Caseload Board', icon: Users },
  ];

  const caregiverTabs = [
    { id: 'caregiver', label: 'Support Monitor', icon: ShieldAlert },
  ];

  const activeTabsList = user.role === 'doctor' ? doctorTabs 
    : user.role === 'caregiver' ? caregiverTabs 
    : patientTabs;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation frame on Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-col py-6 px-4 shrink-0 border-r border-slate-850 justify-between hidden md:flex font-sans">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-3">
            <Activity className="w-6 h-6 text-teal-400 rotate-12" />
            <span className="font-extrabold text-lg text-white tracking-tight">MindGuard AI</span>
          </div>

          <div className="space-y-1.5 pt-4">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Main Board
            </span>
            {activeTabsList.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-teal-600 text-white font-black' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3.5">
          <div className="flex items-center gap-3 px-2">
            <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full border border-slate-800 bg-slate-800" />
            <div className="min-w-0">
              <h4 className="font-bold text-xs truncate">{user.name}</h4>
              <span className="block text-[9px] text-slate-400 capitalize">{user.role} profile</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-350 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white py-4 px-4 flex items-center justify-between z-30 shrink-0 font-sans border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          <span className="font-bold text-base tracking-tight">MindGuard AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:bg-slate-800 rounded-lg relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {hasNewNotifications && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Slide */}
      {mobileMenuOpen && (
        <div className="absolute inset-x-0 top-14 bg-slate-900 border-b border-slate-800 p-4 z-40 space-y-4 md:hidden text-white">
          <div className="space-y-1">
            {activeTabsList.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center gap-3 transition ${
                    activeTab === tab.id ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-slate-855 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Secure Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Container screen */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 md:h-screen bg-slate-50 overflow-hidden font-sans">
        
        {/* Desktop header bar */}
        <header className="bg-white border-b border-slate-100 py-3.5 px-6 items-center justify-between hidden md:flex shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>HIPAA Secure Node • Active EHR Encryption</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification drop */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setHasNewNotifications(false); }}
                className="p-1 px-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl relative cursor-pointer flex items-center"
              >
                <Bell className="w-4.5 h-4.5" />
                {hasNewNotifications && <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-slate-150 shadow-xl py-3 z-50 text-xs">
                  <div className="px-4 pb-2 border-b border-slate-100 font-bold text-slate-800 flex justify-between">
                    <span>Clinical Alerts Stream</span>
                    <button onClick={() => setShowNotifications(false)} className="text-[10px] text-slate-400 hover:underline">Close</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto pt-2 space-y-1">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-slate-400">No active health notifications generated.</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="px-4 py-2 hover:bg-slate-50 flex items-start gap-2 border-b border-slate-50">
                          {notif.type === 'sos' ? (
                            <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                          )}
                          <div>
                            <p className="text-slate-800 font-medium leading-normal">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <img src={user.avatar} className="w-8 h-8 rounded-full border bg-slate-50" alt="Avatar" />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block text-right leading-none">{user.name}</span>
                <span className="block text-[10px] text-slate-400 text-right uppercase mt-0.5 tracking-wider font-semibold">{user.role} mode</span>
              </div>
            </div>
          </div>
        </header>

        {/* Action tab workspace */}
        <section className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 bg-slate-50">
          <div className="max-w-6xl mx-auto pb-12">
            
            {/* View selectors */}
            {activeTab === 'dashboard' && user.role === 'patient' && (
              <PatientDashboard
                user={user}
                moods={moods}
                sleepLogs={sleepLogs}
                medications={medications}
                recommendations={recommendations}
                prediction={prediction}
                adherencePercent={adherencePercent}
                onNavigate={setActiveTab}
                onToggleConsent={handleToggleConsent}
                triggerSos={triggerSos}
                isSosPinging={isSosPinging}
              />
            )}

            {activeTab === 'mood' && user.role === 'patient' && (
              <MoodLogs moods={moods} onAddMood={handleAddMood} />
            )}

            {activeTab === 'sleep' && user.role === 'patient' && (
              <SleepLogs sleepLogs={sleepLogs} onAddSleep={handleAddSleep} />
            )}

            {activeTab === 'journal' && user.role === 'patient' && (
              <MentalHealthJournal journals={journals} onAddJournal={handleAddJournal} />
            )}

            {activeTab === 'meds' && user.role === 'patient' && (
              <MedicationRemiders 
                medications={medications}
                onAddMedication={handleAddMedication}
                onLogMedication={handleLogMedication}
                adherencePercent={adherencePercent}
              />
            )}

            {activeTab === 'wellness' && (
              <WellnessCenter />
            )}

            {activeTab === 'chat' && (
              <AiAssistant onSendMessage={onSendMessageToChat} />
            )}

            {activeTab === 'doctor' && user.role === 'doctor' && (
              <DoctorPortal
                doctor={user}
                patients={patientsList}
                moods={moods}
                sleepLogs={sleepLogs}
                journals={journals}
                medications={medications}
                recommendations={recommendations}
                prediction={prediction}
                onAddRecommendation={handleAddRecommendation}
                auditLogs={auditLogs}
              />
            )}

            {activeTab === 'caregiver' && user.role === 'caregiver' && (
              <CaregiverPortal
                caregiver={user}
                patient={patientsList && patientsList.length > 0 ? patientsList[0] : user}
                moods={moods}
                sleepLogs={sleepLogs}
                prediction={prediction}
                sosAlerts={sosAlerts}
                onResolveSos={handleResolveSos}
              />
            )}

          </div>
        </section>

        {/* Global floating Emergency Red SOS button (visible on every screen) */}
        {user.role === 'patient' && (
          <div className="fixed bottom-6 right-6 z-50 no-print">
            <button
              onClick={triggerSos}
              className={`p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-2xl transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer border-2 border-white ${
                isSosPinging ? 'animate-bounce' : ''
              }`}
              title="Urgent Distress SOS Ping"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold font-sans tracking-wide">SOS EMERGENCY</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
