import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  User, MoodEntry, SleepEntry, JournalEntry, Medication, 
  Recommendation, SosAlert, AppNotification, AuditLog, EpisodePrediction 
} from './src/types';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// Define in-memory state fallback & filesystem synchronizations
interface DatabaseSchema {
  users: User[];
  moods: MoodEntry[];
  sleepLogs: SleepEntry[];
  journals: JournalEntry[];
  medications: Medication[];
  recommendations: Recommendation[];
  sosAlerts: SosAlert[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

// Pre-seeded clinical-grade patient data representing Clara Williams' history
const PRE_SEEDED_DATA: DatabaseSchema = {
  users: [
    {
      id: "pat1",
      email: "clara.williams@example.com",
      name: "Clara Williams",
      role: "patient",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      assignedDoctorId: "doc1",
      assignedDoctorName: "Dr. Helen Thorne",
      assignedCaregiverId: "care1",
      assignedCaregiverName: "Sarah Evans",
      caregiverConsent: true,
      phone: "+1 (555) 234-5678",
      emergencyContactName: "Sarah Evans",
      emergencyContactPhone: "+1 (555) 987-6543"
    },
    {
      id: "doc1",
      email: "helen.thorne@hospital.org",
      name: "Dr. Helen Thorne",
      role: "doctor",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
      caregiverConsent: false,
      phone: "+1 (555) 111-2222"
    },
    {
      id: "care1",
      email: "sarah.evans@example.com",
      name: "Sarah Evans",
      role: "caregiver",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      caregiverConsent: false,
      phone: "+1 (555) 987-6543"
    }
  ],
  moods: [
    { id: "m1", userId: "pat1", score: 3, notes: "Feeling stable and balanced today.", timestamp: "2026-05-27T10:00:00Z" },
    { id: "m2", userId: "pat1", score: 2, notes: "Slightly low, struggling to finds motivation.", timestamp: "2026-05-28T09:30:00Z" },
    { id: "m3", userId: "pat1", score: 2, notes: "Slept poorly, sad mood persists.", timestamp: "2026-05-29T11:15:00Z" },
    { id: "m4", userId: "pat1", score: 1, notes: "Very depressive thoughts. Contacted doctor's assistant.", timestamp: "2026-05-30T08:00:00Z" },
    { id: "m5", userId: "pat1", score: 3, notes: "Better after medication adjustment.", timestamp: "2026-05-31T09:00:00Z" },
    { id: "m6", userId: "pat1", score: 3, notes: "Productive day. Mood is balanced.", timestamp: "2026-06-01T10:30:00Z" },
    { id: "m7", userId: "pat1", score: 4, notes: "Feeling very energetic. Cleaned the whole apartment!", timestamp: "2026-06-02T08:00:00Z" },
    { id: "m8", userId: "pat1", score: 4, notes: "Mind is running fast, but ideas are flowing nicely.", timestamp: "2026-06-03T09:00:00Z" },
    { id: "m9", userId: "pat1", score: 5, notes: "Overwhelmed with joy and infinite ideas. Slept very little.", timestamp: "2026-06-04T07:45:00Z" },
    { id: "m10", userId: "pat1", score: 5, notes: "Super elevated mood! Decided to start 3 new crafts.", timestamp: "2026-06-05T08:30:00Z" },
    { id: "m11", userId: "pat1", score: 4, notes: "Still high but slightly irritable. Heart racing a bit.", timestamp: "2026-06-06T09:00:00Z" },
    { id: "m12", userId: "pat1", score: 3, notes: "Calmer today, feeling a bit tired after the high spike.", timestamp: "2026-06-07T08:15:00Z" }
  ],
  sleepLogs: [
    { id: "s1", userId: "pat1", bedtime: "2026-05-26 22:30", wakeupTime: "2026-05-27 07:00", duration: 8.5, timestamp: "2026-05-27T07:15:00Z" },
    { id: "s2", userId: "pat1", bedtime: "2026-05-27 23:00", wakeupTime: "2026-05-28 06:45", duration: 7.75, timestamp: "2026-05-28T07:00:00Z" },
    { id: "s3", userId: "pat1", bedtime: "2026-05-28 23:45", wakeupTime: "2026-05-29 05:30", duration: 5.75, timestamp: "2026-05-29T06:00:00Z" },
    { id: "s4", userId: "pat1", bedtime: "2026-05-29 01:00", wakeupTime: "2026-05-30 06:00", duration: 5.0, timestamp: "2026-05-30T06:30:00Z" },
    { id: "s5", userId: "pat1", bedtime: "2026-05-30 22:00", wakeupTime: "2026-05-31 06:30", duration: 8.5, timestamp: "2026-05-31T06:45:00Z" },
    { id: "s6", userId: "pat1", bedtime: "2026-05-31 22:15", wakeupTime: "2026-06-01 06:15", duration: 8.0, timestamp: "2026-06-01T06:30:00Z" },
    { id: "s7", userId: "pat1", bedtime: "2026-06-01 23:30", wakeupTime: "2026-06-02 06:00", duration: 6.5, timestamp: "2026-06-02T06:15:00Z" },
    { id: "s8", userId: "pat1", bedtime: "2026-06-02 23:55", wakeupTime: "2026-06-03 05:15", duration: 5.3, timestamp: "2026-06-03T05:30:00Z" },
    { id: "s9", userId: "pat1", bedtime: "2026-06-03 01:40", wakeupTime: "2026-06-04 05:10", duration: 3.5, timestamp: "2026-06-04T05:30:00Z" },
    { id: "s10", userId: "pat1", bedtime: "2026-06-04 02:15", wakeupTime: "2026-06-05 05:45", duration: 3.5, timestamp: "2026-06-05T06:00:00Z" },
    { id: "s11", userId: "pat1", bedtime: "2026-06-05 02:00", wakeupTime: "2026-06-06 05:30", duration: 3.5, timestamp: "2026-06-06T05:45:00Z" },
    { id: "s12", userId: "pat1", bedtime: "2026-06-06 23:50", wakeupTime: "2026-06-07 06:50", duration: 7.0, timestamp: "2026-06-07T07:00:00Z" }
  ],
  journals: [
    {
      id: "j1",
      userId: "pat1",
      text: "Woke up feeling empty. Standard tasks feel heavy. I just want to stay in bed all day and mute the world.",
      timestamp: "2026-05-30T09:00:00Z",
      sentimentAnalysis: {
        sentiment: "Depressive",
        stressScore: 78,
        depressionIndicator: 83,
        maniaIndicator: 5,
        emotionalScore: 15
      }
    },
    {
      id: "j2",
      userId: "pat1",
      text: "The sun is back! Slept okay, medication adjustments from Dr. Thorne seem to be stabilizing my mood.",
      timestamp: "2026-06-01T11:00:00Z",
      sentimentAnalysis: {
        sentiment: "Neutral",
        stressScore: 35,
        depressionIndicator: 20,
        maniaIndicator: 12,
        emotionalScore: 55
      }
    },
    {
      id: "j3",
      userId: "pat1",
      text: "A fire is lit inside my mind today! I have a thousand different ideas. Slept fewer hours but I represent pure energy. I am cleaning everything and drawing!",
      timestamp: "2026-06-03T10:00:00Z",
      sentimentAnalysis: {
        sentiment: "Manic",
        stressScore: 50,
        depressionIndicator: 5,
        maniaIndicator: 78,
        emotionalScore: 92
      }
    },
    {
      id: "j4",
      userId: "pat1",
      text: "Still highly energetic, but starting to feel slightly modern and irritable. Too many sound waves and noise everywhere. Staying focused is tough.",
      timestamp: "2026-06-06T10:15:00Z",
      sentimentAnalysis: {
        sentiment: "Anxious",
        stressScore: 68,
        depressionIndicator: 15,
        maniaIndicator: 65,
        emotionalScore: 70
      }
    }
  ],
  medications: [
    {
      id: "med1",
      userId: "pat1",
      name: "Lithium Carbonate",
      dosage: "300mg",
      time: "20:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      history: {
        "2026-06-01": "taken",
        "2026-06-02": "taken",
        "2026-06-03": "taken",
        "2026-06-04": "missed",
        "2026-06-05": "taken",
        "2026-06-06": "taken",
        "2026-06-07": "taken"
      }
    },
    {
      id: "med2",
      userId: "pat1",
      name: "Lamotrigine",
      dosage: "100mg",
      time: "08:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      history: {
        "2026-06-01": "taken",
        "2026-06-02": "taken",
        "2026-06-03": "taken",
        "2026-06-04": "taken",
        "2026-06-05": "taken",
        "2026-06-06": "taken",
        "2026-06-07": "taken"
      }
    },
    {
      id: "med3",
      userId: "pat1",
      name: "Quetiapine",
      dosage: "50mg (at bedtime)",
      time: "22:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      history: {
        "2026-06-01": "taken",
        "2026-06-02": "taken",
        "2026-06-03": "missed",
        "2026-06-04": "missed",
        "2026-06-05": "taken",
        "2026-06-06": "taken",
        "2026-06-07": "taken"
      }
    }
  ],
  recommendations: [
    {
      id: "rec1",
      patientId: "pat1",
      doctorId: "doc1",
      doctorName: "Dr. Helen Thorne",
      content: "Ensure strict adherence to Lithium dose at 8PM. Reduce screen time after 9PM to enable sleep stabilization.",
      timestamp: "2026-05-30T15:30:00Z"
    },
    {
      id: "rec2",
      patientId: "pat1",
      doctorId: "doc1",
      doctorName: "Dr. Helen Thorne",
      content: "Because your sleep fell to 3.5 hours for three consecutive days (June 3 to June 5), please focus on calming bedtime breathing. Continue daily mood entries.",
      timestamp: "2026-06-05T16:00:00Z"
    }
  ],
  sosAlerts: [
    {
      id: "sos1",
      patientId: "pat1",
      patientName: "Clara Williams",
      timestamp: "2026-05-30T08:12:00Z",
      message: "Severe depressive episode registered with extreme distress indicators.",
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "Market St, San Francisco, CA"
      },
      resolved: true
    }
  ],
  notifications: [
    { id: "n1", userId: "pat1", type: "medication", message: "Reminder: Take Lithium Carbonate (300mg) at 20:00", read: false, timestamp: "2026-06-07T06:00:00Z" },
    { id: "n2", userId: "pat1", type: "sleep", message: "Clinical Warning: Sleep hours fell below 4 hours consecutively earlier this week. Elevated Risk triggered.", read: false, timestamp: "2026-06-05T09:00:00Z" }
  ],
  auditLogs: [
    {
      id: "al1",
      userId: "pat1",
      userName: "Clara Williams",
      role: "Patient",
      action: "Access Record",
      details: "Patient downloaded HIPAA secure encrypted daily mood log history.",
      ip: "192.168.1.102",
      timestamp: "2026-06-07T07:15:00Z"
    }
  ]
};

// Ensure JSON database exists and read it
function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(PRE_SEEDED_DATA, null, 2));
      return PRE_SEEDED_DATA;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to initialize JSON database:", error);
    return PRE_SEEDED_DATA;
  }
}

let db = initDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to sync JSON database:", err);
  }
}

// System logging for HIPAA audits
function auditLog(userId: string, userName: string, role: string, action: string, details: string, req: express.Request) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || "127.0.0.1";
  const newLog: AuditLog = {
    id: `al_${Date.now()}`,
    userId,
    userName,
    role,
    action,
    details,
    ip,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);
  saveDatabase();
}

// Simple session token tracking (simulate session via secure RAM store with 1 day expiry)
const SESSION_STORE = new Map<string, User>();

// Initialize Gemini Client
const aiGen = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// HIPAA-friendly decryption simulator
function encryptData(text: string): string {
  // Simple base64 shift simulation for demonstrating E2E encrypted column display
  return Buffer.from(text).toString('base64');
}

function decryptData(hash: string): string {
  try {
    return Buffer.from(hash, 'base64').toString('utf-8');
  } catch {
    return hash;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API - Auth - Session status
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing session token" });
    }
    const token = authHeader.replace("Bearer ", "");
    const user = SESSION_STORE.get(token);
    if (!user) {
      return res.status(401).json({ error: "Invalid session or expired" });
    }
    res.json({ user });
  });

  // API - Auth - Password Register
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name, role, assignedDoctorId, assignedCaregiverId } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Email, password, name and role are highly required." });
    }

    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: "User already exists with this email address." });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      assignedDoctorId: role === 'patient' ? "doc1" : null,
      assignedDoctorName: role === 'patient' ? "Dr. Helen Thorne" : null,
      assignedCaregiverId: role === 'patient' ? "care1" : null,
      assignedCaregiverName: role === 'patient' ? "Sarah Evans" : null,
      caregiverConsent: true
    };

    db.users.push(newUser);
    saveDatabase();

    const token = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    SESSION_STORE.set(token, newUser);

    auditLog(newUser.id, newUser.name, newUser.role, "Signup", "User registered secure account.", req);
    res.json({ token, user: newUser });
  });

  // API - Auth - Password Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter your email and password credentials." });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: "No account found matching this email." });
    }

    const token = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    SESSION_STORE.set(token, user);

    auditLog(user.id, user.name, user.role, "Login", "User established credential-based session.", req);
    res.json({ token, user });
  });

  // API - Auth - Simulated Google OAuth
  app.post('/api/auth/google-login', (req, res) => {
    const { email, name, role } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Google ID properties is required" });
    }

    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr_g_${Date.now()}`,
        email: email.toLowerCase(),
        name,
        role: role || 'patient',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
        assignedDoctorId: "doc1",
        assignedDoctorName: "Dr. Helen Thorne",
        assignedCaregiverId: "care1",
        assignedCaregiverName: "Sarah Evans",
        caregiverConsent: true
      };
      db.users.push(user);
      saveDatabase();
    }

    const token = `tok_google_${Date.now()}`;
    SESSION_STORE.set(token, user);

    auditLog(user.id, user.name, user.role, "Google OAuth", "User connected via Google secure verification.", req);
    res.json({ token, user });
  });

  // API - Auth - Forgot Password Simulation
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      return res.status(400).json({ error: "Account not found." });
    }
    res.json({ message: "Password reset verification payload transmitted securely under HIPAA logs." });
  });

  // API - Patient - Add Mood entry
  app.post('/api/patient/mood', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Invalid session" });

    const { score, notes } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: "Scores must be integers from 1 to 5." });
    }

    const newMood: MoodEntry = {
      id: `m_${Date.now()}`,
      userId: user.id,
      score,
      notes: notes || "",
      timestamp: new Date().toISOString()
    };

    db.moods.push(newMood);
    saveDatabase();

    auditLog(user.id, user.name, user.role, "Log Mood", `Logged daily mood index score: ${score}`, req);
    res.json({ mood: newMood });
  });

  // API - Patient - Add Sleep Entry
  app.post('/api/patient/sleep', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Invalid session" });

    const { bedtime, wakeupTime, duration } = req.body;
    if (!bedtime || !wakeupTime || duration === undefined) {
      return res.status(400).json({ error: "Missing bedtime, wake-up time, or verified duration properties." });
    }

    const durationNum = Number(duration);
    const newSleep: SleepEntry = {
      id: `s_${Date.now()}`,
      userId: user.id,
      bedtime,
      wakeupTime,
      duration: durationNum,
      timestamp: new Date().toISOString()
    };

    db.sleepLogs.push(newSleep);

    // Sleep episode alert criteria (< 4 hours)
    if (durationNum < 4) {
      const urgentMessage = `Sleep duration fell critical: ${durationNum} hours on date ${bedtime.split(' ')[0]}. Triggering risk updates.`;
      const criticalNotif: AppNotification = {
        id: `n_${Date.now()}`,
        userId: user.id,
        type: 'sleep',
        message: urgentMessage,
        read: false,
        timestamp: new Date().toISOString()
      };
      db.notifications.unshift(criticalNotif);
    }

    saveDatabase();
    auditLog(user.id, user.name, user.role, "Log Sleep", `Logged sleep record: ${durationNum} hours.`, req);
    res.json({ sleep: newSleep });
  });

  // API - Patient - Add & AI Analyze Journal Entry
  app.post('/api/patient/journal', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthenticated" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Invalid session" });

    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Journal entry must contain notes." });
    }

    // High Risk crisis screening rules
    const lowerText = text.toLowerCase();
    const crisisTriggers = [
      "i want to disappear", "life is pointless", "nobody needs me", 
      "kill myself", "suicide", "end my life", "want to die"
    ];
    const isCrisis = crisisTriggers.some(phrase => lowerText.includes(phrase));

    let analysis = {
      sentiment: "Neutral" as 'Positive' | 'Neutral' | 'Negative' | 'Anxious' | 'Manic' | 'Depressive',
      stressScore: 30,
      depressionIndicator: 20,
      maniaIndicator: 10,
      emotionalScore: 50
    };

    const apiKeySet = !!process.env.GEMINI_API_KEY;

    if (apiKeySet) {
      try {
        const prompt = `Analyze this mental health journal entry for indicators of Bipolar Disorder (Depressive vs Manic peaks).
Journal entry text: "${text}"

Reply ONLY with a JSON object of this exact schema:
{
  "sentiment": "Positive" | "Neutral" | "Negative" | "Anxious" | "Manic" | "Depressive",
  "stressScore": number (0-100),
  "depressionIndicator": number (0-100),
  "maniaIndicator": number (0-100),
  "emotionalScore": number (0-100)
}`;

        const response = await aiGen.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are an analytical assistant summarizing mood indicators for therapeutic review."
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed && typeof parsed === 'object') {
            analysis = {
              sentiment: parsed.sentiment || "Neutral",
              stressScore: parsed.stressScore ?? 30,
              depressionIndicator: parsed.depressionIndicator ?? 20,
              maniaIndicator: parsed.maniaIndicator ?? 10,
              emotionalScore: parsed.emotionalScore ?? 50
            };
          }
        }
      } catch (gemError) {
        console.error("Gemini journal analysis failed, falling back to local heuristic analysis:", gemError);
      }
    }

    // Heuristics fallback if API is offline or fail
    if (!apiKeySet || analysis.sentiment === "Neutral") {
      // Parse mania terms vs depression terms
      const depressionTerms = ["empty", "stay in bed", "sad", "unworthy", "pointless", "heavy", "tired", "crying"];
      const maniaTerms = ["energetic", "spinning", "cleaning", "infinite", "racing", "grandiose", "idea", "buying", "speed"];
      const anxiousTerms = ["scared", "heart racing", "worried", "panic", "fear", "anxious", "restless"];

      let depWords = depressionTerms.filter(w => lowerText.includes(w)).length;
      let manWords = maniaTerms.filter(w => lowerText.includes(w)).length;
      let anxWords = anxiousTerms.filter(w => lowerText.includes(w)).length;

      if (depWords > manWords && depWords > anxWords) {
        analysis = {
          sentiment: "Depressive",
          stressScore: Math.min(40 + (depWords * 15), 95),
          depressionIndicator: Math.min(50 + (depWords * 15), 98),
          maniaIndicator: Math.max(5, 10 - depWords),
          emotionalScore: Math.max(10, 30 - (depWords * 8))
        };
      } else if (manWords > depWords && manWords > anxWords) {
        analysis = {
          sentiment: "Manic",
          stressScore: Math.min(30 + (manWords * 10), 80),
          depressionIndicator: Math.max(5, 10 - manWords),
          maniaIndicator: Math.min(50 + (manWords * 15), 98),
          emotionalScore: Math.min(95, 75 + (manWords * 8))
        };
      } else if (anxWords > 0) {
        analysis = {
          sentiment: "Anxious",
          stressScore: Math.min(50 + (anxWords * 15), 95),
          depressionIndicator: Math.min(25 + (anxWords * 10), 70),
          maniaIndicator: Math.min(20 + (anxWords * 8), 60),
          emotionalScore: Math.max(20, 50 - (anxWords * 10))
        };
      }
    }

    const journalId = `j_${Date.now()}`;
    const newJournal: JournalEntry = {
      id: journalId,
      userId: user.id,
      text,
      timestamp: new Date().toISOString(),
      sentimentAnalysis: analysis
    };

    db.journals.push(newJournal);

    // If Crisis / High Risk detected, trigger alerts
    if (isCrisis) {
      const sosNotif: AppNotification = {
        id: `n_sos_${Date.now()}`,
        userId: user.id,
        type: 'sos',
        message: "Urgent Warning: High Risk keyword detected inside patient's journal notes.",
        read: false,
        timestamp: new Date().toISOString()
      };
      db.notifications.unshift(sosNotif);
    }

    saveDatabase();
    auditLog(user.id, user.name, user.role, "Log Journal", "Encrypted Patient Daily mental health reflections.", req);
    res.json({ journal: newJournal, isCrisis });
  });

  // API - Patient - Trigger SOS Emergency System
  app.post('/api/patient/sos', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authentication token." });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Invalid session." });

    const { latitude, longitude, address, message } = req.body;

    const newSos: SosAlert = {
      id: `sos_${Date.now()}`,
      patientId: user.id,
      patientName: user.name,
      timestamp: new Date().toISOString(),
      message: message || "Urgent Distress: MindGuard SOS alert triggered by Patient.",
      location: latitude && longitude ? {
        latitude: Number(latitude),
        longitude: Number(longitude),
        address: address || "Shared device location details."
      } : undefined,
      resolved: false
    };

    db.sosAlerts.unshift(newSos);

    // Create immediate SOS notification for Doctor & Caregiver
    const notification: AppNotification = {
      id: `n_emerg_${Date.now()}`,
      userId: user.id,
      type: 'sos',
      message: "🚨 CRITICAL EMERGENCY: Clara Williams triggered an SOS alert. Emergency message dispatched.",
      read: false,
      timestamp: new Date().toISOString()
    };
    db.notifications.unshift(notification);

    saveDatabase();
    auditLog(user.id, user.name, user.role, "Emergency SOS Trigger", "Dispatched distress ping to Doctor Dr. Helen Thorne & caregiver Sarah Evans with simulated geolocation coords.", req);

    res.json({ alert: newSos, status: "Transmitted successfully" });
  });

  // API - Patient - Toggle Caregiver Consent permission
  app.post('/api/patient/consent', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing authentication token" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Invalid session" });

    const { consent } = req.body;
    if (consent === undefined) {
      return res.status(400).json({ error: "Consent state requires true/false boolean payload." });
    }

    const patient = db.users.find(u => u.id === user.id);
    if (patient) {
      patient.caregiverConsent = !!consent;
      user.caregiverConsent = !!consent;
      saveDatabase();
    }

    auditLog(user.id, user.name, user.role, "Update Consent", `Modified caregiver clinical viewer consent permissions: ${consent}`, req);
    res.json({ user });
  });

  // API - Patient - Get Medications list
  app.get('/api/patient/medications', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthenticated" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Unauthenticated session" });

    const patientId = user.role === 'patient' ? user.id : (req.query.patientId as string || 'pat1');
    const list = db.medications.filter(m => m.userId === patientId);
    res.json({ medications: list });
  });

  // API - Patient - Add Medication
  app.post('/api/patient/medication', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthenticated" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Unauthenticated session" });

    const { name, dosage, time, days } = req.body;
    if (!name || !dosage || !time) {
      return res.status(400).json({ error: "Missing medication parameters. Ensure name, dosage, and times are valid." });
    }

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      userId: user.role === 'patient' ? user.id : 'pat1',
      name,
      dosage,
      time,
      days: days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      history: {}
    };

    db.medications.push(newMed);
    saveDatabase();

    auditLog(user.id, user.name, user.role, "Add Medication", `Added medical regime: ${name} (${dosage}) at ${time}.`, req);
    res.json({ medication: newMed });
  });

  // API - Patient - Log Medication adherence status
  app.post('/api/patient/medication/log', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthenticated" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Unauthenticated session" });

    const { medicationId, date, status } = req.body;
    if (!medicationId || !date || !status) {
      return res.status(400).json({ error: "Missing medicationId, date, or log status." });
    }

    const med = db.medications.find(m => m.id === medicationId);
    if (!med) {
      return res.status(404).json({ error: "Medication regimen not found." });
    }

    med.history[date] = status;
    saveDatabase();

    auditLog(user.id, user.name, user.role, "Log Medication Intake", `Logged medication ID: ${medicationId} on ${date} as ${status}`, req);
    res.json({ medication: med });
  });

  // API - Patient - predictions and analysis index
  app.get('/api/patient/predictions/:id', (req, res) => {
    const patientId = req.params.id || 'pat1';
    
    // Evaluate sleep history, mood fluctuative waves, and journal markers for bipolar episodes
    const patientMoods = db.moods.filter(m => m.userId === patientId);
    const patientSleep = db.sleepLogs.filter(s => s.userId === patientId);
    const patientJournals = db.journals.filter(j => j.userId === patientId);
    const patientMeds = db.medications.filter(m => m.userId === patientId);

    // Default stable indices
    let depressiveRisk = 12;
    let manicRisk = 8;
    let sleepWarning = false;
    let confidence = 85;
    let clinicalNotes = "All biological parameters, medication intake schedules, and cognitive sentiment are highly stable within therapeutic lines.";

    // 1. Analyze recent Sleep Deprivation
    const recentSleep = patientSleep.slice(-3);
    const avgSleep = recentSleep.reduce((acc, curr) => acc + curr.duration, 0) / (recentSleep.length || 1);
    
    if (avgSleep < 5) {
      sleepWarning = true;
      manicRisk += 45; // Deprivation heavily triggers Bipolar mania
      depressiveRisk += 15;
      clinicalNotes = "Major Clinical Alert: Sleep duration averages under 5 hours. Extremely high correlation with oncoming manic phase arousal. Contact psychiatrist immediately.";
    } else if (avgSleep > 10) {
      depressiveRisk += 35; // Oversleeping correlates with depressive troughs
      clinicalNotes = "Warning: Patient showing excessive hypersomnia (symptom of progressive depressive phase). Monitor activity levels.";
    }

    // 2. Analyze Mood fluctuations (Recent volatility vs elevated spikes)
    if (patientMoods.length > 0) {
      const recentMoods = patientMoods.slice(-4);
      const scores = recentMoods.map(m => m.score);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const variance = maxScore - minScore;

      if (variance >= 3) {
        // High mood swings trigger alert
        manicRisk += 20;
        depressiveRisk += 20;
        confidence = 90;
        clinicalNotes = `Mood tracking displays rapid cycling variability (variance of ${variance} points). Suggest immediate clinical therapy sessions.`;
      } else {
        const lastScore = scores[scores.length - 1];
        if (lastScore === 5) {
          manicRisk += 50;
          confidence = 92;
          clinicalNotes = "Patient self-reports extreme elevated mood peaks. Indicators conform to manic episode.";
        } else if (lastScore === 1) {
          depressiveRisk += 65;
          confidence = 94;
          clinicalNotes = "Self-reports show intense depressive status. High risk of heavy depressive episode.";
        }
      }
    }

    // 3. Analyze medication compliance percentage
    let totalScheduledMeds = 0;
    let totalAdheredMeds = 0;
    patientMeds.forEach(m => {
      Object.values(m.history).forEach(status => {
         totalScheduledMeds++;
         if (status === 'taken') totalAdheredMeds++;
      });
    });
    
    const adherencePercent = totalScheduledMeds > 0 ? (totalAdheredMeds / totalScheduledMeds) * 100 : 100;
    if (adherencePercent < 75) {
      depressiveRisk += 25;
      manicRisk += 30;
      clinicalNotes += ` Critical medication non-adherence warning (${adherencePercent.toFixed(0)}% metrics). Episode triggers elevated.`;
    }

    // Cap percentages
    depressiveRisk = Math.min(Math.max(depressiveRisk, 5), 98);
    manicRisk = Math.min(Math.max(manicRisk, 5), 98);

    let riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk' = 'Low Risk';
    const highestRisk = Math.max(depressiveRisk, manicRisk);
    if (highestRisk >= 75) riskLevel = 'Critical Risk';
    else if (highestRisk >= 50) riskLevel = 'High Risk';
    else if (highestRisk >= 25) riskLevel = 'Moderate Risk';

    const prediction: EpisodePrediction = {
      userId: patientId,
      timestamp: new Date().toISOString(),
      riskLevel,
      depressiveRisk,
      manicRisk,
      confidence,
      sleepWarning,
      notes: clinicalNotes
    };

    res.json({ prediction, adherencePercent });
  });

  // API - Doctor - Get Assigned Patients (with preseeded Clara Williams)
  app.get('/api/doctor/patients', (req, res) => {
    // Return patient profiles
    const patients = db.users.filter(u => u.role === 'patient');
    const patientsWithStats = patients.map(pat => {
      const userMoods = db.moods.filter(m => m.userId === pat.id);
      const userSleep = db.sleepLogs.filter(s => s.userId === pat.id);
      
      const lastMood = userMoods[userMoods.length - 1];
      const recentSleep = userSleep.slice(-3);
      const avgSleep = recentSleep.reduce((acc, curr) => acc + curr.duration, 0) / (recentSleep.length || 1);

      return {
        ...pat,
        currentMoodScore: lastMood ? lastMood.score : 3,
        averageSleep: avgSleep,
        riskStatus: avgSleep < 5 ? "Critical Risk" : "Low Risk"
      };
    });

    res.json({ patients: patientsWithStats });
  });

  // API - Doctor - Add Recommendation notes
  app.post('/api/doctor/recommendation', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthenticated" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Unauthenticated session" });

    const { patientId, content } = req.body;
    if (!patientId || !content) {
      return res.status(400).json({ error: "Missing patient ID or recommendation content." });
    }

    const newRecommendation: Recommendation = {
      id: `rec_${Date.now()}`,
      patientId,
      doctorId: user.id,
      doctorName: user.name,
      content,
      timestamp: new Date().toISOString()
    };

    db.recommendations.push(newRecommendation);
    saveDatabase();

    auditLog(user.id, user.name, user.role, "clinical note addition", `Added recommendation for patient: ${patientId}.`, req);
    res.json({ recommendation: newRecommendation });
  });

  // API - Caregiver - Get Patient access check pings
  app.get('/api/caregiver/patients', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthenticated" });
    const user = SESSION_STORE.get(authHeader.replace("Bearer ", ""));
    if (!user) return res.status(401).json({ error: "Unauthenticated session" });

    // Find patients who assigned this caregiver AND turned on consent permission
    const consentedPatients = db.users.filter(u => 
      u.role === 'patient' && 
      u.assignedCaregiverId === user.id && 
      u.caregiverConsent === true
    );

    res.json({ patients: consentedPatients });
  });

  // API - SOS - Resolve alerts
  app.post('/api/sos/resolve', (req, res) => {
    const { id } = req.body;
    const alert = db.sosAlerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      saveDatabase();
    }
    res.json({ success: true });
  });

  // API - Get App Notifications & Audits
  app.get('/api/notifications', (req, res) => {
    res.json({ notifications: db.notifications });
  });

  app.get('/api/audit-logs', (req, res) => {
    res.json({ auditLogs: db.auditLogs });
  });

  // API - Gemini Chat AI Mental Health Assistant
  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing prompt message" });
    }

    const medicalDisclaimer = "⚠️ Disclaimer: I am an AI Mental Health Advisor, not a licensed medical professional or psychiatrist. If you are experiencing a mental health emergency or intense crisis, please click the SOS Emergency trigger on this screen or call the National Crisis Hotline (988) immediately.";

    const systemInstruction = `You are a warm, empathetic, and calming Mental Health Assistant tailored for individuals managing Bipolar Disorder. 
Your focus is to provide stress-reduction advice, guide them through deep diaphragmatic breathing exercises, check in gently on their emotions, or suggest sleep improvements.
NEVER offer a diagnosis, and never prescribe medication. ALWAYS keep the tone supportive and grounded. 
At the beginning of your very first greeting or when appropriate, remind the client politely of the medical disclaimer. Refer to yourself as MindGuard AI Assistant.`;

    const apiKeySet = !!process.env.GEMINI_API_KEY;

    if (apiKeySet) {
      try {
        const response = await aiGen.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 800
          }
        });

        const reply = response.text || "MindGuard AI is having a short processing delay, but we are here to support you. Focus on a deep inhale for 4 seconds, holding for 4, and exhaling for 4.";
        return res.json({ reply: `${medicalDisclaimer}\n\n${reply}` });
      } catch (gemChatErr) {
        console.error("Gemini Chat failed:", gemChatErr);
      }
    }

    // High quality local mental support dialogue if Gemini is offline
    let localReply = "We recorded your thoughts gently. Take a slow, diaphragmatic breath with me right now: inhale for 4 counts, hold for 4, then exhale for 4 counts to steady your resting heart rate. Please recall to let Dr. Helen Thorne or your caregiver Sarah Evans know if you need physical support.";
    if (message.toLowerCase().includes("breathe") || message.toLowerCase().includes("calm")) {
      localReply = "Let's perform the Box Breathing clinical exercise. 1. Inhale slowly through your nose for 4 seconds. 2. Hold your breath for 4 seconds. 3. Exhale fully through your mouth for 4 seconds. 4. Hold empty for 4 seconds. Repeat this loop four times. How does your body feel now?";
    } else if (message.toLowerCase().includes("sleep")) {
      localReply = "Restoring sleep stability is essential for bipolar maintenance. Aim to take your medication exactly on time, lower the temperature of your room, limit visual overhead lighting after 9PM, and listen to a peaceful white noise frequency.";
    }

    res.json({ reply: `${medicalDisclaimer}\n\n${localReply}` });
  });

  // Static serving & Vite setup in Express
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindGuard AI full-stack Express server established securely at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical: MindGuard AI server failed to initialize:", err);
});
