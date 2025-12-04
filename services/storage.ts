
import { BookRequest, DonorContribution, LibraryBook, BookCategory } from '../types';
import { db, SAMPLE_REQUESTS } from '../constants';
import { collection, getDocs, setDoc, doc, updateDoc, query, orderBy, arrayUnion, increment, getDoc } from 'firebase/firestore';

const COLLECTION = 'requests';
const LIB_COLLECTION = 'library_books';
const DONOR_KEY = 'bookflow_user_donations';

export const getRequests = async (): Promise<BookRequest[]> => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return SAMPLE_REQUESTS;
    }

    return snapshot.docs.map(doc => doc.data() as BookRequest);
  } catch (error) {
    console.error("Error fetching requests:", error);
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

export const updateRequestStatus = async (
  id: string,
  status: BookRequest['status'], // Passed as legacy, but we recalculate inside
  donorDetails: DonorContribution
): Promise<void> => {
  try {
    const requestRef = doc(db, COLLECTION, id);
    const requestSnap = await getDoc(requestRef);

    if (requestSnap.exists()) {
      const currentData = requestSnap.data() as BookRequest;

      // 1. Calculate new fulfillment counts
      // If 'items' array doesn't exist (legacy), we assume simplistic full/partial logic, 
      // but if items exist, we do precise math.

      let newItems = currentData.items || [];
      // Handle legacy: create items from categories if missing
      if (newItems.length === 0 && currentData.categories) {
        newItems = currentData.categories.map(c => ({ category: c, quantity: 1, fulfilledCount: 0 }));
      }

      // Add donated quantities
      if (donorDetails.items && donorDetails.items.length > 0) {
        newItems = newItems.map(reqItem => {
          const donation = donorDetails.items.find(d => d.category === reqItem.category);
          if (donation) {
            return { ...reqItem, fulfilledCount: reqItem.fulfilledCount + donation.quantity };
          }
          return reqItem;
        });
      } else {
        // Fallback for full 'bulk' donation without item details (legacy path)
        if (donorDetails.supplyType === 'full') {
          newItems = newItems.map(i => ({ ...i, fulfilledCount: i.quantity }));
        }
      }

      // 2. Determine new Status
      const allFulfilled = newItems.every(i => i.fulfilledCount >= i.quantity);
      const someFulfilled = newItems.some(i => i.fulfilledCount > 0);

      let calculatedStatus: BookRequest['status'] = 'Pending';
      if (allFulfilled) calculatedStatus = 'Fulfilled';
      else if (someFulfilled) calculatedStatus = 'Partially Fulfilled';

      // 3. Update Doc
      await updateDoc(requestRef, {
        status: calculatedStatus,
        items: newItems,
        donors: arrayUnion(donorDetails)
      });
    }

  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// -- LIBRARY FUNCTIONS --

export const getLibraryBooks = async (): Promise<LibraryBook[]> => {
  try {
    const q = query(collection(db, LIB_COLLECTION), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LibraryBook);
  } catch (error) {
    console.error("Error fetching library:", error);
    return [];
  }
};

export const saveLibraryBook = async (book: LibraryBook): Promise<void> => {
  try {
    await setDoc(doc(db, LIB_COLLECTION, book.id), book);
  } catch (error) {
    console.error("Error saving book:", error);
    throw error;
  }
};

export const incrementBookDownload = async (id: string): Promise<void> => {
  try {
    const bookRef = doc(db, LIB_COLLECTION, id);
    await updateDoc(bookRef, { downloads: increment(1) });
  } catch (error) {
    console.error("Error updating downloads:", error);
  }
}

// -- LOCAL STORAGE --

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
