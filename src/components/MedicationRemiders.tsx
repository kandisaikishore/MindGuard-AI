import React, { useState } from 'react';
import { Clock, Plus, CheckCircle2, XCircle, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Medication } from '../types';

interface MedicationRemidersProps {
  medications: Medication[];
  onAddMedication: (name: string, dosage: string, time: string, days: string[]) => void;
  onLogMedication: (medicationId: string, date: string, status: 'taken' | 'missed') => void;
  adherencePercent: number;
}

export default function MedicationRemiders({
  medications,
  onAddMedication,
  onLogMedication,
  adherencePercent
}: MedicationRemidersProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  const [adding, setAdding] = useState(false);
  const [simulatedReminder, setSimulatedReminder] = useState<string | null>(null);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !time) return;

    onAddMedication(name, dosage, time, selectedDays);
    setName('');
    setDosage('');
    setTime('08:00');
    setAdding(false);
  };

  // Get current active date formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const triggerMockReminder = (medName: string, medDosage: string) => {
    setSimulatedReminder(`🔔 Reminding: It is time to take your ${medName} ${medDosage}! Please log your adherence in the status column below.`);
    setTimeout(() => {
      setSimulatedReminder(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Slide-out mock notifications alerts */}
      {simulatedReminder && (
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-slate-700 flex items-center justify-between gap-4 animate-bounce z-40">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-teal-400 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed font-sans">{simulatedReminder}</p>
          </div>
          <button 
            onClick={() => setSimulatedReminder(null)}
            className="text-xs hover:bg-slate-800 text-slate-350 px-2 py-1 rounded cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adherence panel, medication creators */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-950 text-base">Adherence Optimizer</h3>
            <span className="text-xs font-mono text-slate-400">Compliance stats</span>
          </div>

          <div className="text-center space-y-2 py-6 bg-slate-50 rounded-2xl border border-slate-150">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full text-emerald-600 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-slate-800 font-mono">
              {adherencePercent.toFixed(0)}%
            </h4>
            <p className="text-xs text-slate-600 font-sans px-4">
              Your 7-day therapeutic medication compliance score is calculated continuously.
            </p>
          </div>

          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Medication Regimen
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lithium Carbonate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Dosage Structure</label>
                <input
                  type="text"
                  placeholder="e.g. 300mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Dosage Daily time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Recurrent Schedule Days</label>
                <div className="flex flex-wrap gap-1">
                  {daysOfWeek.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition ${
                          isSelected 
                            ? 'bg-teal-600 border-teal-500 text-white' 
                            : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="w-1/2 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                >
                  Register Regiment
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Reminders schedule grid lists */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Prescribed Regimen & Intake Calendar
            </span>
            <span className="text-xs font-normal text-slate-400">Date: <strong className="text-slate-600 font-mono">{todayStr}</strong></span>
          </h3>

          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
            {medications.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-400">No active medication schedules mapped yet.</p>
            ) : (
              medications.map((med) => {
                const todayStatus = med.history[todayStr];
                return (
                  <div key={med.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-4 transition">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-888 leading-tight truncate">{med.name}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-350" />
                          Set for: {med.time}
                        </span>
                        <span>•</span>
                        <span className="truncate">Days: {med.days.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => triggerMockReminder(med.name, med.dosage)}
                        className="p-1 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 transition"
                        title="Simulate push alerts notification triggers"
                      >
                        Simulate Alert
                      </button>

                      {/* Log taken checkbox */}
                      <button
                        onClick={() => onLogMedication(med.id, todayStr, 'taken')}
                        className={`p-1 px-2.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                          todayStatus === 'taken'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {todayStatus === 'taken' ? 'Taken' : 'Mark Taken'}
                      </button>

                      {/* Log missed */}
                      <button
                        onClick={() => onLogMedication(med.id, todayStr, 'missed')}
                        className={`p-1 px-2.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                          todayStatus === 'missed'
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {todayStatus === 'missed' ? 'Missed' : 'Mark Missed'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
