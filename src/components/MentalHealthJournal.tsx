import React, { useState } from 'react';
import { FileText, Sparkles, AlertOctagon, ShieldAlert, Heart, Calendar, Lock } from 'lucide-react';
import { JournalEntry } from '../types';

interface MentalHealthJournalProps {
  journals: JournalEntry[];
  onAddJournal: (text: string) => Promise<{ journal: JournalEntry; isCrisis: boolean }>;
}

export default function MentalHealthJournal({ journals, onAddJournal }: MentalHealthJournalProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [crisisTriggered, setCrisisTriggered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setErrorHeader(null);
    setCrisisTriggered(false);

    try {
      const res = await onAddJournal(text);
      setText('');
      if (res.isCrisis) {
        setCrisisTriggered(true);
      }
    } catch (err) {
      setErrorHeader("Filing journal entry failed. Please check backend response logs.");
    } finally {
      setSubmitting(false);
    }
  };

  const sortedJournals = [...journals].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'Depressive': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Manic': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Anxious': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Journal Submission Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-1 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-base">Mental Health Diary</h3>
        </div>

        <p className="text-slate-500 text-xs">
          Your daily reflection works as a therapeutic monitor. MindGuard runs zero-loss end-to-end sentiment tracking to alert clinicians of early manic or depressive peaks.
        </p>

        {crisisTriggered && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded-xl text-rose-900 space-y-2">
            <div className="flex gap-1.5 items-center font-bold text-xs uppercase tracking-wide">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
              <span>Urgent: Crisis indicator triggered!</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-755">
              We detected stress cues reflecting distress. Please remember: you are not alone. Please consider checking the emergency contacts drawer, clicking the emergency SOS button, or reaching out to Dr. Helen Thorne or your caregiver Sarah Evans right now.
            </p>
          </div>
        )}

        {errorHeader && (
          <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100 text-rose-700 text-xs text-center font-semibold">
            {errorHeader}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How are your thoughts moving today? Do you feel elevated, hyper-focused, empty, or anxious?"
              className="w-full text-xs p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition"
              required
            />
          </div>

          <div className="flex justify-between items-center bg-slate-50 border-t border-slate-100 p-2.5 rounded-lg text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              End-to-end HIPAA Encrypted
            </span>
            <span className="font-mono">Ready to Analyze</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white hover:shadow-md h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? "Processing AI Cognitive Analysis..." : "Verify & File Journal"}
          </button>
        </form>
      </div>

      {/* Diary history list and analysis logs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-5">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Reflections Logs & Mood Analytics
        </h3>

        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {sortedJournals.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No journal reflections filed. Write your first diary entry to start.
            </div>
          ) : (
            sortedJournals.map((entry) => (
              <div key={entry.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl transition space-y-3">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(entry.timestamp).toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {entry.sentimentAnalysis && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSentimentBadge(entry.sentimentAnalysis.sentiment)}`}>
                      Clinical Sentiment: {entry.sentimentAnalysis.sentiment}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                  "{entry.text}"
                </div>

                {entry.sentimentAnalysis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-[11px] text-slate-600 font-medium">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Depressive indicator:</span>
                        <span className="font-bold text-indigo-600 font-mono">{entry.sentimentAnalysis.depressionIndicator}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${entry.sentimentAnalysis.depressionIndicator}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Manic indicator:</span>
                        <span className="font-bold text-orange-600 font-mono">{entry.sentimentAnalysis.maniaIndicator}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${entry.sentimentAnalysis.maniaIndicator}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Stress rating:</span>
                        <span className="font-bold text-rose-600 font-mono">{entry.sentimentAnalysis.stressScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${entry.sentimentAnalysis.stressScore}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Emotional Quotient:</span>
                        <span className="font-bold text-teal-600 font-mono">{entry.sentimentAnalysis.emotionalScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${entry.sentimentAnalysis.emotionalScore}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
