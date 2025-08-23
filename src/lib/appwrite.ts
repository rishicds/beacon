import { Client, Databases, Account, Functions, ID } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

// Client SDK for frontend
export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);
export const functions = new Functions(client);

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'email_beacon_db';
export const BEACON_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BEACON_COLLECTION_ID || 'beacon_logs';

// For server-side operations
export { ID };

// Types for beacon tracking
export interface BeaconData {
    emailId: string;
    recipientEmail: string;
    companyId: string;
    senderUserId: string;
    ip?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    location?: {
        country?: string;
        city?: string;
        region?: string;
        latitude?: number;
        longitude?: number;
    };
    timestamp: string;
    referrer?: string;
    screenResolution?: string;
    language?: string;
    timezone?: string;
}
