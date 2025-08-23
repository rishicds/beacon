# Appwrite Beacon Tracking Setup Guide

This guide will help you set up Appwrite for email beacon tracking in your GuardianMail application.

## Prerequisites

- An Appwrite account (sign up at [cloud.appwrite.io](https://cloud.appwrite.io))
- Appwrite CLI installed (`npm install -g appwrite-cli`)

## Step 1: Create Appwrite Project

1. **Create a new project** in the Appwrite console
2. **Copy your Project ID** - you'll need this for environment variables
3. **Copy your API Endpoint** (usually `https://cloud.appwrite.io/v1`)

## Step 2: Create Database and Collection

### Using Appwrite Console:

1. **Go to Databases** section in your Appwrite project
2. **Create a new database** with ID: `email_beacon_db`
3. **Create a collection** with ID: `beacon_logs`
4. **Configure Collection Attributes:**

```json
{
  "emailId": {
    "type": "string",
    "size": 255,
    "required": true
  },
  "recipientEmail": {
    "type": "string",
    "size": 255,
    "required": true
  },
  "companyId": {
    "type": "string",
    "size": 255,
    "required": true
  },
  "senderUserId": {
    "type": "string",
    "size": 255,
    "required": true
  },
  "ip": {
    "type": "string",
    "size": 45,
    "required": false
  },
  "userAgent": {
    "type": "string",
    "size": 1000,
    "required": false
  },
  "device": {
    "type": "string",
    "size": 50,
    "required": false
  },
  "browser": {
    "type": "string",
    "size": 50,
    "required": false
  },
  "os": {
    "type": "string",
    "size": 50,
    "required": false
  },
  "location": {
    "type": "string",
    "size": 1000,
    "required": false
  },
  "timestamp": {
    "type": "datetime",
    "required": true
  },
  "referrer": {
    "type": "string",
    "size": 500,
    "required": false
  },
  "screenResolution": {
    "type": "string",
    "size": 50,
    "required": false
  },
  "language": {
    "type": "string",
    "size": 10,
    "required": false
  },
  "timezone": {
    "type": "string",
    "size": 50,
    "required": false
  }
}
```

5. **Set Collection Permissions:**
   - Read: `users`
   - Write: `users`
   - Create: `users`

### Using Appwrite CLI:

```bash
# Login to Appwrite
appwrite login

# Create database
appwrite databases create --databaseId email_beacon_db --name "Email Beacon Database"

# Create collection
appwrite databases createCollection \
  --databaseId email_beacon_db \
  --collectionId beacon_logs \
  --name "Beacon Logs" \
  --permissions 'read("users")' 'write("users")' 'create("users")'

# Create attributes
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key emailId --size 255 --required true
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key recipientEmail --size 255 --required true
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key companyId --size 255 --required true
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key senderUserId --size 255 --required true
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key ip --size 45 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key userAgent --size 1000 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key device --size 50 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key browser --size 50 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key os --size 50 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key location --size 1000 --required false
appwrite databases createDatetimeAttribute --databaseId email_beacon_db --collectionId beacon_logs --key timestamp --required true
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key referrer --size 500 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key screenResolution --size 50 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key language --size 10 --required false
appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key timezone --size 50 --required false
```

## Step 3: Create API Key

1. **Go to Settings > API Keys** in your Appwrite project
2. **Create a new API key** with the following scopes:
   - `databases.read`
   - `databases.write`
   - `functions.read`
   - `functions.write`
   - `functions.execute`
3. **Copy the API key** - you'll need this for environment variables

## Step 4: Deploy Appwrite Function

### Using Appwrite CLI:

1. **Initialize Appwrite in your project:**
```bash
cd appwrite-functions/beacon-tracker
appwrite init function
```

2. **Deploy the function:**
```bash
appwrite functions createDeployment \
  --functionId beacon-tracker \
  --code . \
  --activate true
```

### Using Appwrite Console:

1. **Go to Functions** section in your Appwrite project
2. **Create a new function** with ID: `beacon-tracker`
3. **Upload the function code** from `appwrite-functions/beacon-tracker/`
4. **Set Function Runtime:** Node.js 18.0
5. **Set Function Entry Point:** `src/main.js`
6. **Enable Function Execute permissions** for `users`

## Step 5: Configure Environment Variables

Create or update your `.env` file with:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=email_beacon_db
NEXT_PUBLIC_APPWRITE_BEACON_COLLECTION_ID=beacon_logs
NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID=beacon-tracker

# Server-side configuration for functions
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_server_api_key
APPWRITE_DATABASE_ID=email_beacon_db
APPWRITE_BEACON_COLLECTION_ID=beacon_logs
```

## Step 6: Test the Setup

1. **Send a test email** through your application
2. **Open the email** (the tracking pixel should fire automatically)
3. **Check the beacon logs** in your admin or company dashboard
4. **Verify tracking data** appears with device, browser, location info

## Step 7: Monitor and Troubleshoot

### Check Function Logs:
```bash
appwrite functions listExecutions --functionId beacon-tracker
```

### Common Issues:

1. **CORS Errors**: Make sure your domain is added to the allowed origins in Appwrite settings
2. **Permission Errors**: Verify API key has correct scopes
3. **Function Not Executing**: Check function deployment status and logs
4. **Database Errors**: Verify collection attributes match the schema

## Advanced Configuration

### Custom Domain for Functions:
You can set up a custom domain for your functions to avoid CORS issues and make the beacon URLs more branded.

### Rate Limiting:
Consider implementing rate limiting to prevent abuse of the tracking endpoint.

### Data Retention:
Set up automated cleanup of old beacon logs to manage database size.

## Security Considerations

1. **API Key Security**: Never expose server API keys in client-side code
2. **Data Privacy**: Ensure compliance with GDPR/CCPA for tracking user data
3. **Access Control**: Limit function execution to authenticated users only
4. **Data Validation**: Always validate incoming tracking data

## Monitoring and Analytics

The beacon tracking system provides:
- Real-time email open tracking
- Device and browser analytics
- Geographic location data
- User engagement metrics
- Historical tracking data

All data is displayed in both admin and company dashboards with comprehensive analytics.
