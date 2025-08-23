// Utility functions for beacon tracking
export const trackPageView = async (emailId: string, recipientEmail: string, companyId: string, senderUserId: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    // Get device information
    const userAgent = navigator.userAgent;
    let device = 'Desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      device = /iPad|iPod/i.test(userAgent) ? 'Tablet' : 'Mobile';
    } else if (/Tablet/i.test(userAgent)) {
      device = 'Tablet';
    }

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    const trackingData: any = {
      emailId,
      recipientEmail,
      companyId,
      senderUserId,
      device,
      browser,
      os,
      userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString()
    };

    // Try to get location if permission is granted
    try {
      const position = await getCurrentLocation();
      trackingData.latitude = position.coords.latitude;
      trackingData.longitude = position.coords.longitude;
      trackingData.accuracy = position.coords.accuracy;
    } catch (error) {
      console.log('Location not available for tracking:', error);
    }

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
    console.log('Page view tracked successfully:', result);
    return result;

  } catch (error) {
    console.error('Failed to track page view:', error);
    // Don't throw error - tracking should not block the user experience
  }
};

const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};
