"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight, Bot, Sparkles } from "lucide-react";

import { processQuery } from "@/ai/flows/natural-language-admin-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "../ui/skeleton";

// This is a simplified representation of the DB schema for the AI model
const dbSchema = `
  // In-memory array of objects, not a SQL database.
  // You can only filter on these fields for each type.
  // No SQL queries, only JSON-based filtering.

  interface Email {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    secureLinkToken: string;
    pin: string;
    createdAt: string;
  }

  interface AccessLog {
    id: string;
    emailId: string;
    user: string;
    email: string;
    ip: string;
    device: string;
    timestamp: string;
    status: 'Success' | 'Failed';
  }

  interface BeaconLog {
    id: string;
    emailId: string;
    email: string;
    ip: string;
    device: string;
    timestamp: string;
    status: 'Opened' | 'Suspicious';
  }
`;

const initialState = {
  jsonFilter: "",
  results: "",
  summary: "",
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="icon" className="absolute right-1 top-1 h-8 w-8 bg-accent hover:bg-accent/90">
      {pending ? <Sparkles className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
    </Button>
  );
}

export default function NaturalLanguageQuery() {
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    const query = formData.get("query") as string;
    if (!query) {
      return { ...initialState, error: "Please enter a query." };
    }
    try {
        const result = await processQuery({ query, dbSchema });
        return { ...result, error: null };
    } catch (e) {
        return { ...initialState, error: "An error occurred. Please try again." }
    }
  }, initialState);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-accent" />
          Natural Language Query
        </CardTitle>
        <CardDescription>
          Ask a question about your security data in plain English.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="relative">
            <Input
              name="query"
              placeholder="e.g., 'Show me all suspicious activity this week'"
              className="pr-12"
            />
            <SubmitButton />
          </div>
        </form>
        {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
        
        {(state.summary) && (
          <div className="mt-4 space-y-4 rounded-lg border bg-secondary/50 p-4 text-sm">
             <h4 className="font-semibold">AI Response:</h4>
             <p>{state.summary}</p>
          </div>
        )}

        {useFormStatus().pending && !state.summary && (
          <div className="mt-4 space-y-4 rounded-lg border bg-secondary/50 p-4 text-sm">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
