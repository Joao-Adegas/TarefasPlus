import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJmwXB7uHqOpXIcfeg7pDhY2cAbLZYMzo",
  authDomain: "tarefasplus-d187d.firebaseapp.com",
  projectId: "tarefasplus-d187d",
  storageBucket: "tarefasplus-d187d.firebasestorage.app",
  messagingSenderId: "778101178862",
  appId: "1:778101178862:web:47e8bab91a9b02b4ad0eff"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

export {db}