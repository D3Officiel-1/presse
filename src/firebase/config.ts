import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBlEU_0ptceL-mELjQyl29sHyEmkQgi3sA",
  authDomain: "leaders-club-saint-exupery.firebaseapp.com",
  projectId: "leaders-club-saint-exupery",
  storageBucket: "leaders-club-saint-exupery.firebasestorage.app",
  messagingSenderId: "1027258750099",
  appId: "1:1027258750099:web:e56ea74ce9ddb363fee966",
  measurementId: "G-2DSX48J9V2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = initializeFirestore(app, {});
const auth = getAuth(app);

export { app, firestore, auth };
