
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Use environment variables for Firebase credentials
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Check if required environment variables are set
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  console.error("Missing required Firebase environment variables:");
  console.error("Please set the following environment variables:");
  console.error("- FIREBASE_PROJECT_ID");
  console.error("- FIREBASE_PRIVATE_KEY");
  console.error("- FIREBASE_CLIENT_EMAIL");
  console.error("Or create a serviceAccount.json file at the project root.");
  process.exit(1);
}

// Ensure all required fields are present for TypeScript
const validatedServiceAccount = {
  type: serviceAccount.type,
  project_id: serviceAccount.project_id!,
  private_key_id: serviceAccount.private_key_id!,
  private_key: serviceAccount.private_key!,
  client_email: serviceAccount.client_email!,
  client_id: serviceAccount.client_id!,
  auth_uri: serviceAccount.auth_uri,
  token_uri: serviceAccount.token_uri,
  auth_provider_x509_cert_url: serviceAccount.auth_provider_x509_cert_url,
  client_x509_cert_url: serviceAccount.client_x509_cert_url!
} as const;

initializeApp({
  credential: cert(validatedServiceAccount as any)
});

const db = getFirestore();
const auth = getAuth();

const seedData = async () => {
    console.log("Starting to seed data...");

    // 1. Seed Companies
    console.log("Seeding companies...");
    const companies = {
        '1': { name: 'Stark Industries' },
        '2': { name: 'Wayne Enterprises' },
    };
    for (const [id, data] of Object.entries(companies)) {
        await db.collection('companies').doc(id).set(data);
    }
    console.log("Companies seeded.");

    // 2. Seed Users and create Auth users
    console.log("Seeding users and creating auth accounts...");
    const users = [
        { uid: 'user-admin-01', email: 'rishi.404@outlook.com', password: 'password123', name: 'Rishi', role: 'admin', avatarUrl: 'https://placehold.co/36x36.png' },
        { uid: 'user-ca-01', email: 'tony@stark.com', password: 'password123', name: 'Tony Stark', role: 'company_admin', companyId: '1', avatarUrl: 'https://placehold.co/36x36.png' },
        { uid: 'user-emp-01', email: 'pepper@stark.com', password: 'password123', name: 'Pepper Potts', role: 'employee', companyId: '1', avatarUrl: 'https://placehold.co/36x36.png' },
        { uid: 'user-ca-02', email: 'bruce@wayne.com', password: 'password123', name: 'Bruce Wayne', role: 'company_admin', companyId: '2', avatarUrl: 'https://placehold.co/36x36.png' },
        { uid: 'user-emp-02', email: 'lucius@wayne.com', password: 'password123', name: 'Lucius Fox', role: 'employee', companyId: '2', avatarUrl: 'https://placehold.co/36x36.png' },
    ];
    
    for (const userData of users) {
        const { uid, email, password, ...firestoreData } = userData;
        try {
            await auth.createUser({ uid, email, password });
            console.log(`Created auth user: ${email}`);
        } catch (error: any) {
            if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
                console.log(`Auth user already exists, skipping creation: ${email}`);
            } else {
                throw error;
            }
        }
        await db.collection('users').doc(uid).set(firestoreData);
    }
    console.log("Users seeded.");

    console.log("Data seeding complete!");
};

seedData().catch(console.error);
