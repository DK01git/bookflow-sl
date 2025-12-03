
import { BookCategory, BookRequest, UrgencyLevel, SRI_LANKA_DISTRICTS } from './types';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBHaJUc043faxUP9PwuAGulG76CcfUm_E",
  authDomain: "bookflow-f9a7f.firebaseapp.com",
  projectId: "bookflow-f9a7f",
  storageBucket: "bookflow-f9a7f.firebasestorage.app",
  messagingSenderId: "630669323058",
  appId: "1:630669323058:web:c1b02662479e1f7a73852b",
  measurementId: "G-LKV5G9B6D4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Analytics can be used later
// const analytics = getAnalytics(app);

export const TRANSLATIONS = {
  en: {
    heroTitle: "Donate Books, Rebuild Futures",
    heroSubtitle: "Help Sri Lankan students affected by floods get back to school.",
    btnRequest: "I Need Books",
    btnDonate: "I Can Help",
    navHome: "Home",
    navRequests: "Requests",
    navDashboard: "My Dashboard",
    step: "Step",
    next: "Next",
    submit: "Submit Request",
    submitting: "Sending...",
    back: "Back",
    district: "District",
    grade: "Grade",
    category: "Category",
    urgency: "Urgency",
    contact: "Contact (WhatsApp)",
    searchPlaceholder: "Search by school or district...",
    statsBooks: "Books Requested",
    statsDonors: "Active Donors",
    statsFulfilled: "Requests Fulfilled",
    urgentBadge: "Flood Victim",
    thankYou: "Thank You!",
    matchTitle: "Match Found!",
    formName: "Your Name",
    formSchool: "School / Location",
    formDetails: "Specific books needed (e.g., 'Grade 5 Math text')",
    filterAll: "All Districts",
    // New Translations
    filterGrade: "All Grades",
    filterUrgentOnly: "Flood Victims Only",
    daysAgo: "days ago",
    justNow: "Just now",
    donorModalTitle: "Thank you for helping!",
    donorModalSubtitle: "Please confirm your donation details for",
    labelSupplyType: "I can provide:",
    supplyFull: "Everything requested",
    supplyPartial: "Some items",
    labelShipping: "How will you send it?",
    shipPost: "Courier / Post",
    shipPerson: "Drop off at School",
    labelPhoto: "Upload Photo of Books (Optional)",
    btnConfirmDonate: "Confirm & Connect on WhatsApp",
    cancel: "Cancel",
    confirmRedirect: "You are about to be redirected to WhatsApp to connect with the student. Proceed?",
    statusPending: "Pending",
    statusPartial: "Partially Fulfilled",
    statusFulfilled: "Fulfilled",
  },
  si: {
    heroTitle: "පුස්තකාල යළි ගොඩනගමු, අනාගතය දිනවමු",
    heroSubtitle: "ගංවතුරෙන් පීඩාවට පත් දරුවන්ට පොත්පත් ලබාදීමට එකතු වන්න.",
    btnRequest: "පොත් අවශ්‍යයි",
    btnDonate: "උදව් කරන්න",
    navHome: "මුල් පිටුව",
    navRequests: "ඉල්ලීම්",
    navDashboard: "මගේ දත්ත",
    step: "පියවර",
    next: "ඊළඟ",
    submit: "ඉල්ලීම යවන්න",
    submitting: "යවමින් පවතී...",
    back: "ආපසු",
    district: "දිස්ත්‍රික්කය",
    grade: "ශ්‍රේණිය",
    category: "වර්ගය",
    urgency: "අවශ්‍යතාවය",
    contact: "දුරකථන අංකය",
    searchPlaceholder: "පාසල හෝ දිස්ත්‍රික්කය සොයන්න...",
    statsBooks: "ඉල්ලීම්",
    statsDonors: "පරිත්‍යාගශීලීන්",
    statsFulfilled: "සම්පූර්ණ කළ ඉල්ලීම්",
    urgentBadge: "ගංවතුරෙන් පීඩිත",
    thankYou: "ස්තූතියි!",
    matchTitle: "ගැලපීමක් හමු විය!",
    formName: "ඔබේ නම",
    formSchool: "පාසල / ප්‍රදේශය",
    formDetails: "අවශ්‍ය පොත් මොනවාද?",
    filterAll: "සියලුම දිස්ත්‍රික්ක",
    // New Translations
    filterGrade: "සියලුම ශ්‍රේණි",
    filterUrgentOnly: "ගංවතුරෙන් පීඩිත අය පමණයි",
    daysAgo: "දිනවලට පෙර",
    justNow: "දැන්",
    donorModalTitle: "ඔබගේ කාරුණිකත්වයට ස්තූතියි!",
    donorModalSubtitle: "කරුණාකර පහත විස්තර තහවුරු කරන්න:",
    labelSupplyType: "මට ලබා දිය හැක්කේ:",
    supplyFull: "සියල්ලම",
    supplyPartial: "කොටසක් පමණි",
    labelShipping: "ලබා දෙන ආකාරය?",
    shipPost: "තැපැල් / කුරියර් මගින්",
    shipPerson: "පාසලට ගෙනවිත් භාර දීම",
    labelPhoto: "පොත් වල ඡායාරූපයක් (අවශ්‍ය නම්)",
    btnConfirmDonate: "තහවුරු කර WhatsApp වෙත යන්න",
    cancel: "අවලංගු කරන්න",
    confirmRedirect: "ඔබව WhatsApp වෙත යොමු කරනු ඇත. ඉදිරියට යන්නද?",
    statusPending: "බලාපොරොත්තුවෙන්",
    statusPartial: "කොටසක් ලැබී ඇත",
    statusFulfilled: "සම්පූර්ණයි",
  }
};

export const SAMPLE_REQUESTS: BookRequest[] = [
  {
    id: 'req-001',
    studentName: 'Nimal Perera',
    grade: 'Grade 5',
    school: 'Vidyalaya, Kolonnawa',
    district: 'Colombo',
    categories: [BookCategory.TEXTBOOK, BookCategory.STORYBOOK],
    details: 'Lost all books in Kelani river overflow. Need Grade 5 Math and Sinhala text books.',
    urgency: UrgencyLevel.CRITICAL,
    contactNumber: '0771234567',
    status: 'Pending',
    timestamp: Date.now() - 86400000 * 1
  },
  {
    id: 'req-002',
    studentName: 'Fatima R.',
    grade: 'O/L (Grade 11)',
    school: 'Muslim Ladies College, Galle',
    district: 'Galle',
    categories: [BookCategory.TEXTBOOK, BookCategory.EXERCISE],
    details: 'Past papers and exercise books for O/L preparation.',
    urgency: UrgencyLevel.HIGH,
    contactNumber: '0719876543',
    status: 'Matched',
    timestamp: Date.now() - 86400000 * 2,
    donorId: 'donor-001'
  },
  {
    id: 'req-003',
    studentName: 'Saman Kumara',
    grade: 'Grade 8',
    school: 'Ratnapura Central',
    district: 'Ratnapura',
    categories: [BookCategory.STATIONERY, BookCategory.OTHER],
    details: 'School bag and geometry box needed.',
    urgency: UrgencyLevel.CRITICAL,
    contactNumber: '0765554444',
    status: 'Pending',
    timestamp: Date.now() - 86400000 * 0.5
  },
];
