// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBlEU_0ptceL-mELjQyl29sHyEmkQgi3sA",
  authDomain: "leaders-club-saint-exupery.firebaseapp.com",
  databaseURL: "https://leaders-club-saint-exupery.firebaseio.com",
  projectId: "leaders-club-saint-exupery",
  storageBucket: "leaders-club-saint-exupery.appspot.com",
  messagingSenderId: "1027258750099",
  appId: "1:1027258750099:web:b61c4b9a52027bc7fee966",
  measurementId: "G-LYWN0MJ85V"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = initializeFirestore(app, {});
const auth = getAuth(app);

export { app, firestore, auth };
