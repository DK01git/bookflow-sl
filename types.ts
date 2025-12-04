
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

export interface RequestItem {
  category: BookCategory;
  quantity: number;      // Total needed
  fulfilledCount: number; // How many received so far
}

export interface DonatedItem {
  category: BookCategory;
  quantity: number;
}

export interface DonorContribution {
  donorName: string;
  supplyType: 'full' | 'partial';
  items: DonatedItem[]; // Specific items donated
  timestamp: number;
}

export interface BookRequest {
  id: string;
  studentName: string;
  grade: string;
  school: string;
  district: string;
  // categories is kept for backward compatibility/search indexing, 
  // but 'items' is the source of truth for quantities
  categories: BookCategory[];
  items: RequestItem[];
  details: string;
  urgency: UrgencyLevel;
  contactNumber: string;
  status: 'Pending' | 'Partially Fulfilled' | 'Matched' | 'Fulfilled';
  timestamp: number;
  donorId?: string;
  donors?: DonorContribution[];
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  description: string;
  language: 'Sinhala' | 'Tamil' | 'English';
  linkUrl: string;
  coverUrl?: string;
  uploadedBy: string;
  downloads: number;
  timestamp: number;
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
