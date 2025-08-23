import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query } from 'appwrite';

// Initialize Appwrite client for server-side operations
function createServerClient() {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'http://66.42.92.192/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || 'beacondev');
    
    // Set API key for server-side operations
    const apiKey = process.env.APPWRITE_API_KEY || 'beacondev';
    if (apiKey) {
        client.setDevKey(apiKey);
    }
    
    return client;
}

// Helper function to get location from IP
async function getLocationFromIP(ip: string) {
    try {
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
function parseUserAgent(userAgent: string) {
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
function getRealIP(request: NextRequest): string {
    // Check various headers for real IP
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    const xClientIP = request.headers.get('x-client-ip');
    
    if (cfConnectingIP) return cfConnectingIP;
    if (xRealIP) return xRealIP;
    if (xClientIP) return xClientIP;
    if (xForwardedFor) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        return xForwardedFor.split(',')[0].trim();
    }
    
    return '127.0.0.1';
}

// GET handler for tracking pixel
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Extract tracking data from query parameters
        const emailId = searchParams.get('emailId');
        const recipientEmail = searchParams.get('recipientEmail');
        const companyId = searchParams.get('companyId') || 'unknown';
        const senderUserId = searchParams.get('senderUserId') || 'unknown';

        // Validate required fields
        if (!emailId || !recipientEmail) {
            console.error('Missing required fields: emailId and recipientEmail');
            // Still return a pixel to avoid breaking the email
            const pixel = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                'base64'
            );
            return new Response(pixel, {
                headers: {
                    'Content-Type': 'image/png',
                    'Content-Length': pixel.length.toString(),
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
        }

        // Extract information from headers
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip = getRealIP(request);
        const referrer = request.headers.get('referer') || request.headers.get('referrer') || '';
        const acceptLanguage = request.headers.get('accept-language') || '';

        // Parse user agent
        const { device, browser, os } = parseUserAgent(userAgent);

        // Get location from IP
        const location = await getLocationFromIP(ip);

        // Prepare beacon data
        const beaconData = {
            emailId: emailId,
            recipientEmail: recipientEmail,
            companyId: companyId,
            senderUserId: senderUserId,
            ip: ip,
            userAgent: userAgent,
            device: device,
            browser: browser,
            os: os,
            location: JSON.stringify(location), // Store as string
            timestamp: new Date().toISOString(),
            referrer: referrer,
            language: acceptLanguage.split(',')[0] || '',
        };

        // Store in Appwrite database
        const client = createServerClient();
        const databases = new Databases(client);
        
        const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'email_beacon_db';
        const collectionId = process.env.APPWRITE_BEACON_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_BEACON_COLLECTION_ID || 'beacon_logs';

        try {
            const document = await databases.createDocument(
                databaseId,
                collectionId,
                ID.unique(),
                beaconData
            );

            console.log('Beacon tracking data stored successfully:', document.$id);

            // Check for suspicious opens (different IP/device/user agent)
            // Fetch previous beacon logs for this emailId specifically
            const previousLogs = await databases.listDocuments(databaseId, collectionId, [
                Query.equal('emailId', emailId),
                Query.orderDesc('timestamp'),
                Query.limit(10)
            ]);

            let isSuspicious = false;
            let suspiciousReasons = [];
            
            if (previousLogs.documents.length > 1) {
                // Get the first (oldest) log for comparison
                const firstLog = previousLogs.documents[previousLogs.documents.length - 1];
                
                // Check for differences that indicate suspicious activity
                if (firstLog.ip && firstLog.ip !== ip) {
                    isSuspicious = true;
                    suspiciousReasons.push(`Different IP: ${firstLog.ip} vs ${ip}`);
                }
                
                if (firstLog.device && firstLog.device !== device) {
                    isSuspicious = true;
                    suspiciousReasons.push(`Different device: ${firstLog.device} vs ${device}`);
                }
                
                if (firstLog.userAgent && firstLog.userAgent !== userAgent) {
                    isSuspicious = true;
                    suspiciousReasons.push(`Different user agent`);
                }
                
                // Check for location differences (if available)
                try {
                    const firstLocation = typeof firstLog.location === 'string' 
                        ? JSON.parse(firstLog.location) 
                        : firstLog.location;
                    if (firstLocation && location) {
                        if (firstLocation.country !== location.country) {
                            isSuspicious = true;
                            suspiciousReasons.push(`Different country: ${firstLocation.country} vs ${location.country}`);
                        }
                        if (firstLocation.city !== location.city) {
                            suspiciousReasons.push(`Different city: ${firstLocation.city} vs ${location.city}`);
                        }
                    }
                } catch (e) {
                    console.log('Could not parse location for comparison:', e);
                }
            }

            // If suspicious, try to mark the email as revoked and create an alert
            if (isSuspicious) {
                console.log(`Suspicious activity detected for email ${emailId}: ${suspiciousReasons.join(', ')}`);
                
                try {
                    // Try to update the email document in Appwrite (if using Appwrite for emails)
                    await databases.updateDocument(
                        databaseId,
                        'emails', // emails collection id
                        emailId,
                        { revoked: true }
                    );
                } catch (e) {
                    console.log('Could not update email revoked status in Appwrite:', e);
                }

                // Log an alert with detailed reasons
                try {
                    await databases.createDocument(
                        databaseId,
                        'alerts', // alerts collection id
                        ID.unique(),
                        {
                            emailId: emailId,
                            companyId: companyId,
                            type: 'Suspicious Open',
                            message: `Email opened from suspicious source. Reasons: ${suspiciousReasons.join(', ')}. Link automatically revoked.`,
                            details: JSON.stringify({
                                suspiciousReasons,
                                currentAccess: {
                                    ip,
                                    device,
                                    browser,
                                    os,
                                    location: JSON.stringify(location),
                                    userAgent
                                },
                                timestamp: new Date().toISOString()
                            }),
                            timestamp: new Date().toISOString(),
                            resolved: false
                        }
                    );
                } catch (e) {
                    console.log('Could not create alert in Appwrite:', e);
                }
            }

        } catch (dbError) {
            console.error('Failed to store beacon data:', dbError);
        }

        // Return a 1x1 transparent PNG pixel
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'base64'
        );

        return new Response(pixel, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': pixel.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error) {
        console.error('Beacon tracking error:', error);
        
        // Still return a pixel to avoid breaking the email
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'base64'
        );
        
        return new Response(pixel, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': pixel.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    }
}

// POST handler for programmatic tracking
export async function POST(request: NextRequest) {
    try {
        const trackingData = await request.json();

        // Validate required fields
        if (!trackingData.emailId || !trackingData.recipientEmail) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required fields: emailId and recipientEmail' 
            }, { status: 400 });
        }

        // Extract information from headers
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip = getRealIP(request);
        const referrer = request.headers.get('referer') || request.headers.get('referrer') || '';
        const acceptLanguage = request.headers.get('accept-language') || '';

        // Parse user agent
        const { device, browser, os } = parseUserAgent(userAgent);

        // Prefer client-supplied geolocation if present, else use IP-based geolocation
        let location = null;
        if (
            typeof trackingData.latitude === 'number' &&
            typeof trackingData.longitude === 'number'
        ) {
            location = {
                latitude: trackingData.latitude,
                longitude: trackingData.longitude,
                accuracy: trackingData.accuracy || null,
                // Optionally, you can reverse geocode here if you want city/country
                source: 'client',
            };
        } else {
            // Fallback to IP-based geolocation
            const ipLocation = await getLocationFromIP(ip);
            location = { ...ipLocation, source: 'ip' };
        }

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
            location: JSON.stringify(location), // Store as string
            timestamp: new Date().toISOString(),
            referrer: referrer,
            screenResolution: trackingData.screenResolution || '',
            language: acceptLanguage.split(',')[0] || '',
            timezone: trackingData.timezone || '',
        };

        // Store in Appwrite database
        const client = createServerClient();
        const databases = new Databases(client);
        
        const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'email_beacon_db';
        const collectionId = process.env.APPWRITE_BEACON_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_BEACON_COLLECTION_ID || 'beacon_logs';

        const document = await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            beaconData
        );

        console.log('Beacon tracking data stored successfully:', document.$id);

        return NextResponse.json({
            success: true,
            message: 'Beacon tracking recorded',
            documentId: document.$id,
            data: {
                device: device,
                browser: browser,
                os: os,
                location: location,
                timestamp: beaconData.timestamp
            }
        });

    } catch (error) {
        console.error('Beacon tracking error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to track beacon'
        }, { status: 500 });
    }
}
