import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID, BEACON_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    let queries = [Query.limit(1000)];
    if (companyId) {
      queries.push(Query.equal('companyId', companyId));
    }

    const response = await serverDatabases.listDocuments(
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

    const analytics = {
      totalOpens,
      uniqueOpens,
      recentOpens: recentLogs.length,
      deviceStats,
      browserStats,
      osStats,
      locationStats,
      openRate: uniqueOpens > 0 ? ((totalOpens / uniqueOpens) * 100).toFixed(1) : '0'
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Failed to fetch beacon analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beacon analytics', details: (error as Error).message },
      { status: 500 }
    );
  }
}
