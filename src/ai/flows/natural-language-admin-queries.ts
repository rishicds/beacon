'use server';

/**
 * @fileOverview A natural language query processing AI agent for admin dashboard.
 *
 * - processQuery - A function that handles the natural language query processing.
 */

import {ai} from '@/ai/genkit';
import { NaturalLanguageAdminQueriesInputSchema, NaturalLanguageAdminQueriesOutputSchema, type NaturalLanguageAdminQueriesInput, type NaturalLanguageAdminQueriesOutput } from '@/ai/types/natural-language-admin-queries-types';


export async function processQuery(input: NaturalLanguageAdminQueriesInput): Promise<NaturalLanguageAdminQueriesOutput> {
  return naturalLanguageAdminQueriesFlow(input);
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
