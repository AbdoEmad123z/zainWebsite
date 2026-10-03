import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDKhKQhL61TwjVaFbvrp1h8mtPcJATl0jo",
    authDomain: "zain-website-7bfa5.firebaseapp.com",
    projectId: "zain-website-7bfa5",
    storageBucket: "zain-website-7bfa5.firebasestorage.app",
    messagingSenderId: "882291141135",
    appId: "1:882291141135:web:a688890d4f8d41cb44517a",
    measurementId: "G-9MMF35L683"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);