import { databases, DATABASE_ID, BEACON_COLLECTION_ID, BeaconData } from './appwrite';
import { Query } from 'appwrite';

export class BeaconService {
    // Get all beacon logs for admin
    static async getAllBeaconLogs(limit = 100, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BEACON_COLLECTION_ID,
                [
                    Query.orderDesc('timestamp'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Failed to fetch beacon logs:', error);
            throw error;
        }
    }

    // Get beacon logs for specific company
    static async getBeaconLogsByCompany(companyId: string, limit = 100, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BEACON_COLLECTION_ID,
                [
                    Query.equal('companyId', companyId),
                    Query.orderDesc('timestamp'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Failed to fetch company beacon logs:', error);
            throw error;
        }
    }

    // Get beacon logs for specific email
    static async getBeaconLogsByEmail(emailId: string) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BEACON_COLLECTION_ID,
                [
                    Query.equal('emailId', emailId),
                    Query.orderDesc('timestamp')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Failed to fetch email beacon logs:', error);
            throw error;
        }
    }

    // Get beacon analytics summary
    static async getBeaconAnalytics(companyId?: string) {
        try {
            let queries = [Query.limit(1000)];
            if (companyId) {
                queries.push(Query.equal('companyId', companyId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                BEACON_COLLECTION_ID,
                queries
            );

            const logs = response.documents;
            
            // Calculate analytics
            const totalOpens = logs.length;
            const uniqueOpens = new Set(logs.map(log => log.emailId)).size;
            
            // Device analytics
            const deviceStats = logs.reduce((acc: any, log: any) => {
                acc[log.device] = (acc[log.device] || 0) + 1;
                return acc;
            }, {});

            // Browser analytics
            const browserStats = logs.reduce((acc: any, log: any) => {
                acc[log.browser] = (acc[log.browser] || 0) + 1;
                return acc;
            }, {});

            // OS analytics
            const osStats = logs.reduce((acc: any, log: any) => {
                acc[log.os] = (acc[log.os] || 0) + 1;
                return acc;
            }, {});

            // Location analytics
            const locationStats = logs.reduce((acc: any, log: any) => {
                const country = log.location?.country || 'Unknown';
                acc[country] = (acc[country] || 0) + 1;
                return acc;
            }, {});

            // Recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentLogs = logs.filter((log: any) => 
                new Date(log.timestamp) > sevenDaysAgo
            );

            return {
                totalOpens,
                uniqueOpens,
                recentOpens: recentLogs.length,
                deviceStats,
                browserStats,
                osStats,
                locationStats,
                openRate: uniqueOpens > 0 ? ((totalOpens / uniqueOpens) * 100).toFixed(1) : '0'
            };
        } catch (error) {
            console.error('Failed to fetch beacon analytics:', error);
            throw error;
        }
    }

    // Get top opened emails
    static async getTopOpenedEmails(companyId?: string, limit = 10) {
        try {
            let queries = [Query.limit(1000)];
            if (companyId) {
                queries.push(Query.equal('companyId', companyId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                BEACON_COLLECTION_ID,
                queries
            );

            const logs = response.documents;
            
            // Group by email ID and count opens
            const emailOpenCounts = logs.reduce((acc: any, log: any) => {
                acc[log.emailId] = (acc[log.emailId] || 0) + 1;
                return acc;
            }, {});

            // Sort by open count and return top emails
            const topEmails = Object.entries(emailOpenCounts)
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, limit)
                .map(([emailId, openCount]) => ({
                    emailId,
                    openCount,
                    recipientEmail: logs.find((log: any) => log.emailId === emailId)?.recipientEmail
                }));

            return topEmails;
        } catch (error) {
            console.error('Failed to fetch top opened emails:', error);
            throw error;
        }
    }
}
