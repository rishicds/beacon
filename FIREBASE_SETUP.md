# Firebase Setup for Seed Script

## Option 1: Environment Variables (Recommended)

Create a `.env` file in your project root with the following variables:

```bash
# Required fields
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Optional fields (these have default values)
FIREBASE_TYPE=service_account
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
```

## Option 2: Service Account JSON File

Alternatively, you can create a `serviceAccount.json` file at your project root:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file and rename it to `serviceAccount.json`
6. Place it in your project root (same level as `package.json`)

Then update the seed script to import it:

```typescript
import serviceAccount from '../serviceAccount.json';

// ... rest of the code
```

## How to Get Firebase Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Go to Project Settings** (gear icon)
4. **Click on Service Accounts tab**
5. **Click "Generate new private key"**
6. **Download the JSON file**

## Security Note

- **Never commit** your `.env` file or `serviceAccount.json` to version control
- Add them to your `.gitignore` file
- Use environment variables in production environments
