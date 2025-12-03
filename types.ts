export type Language = 'en' | 'si';

export enum BookCategory {
  TEXTBOOK = 'Textbook',
  STORYBOOK = 'Storybook',
  EXERCISE = 'Exercise Book',
  STATIONERY = 'Stationery',
  DICTIONARY = 'Dictionary',
  OTHER = 'Other',
}

export enum UrgencyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical - Flood Victim',
}

export interface BookRequest {
  id: string;
  studentName: string;
  grade: string;
  school: string;
  district: string;
  categories: BookCategory[];
  details: string;
  urgency: UrgencyLevel;
  contactNumber: string;
  status: 'Pending' | 'Matched' | 'Fulfilled';
  timestamp: number;
  donorId?: string;
  donorMessage?: string;
}

export interface Donor {
  id: string;
  name: string;
  totalDonated: number;
  badges: string[];
}

export interface AppState {
  requests: BookRequest[];
  userType: 'guest' | 'student' | 'donor' | 'admin';
  language: Language;
}

export const SRI_LANKA_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
];

export const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "O/L (Grade 11)", "A/L (Grade 12-13)"
];
