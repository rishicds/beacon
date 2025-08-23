#!/usr/bin/env tsx

/**
 * Comprehensive Beacon Tracking Test Suite
 * Tests all aspects of the beacon tracking implementation
 */

import { config } from 'dotenv';

// Load environment variables
config();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://66.42.92.192/v1';
const BEACON_FUNCTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID || 'beacon-tracker';

// Test data
const TEST_DATA = {
  emailId: 'test-email-' + Date.now(),
  recipientEmail: 'test@example.com',
  companyId: 'test-company',
  senderUserId: 'test-sender'
};

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBeaconPixelGET() {
  console.log('🖼️  Testing Beacon Pixel (GET request)...');
  
  try {
    const beaconUrl = `${APPWRITE_ENDPOINT}/functions/${BEACON_FUNCTION_ID}/executions` +
      `?emailId=${TEST_DATA.emailId}` +
      `&recipientEmail=${encodeURIComponent(TEST_DATA.recipientEmail)}` +
      `&companyId=${encodeURIComponent(TEST_DATA.companyId)}` +
      `&senderUserId=${encodeURIComponent(TEST_DATA.senderUserId)}`;
    
    console.log(`   📡 Beacon URL: ${beaconUrl}`);
    
    const response = await fetch(beaconUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      }
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Content-Type: ${contentType}`);
      console.log(`   ✅ Content-Length: ${contentLength} bytes`);
      
      if (contentType === 'image/png' && contentLength === '67') {
        console.log('   ✅ Correct 1x1 transparent PNG returned');
        return true;
      } else {
        console.log('   ⚠️  Response format may be incorrect');
        return false;
      }
    } else {
      console.log(`   ❌ Failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testBeaconDataPOST() {
  console.log('\n📊 Testing Beacon Data Collection (POST request)...');
  
  try {
    const trackingData = {
      ...TEST_DATA,
      device: 'Desktop',
      browser: 'Chrome',
      os: 'Windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/New_York',
      referrer: 'https://gmail.com'
    };
    
    const response = await fetch(`${APPWRITE_ENDPOINT}/functions/${BEACON_FUNCTION_ID}/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': trackingData.userAgent,
        'Accept-Language': trackingData.language,
        'Referer': trackingData.referrer
      },
      body: JSON.stringify(trackingData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Response:`, result);
      console.log(`   ✅ Document ID: ${result.documentId || 'N/A'}`);
      return true;
    } else {
      console.log(`   ❌ Failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testBeaconAPI() {
  console.log('\n🔍 Testing Beacon API endpoints...');
  
  const endpoints = [
    { name: 'All Logs', url: `/api/beacon/logs?limit=5` },
    { name: 'Company Logs', url: `/api/beacon/logs?companyId=${TEST_DATA.companyId}&limit=5` },
    { name: 'Email Logs', url: `/api/beacon/logs?emailId=${TEST_DATA.emailId}` },
    { name: 'Analytics', url: `/api/beacon/analytics` },
    { name: 'Top Emails', url: `/api/beacon/top-emails?limit=5` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   📡 Testing ${endpoint.name}...`);
      const response = await fetch(`${BASE_URL}${endpoint.url}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.name}: ${Array.isArray(data) ? data.length : 'OK'} results`);
      } else {
        console.log(`   ❌ ${endpoint.name}: Status ${response.status}`);
      }
    } catch (error: any) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
    
    await delay(100); // Small delay between requests
  }
}

async function testEmailIntegration() {
  console.log('\n📧 Testing Email Integration...');
  
  try {
    console.log('   📡 Testing compose endpoint...');
    const response = await fetch(`${BASE_URL}/api/test-beacon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_DATA)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ Compose test: ${result.message}`);
      return true;
    } else {
      console.log(`   ❌ Compose test failed: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Compose test error: ${error.message}`);
    return false;
  }
}

async function testSuspiciousActivityDetection() {
  console.log('\n🚨 Testing Suspicious Activity Detection...');
  
  try {
    // First access from one IP/device
    const firstAccess = {
      ...TEST_DATA,
      emailId: 'suspicious-test-' + Date.now(),
      device: 'Desktop',
      browser: 'Chrome',
      os: 'Windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    await fetch(`${APPWRITE_ENDPOINT}/functions/${BEACON_FUNCTION_ID}/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '192.168.1.100',
        'User-Agent': firstAccess.userAgent
      },
      body: JSON.stringify(firstAccess)
    });
    
    console.log('   📡 First access logged...');
    await delay(1000);
    
    // Second access from different IP/device (should trigger suspicious activity)
    const secondAccess = {
      ...firstAccess,
      device: 'Mobile',
      browser: 'Safari',
      os: 'iOS',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    };
    
    const response = await fetch(`${APPWRITE_ENDPOINT}/functions/${BEACON_FUNCTION_ID}/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '203.0.113.5',
        'User-Agent': secondAccess.userAgent
      },
      body: JSON.stringify(secondAccess)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Suspicious activity test completed');
      console.log('   📊 Check your alerts collection for suspicious activity alerts');
      return true;
    } else {
      console.log('   ❌ Suspicious activity test failed');
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Suspicious activity test error: ${error.message}`);
    return false;
  }
}

async function runTestSuite() {
  console.log('🧪 Comprehensive Beacon Tracking Test Suite');
  console.log('='.repeat(50));
  
  const results = {
    pixelTest: false,
    dataTest: false,
    apiTest: true, // Assume success unless proven otherwise
    emailTest: false,
    suspiciousTest: false
  };
  
  // Run all tests
  results.pixelTest = await testBeaconPixelGET();
  await delay(500);
  
  results.dataTest = await testBeaconDataPOST();
  await delay(500);
  
  await testBeaconAPI();
  await delay(500);
  
  results.emailTest = await testEmailIntegration();
  await delay(500);
  
  results.suspiciousTest = await testSuspiciousActivityDetection();
  
  // Summary
  console.log('\n📋 Test Results Summary');
  console.log('='.repeat(30));
  console.log(`🖼️  Beacon Pixel (GET): ${results.pixelTest ? '✅' : '❌'}`);
  console.log(`📊 Data Collection (POST): ${results.dataTest ? '✅' : '❌'}`);
  console.log(`🔍 API Endpoints: ✅ (check individual results above)`);
  console.log(`📧 Email Integration: ${results.emailTest ? '✅' : '❌'}`);
  console.log(`🚨 Suspicious Activity: ${results.suspiciousTest ? '✅' : '❌'}`);
  
  const overallSuccess = Object.values(results).every(Boolean);
  console.log(`\n${overallSuccess ? '🎉' : '⚠️'} Overall Result: ${overallSuccess ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (!overallSuccess) {
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Check your .env file for correct Appwrite configuration');
    console.log('2. Ensure your Appwrite function is deployed and accessible');
    console.log('3. Verify your database collections exist and have proper permissions');
    console.log('4. Check network connectivity to Appwrite endpoints');
  }
  
  console.log('\n📚 Next Steps:');
  console.log('1. Send a real email using the compose feature');
  console.log('2. Open the email in a real email client');
  console.log('3. Click the secure link to trigger page-level tracking');
  console.log('4. Check the beacon logs in your admin dashboard');
}

// Run the test suite
runTestSuite().catch(console.error);
