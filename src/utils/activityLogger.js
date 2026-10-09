import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, firebaseEnabled } from "../firebase";

const STORAGE_KEY = "mocosn_activity_logs";

export function getActivityLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Purge any legacy dummy logs
      const cleaned = parsed.filter(
        (l) =>
          !["log-1", "log-2", "log-3", "log-4", "log-5", "log-6"].includes(l.id) &&
          !l.details?.includes("@example.com") &&
          !l.actor?.includes("@example.com")
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (err) {
    console.warn("Could not read activity logs from storage:", err);
  }
  return [];
}

export async function logActivity({
  category = "WORKSPACE",
  event = "Action Performed",
  details = "",
  actor = "User",
  role = "Member"
}) {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: category.toUpperCase(),
    event,
    details,
    actor,
    role,
    timestamp: new Date().toISOString()
  };

  try {
    const currentLogs = getActivityLogs();
    const updated = [newLog, ...currentLogs.slice(0, 99)]; // Keep latest 100
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save log locally:", err);
  }

  if (firebaseEnabled && db) {
    try {
      await addDoc(collection(db, "activity_logs"), {
        ...newLog,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore activity logging skipped:", err);
    }
  }

  return newLog;
}

export function clearActivityLogs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
