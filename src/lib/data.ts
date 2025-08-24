import { db, auth as firebaseAuth } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, setDoc, limit, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, signInWithEmailAndPassword } from 'firebase/auth';
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

export interface PinResetRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    companyId: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Timestamp;
    reviewedAt?: Timestamp;
    reviewedBy?: string;
    reviewerName?: string;
}

const usersCollection = collection(db, 'users');
const companiesCollection = collection(db, 'companies');
const emailsCollection = collection(db, 'emails');
const accessLogsCollection = collection(db, 'accessLogs');
const beaconLogsCollection = collection(db, 'beaconLogs');
const alertsCollection = collection(db, 'alerts');
const pinResetRequestsCollection = collection(db, 'pinResetRequests');


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
        // Store the current user's credentials to restore session later
        const currentUser = firebaseAuth.currentUser;
        const currentUserEmail = currentUser?.email;
        
        const batch = writeBatch(db);
        const setupToken = randomBytes(32).toString('hex');
        const setupTokenExpires = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
        
        try {
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

            // Sign out the newly created user immediately
            await signOut(firebaseAuth);
            
            // If there was a current user, try to restore their session
            if (currentUser && currentUserEmail) {
                try {
                    // Look up the current user's stored password (for demo purposes)
                    const MOCK_PASSWORDS: Record<string, string> = {
                        
                        "nirjharbarma@gmail.com": "Admin123",
                        "tony@stark.com": "password123",
                        "pepper@stark.com": "password123",
                        "bruce@wayne.com": "password123",
                        "lucius@wayne.com": "password123",
                        "aditighosh668@gmail.com": "000000"
                        // <-- Add your company admin here
                    };
                    
                    const currentUserPassword = MOCK_PASSWORDS[currentUserEmail];
                    if (currentUserPassword) {
                        await signInWithEmailAndPassword(firebaseAuth, currentUserEmail, currentUserPassword);
                    }
                } catch (restoreError) {
                    console.warn("Could not restore admin session:", restoreError);
                    // Continue anyway, the admin can re-login if needed
                }
            }

            // Use actual companyId and senderId for onboarding email
            let onboardingCompanyId = userData.companyId || 'SYSTEM';
            let onboardingSenderId = currentUser?.uid || 'SYSTEM';
            // Fetch company name for onboarding email if available
            let companyName = '';
            if (userData.companyId) {
                try {
                    const company = await data.companies.findById(userData.companyId);
                    if (company) companyName = company.name;
                } catch (e) {
                    console.warn('Could not fetch company name for onboarding email:', e);
                }
            }

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
            const onboardingLink = `${baseUrl}/onboarding/${setupToken}`;
            const emailBody = `
                <h1>Welcome to Beacon${companyName ? ' at ' + companyName : ''}!</h1>
                <p>Your account has been created${companyName ? ` for <b>${companyName}</b>` : ''}. Please complete your account onboarding by setting up your password and security PIN.</p>
                <p>Click the link below to get started. This link is valid for 24 hours.</p>
                <p><a href="${onboardingLink}">Complete Your Account Setup</a></p>
                <p>If you did not request this, please ignore this email.</p>
            `;
            // --- Robust error handling for onboarding email ---
            console.log('[ONBOARDING] Attempting to send onboarding email to', userData.email, 'for company', onboardingCompanyId);
            try {
                await composeAndSendEmail({
                    recipient: userData.email,
                    subject: `Welcome to Beacon${companyName ? ' at ' + companyName : ''} - Complete Your Onboarding`,
                    body: emailBody,
                    companyId: onboardingCompanyId, 
                    senderId: onboardingSenderId,
                    linkExpires: false,
                    isGuest: false,
                });
                console.log('[ONBOARDING] Onboarding email sent successfully to', userData.email);
            } catch (emailError) {
                console.error('[ONBOARDING] FAILED to send onboarding email:', emailError);
                let errorMsg = '';
                if (emailError instanceof Error) {
                  errorMsg = emailError.message;
                } else if (typeof emailError === 'object' && emailError !== null && 'message' in emailError) {
                  errorMsg = (emailError as any).message;
                } else {
                  errorMsg = String(emailError);
                }
                throw new Error("Employee created, but onboarding email failed to send. Please check email configuration. " + errorMsg);
            }

            return { id: authUser.uid, ...newUser };
        } catch (error) {
            // If user creation fails, make sure we don't leave the admin signed out
            if (currentUser && currentUserEmail) {
                try {
                    const MOCK_PASSWORDS: Record<string, string> = {
                        
                        "nirjharbarma@gmail.com": "Admin123",
                        "tony@stark.com": "password123",
                        "pepper@stark.com": "password123",
                        "bruce@wayne.com": "password123",
                        "lucius@wayne.com": "password123",
                        // <-- Add your company admin here
                    };
                    
                    const currentUserPassword = MOCK_PASSWORDS[currentUserEmail];
                    if (currentUserPassword) {
                        await signInWithEmailAndPassword(firebaseAuth, currentUserEmail, currentUserPassword);
                    }
                } catch (restoreError) {
                    console.warn("Could not restore admin session after error:", restoreError);
                }
            }
            throw error;
        }
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
    delete: async (id: string): Promise<void> => {
      const batch = writeBatch(db);
      
      // First, get all users associated with this company
      const companyUsers = await data.users.findByCompany(id);
      
      // Get all emails for this company
      const companyEmails = await data.emails.list({ companyId: id });
      
      // Get all access logs for this company
      const companyAccessLogs = await data.accessLogs.list({ companyId: id });
      
      // Get all beacon logs for this company
      const companyBeaconLogs = await data.beaconLogs.list({ companyId: id });
      
      // Get all alerts for this company
      const companyAlerts = await data.alerts.list({ companyId: id });
      
      // Delete all users
      companyUsers.forEach(user => {
        const userRef = doc(db, "users", user.id);
        batch.delete(userRef);
      });
      
      // Delete all emails
      companyEmails.forEach(email => {
        const emailRef = doc(db, "emails", email.id);
        batch.delete(emailRef);
      });
      
      // Delete all access logs
      companyAccessLogs.forEach(log => {
        const logRef = doc(db, "accessLogs", log.id);
        batch.delete(logRef);
      });
      
      // Delete all beacon logs
      companyBeaconLogs.forEach(log => {
        const logRef = doc(db, "beaconLogs", log.id);
        batch.delete(logRef);
      });
      
      // Delete all alerts
      companyAlerts.forEach(alert => {
        const alertRef = doc(db, "alerts", alert.id);
        batch.delete(alertRef);
      });
      
      // Finally, delete the company
      const companyRef = doc(db, "companies", id);
      batch.delete(companyRef);
      
      // Execute all deletions at once
      await batch.commit();
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
    },
    unrevoke: async(emailId: string): Promise<void> => {
        const emailRef = doc(db, 'emails', emailId);
        await updateDoc(emailRef, { revoked: false });
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
  pinResetRequests: {
    create: async (requestData: Omit<PinResetRequest, 'id' | 'requestedAt'>): Promise<PinResetRequest> => {
        const newRequest = {
            ...requestData,
            requestedAt: Timestamp.now(),
            status: 'pending' as const,
        };
        const docRef = await addDoc(pinResetRequestsCollection, newRequest);
        return { id: docRef.id, ...newRequest } as PinResetRequest;
    },
    list: async (filters?: { companyId?: string }): Promise<PinResetRequest[]> => {
        const q = filters?.companyId
            ? query(pinResetRequestsCollection, where("companyId", "==", filters.companyId), orderBy("requestedAt", "desc"))
            : query(pinResetRequestsCollection, orderBy("requestedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PinResetRequest));
    },
    findById: async (id: string): Promise<PinResetRequest | undefined> => {
        const docRef = doc(db, "pinResetRequests", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as PinResetRequest : undefined;
    },
    update: async (id: string, requestData: Partial<Omit<PinResetRequest, 'id'>>): Promise<void> => {
        const requestRef = doc(db, 'pinResetRequests', id);
        await updateDoc(requestRef, requestData);
    },
    delete: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, "pinResetRequests", id));
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
