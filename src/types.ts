export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'caregiver';
  avatar?: string;
  
  // Patient-specific relationships & configs
  assignedDoctorId?: string | null;
  assignedDoctorName?: string | null;
  assignedCaregiverId?: string | null;
  assignedCaregiverName?: string | null;
  caregiverConsent: boolean;
  
  // Profile info
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  score: 1 | 2 | 3 | 4 | 5; // Very Sad (1) to Very Happy (5)
  notes?: string;
  timestamp: string;
}

export interface SleepEntry {
  id: string;
  userId: string;
  bedtime: string; // "YYYY-MM-DD HH:MM"
  wakeupTime: string; // "YYYY-MM-DD HH:MM"
  duration: number; // in hours
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  sentimentAnalysis?: {
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Anxious' | 'Manic' | 'Depressive';
    stressScore: number; // 0-100
    depressionIndicator: number; // 0-100
    maniaIndicator: number; // 0-100
    emotionalScore: number; // 0-100
  };
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  time: string; // "HH:MM"
  days: string[]; // ["Mon", "Tue", ...]
  history: { [date: string]: 'taken' | 'missed' }; // Date key formatted as "YYYY-MM-DD"
}

export interface Recommendation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  content: string;
  timestamp: string;
}

export interface SosAlert {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  resolved: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'medication' | 'risk' | 'checkin' | 'sleep' | 'sos';
  message: string;
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface EpisodePrediction {
  userId: string;
  timestamp: string;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  depressiveRisk: number; // percentage
  manicRisk: number; // percentage
  confidence: number; // percentage
  sleepWarning: boolean;
  notes: string;
}
