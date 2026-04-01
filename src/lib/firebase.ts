
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBmDzDjnQOri7oyjFo96YFMvojDWyXtk9M",
  authDomain: "studio-8192964308-b47d6.firebaseapp.com",
  projectId: "studio-8192964308-b47d6",
  storageBucket: "studio-8192964308-b47d6.firebasestorage.app",
  messagingSenderId: "149733270188",
  appId: "1:149733270188:web:2772cd8a2ad95d6edff509"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
