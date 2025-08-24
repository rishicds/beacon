
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bold, Italic, Underline, Paperclip, X, Sparkles, Send, UserCheck, ChevronDown, Check } from "lucide-react";
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
import { data, type User } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ComposePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [linkExpires, setLinkExpires] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await data.users.list();
        setUsers(allUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.id !== user?.id && // Don't show current user
    (u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
     u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setRecipient(selectedUser.email);
    setUserDropdownOpen(false);
    setUserSearchQuery("");
  };

  // allowUnknownRecipients removed; no handler needed
  
  const handleBodyChange = () => {
    if (bodyRef.current) {
        setBody(bodyRef.current.innerHTML);
    }
  }

  const handleFormat = (command: string) => {
    // execCommand is deprecated but used here for simple rich-text actions in the existing codebase
    // It keeps the existing UI behavior unchanged.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    document.execCommand(command, false);
    bodyRef.current?.focus();
  };

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
    
    // Enhanced debugging for authentication issues
    console.log('User object:', user);
    console.log('User companyId:', user?.companyId);
    console.log('User role:', user?.role);
    
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to send emails. Please sign in first.",
        });
        return;
    }
    
    // Admin users don't need a companyId, other roles do
    if (user.role !== 'admin' && !user.companyId) {
        toast({
            variant: "destructive",
            title: "Company Association Required",
            description: `Your account (${user.role}) is not associated with a company. Please contact your administrator.`,
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

    // Validate recipient
    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: "Invalid Recipient",
        description: "Please select a user from the database.",
      });
      return;
    }

    let attachmentDataUri: string | undefined = undefined;
    if (attachment) {
      attachmentDataUri = await fileToDataUri(attachment);
    }

    try {
      const emailData: any = {
        recipient,
        subject,
        body,
        companyId: user.companyId || 'ADMIN', // Use 'ADMIN' as fallback for admin users
        senderId: user.id,
        linkExpires,
        isGuest: false, // Always false as guest sending is removed
      };
      if (attachment && attachmentDataUri) {
        emailData.attachmentDataUri = attachmentDataUri;
        emailData.attachmentFilename = attachment.name;
      }

      const result = await composeAndSendEmail(emailData);

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
  
  if (loading) {
      return (
        <div className="flex min-h-screen flex-col bg-muted/40">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6">
            <Card className="max-w-4xl mx-auto shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      );
  }
  
  if (!user) {
      return (
        <div className="flex min-h-screen flex-col bg-muted/40">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6">
            <Card className="max-w-4xl mx-auto shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                  <p className="text-muted-foreground mb-4">You must be logged in to compose emails.</p>
                  <Button onClick={() => router.push('/login')}>Sign In</Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      );
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
                    <Popover open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={userDropdownOpen}
                          className="w-full justify-between border-0 border-b rounded-none shadow-none focus-visible:ring-0 hover:bg-transparent"
                        >
                          {selectedUser ? (
                            <span className="flex items-center gap-2">
                              <span>{selectedUser.name}</span>
                              <span className="text-muted-foreground text-sm">({selectedUser.email})</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Select a user...</span>
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <div className="p-2">
                          <Input
                            placeholder="Search users..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="mb-2"
                          />
                          <div className="max-h-60 overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                No users found
                              </div>
                            ) : (
                              filteredUsers.map((user) => (
                                <Button
                                  key={user.id}
                                  variant="ghost"
                                  className="w-full justify-start p-2 h-auto"
                                  onClick={() => handleUserSelect(user)}
                                >
                                  <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{user.name}</span>
                                      <span className="text-xs bg-muted px-1 rounded">
                                        {user.role}
                                      </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                  </div>
                                  {selectedUser?.id === user.id && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </Button>
                              ))
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                   <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                    <Label htmlFor="subject" className="text-right text-muted-foreground">
                      Subject
                    </Label>
                    <Input id="subject" name="subject" required placeholder="Confidential: Q2 Financial Report" value={subject} onChange={e => setSubject(e.target.value)} className="border-0 border-b rounded-none shadow-none focus-visible:ring-0 focus:border-primary"/>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] items-center gap-4 pt-2">
                    <div />
                    <div className="flex items-center space-x-2">
                      <Switch id="link-expires" checked={linkExpires} onCheckedChange={setLinkExpires} />
                      <Label htmlFor="link-expires" className="text-sm text-muted-foreground">Secure link will expire in 7 days</Label>
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