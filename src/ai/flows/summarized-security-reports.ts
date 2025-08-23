'use server';

/**
 * @fileOverview A flow that generates summarized security reports in human-readable language using Gemini.
 *
 * - generateSecurityReport - A function that generates the security report.
 */

import {ai} from '@/ai/genkit';
import { GenerateSecurityReportInputSchema, GenerateSecurityReportOutputSchema, type GenerateSecurityReportInput, type GenerateSecurityReportOutput } from '@/ai/types/summarized-security-reports-types';

export async function generateSecurityReport(input: GenerateSecurityReportInput): Promise<GenerateSecurityReportOutput> {
  return generateSecurityReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'securityReportPrompt',
  input: {schema: GenerateSecurityReportInputSchema},
  output: {schema: GenerateSecurityReportOutputSchema},
  prompt: `You are a security analyst tasked with summarizing security logs into a human-readable report.

  The report should be concise and highlight any potential security risks or suspicious activities. It should include the number of successful vs. failed access attempts and the number of regular vs. suspicious email opens.

  Report Type: {{{reportType}}}
  Raw Logs: {{{rawLogs}}}

  Summary:`,
});

const generateSecurityReportFlow = ai.defineFlow(
  {
    name: 'generateSecurityReportFlow',
    inputSchema: GenerateSecurityReportInputSchema,
    outputSchema: GenerateSecurityReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
