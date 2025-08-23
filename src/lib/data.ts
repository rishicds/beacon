import { db, auth as firebaseAuth } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, setDoc, limit, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { composeAndSendEmail } from '@/ai/flows/compose-email-flow';

export type Role = 'admin' | 'company_admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string;
  avatarUrl: string;
  pinHash?: string;
  pinSet?: boolean;
  setupToken?: string;
  setupTokenExpires?: Timestamp;
}

export interface Company {
  id:string;
  name: string;
}

export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  secureLinkToken: string;
  createdAt: string | Timestamp;
  expiresAt: string | Timestamp | null;
  attachmentDataUri?: string;
  attachmentFilename?: string;
  companyId: string;
  senderId: string;
  revoked?: boolean;
  isGuest?: boolean;
}

export interface AccessLog {
  id: string;
  emailId: string;
  user: string;
  email: string;
  ip: string;
  device: string;
  timestamp: string | Timestamp;
  status: 'Success' | 'Failed';
  companyId: string;
}

export interface BeaconLog {
  id: string;
  emailId: string;
  email: string;
  ip: string;
  device: string;
  timestamp: string | Timestamp;
  status: 'Opened' | 'Suspicious';
  companyId: string;
}

export interface Alert {
    id: string;
    companyId: string;
    emailId: string;
    recipientEmail: string;
    type: 'Multiple Failed PINs' | 'Suspicious Open';
    message: string;
    timestamp: string | Timestamp;
    resolved: boolean;
    incidentReport?: string;
}

const usersCollection = collection(db, 'users');
const companiesCollection = collection(db, 'companies');
const emailsCollection = collection(db, 'emails');
const accessLogsCollection = collection(db, 'accessLogs');
const beaconLogsCollection = collection(db, 'beaconLogs');
const alertsCollection = collection(db, 'alerts');


export const data = {
  users: {
    list: async (): Promise<User[]> => {
      const snapshot = await getDocs(usersCollection);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    },
    findById: async (id: string): Promise<User | undefined> => {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : undefined;
    },
     findByToken: async (token: string): Promise<User | undefined> => {
      const q = query(usersCollection, where("setupToken", "==", token));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    },
    findByCompany: async (companyId: string): Promise<User[]> => {
      const q = query(usersCollection, where("companyId", "==", companyId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    },
    findByEmail: async (email: string): Promise<User | undefined> => {
      const q = query(usersCollection, where("email", "==", email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    },
    delete: async (id: string): Promise<void> => {
      await deleteDoc(doc(db, "users", id));
    },
    createUser: async (userData: Omit<User, 'id' | 'avatarUrl' | 'pinHash' | 'pinSet'>): Promise<User> => {
        const batch = writeBatch(db);
        const setupToken = randomBytes(32).toString('hex');
        const setupTokenExpires = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
        
        // Use setupToken as temporary password for initial authentication
        const userCredential = await createUserWithEmailAndPassword(
            firebaseAuth,
            userData.email,
            setupToken,
        );
        const authUser = userCredential.user;

        const newUserDocRef = doc(db, "users", authUser.uid);
        const newUser: Omit<User, 'id'> = {
            ...userData,
            avatarUrl: `https://placehold.co/36x36.png`,
            pinSet: false,
            setupToken,
            setupTokenExpires,
        };
        batch.set(newUserDocRef, newUser);
        
        await batch.commit();

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        const onboardingLink = `${baseUrl}/onboarding/${setupToken}`;
        const emailBody = `
            <h1>Welcome to GuardianMail!</h1>
            <p>Your account has been created. Please complete your account onboarding by setting up your password and security PIN.</p>
            <p>Click the link below to get started. This link is valid for 24 hours.</p>
            <p><a href="${onboardingLink}">Complete Your Account Setup</a></p>
            <p>If you did not request this, please ignore this email.</p>
        `;
        
         await composeAndSendEmail({
            recipient: userData.email,
            subject: "Welcome to GuardianMail - Complete Your Onboarding",
            body: emailBody,
            companyId: 'SYSTEM', 
            senderId: 'SYSTEM',
            linkExpires: false,
            isGuest: false,
        });

        return { id: authUser.uid, ...newUser };
    },
    update: async (id: string, userData: Partial<Omit<User, 'id'>>): Promise<void> => {
        const userRef = doc(db, 'users', id);
        
        const dataToUpdate:any = {...userData};
        
        if (userData.pinHash) {
             const salt = await bcrypt.genSalt(10);
             dataToUpdate.pinHash = await bcrypt.hash(userData.pinHash, salt);
        }

        await updateDoc(userRef, dataToUpdate);
    },
    verifyPin: async (id: string, pin: string): Promise<boolean> => {
        const user = await data.users.findById(id);
        if (!user || !user.pinHash) {
            return false;
        }
        return await bcrypt.compare(pin, user.pinHash);
    },
    resetPin: async(id: string): Promise<void> => {
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, {
            pinHash: null,
            pinSet: false
        });
    }
  },
  companies: {
    list: async (): Promise<Company[]> => {
      const q = query(companiesCollection, orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
    },
    findById: async (id: string): Promise<Company | undefined> => {
      const docRef = doc(db, "companies", id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Company : undefined;
    },
    create: async (company: Omit<Company, 'id'>): Promise<Company> => {
      const docRef = await addDoc(companiesCollection, company);
      return { id: docRef.id, ...company };
    },
  },
  emails: {
    create: async (email: Omit<Email, 'id' | 'createdAt'>): Promise<Email> => {
      const now = Timestamp.now();
      
      const newEmail = {
        ...email,
        createdAt: now,
        revoked: false,
      };
      const docRef = await addDoc(emailsCollection, newEmail);
      return { id: docRef.id, ...newEmail } as Email;
    },
    findByToken: async (token: string): Promise<Email | undefined> => {
      const q = query(emailsCollection, where("secureLinkToken", "==", token));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Email;
    },
    list: async (filters?: { companyId?: string }): Promise<Email[]> => {
      const q = filters?.companyId
        ? query(emailsCollection, where("companyId", "==", filters.companyId))
        : emailsCollection;
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Email));
    },
    revoke: async(emailId: string): Promise<void> => {
        const emailRef = doc(db, 'emails', emailId);
        await updateDoc(emailRef, { revoked: true });
    }
  },
  accessLogs: {
    create: async (log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<AccessLog> => {
       const newLog = {
        ...log,
        timestamp: Timestamp.now(),
      };
      const docRef = await addDoc(accessLogsCollection, newLog);
      return { id: docRef.id, ...newLog } as AccessLog;
    },
    list: async (filters?: { companyId?: string }): Promise<AccessLog[]> => {
       const q = filters?.companyId
        ? query(accessLogsCollection, where("companyId", "==", filters.companyId), orderBy("timestamp", "desc"))
        : query(accessLogsCollection, orderBy("timestamp", "desc"));
       const snapshot = await getDocs(q);
       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessLog));
    },
    countFailedAttempts: async (emailId: string): Promise<number> => {
        const q = query(accessLogsCollection, where("emailId", "==", emailId), where("status", "==", "Failed"));
        const snapshot = await getDocs(q);
        return snapshot.size;
    },
    getLogsForEmail: async (emailId: string, count: number): Promise<AccessLog[]> => {
        const q = query(accessLogsCollection, where("emailId", "==", emailId), orderBy("timestamp", "desc"), limit(count));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessLog));
    }
  },
  beaconLogs: {
    create: async (log: Omit<BeaconLog, 'id' | 'timestamp'>): Promise<BeaconLog> => {
       const newLog = {
        ...log,
        timestamp: Timestamp.now(),
      };
      const docRef = await addDoc(beaconLogsCollection, newLog);
      return { id: docRef.id, ...newLog } as BeaconLog;
    },
    list: async (filters?: { companyId?: string }): Promise<BeaconLog[]> => {
      const q = filters?.companyId
        ? query(beaconLogsCollection, where("companyId", "==", filters.companyId), orderBy("timestamp", "desc"))
        : query(beaconLogsCollection, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BeaconLog));
    },
  },
  alerts: {
      create: async (alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<Alert> => {
          const newAlert = {
              ...alertData,
              timestamp: Timestamp.now(),
              resolved: false,
          };
          const docRef = await addDoc(alertsCollection, newAlert);
          return { id: docRef.id, ...newAlert } as Alert;
      },
      list: async (filters?: { companyId?: string }): Promise<Alert[]> => {
          const q = filters?.companyId
              ? query(alertsCollection, where("companyId", "==", filters.companyId), where("resolved", "==", false), orderBy("timestamp", "desc"))
              : query(alertsCollection, where("resolved", "==", false), orderBy("timestamp", "desc"));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      },
      checkExisting: async(emailId: string, type: Alert['type']): Promise<boolean> => {
        const q = query(alertsCollection, where("emailId", "==", emailId), where("type", "==", type), where("resolved", "==", false), limit(1));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
      }
  },
  getAllLogs: async (companyId?: string): Promise<string> => {
    const accessLogs = await data.accessLogs.list({ companyId });
    const beaconLogs = await data.beaconLogs.list({ companyId });
    const allLogs = {
      accessLogs: accessLogs.map(l => ({...l, timestamp: (l.timestamp as Timestamp).toDate().toISOString()})),
      beaconLogs: beaconLogs.map(l => ({...l, timestamp: (l.timestamp as Timestamp).toDate().toISOString()})),
    };
    return JSON.stringify(allLogs, null, 2);
  }
};
