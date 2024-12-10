// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 설정 값
const firebaseConfig = {
    apiKey: "AIzaSyCwEeoO_MMoLK4mLNnugnYNbd649_3lLGg",
    authDomain: "chippo-internetprograming.firebaseapp.com",
    projectId: "chippo-internetprograming",
    storageBucket: "chippo-internetprograming.firebasestorage.app",
    messagingSenderId: "959585915024",
    appId: "1:959585915024:web:c0d5822d77ed78d2b00815",
    measurementId: "G-0L85E7S6WW"
  };

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;