
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LockKeyhole, ShieldCheck, ShieldX, Paperclip, Download, Hourglass, MapPin } from "lucide-react";
import GuardianMailLogo from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { verifyPinAndGetContent } from "@/ai/flows/unlock-content-flow";
import type { VerifyPinOutput } from "@/ai/types/unlock-content-types";
import { Skeleton } from "@/components/ui/skeleton";
import { data, type Email } from "@/lib/data";
import { Timestamp } from "firebase/firestore";
import { BeaconService } from "@/lib/beacon-service";
import { trackPageView } from "@/lib/tracking-utils";

function UnlockedContentDisplay({ document }: { document: NonNullable<VerifyPinOutput['document']> }) {
  return (
    <div className="flex flex-col items-center w-full">
      <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 bg-gradient-to-br from-white via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 relative">
        <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 text-xs font-semibold shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Access Granted
          </span>
        </div>
        <CardContent className="space-y-6 px-0 pb-8 pt-8">
          <h3 className="font-semibold text-2xl text-primary mb-2 text-center">{document.title}</h3>
          <div
            className="prose dark:prose-invert text-base leading-relaxed bg-white/80 dark:bg-slate-900/60 rounded-lg p-6 shadow mx-auto"
            style={{ width: '100%', maxWidth: '100%' }}
            dangerouslySetInnerHTML={{ __html: document.description }}
          />
          {document.imageUrl && document.imageUrl.trim() && document.imageUrl !== 'about:blank' && !/800x600/.test(document.imageUrl) ? (
            <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden border shadow-lg bg-white dark:bg-slate-900">
              <Image
                src={document.imageUrl}
                alt="Secure document"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }}
                data-ai-hint={document.imageHint}
                className="transition-all duration-300 hover:scale-105"
                priority
              />
            </div>
          ) : null}
          {document.attachmentFilename && document.attachmentDataUri && (
            <a
              href={document.attachmentDataUri}
              download={document.attachmentFilename}
              className="block mt-6"
            >
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Attachment: {document.attachmentFilename}
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SecureLinkPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [unlockedContent, setUnlockedContent] = useState<VerifyPinOutput['document'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailMeta, setEmailMeta] = useState<Email | null>(null);
  const [requiresPin, setRequiresPin] = useState<boolean>(true);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const params = useParams();
  const token = params.token as string;

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setError("Invalid link. No token provided.");
        setIsLoading(false);
        return;
      }
      try {
        const email = await data.emails.findByToken(token);
        if (!email) {
          setError("Invalid or expired link.");
          setIsLoading(false);
          return;
        }
        if (email.revoked) {
          setError("This secure link has been revoked by the sender.");
          setIsLoading(false);
          return;
        }
        if (email.expiresAt && (email.expiresAt as Timestamp).toDate() < new Date()) {
          setError("This secure link has expired.");
          setIsLoading(false);
          return;
        }

        setEmailMeta(email);

        // Track email access attempt with beacon (every time the page is loaded)
        try {
          await trackPageView(
            email.id, 
            email.recipient, 
            email.companyId, 
            email.senderId
          );
          console.log('Email access tracked successfully');
        } catch (error) {
          console.error('Failed to track email access:', error);
        }

        if (email.isGuest) {
          // For guests, bypass PIN and unlock content directly
          const result = await verifyPinAndGetContent({ token, pin: "GUEST_ACCESS" });
          if (result.success) {
            setUnlockedContent(result.document ?? null);
          } else {
            setError(result.error || "Could not retrieve guest content.");
          }
        } else {
          // Check if recipient is in the database to determine if PIN is required
          const allUsers = await data.users.list();
          const recipientInDb = allUsers.find(user => user.email === email.recipient);
          
          if (!recipientInDb) {
            // Recipient not in database - require location but no PIN
            setRequiresPin(false);
            if (locationPermissionGranted) {
              const result = await verifyPinAndGetContent({ token, pin: "" });
              if (result.success) {
                setUnlockedContent(result.document ?? null);
              } else {
                setError(result.error || "Could not retrieve content.");
              }
            }
          } else if (!recipientInDb.pinHash) {
            // Recipient exists but hasn't set PIN
            setError("You need to set up your PIN before accessing secure content. Please contact your administrator.");
          } else {
            // Recipient exists and has PIN - require PIN verification and location
            setRequiresPin(true);
          }
        }
      } catch (err) {
        setError("An unexpected error occurred while verifying the link.");
      } finally {
        setIsLoading(false);
      }
    }
    checkToken();
  }, [token, locationPermissionGranted, userLocation]);

  // Request location permission
  const requestLocationPermission = async () => {
    setIsRequestingLocation(true);
    setError("");
    
    try {
      const position = await BeaconService.getLocationWithPermission();
      setUserLocation(position);
      setLocationPermissionGranted(true);
      setError("");
    } catch (error: any) {
      setError(error.message || "Location access is required to view secure content.");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setIsLoading(true);
    try {
      const result = await verifyPinAndGetContent({ token, pin });
      if (result.success) {
        setUnlockedContent(result.document ?? null);
        // Track successful PIN entry with additional tracking
        try {
          await trackPageView(
            emailMeta!.id, 
            emailMeta!.recipient, 
            emailMeta!.companyId, 
            emailMeta!.senderId
          );
          console.log('Successful PIN entry tracked');
        } catch (error) {
          console.error('Failed to track successful PIN entry:', error);
        }
        window.dispatchEvent(new Event('refresh-logs'));
      } else {
        setError(result.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError("Failed to verify PIN. Please try again later.");
    } finally {
      setIsLoading(false);
      setPin("");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-96 w-full max-w-sm" />;
    }

    if (error) {
       return (
         <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                     <Hourglass className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
         </Card>
       )
    }

    if (unlockedContent) {
      return <UnlockedContentDisplay document={unlockedContent} />;
    }
    
    // Show location permission request if not granted and not guest
    if (emailMeta && !emailMeta.isGuest && !locationPermissionGranted) {
      return (
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <MapPin className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl">Location Required</CardTitle>
            <CardDescription>
              For security purposes, this secure document requires location access to verify your identity and track access attempts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <ShieldX className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            <Button 
              onClick={requestLocationPermission} 
              className="w-full" 
              disabled={isRequestingLocation}
            >
              {isRequestingLocation ? 'Requesting Location...' : 'Grant Location Access'}
            </Button>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground">
            <p>Your location data is used only for security monitoring and will not be stored permanently.</p>
          </CardFooter>
        </Card>
      );
    }
    
    if (emailMeta && !emailMeta.isGuest && requiresPin) {
      return (
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LockKeyhole className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Secure Access</CardTitle>
            <CardDescription>Enter your 6-digit PIN to view the protected content.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">6-Digit PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  placeholder="••••••"
                  className="text-center text-2xl tracking-[0.5em]"
                  required
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <ShieldX className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || !pin || pin.length < 6}>
                {isLoading ? 'Verifying...' : 'Unlock Content'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground">
            <p>This link is secure and tracked. Do not share the PIN.</p>
          </CardFooter>
        </Card>
      );
    }
    
    if (emailMeta && !emailMeta.isGuest && !requiresPin) {
      // This case should not be reached as non-database recipients are handled automatically
      return (
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Loading Content</CardTitle>
            <CardDescription>Accessing your secure content...</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    
    return null; // Should not be reached if logic is correct
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-8 flex items-center gap-2">
        <GuardianMailLogo className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-foreground">BeaconMail</span>
      </div>
      {renderContent()}
    </div>
  );
}
