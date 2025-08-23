import { describe, test, expect } from '@jest/globals';

// Test the beacon API endpoint
describe('Beacon API', () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

  test('should return a 1x1 pixel for GET request', async () => {
    const testParams = new URLSearchParams({
      emailId: 'test-123',
      recipientEmail: 'test@example.com',
      companyId: 'TEST',
      senderUserId: 'user-123'
    });

    const response = await fetch(`${baseUrl}/api/beacon?${testParams}`, {
      method: 'GET'
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  test('should handle POST request and return JSON', async () => {
    const trackingData = {
      emailId: 'test-123',
      recipientEmail: 'test@example.com',
      companyId: 'TEST',
      senderUserId: 'user-123',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/New_York'
    };

    const response = await fetch(`${baseUrl}/api/beacon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData)
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.message).toBe('Beacon tracking recorded');
    expect(result.documentId).toBeDefined();
  });

  test('should handle missing required fields gracefully', async () => {
    // Test with missing emailId
    const response = await fetch(`${baseUrl}/api/beacon?recipientEmail=test@example.com`, {
      method: 'GET'
    });

    // Should still return a pixel (to not break email display)
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });
});
