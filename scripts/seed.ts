
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../serviceAccount.json';

// The service account is now imported directly from the JSON file.
// This avoids parsing issues with environment variables.
if (!serviceAccount || !serviceAccount.private_key) {
  console.error("serviceAccount.json is missing or invalid.");
  console.error("Please ensure you have a valid service account key at the root of your project.");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
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
