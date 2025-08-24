import { databases } from './appwrite';
import { Query } from 'appwrite';

export class EmailService {
    static async getRevokedEmails(companyId?: string): Promise<string[]> {
        // Fetch emails with revoked: true
        try {
            const response = await databases.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'email_beacon_db',
                'emails',
                companyId ? [
                    // Only fetch for this company
                    Query.equal('companyId', companyId),
                    Query.equal('revoked', true)
                ] : [ 
                    Query.equal('revoked', true)
                ]
            );
            return response.documents.map((doc: any) => doc.$id || doc.id);
        } catch (e) {
            console.error('Failed to fetch revoked emails:', e);
            return [];
        }
    }
}
