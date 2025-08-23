
"use client";

import { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bold, Italic, Underline, Paperclip, X, Sparkles, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { composeAndSendEmail } from "@/ai/flows/compose-email-flow";
import GuardianMailLogo from "@/components/icons/logo";
import { useAuth } from "@/context/auth-context";
import AppHeader from "@/components/app-header";

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ComposePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [linkExpires, setLinkExpires] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    bodyRef.current?.focus();
  };
  
  const handleBodyChange = () => {
    if (bodyRef.current) {
        setBody(bodyRef.current.innerHTML);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `The selected file exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
        });
        return;
      }
      setAttachment(file);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !user.companyId) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in and part of a company to send emails.",
        });
        return;
    }
    if (!recipient || !subject || !body) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please fill out the recipient, subject, and body.",
        });
        return;
    }
    setIsLoading(true);

    let attachmentDataUri: string | undefined;
    if (attachment) {
        attachmentDataUri = await fileToDataUri(attachment);
    }

    try {
      const result = await composeAndSendEmail({ 
        recipient, 
        subject, 
        body,
        attachmentDataUri,
        attachmentFilename: attachment?.name,
        companyId: user.companyId,
        senderId: user.id,
        linkExpires,
        isGuest,
      });

      if (result.success) {
        toast({
          title: "Email Sent",
          description: result.message,
        });
        window.dispatchEvent(new Event('refresh-logs'));
        router.push(user.role === 'admin' ? '/admin' : '/company-dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!user) {
      return null;
  }
  
  const dashboardHref = user.role === 'admin' ? '/admin' : '/company-dashboard';

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
       <AppHeader />
       <main className="flex-1 p-4 sm:p-6">
        <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <Link href={dashboardHref} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Dashboard</span>
                </Link>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                    <Label htmlFor="recipient" className="text-right text-muted-foreground">
                      To
                    </Label>
                    <Input id="recipient" name="recipient" type="email" required placeholder="email@example.com" value={recipient} onChange={e => setRecipient(e.target.value)} className="border-0 border-b rounded-none shadow-none focus-visible:ring-0 focus:border-primary" />
                  </div>
                   <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                    <Label htmlFor="subject" className="text-right text-muted-foreground">
                      Subject
                    </Label>
                    <Input id="subject" name="subject" required placeholder="Confidential: Q2 Financial Report" value={subject} onChange={e => setSubject(e.target.value)} className="border-0 border-b rounded-none shadow-none focus-visible:ring-0 focus:border-primary"/>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] items-center gap-4 pt-2">
                    <div />
                     <div className="flex flex-col gap-3">
                         <div className="flex items-center space-x-2">
                            <Switch id="is-guest" checked={isGuest} onCheckedChange={setIsGuest} />
                            <Label htmlFor="is-guest" className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserCheck className="h-4 w-4" />
                                Guest Recipient <span className="text-xs">(PIN-less, 24-hour link)</span>
                            </Label>
                        </div>
                        {!isGuest && (
                             <div className="flex items-center space-x-2">
                                <Switch id="link-expires" checked={linkExpires} onCheckedChange={setLinkExpires} />
                                <Label htmlFor="link-expires" className="text-sm text-muted-foreground">Secure link will expire in 7 days</Label>
                            </div>
                        )}
                     </div>
                  </div>

                  <div className="border rounded-md mt-4">
                     <div className="p-2 border-b">
                         <div
                            ref={bodyRef}
                            contentEditable
                            onInput={handleBodyChange}
                            className="min-h-72 w-full rounded-md bg-transparent p-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                     </div>
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('bold')}><Bold className="h-4 w-4" /></Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('italic')}><Italic className="h-4 w-4" /></Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('underline')}><Underline className="h-4 w-4" /></Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        </div>
                        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                             {isLoading ? <Sparkles className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                             {isLoading ? 'Sending...' : 'Send Secure Email'}
                         </Button>
                      </div>
                  </div>

                  {attachment && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span>{attachment.name}</span>
                        <span className="text-muted-foreground">({(attachment.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setAttachment(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                  )}

              </form>
            </CardContent>
        </Card>
       </main>
    </div>
  );
}
