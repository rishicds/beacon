// Test script to simulate suspicious beacon activity
const baseUrl = 'http://localhost:9002';

async function simulateBeaconOpens() {
    const emailId = 'test-anomaly-' + Date.now();
    
    console.log(`Testing anomaly detection for email: ${emailId}`);
    
    // Simulate first normal open
    console.log('\n1. Simulating first normal open...');
    const response1 = await fetch(`${baseUrl}/api/beacon`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'X-Forwarded-For': '192.168.1.100'
        },
        body: JSON.stringify({
            emailId: emailId,
            recipientEmail: 'test@example.com',
            companyId: 'TEST',
            senderUserId: 'user-123',
            screenResolution: '1920x1080',
            language: 'en-US',
            timezone: 'America/New_York'
        })
    });
    
    const result1 = await response1.json();
    console.log('First open result:', result1);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate suspicious open from different device/IP
    console.log('\n2. Simulating suspicious open from different device/IP...');
    const response2 = await fetch(`${baseUrl}/api/beacon`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
            'X-Forwarded-For': '203.45.67.89'
        },
        body: JSON.stringify({
            emailId: emailId,
            recipientEmail: 'test@example.com',
            companyId: 'TEST',
            senderUserId: 'user-123',
            screenResolution: '375x812',
            language: 'en-US',
            timezone: 'America/Los_Angeles'
        })
    });
    
    const result2 = await response2.json();
    console.log('Suspicious open result:', result2);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate another suspicious open from different location
    console.log('\n3. Simulating another suspicious open from different location...');
    const response3 = await fetch(`${baseUrl}/api/beacon`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'X-Forwarded-For': '87.123.45.67'
        },
        body: JSON.stringify({
            emailId: emailId,
            recipientEmail: 'test@example.com',
            companyId: 'TEST',
            senderUserId: 'user-123',
            screenResolution: '2560x1440',
            language: 'fr-FR',
            timezone: 'Europe/Paris'
        })
    });
    
    const result3 = await response3.json();
    console.log('Third open result:', result3);
    
    console.log(`\n✅ Test completed! Check the admin panel for email: ${emailId}`);
    console.log(`Visit: ${baseUrl}/admin/emails to see the results`);
}

// Run the test
simulateBeaconOpens().catch(console.error);
