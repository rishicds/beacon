# Beacon Tracking Testing Guide

This guide provides multiple ways to test the beacon tracking implementation in your GuardianMail application.

## Prerequisites

1. **Environment Setup**: Ensure your `.env` file contains:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID=beacon-tracker
   NEXT_PUBLIC_BASE_URL=http://localhost:9002
   ```

2. **Appwrite Function**: Ensure the beacon-tracker function is deployed to Appwrite

3. **Application Running**: Start your Next.js application:
   ```bash
   pnpm dev
   ```

## Testing Methods

### 1. 🔧 Automated Test Suite

Run the comprehensive test suite:

```bash
# Make the script executable (if needed)
chmod +x scripts/test-beacon-comprehensive.ts

# Run with tsx
npx tsx scripts/test-beacon-comprehensive.ts
```

This will test:
- Beacon pixel image generation (GET request)
- Data collection via POST request
- API endpoints functionality
- Email integration
- Suspicious activity detection

### 2. 📧 End-to-End Email Testing

#### Step 1: Send a Test Email
1. Navigate to `/compose` in your application
2. Fill out the form:
   - **Recipient**: Use a real email address you can access
   - **Subject**: "Test Beacon Tracking"
   - **Body**: "This is a test email to verify beacon tracking"
3. Send the email

#### Step 2: Open the Email
1. Check your email client (Gmail, Outlook, etc.)
2. Open the email you just sent
3. **Important**: The beacon pixel will automatically load when you view the email

#### Step 3: Click the Secure Link
1. Click the secure link in the email
2. Enter your PIN (if required)
3. This triggers additional page-level tracking

#### Step 4: Verify Tracking Data
1. Go to your admin dashboard (`/admin`)
2. Check the "Activity Logs" or "Beacon Tracking" section
3. You should see tracking entries for:
   - Email opened (when you viewed it in your email client)
   - Link accessed (when you clicked the secure link)

### 3. 🌐 Manual API Testing

#### Test the Beacon Pixel (GET Request)
Open this URL in your browser (replace with your actual values):
```
https://cloud.appwrite.io/v1/functions/beacon-tracker/executions?emailId=test-123&recipientEmail=test@example.com&companyId=test-company&senderUserId=test-user
```

**Expected Result**: You should see a tiny 1x1 transparent image

#### Test Data Collection (POST Request)
Use curl or a tool like Postman:

```bash
curl -X POST \
  https://cloud.appwrite.io/v1/functions/beacon-tracker/executions \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -d '{
    "emailId": "test-email-123",
    "recipientEmail": "test@example.com", 
    "companyId": "test-company",
    "senderUserId": "test-user",
    "device": "Desktop",
    "browser": "Chrome",
    "os": "Windows"
  }'
```

**Expected Result**: JSON response with success status and document ID

### 4. 🔍 Check API Endpoints

#### Get Beacon Logs
```bash
curl http://localhost:9002/api/beacon/logs?limit=10
```

#### Get Analytics
```bash
curl http://localhost:9002/api/beacon/analytics
```

#### Get Company-Specific Logs
```bash
curl "http://localhost:9002/api/beacon/logs?companyId=your-company-id&limit=10"
```

### 5. 🧪 Browser Console Testing

Open your browser's developer console and run:

```javascript
// Test the tracking utility function
import { trackPageView } from '/src/lib/tracking-utils';

trackPageView(
  'test-email-id',
  'test@example.com', 
  'test-company',
  'test-user'
).then(result => {
  console.log('Tracking result:', result);
}).catch(error => {
  console.error('Tracking failed:', error);
});
```

### 6. 🎯 Test Suspicious Activity Detection

1. **First Access**: Open a secure email link from one device/location
2. **Second Access**: Open the same link from a different device/IP
3. **Check Results**: Look for alerts in your admin dashboard

The system should:
- Detect different IP addresses, devices, or user agents
- Automatically revoke the email link
- Generate a security alert

## Troubleshooting

### Common Issues

1. **Beacon Function Not Responding**
   - Check Appwrite function deployment status
   - Verify environment variables
   - Check function logs in Appwrite console

2. **No Tracking Data**
   - Confirm database collections exist and have proper permissions
   - Check network connectivity
   - Verify API endpoints are accessible

3. **Email Client Blocks Images**
   - Some email clients block external images by default
   - Test with multiple email clients
   - Check email client's image loading settings

4. **CORS Issues**
   - Ensure Appwrite function has proper CORS configuration
   - Check browser console for CORS errors

### Debug Tips

1. **Enable Verbose Logging**
   ```javascript
   // Add to your .env.local
   NODE_ENV=development
   DEBUG=beacon:*
   ```

2. **Check Browser Network Tab**
   - Open DevTools > Network
   - Look for requests to your Appwrite function
   - Check request/response headers and payloads

3. **Monitor Appwrite Function Logs**
   - Go to Appwrite Console > Functions > beacon-tracker
   - Check the "Logs" tab for execution details

## Verification Checklist

- [ ] Beacon pixel loads correctly (1x1 transparent PNG)
- [ ] POST requests successfully store tracking data
- [ ] API endpoints return expected data
- [ ] Email integration embeds pixel correctly
- [ ] Page-level tracking works on secure links
- [ ] Suspicious activity detection triggers alerts
- [ ] Admin dashboard shows tracking data
- [ ] Real email clients load the beacon pixel
- [ ] Different devices/IPs trigger security alerts

## Expected Data Structure

When tracking works correctly, you should see data like:

```json
{
  "emailId": "email-123",
  "recipientEmail": "user@example.com",
  "companyId": "company-456", 
  "senderUserId": "sender-789",
  "ip": "192.168.1.100",
  "device": "Desktop",
  "browser": "Chrome",
  "os": "Windows",
  "location": {
    "country": "United States",
    "city": "New York",
    "region": "NY"
  },
  "timestamp": "2025-08-23T10:30:00.000Z"
}
```

## Performance Considerations

- Beacon tracking should not block email delivery
- Failed tracking should not prevent email access
- Tracking data should be stored asynchronously
- Pixel loading should have minimal performance impact

## Security Notes

- Beacon URLs contain sensitive information (email IDs, user data)
- Ensure Appwrite function has proper access controls
- Monitor for unusual tracking patterns
- Regularly review and clean up old tracking data
