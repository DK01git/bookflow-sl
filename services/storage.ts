import { BookRequest } from '../types';
import { db, SAMPLE_REQUESTS } from '../constants';
import { collection, getDocs, setDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

const COLLECTION = 'requests';
const DONOR_KEY = 'bookflow_user_donations';

export const getRequests = async (): Promise<BookRequest[]> => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // If DB is empty (first run), return samples but don't save them to DB to avoid spamming
      return SAMPLE_REQUESTS;
    }

    return snapshot.docs.map(doc => doc.data() as BookRequest);
  } catch (error) {
    console.error("Error fetching requests:", error);
    // Fallback to samples if offline or error
    return SAMPLE_REQUESTS;
  }
};

export const saveRequest = async (request: BookRequest): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTION, request.id), request);
  } catch (error) {
    console.error("Error saving request:", error);
    throw error;
  }
};

export const updateRequestStatus = async (id: string, status: BookRequest['status'], donorId?: string): Promise<void> => {
  try {
    const requestRef = doc(db, COLLECTION, id);
    await updateDoc(requestRef, { 
      status, 
      donorId: donorId || 'anonymous' 
    });
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// Keep local storage for "My Donations" tracking on this device only
export const getUserDonations = (): string[] => {
  const data = localStorage.getItem(DONOR_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUserDonation = (requestId: string): void => {
  const donations = getUserDonations();
  if (!donations.includes(requestId)) {
    localStorage.setItem(DONOR_KEY, JSON.stringify([...donations, requestId]));
  }
};