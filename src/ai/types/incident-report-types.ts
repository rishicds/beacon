import { z } from 'zod';

export const GenerateIncidentReportInputSchema = z.object({
  eventType: z.string().describe('The type of security event that occurred.'),
  recipientEmail: z.string().email().describe('The email address of the user involved in the event.'),
  logs: z.string().describe('A stringified JSON array of relevant logs.'),
});
export type GenerateIncidentReportInput = z.infer<typeof GenerateIncidentReportInputSchema>;

export const GenerateIncidentReportOutputSchema = z.object({
  report: z.string().describe('The full, detailed incident report in Markdown format.'),
});
export type GenerateIncidentReportOutput = z.infer<typeof GenerateIncidentReportOutputSchema>;
