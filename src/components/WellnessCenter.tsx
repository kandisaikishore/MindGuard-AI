import { useState, useEffect } from 'react';
import { Sparkles, Play, Pause, Compass, Activity, BookOpen, AlertCircle, Heart, Check } from 'lucide-react';

export default function WellnessCenter() {
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold Empty'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathingActive, setBreathingActive] = useState(false);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  // Box Breathing Loop Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            // Transition and reset
            setBreathPhase((current) => {
              switch (current) {
                case 'Inhale': return 'Hold';
                case 'Hold': return 'Exhale';
                case 'Exhale': return 'Hold Empty';
                case 'Hold Empty': return 'Inhale';
                default: return 'Inhale';
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathTimer(4);
      setBreathPhase('Inhale');
    }

    return () => clearInterval(interval);
  }, [breathingActive]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
  };

  const getBubbleScale = () => {
    if (!breathingActive) return 'scale-50';
    switch (breathPhase) {
      case 'Inhale': return 'scale-[1.1] transition-all duration-[4000ms] ease-out';
      case 'Hold': return 'scale-[1.1]';
      case 'Exhale': return 'scale-40 transition-all duration-[4000ms] ease-in';
      case 'Hold Empty': return 'scale-40';
      default: return 'scale-50';
    }
  };

  const getBubbleColor = () => {
    switch (breathPhase) {
      case 'Inhale': return 'from-teal-400 to-teal-500 shadow-teal-100';
      case 'Hold': return 'from-violet-400 to-violet-500 shadow-violet-100';
      case 'Exhale': return 'from-indigo-400 to-indigo-500 shadow-indigo-100';
      case 'Hold Empty': return 'from-slate-400 to-slate-500 shadow-slate-100';
      default: return 'from-teal-400 to-teal-500 shadow-teal-100';
    }
  };

  const exerciseArticles = [
    {
      id: "art1",
      title: "Stable Bedtimes: Why they regulate Bipolar cycles",
      category: "Circadian Rhythm Science",
      excerpt: "Your brain's master biological clock coordinates core mood pathways. Sleep shifts of even 2 hours can trigger clinical hypomania arousal.",
      readTime: "3 min read"
    },
    {
      id: "art2",
      title: "Coping with the Mania Sparkle",
      category: "Symptom Management",
      excerpt: "When ideas spin fast and confidence surges, box breathing and tracking visual schedules work to anchor logical cognition pathways.",
      readTime: "5 min read"
    },
    {
      id: "art3",
      title: "Self-Compassion in Depressive Troughs",
      category: "Cognitive Therapy",
      excerpt: "Sadness is a biological state, not a personal failure. In depressive loops, reduce critical task loads and focus on light box structures.",
      readTime: "4 min read"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Box Breathing visualizer */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-1 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Compass className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-base font-sans">Box Breathing Loop</h3>
          </div>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            Standard psychiatric grounding loop. Steadying breathing resets vagus nerve triggers and lowers high cardiac indices associated with manic flight or depressive anxiety.
          </p>
        </div>

        {/* Dynamic visual bubble container */}
        <div className="flex flex-col items-center justify-center py-6 relative">
          <div className="h-44 w-44 flex items-center justify-center relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-xl animate-pulse-slow ${
              breathPhase === 'Inhale' ? 'from-teal-300 to-teal-400' : 'from-violet-300 to-violet-400'
            }`} />
            
            <div 
              className={`h-24 w-24 rounded-full bg-gradient-to-tr shadow-2xl flex flex-col items-center justify-center text-white text-center transform ${getBubbleScale()} ${getBubbleColor()}`}
            >
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">
                {breathingActive ? breathPhase : "Ready"}
              </span>
              <span className="text-lg font-black font-mono">
                {breathingActive ? `${breathTimer}s` : "4s"}
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {breathingActive ? `Action: ${breathPhase}` : "Take a moment to center"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              {breathPhase === 'Inhale' ? 'Slowly take deep belly breaths.' :
               breathPhase === 'Hold' ? 'Hold full lung capacity gently.' :
               breathPhase === 'Exhale' ? 'Exhale empty your posture counts.' :
               'Wait empty before restarting loop.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleBreathing}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
            breathingActive 
              ? 'bg-slate-900 text-white hover:bg-slate-950' 
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {breathingActive ? "Pause Grounding Session" : "Start Box Breathing Loop"}
        </button>
      </div>

      {/* Educational Center, Guides and Coping Center */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs lg:col-span-2 space-y-6">
        <h3 className="font-extrabold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          MindGuard Psychoeducational Library
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick coping triggers cards */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-3">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wide flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-teal-600" />
              Depression Coping Strategies
            </span>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 font-sans">
              <li><strong>Zero-loss activation:</strong> Accomplish tiny tasks like making your mattress.</li>
              <li>Circulate blood circulation through a short, brisk 5-minute garden pacing.</li>
              <li>Acknowledge sad thoughts without filing self-critiques — thoughts are passive clouds.</li>
            </ul>
          </div>

          <div className="p-4 bg-orange-50/30 rounded-xl border border-orange-100 space-y-3">
            <span className="text-xs font-bold text-orange-850 uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-orange-500" />
              Hypomania Shielding Protocols
            </span>
            <ul className="text-xs text-slate-655 space-y-2.5 list-disc pl-4 font-sans">
              <li><strong>Strict bedtime anchor:</strong> Turn off all phone panels by 9:30 PM.</li>
              <li>Avoid high retail transactions, stock buyings, or huge creative launches.</li>
              <li>Engage breathing loops to restrict cardiac hyper-arousal symptoms.</li>
            </ul>
          </div>
        </div>

        {/* Guided articles */}
        <div className="space-y-3">
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Curated Bipolar Wellness Articles
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exerciseArticles.map((art) => (
              <div 
                key={art.id} 
                onClick={() => setActiveExercise(art.id)}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-150 text-left cursor-pointer transition flex flex-col justify-between text-xs space-y-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{art.category}</span>
                  <h4 className="font-bold text-slate-900 leading-snug">{art.title}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3">{art.excerpt}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">{art.readTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded article dialog */}
      {activeExercise && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border">
            {exerciseArticles.filter(a => a.id === activeExercise).map((art) => (
              <div key={art.id} className="space-y-3">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">{art.category}</span>
                <h3 className="font-extrabold text-slate-900 text-lg">{art.title}</h3>
                <div className="p-3.5 bg-slate-50 rounded-xl border text-xs text-slate-700 leading-relaxed font-sans font-light whitespace-pre-line">
                  {art.excerpt}
                  {"\n\nCircadian rhythms form the foundation of bipolar mood maintenance. Clinicians agree that waking up at exactly the same time everyday anchors the pituitary gland, stabilising chemical releases. Box breathing and physical scheduling prevent erratic cycle triggers. Continue utilizing MindGuard log monitors to map your progress."}
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setActiveExercise(null)}
                    className="px-4 py-2 bg-slate-150 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Close Resource
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
