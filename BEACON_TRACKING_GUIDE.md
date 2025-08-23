# Beacon Tracking System Implementation

## Overview
The beacon tracking system monitors email opens and secure link access attempts to provide security analytics and detect suspicious activity.

## Components

### 1. Email Tracking Pixel
- **Location**: Embedded in emails sent via `compose-email-flow.ts`
- **Function**: Tracks when emails are opened
- **Implementation**: 1x1 invisible image that loads from Appwrite function

### 2. Secure Page Access Tracking
- **Location**: `/secure/[token]` page
- **Function**: Tracks every access attempt to secure links
- **Features**:
  - Location permission requirement (non-guest users)
  - Device fingerprinting
  - Multiple access detection

### 3. Appwrite Function (beacon-tracker)
- **Location**: `appwrite-functions/beacon-tracker/src/main.js`
- **Function**: Processes and stores tracking data
- **Features**:
  - IP geolocation
  - Device/browser detection
  - Suspicious activity detection
  - Automatic email revocation on suspicious opens

### 4. BeaconService
- **Location**: `src/lib/beacon-service.ts`
- **Function**: Client-side tracking methods and data retrieval
- **Methods**:
  - `getAllBeaconLogs()` - Get all tracking logs
  - `getBeaconLogsByEmail()` - Get logs for specific email
  - `getBeaconAnalytics()` - Get analytics summary
  - `trackEmailAccess()` - Track access attempts

## Data Collected

### Email Open Tracking
- Email ID and recipient
- IP address and geolocation
- Device type (Mobile/Desktop/Tablet)
- Browser and OS information
- Timestamp of access
- User agent string
- Screen resolution
- Language and timezone

### Access Attempt Tracking
- All above data plus:
- GPS coordinates (if permission granted)
- Referrer information
- Multiple device detection
- PIN verification attempts

## Security Features

### Suspicious Activity Detection
The system flags suspicious activity when:
- Same email opened from different IP addresses
- Same email opened from different devices
- Different user agents detected

### Automatic Responses
When suspicious activity is detected:
- Email link is automatically revoked
- Alert is logged in the system
- Admin dashboard shows warning

### Location Requirements
- Non-guest users must grant location permission
- Location data is used for security monitoring
- Prevents access without proper verification

## Dashboard Integration

### Admin Email Details (`/admin/emails/[id]`)
- Shows all beacon triggers for an email
- Displays device and location information
- Shows suspicious activity indicators
- Provides access attempt history

### Beacon Tracking Component
- Real-time analytics dashboard
- Device and browser statistics
- Geographic distribution of opens
- Suspicious activity alerts

## Implementation Guide

### 1. Setup Appwrite Function
```bash
cd appwrite-functions/beacon-tracker
appwrite functions deploy
```

### 2. Configure Environment Variables
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID=beacon-tracker
APPWRITE_DATABASE_ID=email_beacon_db
APPWRITE_BEACON_COLLECTION_ID=beacon_logs
```

### 3. Database Schema
The `beacon_logs` collection should have:
- emailId (string, required)
- recipientEmail (string, required)
- companyId (string, required)
- senderUserId (string, required)
- ip (string)
- device, browser, os (strings)
- location (object with city, country, etc.)
- timestamp (datetime, required)
- userAgent, screenResolution, language, timezone (strings)

## Testing

### Manual Testing
1. Send a test email through the compose interface
2. Open the email (tracking pixel should fire)
3. Click the secure link (page access should be tracked)
4. Check admin dashboard for tracking data

### API Testing
Use the test endpoint: `GET /api/test-beacon`

### Verification Points
- [ ] Email tracking pixel loads correctly
- [ ] Secure page tracks every access
- [ ] Location permission is required
- [ ] Multiple device access is detected
- [ ] Admin dashboard shows tracking data
- [ ] Suspicious activity triggers alerts

## Troubleshooting

### Common Issues
1. **No tracking data**: Check Appwrite function deployment
2. **Location not working**: Verify HTTPS and browser permissions
3. **Dashboard empty**: Confirm BeaconService is properly fetching data
4. **Function errors**: Check Appwrite function logs

### Debug Mode
Add `console.log` statements in:
- `trackPageView()` function
- Secure page `useEffect`
- BeaconService methods

### Monitoring
- Check Appwrite function execution logs
- Monitor browser network tab for tracking requests
- Verify database entries in Appwrite console

## Future Enhancements

### Planned Features
- Real-time notifications for suspicious activity
- Advanced device fingerprinting
- Machine learning for anomaly detection
- Export capabilities for security reports
- Integration with external security systems

### Performance Optimizations
- Batch tracking requests
- Client-side caching of device info
- Asynchronous tracking to not block UI
- Rate limiting for tracking requests
