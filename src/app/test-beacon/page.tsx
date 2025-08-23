"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, Play, Code, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function BeaconTestPage() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testData, setTestData] = useState({
    emailId: `test-email-${Date.now()}`,
    recipientEmail: 'test@example.com',
    companyId: 'test-company',
    senderUserId: 'test-user'
  });

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runBeaconPixelTest = async () => {
    updateTestResult('Beacon Pixel (GET)', 'pending', 'Testing beacon pixel generation...');
    
    try {
      const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const beaconFunctionId = process.env.NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID || 'beacon-tracker';
      
      const beaconUrl = `${appwriteEndpoint}/functions/${beaconFunctionId}/executions` +
        `?emailId=${testData.emailId}` +
        `&recipientEmail=${encodeURIComponent(testData.recipientEmail)}` +
        `&companyId=${encodeURIComponent(testData.companyId)}` +
        `&senderUserId=${encodeURIComponent(testData.senderUserId)}`;
      
      const response = await fetch(beaconUrl, {
        method: 'GET',
        headers: {
          'User-Agent': navigator.userAgent,
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        if (contentType === 'image/png') {
          updateTestResult('Beacon Pixel (GET)', 'success', 
            `✅ Beacon pixel returned successfully (${contentLength} bytes)`, 
            { contentType, contentLength, url: beaconUrl });
        } else {
          updateTestResult('Beacon Pixel (GET)', 'warning', 
            `⚠️ Unexpected content type: ${contentType}`, 
            { contentType, contentLength });
        }
      } else {
        const errorText = await response.text();
        updateTestResult('Beacon Pixel (GET)', 'error', 
          `❌ Request failed (${response.status})`, 
          { status: response.status, error: errorText });
      }
    } catch (error: any) {
      updateTestResult('Beacon Pixel (GET)', 'error', 
        `❌ Network error: ${error.message}`, 
        { error: error.message });
    }
  };

  const runDataCollectionTest = async () => {
    updateTestResult('Data Collection (POST)', 'pending', 'Testing data collection...');
    
    try {
      const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const beaconFunctionId = process.env.NEXT_PUBLIC_APPWRITE_BEACON_FUNCTION_ID || 'beacon-tracker';
      
      const trackingData = {
        ...testData,
        device: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        browser: getBrowserName(),
        os: getOSName(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || ''
      };
      
      const response = await fetch(`${appwriteEndpoint}/functions/${beaconFunctionId}/executions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': trackingData.userAgent,
          'Accept-Language': trackingData.language,
        },
        body: JSON.stringify(trackingData)
      });
      
      if (response.ok) {
        const result = await response.json();
        updateTestResult('Data Collection (POST)', 'success', 
          `✅ Data collected successfully`, 
          { documentId: result.documentId, data: result.data });
      } else {
        const errorText = await response.text();
        updateTestResult('Data Collection (POST)', 'error', 
          `❌ Request failed (${response.status})`, 
          { status: response.status, error: errorText });
      }
    } catch (error: any) {
      updateTestResult('Data Collection (POST)', 'error', 
        `❌ Network error: ${error.message}`, 
        { error: error.message });
    }
  };

  const runAPITest = async () => {
    updateTestResult('API Endpoints', 'pending', 'Testing API endpoints...');
    
    try {
      const endpoints = [
        { name: 'Beacon Logs', url: '/api/beacon/logs?limit=5' },
        { name: 'Analytics', url: '/api/beacon/analytics' },
        { name: 'Test Beacon', url: '/api/test-beacon' }
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url);
          if (response.ok) {
            const data = await response.json();
            results.push({ name: endpoint.name, status: 'success', data });
          } else {
            results.push({ name: endpoint.name, status: 'error', error: response.status });
          }
        } catch (error: any) {
          results.push({ name: endpoint.name, status: 'error', error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.status === 'success').length;
      
      if (successCount === results.length) {
        updateTestResult('API Endpoints', 'success', 
          `✅ All ${successCount} endpoints working`, 
          results);
      } else {
        updateTestResult('API Endpoints', 'warning', 
          `⚠️ ${successCount}/${results.length} endpoints working`, 
          results);
      }
    } catch (error: any) {
      updateTestResult('API Endpoints', 'error', 
        `❌ API test failed: ${error.message}`, 
        { error: error.message });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    toast({
      title: "Running Tests",
      description: "Testing beacon tracking implementation...",
    });
    
    try {
      await runBeaconPixelTest();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await runDataCollectionTest();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await runAPITest();
      
      toast({
        title: "Tests Completed",
        description: "Check results below for details",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Test Error",
        description: "An error occurred while running tests",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  };

  const getOSName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<TestResult['status'], any> = {
      success: 'default',
      error: 'destructive', 
      warning: 'secondary',
      pending: 'outline'
    };
    
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Beacon Tracking Test Suite</h1>
        <p className="text-muted-foreground">
          Test all aspects of the beacon tracking implementation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Test Configuration
            </CardTitle>
            <CardDescription>
              Configure test parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emailId">Email ID</Label>
              <Input
                id="emailId"
                value={testData.emailId}
                onChange={(e) => setTestData(prev => ({ ...prev, emailId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={testData.recipientEmail}
                onChange={(e) => setTestData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="companyId">Company ID</Label>
              <Input
                id="companyId"
                value={testData.companyId}
                onChange={(e) => setTestData(prev => ({ ...prev, companyId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="senderUserId">Sender User ID</Label>
              <Input
                id="senderUserId"
                value={testData.senderUserId}
                onChange={(e) => setTestData(prev => ({ ...prev, senderUserId: e.target.value }))}
              />
            </div>
            
            <Separator />
            
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>
              Real-time test execution results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tests run yet. Click "Run All Tests" to begin.
              </p>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current browser and system details that will be tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Browser:</strong> {getBrowserName()}
            </div>
            <div>
              <strong>OS:</strong> {getOSName()}
            </div>
            <div>
              <strong>Screen:</strong> {screen.width}x{screen.height}
            </div>
            <div>
              <strong>Language:</strong> {navigator.language}
            </div>
            <div>
              <strong>Timezone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
            <div>
              <strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Cookies:</strong> {navigator.cookieEnabled ? 'Enabled' : 'Disabled'}
            </div>
            <div>
              <strong>Device:</strong> {/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
