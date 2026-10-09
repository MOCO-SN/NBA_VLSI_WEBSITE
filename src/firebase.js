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

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCu0e99RAKWOqLZzvhWqVv5adqFloUi6ZE",
  authDomain: "vlsi-development.firebaseapp.com",
  projectId: "vlsi-development",
  storageBucket: "vlsi-development.firebasestorage.app",
  messagingSenderId: "129480774207",
  appId: "1:129480774207:web:c82f24702506a02ca19e8a",
  measurementId: "G-CNTFLEJZND"
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

export const firebaseEnabled = hasFirebaseConfig;

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (firebaseEnabled) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

// Authentication Helper Functions
export async function loginWithEmail(email, password) {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signupWithEmail(name, email, password) {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  const res = await createUserWithEmailAndPassword(auth, email, password);
  if (name && res.user) {
    await updateProfile(res.user, { displayName: name });
  }
  return res;
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) throw new Error("Google Authentication is not available.");
  return await signInWithPopup(auth, googleProvider);
}

export async function resetPassword(email) {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
}

export { app, auth, db, storage, googleProvider };