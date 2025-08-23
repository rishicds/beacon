import { Client, Databases, Query, ID } from 'node-appwrite';

// Helper function to get location from IP
async function getLocationFromIP(ip) {
    try {
        // Using ipapi.co for geolocation (free tier available)
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        
        return {
            country: data.country_name || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            latitude: data.latitude || undefined,
            longitude: data.longitude || undefined,
        };
    } catch (error) {
        console.error('Failed to get location:', error);
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
        };
    }
}

// Helper function to parse user agent
function parseUserAgent(userAgent) {
    let device = 'Unknown';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Detect Browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Detect Device Type
    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet')) device = 'Tablet';
    else device = 'Desktop';

    return { device, browser, os };
}

// Helper function to get real IP address
function getRealIP(headers, forwardedFor) {
    // Check various headers for real IP
    const xForwardedFor = headers['x-forwarded-for'];
    const xRealIP = headers['x-real-ip'];
    const cfConnectingIP = headers['cf-connecting-ip']; // Cloudflare
    const xClientIP = headers['x-client-ip'];
    
    if (cfConnectingIP) return cfConnectingIP;
    if (xRealIP) return xRealIP;
    if (xClientIP) return xClientIP;
    if (xForwardedFor) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        return xForwardedFor.split(',')[0].trim();
    }
    
    return forwardedFor || '127.0.0.1';
}

export default async ({ req, res, log, error }) => {
    try {
        // Initialize Appwrite client
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'http://66.42.92.192/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID || '')
            .setKey(process.env.APPWRITE_API_KEY || ''); // Server API key

        const databases = new Databases(client);

        // Get tracking data from request
        const method = req.method;
        let trackingData = {};

        if (method === 'GET') {
            // Extract from query parameters
            trackingData = req.query;
        } else if (method === 'POST') {
            // Extract from request body
            trackingData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        }

        // Validate required fields
        if (!trackingData.emailId || !trackingData.recipientEmail) {
            return res.json({ 
                success: false, 
                error: 'Missing required fields: emailId and recipientEmail' 
            }, 400);
        }

        // Extract information from headers
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = getRealIP(req.headers, req.headers['x-forwarded-for']);
        const referrer = req.headers['referer'] || req.headers['referrer'] || '';
        const acceptLanguage = req.headers['accept-language'] || '';

        // Parse user agent
        const { device, browser, os } = parseUserAgent(userAgent);

        // Get location from IP
        const location = await getLocationFromIP(ip);

        // Prepare beacon data
        const beaconData = {
            emailId: trackingData.emailId,
            recipientEmail: trackingData.recipientEmail,
            companyId: trackingData.companyId || 'unknown',
            senderUserId: trackingData.senderUserId || 'unknown',
            ip: ip,
            userAgent: userAgent,
            device: device,
            browser: browser,
            os: os,
            location: location,
            timestamp: new Date().toISOString(),
            referrer: referrer,
            screenResolution: trackingData.screenResolution || '',
            language: acceptLanguage.split(',')[0] || '',
            timezone: trackingData.timezone || '',
        };

        // Store in Appwrite database
        const databaseId = process.env.APPWRITE_DATABASE_ID || 'email_beacon_db';
        const collectionId = process.env.APPWRITE_BEACON_COLLECTION_ID || 'beacon_logs';

        const document = await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            beaconData
        );

        log('Beacon tracking data stored successfully:', document.$id);

        // Check for suspicious opens (different IP/device/user agent)
        // Fetch all previous beacon logs for this emailId
        const previousLogs = await databases.listDocuments(databaseId, collectionId, [
            Query.equal('emailId', trackingData.emailId),
            Query.orderDesc('timestamp'),
            Query.limit(10)
        ]);

        let isSuspicious = false;
        if (previousLogs.documents.length > 0) {
            // If a previous log exists with a different IP or device or user agent, flag as suspicious
            for (const log of previousLogs.documents) {
                if (
                    (log.ip && log.ip !== ip) ||
                    (log.device && log.device !== device) ||
                    (log.userAgent && log.userAgent !== userAgent)
                ) {
                    isSuspicious = true;
                    break;
                }
            }
        }

        // If suspicious, mark the email as revoked and log an alert
        if (isSuspicious) {
            // Revoke the email link in the emails collection (Firestore or Appwrite)
            try {
                // Try to update the email document in Appwrite (if using Appwrite for emails)
                await databases.updateDocument(
                    databaseId,
                    'emails', // emails collection id
                    trackingData.emailId,
                    { revoked: true }
                );
            } catch (e) {
                // If not using Appwrite for emails, you may need to call a webhook or use another method
                log('Could not update email revoked status in Appwrite:', e.message);
            }
            // Log an alert in beacon_logs or a separate alerts collection
            try {
                await databases.createDocument(
                    databaseId,
                    'alerts', // alerts collection id
                    ID.unique(),
                    {
                        emailId: trackingData.emailId,
                        companyId: trackingData.companyId || 'unknown',
                        type: 'Suspicious Open',
                        message: 'Email opened by multiple devices or locations. Link revoked.',
                        timestamp: new Date().toISOString(),
                        resolved: false
                    }
                );
            } catch (e) {
                log('Could not create alert in Appwrite:', e.message);
            }
        }

        // For GET requests (pixel tracking), return a 1x1 transparent pixel
        if (method === 'GET') {
            // Return a 1x1 transparent PNG pixel
            const pixel = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                'base64'
            );

            return res.send(pixel, 200, {
                'Content-Type': 'image/png',
                'Content-Length': pixel.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
        }

        // For POST requests, return JSON response
        return res.json({
            success: true,
            message: 'Beacon tracking recorded',
            documentId: document.$id,
            data: {
                device: device,
                browser: browser,
                os: os,
                location: location.city + ', ' + location.country,
                timestamp: beaconData.timestamp
            }
        });

    } catch (err) {
        error('Beacon tracking error:', err);
        return res.json({
            success: false,
            error: err.message || 'Failed to track beacon'
        }, 500);
    }
};
