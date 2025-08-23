import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID, BEACON_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '10');

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

    return NextResponse.json(topEmails);
  } catch (error) {
    console.error('Failed to fetch top opened emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top opened emails', details: (error as Error).message },
      { status: 500 }
    );
  }
}
