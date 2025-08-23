import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID, BEACON_COLLECTION_ID } from '@/lib/appwrite';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Appwrite connection...');
    console.log('Database ID:', DATABASE_ID);
    console.log('Collection ID:', BEACON_COLLECTION_ID);
    console.log('API Key available:', !!process.env.APPWRITE_API_KEY);
    
    // Try to list documents with a small limit
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      BEACON_COLLECTION_ID,
      []
    );

    return NextResponse.json({
      success: true,
      message: 'Appwrite connection successful',
      documentCount: response.documents.length,
      total: response.total
    });
  } catch (error) {
    console.error('Appwrite connection test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Appwrite connection failed', 
        details: (error as Error).message,
        config: {
          endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
          projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          databaseId: DATABASE_ID,
          collectionId: BEACON_COLLECTION_ID,
          hasApiKey: !!process.env.APPWRITE_API_KEY
        }
      },
      { status: 500 }
    );
  }
}
