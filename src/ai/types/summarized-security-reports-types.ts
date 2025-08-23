import { z } from 'zod';

export const GenerateSecurityReportInputSchema = z.object({
  rawLogs: z
    .string()
    .describe('The raw security logs to be summarized.'),
  reportType: z
    .enum(['daily', 'weekly'])
    .describe('The type of security report to generate (daily or weekly).'),
});
export type GenerateSecurityReportInput = z.infer<typeof GenerateSecurityReportInputSchema>;

export const GenerateSecurityReportOutputSchema = z.object({
  summary: z.string().describe('A human-readable summary of the security report.'),
});
export type GenerateSecurityReportOutput = z.infer<typeof GenerateSecurityReportOutputSchema>;
