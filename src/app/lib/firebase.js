// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCrANPNVW9ytt4svfqSQesOajokgsK1AmY",
  authDomain: "stock-c51d3.firebaseapp.com",
  projectId: "stock-c51d3",
  storageBucket: "stock-c51d3.firebasestorage.app",
  messagingSenderId: "341506844698",
  appId: "1:341506844698:web:58f867cf42228a0b08c9a3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
