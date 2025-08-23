#!/usr/bin/env node

/**
 * Automated Appwrite Setup Script for Beacon Tracking
 * This script sets up the required database, collection, and function for email beacon tracking
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function setupAppwrite() {
    console.log('🚀 Setting up Appwrite for Beacon Tracking...\n');

    try {
        // Get project details
        const projectId = await ask('Enter your Appwrite Project ID: ');
        const endpoint = await ask('Enter your Appwrite Endpoint (default: https://cloud.appwrite.io/v1): ') || 'https://cloud.appwrite.io/v1';

        console.log('\n📊 Creating database and collection...');

        // Create database
        console.log('Creating database: email_beacon_db');
        try {
            execSync(`appwrite databases create --databaseId email_beacon_db --name "Email Beacon Database"`, { stdio: 'inherit' });
        } catch (error) {
            console.log('Database might already exist, continuing...');
        }

        // Create collection
        console.log('Creating collection: beacon_logs');
        try {
            execSync(`appwrite databases createCollection --databaseId email_beacon_db --collectionId beacon_logs --name "Beacon Logs" --permissions 'read("users")' 'write("users")' 'create("users")'`, { stdio: 'inherit' });
        } catch (error) {
            console.log('Collection might already exist, continuing...');
        }

        // Create attributes
        console.log('Creating collection attributes...');
        const attributes = [
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key emailId --size 255 --required true',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key recipientEmail --size 255 --required true',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key companyId --size 255 --required true',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key senderUserId --size 255 --required true',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key ip --size 45 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key userAgent --size 1000 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key device --size 50 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key browser --size 50 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key os --size 50 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key location --size 1000 --required false',
            'appwrite databases createDatetimeAttribute --databaseId email_beacon_db --collectionId beacon_logs --key timestamp --required true',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key referrer --size 500 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key screenResolution --size 50 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key language --size 10 --required false',
            'appwrite databases createStringAttribute --databaseId email_beacon_db --collectionId beacon_logs --key timezone --size 50 --required false'
        ];

        for (const attr of attributes) {
            try {
                execSync(attr, { stdio: 'inherit' });
            } catch (error) {
                console.log(`Attribute might already exist, continuing...`);
            }
        }

        console.log('\n🔧 Creating function...');
        
        // Create function
        try {
            execSync(`appwrite functions create --functionId beacon-tracker --name "Beacon Tracker" --runtime node-18.0 --execute 'users'`, { stdio: 'inherit' });
        } catch (error) {
            console.log('Function might already exist, continuing...');
        }

        // Deploy function
        console.log('Deploying function code...');
        try {
            execSync(`cd appwrite-functions/beacon-tracker && appwrite functions createDeployment --functionId beacon-tracker --code . --activate true`, { stdio: 'inherit' });
        } catch (error) {
            console.log('⚠️ Function deployment failed. Please deploy manually from the Appwrite console.');
        }

        console.log('\n✅ Appwrite setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Create an API key in your Appwrite console with the following scopes:');
        console.log('   - databases.read');
        console.log('   - databases.write');
        console.log('   - functions.read');
        console.log('   - functions.write');
        console.log('   - functions.execute');
        console.log('\n2. Update your .env file with:');
        console.log(`   NEXT_PUBLIC_APPWRITE_ENDPOINT=${endpoint}`);
        console.log(`   NEXT_PUBLIC_APPWRITE_PROJECT_ID=${projectId}`);
        console.log(`   NEXT_PUBLIC_APPWRITE_DATABASE_ID=email_beacon_db`);
        console.log(`   NEXT_PUBLIC_APPWRITE_BEACON_COLLECTION_ID=beacon_logs`);
        console.log(`   NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID=beacon-tracker`);
        console.log(`   APPWRITE_API_KEY=your_server_api_key`);
        console.log('\n3. Test by sending an email and checking the dashboard for beacon data!');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n📖 Please refer to APPWRITE_BEACON_SETUP.md for manual setup instructions.');
    } finally {
        rl.close();
    }
}

// Check if Appwrite CLI is installed
try {
    execSync('appwrite --version', { stdio: 'pipe' });
    setupAppwrite();
} catch (error) {
    console.error('❌ Appwrite CLI is not installed. Please install it first:');
    console.log('npm install -g appwrite-cli');
    console.log('\nThen run: appwrite login');
    console.log('And try this script again.');
    process.exit(1);
}
