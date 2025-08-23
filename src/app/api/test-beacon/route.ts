import { NextRequest, NextResponse } from 'next/server';
import { BeaconService } from '@/lib/beacon-service';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing beacon tracking system...');
    
    // Test fetching beacon logs
    const logs = await BeaconService.getAllBeaconLogs(5);
    console.log(`Found ${logs.length} beacon logs`);
    
    // Test analytics
    const analytics = await BeaconService.getBeaconAnalytics();
    console.log('Analytics:', analytics);
    
    return NextResponse.json({
      success: true,
      message: 'Beacon tracking system test completed',
      data: {
        totalLogs: logs.length,
        analytics: analytics,
        recentLogs: logs.slice(0, 3)
      }
    });
  } catch (error: any) {
    console.error('Beacon test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, recipientEmail, companyId, senderUserId } = body;
    
    if (!emailId || !recipientEmail || !companyId || !senderUserId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }
    
    // Test manual beacon tracking
    console.log('Testing manual beacon tracking...');
    
    // This would normally be called from the client side
    // For testing, we'll simulate the tracking call
    const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const beaconFunctionId = process.env.NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID || 'beacon-tracker';
    
    const trackingData = {
      emailId,
      recipientEmail,
      companyId,
      senderUserId,
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/New_York'
    };
    
    const response = await fetch(`${appwriteEndpoint}/functions/${beaconFunctionId}/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData)
    });
    
    if (!response.ok) {
      throw new Error(`Appwrite function call failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Manual beacon tracking test completed',
      result
    });
    
  } catch (error: any) {
    console.error('Manual beacon test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
