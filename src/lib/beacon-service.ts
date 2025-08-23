import { databases, DATABASE_ID, BEACON_COLLECTION_ID, BeaconData } from './appwrite';
import { Query } from 'appwrite';

export class BeaconService {
    // Get all beacon logs for admin
    static async getAllBeaconLogs(limit = 100, offset = 0) {
        try {
            const response = await fetch(`/api/beacon/logs?limit=${limit}&offset=${offset}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch beacon logs: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch beacon logs:', error);
            throw error;
        }
    }

    // Get beacon logs for specific company
    static async getBeaconLogsByCompany(companyId: string, limit = 100, offset = 0) {
        try {
            const response = await fetch(`/api/beacon/logs?companyId=${companyId}&limit=${limit}&offset=${offset}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch company beacon logs: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch company beacon logs:', error);
            throw error;
        }
    }

    // Get beacon logs for specific email
    static async getBeaconLogsByEmail(emailId: string) {
        try {
            const response = await fetch(`/api/beacon/logs?emailId=${emailId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch email beacon logs: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch email beacon logs:', error);
            throw error;
        }
    }

    // Get beacon analytics summary
    static async getBeaconAnalytics(companyId?: string) {
        try {
            const url = companyId 
                ? `/api/beacon/analytics?companyId=${companyId}`
                : '/api/beacon/analytics';

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch beacon analytics: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch beacon analytics:', error);
            throw error;
        }
    }

    // Get top opened emails
    static async getTopOpenedEmails(companyId?: string, limit = 10) {
        try {
            const url = companyId 
                ? `/api/beacon/top-emails?companyId=${companyId}&limit=${limit}`
                : `/api/beacon/top-emails?limit=${limit}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch top opened emails: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch top opened emails:', error);
            throw error;
        }
    }

    // Track email access attempt (when secure link is accessed)
    static async trackEmailAccess(emailId: string, recipientEmail: string, companyId: string, senderUserId: string, locationData?: GeolocationPosition) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
            
            // Get additional device information
            const deviceInfo = this.getDeviceInfo();
            
            const trackingData: any = {
                emailId,
                recipientEmail,
                companyId,
                senderUserId,
                screenResolution: `${screen.width}x${screen.height}`,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ...deviceInfo
            };

            // Add location data if available
            if (locationData) {
                trackingData.latitude = locationData.coords.latitude;
                trackingData.longitude = locationData.coords.longitude;
                trackingData.accuracy = locationData.coords.accuracy;
            }

            // Send tracking data to Next.js API route
            const response = await fetch(`${baseUrl}/api/beacon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trackingData)
            });

            if (!response.ok) {
                throw new Error(`Tracking failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Beacon tracking successful:', result);
            return result;

        } catch (error) {
            console.error('Failed to track email access:', error);
            throw error;
        }
    }

    // Get device and browser information
    private static getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        // Detect device type
        let device = 'Desktop';
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            device = /iPad|iPod/i.test(userAgent) ? 'Tablet' : 'Mobile';
        } else if (/Tablet/i.test(userAgent)) {
            device = 'Tablet';
        }

        // Detect browser
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';

        // Detect OS
        let os = 'Unknown';
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac OS')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        return { device, browser, os };
    }

    // Request location permission and get coordinates
    static async getLocationWithPermission(): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => {
                    let errorMessage = 'Location access denied.';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 600000 // 10 minutes
                }
            );
        });
    }

    // Track pixel load (for email opens)
    static async trackPixelLoad(emailId: string, recipientEmail: string, companyId: string, senderUserId: string) {
        try {
            const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://66.42.92.192/v1';
            const beaconFunctionId = process.env.NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID || 'beacon-tracker';
            
            // Create tracking pixel URL
            const pixelUrl = `${appwriteEndpoint}/functions/${beaconFunctionId}/executions?emailId=${emailId}&recipientEmail=${encodeURIComponent(recipientEmail)}&companyId=${encodeURIComponent(companyId)}&senderUserId=${encodeURIComponent(senderUserId)}`;
            
            // Load pixel (this will trigger the beacon)
            const img = new Image();
            img.src = pixelUrl;
            
            return pixelUrl;
        } catch (error) {
            console.error('Failed to track pixel load:', error);
            throw error;
        }
    }
}
