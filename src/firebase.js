import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { fetchFirebaseConfigFromProxy } from "./utils/proxyClient";

/**
 * Firebase Services
 * All API keys and credentials are dynamically fetched from the proxy gateway (https://devclub.wasmer.app).
 * NO hardcoded API keys are stored in this file or in localStorage.
 */

export let app = null;
export let auth = null;
export let db = null;
export let storage = null;
export let googleProvider = null;
export let firebaseEnabled = false;

const readyCallbacks = [];

export function onFirebaseReady(cb) {
  if (firebaseEnabled && auth) {
    cb({ app, auth, db, storage });
  } else {
    readyCallbacks.push(cb);
  }
}

/**
 * Dynamically initialize Firebase from the backend proxy endpoint.
 */
export async function initFirebaseFromProxy() {
  if (firebaseEnabled && app) {
    return true;
  }

  try {
    const config = await fetchFirebaseConfigFromProxy();
    if (config && config.apiKey && config.projectId) {
      app = !getApps().length ? initializeApp(config) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });
      firebaseEnabled = true;

      // Trigger listeners
      readyCallbacks.forEach((cb) => {
        try {
          cb({ app, auth, db, storage });
        } catch {}
      });
      readyCallbacks.length = 0;

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("firebase-initialized", {
            detail: { app, auth, db, storage }
          })
        );
      }

      return true;
    }
  } catch (err) {
    console.warn("Could not load Firebase configuration from proxy endpoint:", err.message);
  }

  return false;
}

// Auto-trigger dynamic initialization in browser environment
if (typeof window !== "undefined") {
  initFirebaseFromProxy().catch(() => {});
}

// Authentication Helper Functions
export async function loginWithEmail(email, password) {
  if (!auth) await initFirebaseFromProxy();
  if (!auth) throw new Error("Firebase Auth is not available from proxy gateway.");
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signupWithEmail(name, email, password) {
  if (!auth) await initFirebaseFromProxy();
  if (!auth) throw new Error("Firebase Auth is not available from proxy gateway.");
  const res = await createUserWithEmailAndPassword(auth, email, password);
  if (name && res.user) {
    await updateProfile(res.user, { displayName: name });
  }
  return res;
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) await initFirebaseFromProxy();
  if (!auth || !googleProvider) throw new Error("Google Authentication is not available from proxy gateway.");
  return await signInWithPopup(auth, googleProvider);
}

export async function resetPassword(email) {
  if (!auth) await initFirebaseFromProxy();
  if (!auth) throw new Error("Firebase Auth is not available from proxy gateway.");
  return await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
}