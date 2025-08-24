'use server';

/**
 * @fileOverview A natural language query processing AI agent for admin dashboard.
 *
 * - processQuery - A function that handles the natural language query processing.
 */

import {ai} from '@/ai/genkit';
import { NaturalLanguageAdminQueriesInputSchema, NaturalLanguageAdminQueriesOutputSchema, type NaturalLanguageAdminQueriesInput, type NaturalLanguageAdminQueriesOutput } from '@/ai/types/natural-language-admin-queries-types';
import { data, type User } from '@/lib/data';
import { serverDatabases, DATABASE_ID, BEACON_COLLECTION_ID, type BeaconData } from '@/lib/appwrite';


export async function processQuery(input: NaturalLanguageAdminQueriesInput & { user?: User }): Promise<NaturalLanguageAdminQueriesOutput> {
  // If user is company_admin, restrict queries to their company
  let companyId: string | undefined = undefined;
  if (input.user && input.user.role === 'company_admin') {
    companyId = input.user.companyId;
  }

  // Run the LLM prompt to get the filter
  const aiResult = await naturalLanguageAdminQueriesFlow(input);
  let filter: any = {};
  try {
    filter = JSON.parse(aiResult.jsonFilter);
  } catch (e) {
    // fallback: no filter
    filter = {};
  }

  // Determine which collection to query based on filter keys
  let results: any[] = [];
  let suspiciousEmails: any[] = [];
  let suspiciousReasons: Record<string, string[]> = {};

  if (filter && filter._collection === 'emails') {
    results = await data.emails.list(companyId ? { companyId } : undefined);
    // Optionally apply further filtering here
  } else if (filter && filter._collection === 'users') {
    results = companyId ? await data.users.findByCompany(companyId) : await data.users.list();
  } else if (filter && filter._collection === 'companies') {
    results = companyId ? [await data.companies.findById(companyId)] : await data.companies.list();
  } else if (filter && filter._collection === 'accessLogs') {
    results = await data.accessLogs.list(companyId ? { companyId } : undefined);
  } else if (filter && filter._collection === 'beaconLogs') {
    // Fetch from Firebase
    results = await data.beaconLogs.list(companyId ? { companyId } : undefined);
    // Fetch from Appwrite beacon_logs as well
    try {
      const appwriteLogs = await serverDatabases.listDocuments(
        DATABASE_ID,
        BEACON_COLLECTION_ID,
        companyId ? [
          // Appwrite Query.equal('companyId', companyId)
          { attribute: 'companyId', operator: 'equal', value: companyId }
        ] : []
      );
      if (appwriteLogs && appwriteLogs.documents) {
        results = results.concat(appwriteLogs.documents);
      }
      // Parse for suspicious emails
      const emailLogs: Record<string, BeaconData[]> = {};
      for (const log of results) {
        if (!log.emailId) continue;
        if (!emailLogs[log.emailId]) emailLogs[log.emailId] = [];
        emailLogs[log.emailId].push(log);
      }
      for (const [emailId, logs] of Object.entries(emailLogs)) {
        // Check for suspicious: multiple IPs, devices, or user agents
        const ips = new Set(logs.map(l => l.ip).filter(Boolean));
        const devices = new Set(logs.map(l => l.device).filter(Boolean));
        const userAgents = new Set(logs.map(l => l.userAgent).filter(Boolean));
        const reasons: string[] = [];
        if (ips.size > 1) reasons.push('Opened from multiple IP addresses');
        if (devices.size > 1) reasons.push('Opened from multiple device types');
        if (userAgents.size > 1) reasons.push('Opened from multiple user agents');
        if (reasons.length > 0) {
          suspiciousEmails.push(emailId);
          suspiciousReasons[emailId] = reasons;
        }
      }
    } catch (e) {
      // Ignore Appwrite errors, just use Firebase logs
    }
  }

  // If the query is about suspicious emails, return them with reasons
  if (filter && filter._suspiciousEmails) {
    if (suspiciousEmails.length === 0) {
      return {
        ...aiResult,
        results: JSON.stringify([]),
        summary: 'No suspicious emails found.'
      };
    }
    return {
      ...aiResult,
      results: JSON.stringify(suspiciousEmails.map(emailId => ({ emailId, reasons: suspiciousReasons[emailId] })) ),
      summary: `Suspicious emails: ${suspiciousEmails.map(eid => `${eid} (${suspiciousReasons[eid].join('; ')})`).join(', ')}`
    };
  }

  // Stringify results for output
  const resultsString = JSON.stringify(results);

  return {
    ...aiResult,
    results: resultsString,
  };
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageAdminQueriesPrompt',
  input: {schema: NaturalLanguageAdminQueriesInputSchema},
  output: {schema: NaturalLanguageAdminQueriesOutputSchema},
  prompt: `You are an expert in translating natural language queries into SQL-like queries for a document database.
You CANNOT perform joins or relational queries. You must query each table individually.
You can only filter on the data available in the provided schema. Do not invent fields.
When asked about activity, you should look at both access_logs and beacon_logs.
'Suspicious' status is only available in 'beacon_logs'.
'Failed' status is only available in 'access_logs'.
When asked for a user, you should use the user's name or email.

You will receive a natural language query from the admin, along with the database schema.

Your task is to:
1.  Analyze the natural language query.
2.  Determine which table to query (emails, access_logs, or beacon_logs). You can only query one table at a time.
3.  Generate a filter object in JSON format to query the data.
4.  Based on the data, formulate a natural language response.
5.  Return the JSON filter, the data you found, and the natural language response.

Here is the database schema:
{{{dbSchema}}}

Here is the natural language query:
{{{query}}}

Translate the query into a JSON filter, find the relevant data, and generate a natural language summary of the results.
`,
});

const naturalLanguageAdminQueriesFlow = ai.defineFlow(
  {
    name: 'naturalLanguageAdminQueriesFlow',
    inputSchema: NaturalLanguageAdminQueriesInputSchema,
    outputSchema: NaturalLanguageAdminQueriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
