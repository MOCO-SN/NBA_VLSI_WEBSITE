import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db, firebaseEnabled } from "../firebase";

const STORAGE_KEY = "mocosn_landing_contacts";

export function getContactMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Error reading contact messages from storage:", err);
  }
  return [];
}

export async function fetchContactMessagesFromFirestore() {
  if (!firebaseEnabled || !db) return getContactMessages();
  try {
    const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    if (list.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn("Could not fetch contacts from Firestore:", err);
  }
  return getContactMessages();
}

export async function saveContactMessage({ name, email, message }) {
  const newMsg = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
    status: "New" // "New" | "Resolved"
  };

  const current = getContactMessages();
  const updated = [newMsg, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Firestore if enabled
  if (firebaseEnabled && db) {
    try {
      const docRef = await addDoc(collection(db, "contacts"), {
        name: newMsg.name,
        email: newMsg.email,
        message: newMsg.message,
        timestamp: newMsg.timestamp,
        status: "New"
      });
      newMsg.id = docRef.id;
    } catch (err) {
      console.warn("Could not sync contact message to Firestore:", err);
    }
  }

  return updated;
}

export async function toggleContactStatus(id) {
  const current = getContactMessages();
  const target = current.find((m) => m.id === id);
  if (!target) return current;

  const newStatus = target.status === "Resolved" ? "New" : "Resolved";
  const updated = current.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (firebaseEnabled && db) {
    try {
      await updateDoc(doc(db, "contacts", id), { status: newStatus });
    } catch (err) {
      console.warn("Could not update contact status in Firestore:", err);
    }
  }

  return updated;
}

export async function deleteContactMessage(id) {
  const current = getContactMessages();
  const updated = current.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (firebaseEnabled && db) {
    try {
      await deleteDoc(doc(db, "contacts", id));
    } catch (err) {
      console.warn("Could not delete contact message from Firestore:", err);
    }
  }

  return updated;
}
