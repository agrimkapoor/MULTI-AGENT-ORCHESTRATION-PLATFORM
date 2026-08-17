//his file is the Firebase Admin SDK initialization for your authentication service. 
//It sets up the Firebase Admin SDK using a service account JSON file, which grants your backend full administrative access to Firebase services

import { initializeApp, cert } from "firebase-admin/app";
//initialiseApp func is used to initialise the firebase admin sdk
//cert is a helper function which takes the service account into a credential that firebase can use to authenticate 

import serviceAccount from "../serviceAccount.json" with { type: "json" };
// with { type: "json" } : explicitly bta rhe ki json file import kar rhe hai

//A service account is a special Google identity that your backend uses to authenticate with Firebase/Google APIs.

export const app = initializeApp({
  credential: cert(serviceAccount),
});


// In your multi-agent platform, users authenticate via Firebase Authentication on the frontend. 
//The frontend receives a Firebase ID token (JWT). 
//To verify that token on the backend, you need the Firebase Admin SDK.
