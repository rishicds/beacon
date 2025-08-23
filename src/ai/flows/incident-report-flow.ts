
'use server';

/**
 * @fileOverview A flow that generates an automated incident report for security events.
 *
 * - generateIncidentReport - A function that generates the incident report.
 */

import { ai } from '@/ai/genkit';
import { GenerateIncidentReportInputSchema, GenerateIncidentReportOutputSchema, type GenerateIncidentReportInput, type GenerateIncidentReportOutput } from '@/ai/types/incident-report-types';
import { data } from '@/lib/data';

export async function generateIncidentReport(input: GenerateIncidentReportInput): Promise<GenerateIncidentReportOutput> {
  return generateIncidentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'incidentReportPrompt',
  input: { schema: GenerateIncidentReportInputSchema },
  output: { schema: GenerateIncidentReportOutputSchema },
  prompt: `You are a senior security analyst responsible for creating incident reports.
  
  A security event has occurred which requires a formal report. Analyze the provided event data and generate a clear, concise, and actionable incident report.

  The report must contain:
  1.  A summary of the event.
  2.  A timeline of the logged actions.
  3.  An analysis of the potential risk (e.g., brute-force attack, phishing attempt).
  4.  A list of recommended immediate actions (e.g., revoke link, contact user).

  Event Data:
  - Event Type: {{{eventType}}}
  - Recipient Email: {{{recipientEmail}}}
  - Associated Logs:
  {{{logs}}}

  Generate the report.`,
});

const generateIncidentReportFlow = ai.defineFlow(
  {
    name: 'generateIncidentReportFlow',
    inputSchema: GenerateIncidentReportInputSchema,
    outputSchema: GenerateIncidentReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
