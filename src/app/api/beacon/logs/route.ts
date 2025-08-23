import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID, BEACON_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll skip complex authentication and allow access
    // In production, you should implement proper authentication
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const emailId = searchParams.get('emailId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queries = [
      Query.orderDesc('timestamp'),
      Query.limit(limit),
      Query.offset(offset)
    ];

    if (emailId) {
      queries.push(Query.equal('emailId', emailId));
    } else if (companyId) {
      queries.push(Query.equal('companyId', companyId));
    }

    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      BEACON_COLLECTION_ID,
      queries
    );

    return NextResponse.json(response.documents);
  } catch (error) {
    console.error('Failed to fetch beacon logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beacon logs', details: (error as Error).message },
      { status: 500 }
    );
  }
}
