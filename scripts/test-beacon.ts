import { BeaconService } from '../src/lib/beacon-service';

async function testBeaconTracking() {
    try {
        console.log('🧪 Testing Beacon Tracking...\n');

        // Test getting all beacon logs
        console.log('Fetching all beacon logs...');
        const allLogs = await BeaconService.getAllBeaconLogs(10);
        console.log(`Found ${allLogs.length} beacon logs`);

        // Test analytics
        console.log('\nFetching analytics...');
        const analytics = await BeaconService.getBeaconAnalytics();
        console.log('Analytics:', {
            totalOpens: analytics.totalOpens,
            uniqueOpens: analytics.uniqueOpens,
            openRate: analytics.openRate,
            topDevice: Object.keys(analytics.deviceStats)[0],
            topBrowser: Object.keys(analytics.browserStats)[0]
        });

        // Test top emails
        console.log('\nFetching top opened emails...');
        const topEmails = await BeaconService.getTopOpenedEmails(undefined, 5);
        console.log(`Found ${topEmails.length} top emails`);

        console.log('\n✅ Beacon tracking test completed successfully!');
        
        if (allLogs.length === 0) {
            console.log('\n💡 No beacon data found. Send a test email and open it to generate tracking data.');
        }

    } catch (error) {
        console.error('❌ Beacon tracking test failed:', error);
        console.log('\n🔧 Make sure your Appwrite configuration is correct in your .env file');
    }
}

testBeaconTracking();
