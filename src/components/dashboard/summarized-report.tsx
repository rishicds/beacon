
"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Sparkles, FileText, ClipboardList } from "lucide-react";
import { generateSecurityReport } from "@/ai/flows/summarized-security-reports";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { data } from "@/lib/data";
import { useAuth } from "@/context/auth-context";

const initialState = {
  summary: "",
  error: null,
};


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" /> Generate Report
        </>
      )}
    </Button>
  );
}

export default function SummarizedReport() {
    const { user } = useAuth();
    const [sampleLogs, setSampleLogs] = React.useState("");

    React.useEffect(() => {
        if(user) {
            const companyId = user.role === 'admin' ? undefined : user.companyId;
            data.getAllLogs(companyId).then(setSampleLogs);
        }
    }, [user])
    
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    const rawLogs = formData.get("rawLogs") as string;
    const reportType = (formData.get("reportType") as "daily" | "weekly") || "daily";

    if (!rawLogs) {
        return { ...initialState, error: "Please provide logs to summarize." };
    }

    try {
        const result = await generateSecurityReport({ rawLogs, reportType });
        return { ...result, error: null };
    } catch (e) {
        return { ...initialState, error: "An error occurred. Please try again." }
    }
  }, initialState);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            Summarized Security Report
        </CardTitle>
        <CardDescription>
          Get AI-powered daily or weekly security digests from live data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logs">Raw Logs (from live data)</Label>
            <Textarea
              id="logs"
              name="rawLogs"
              placeholder="Loading logs..."
              className="min-h-32 font-mono text-xs"
              value={sampleLogs}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select name="reportType" defaultValue="daily">
              <SelectTrigger id="reportType" className="w-full">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SubmitButton />
        </form>
        {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
        {state.summary && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Generated Summary
            </h4>
            <div className="rounded-lg border bg-secondary/50 p-4 text-sm text-foreground">
              <p className="whitespace-pre-wrap">{state.summary}</p>
            </div>
          </div>
        )}
        {useFormStatus().pending && !state.summary && (
            <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <div className="space-y-2 rounded-lg border bg-secondary/50 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
