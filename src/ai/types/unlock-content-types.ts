import { z } from 'zod';

export const VerifyPinInputSchema = z.object({
  token: z.string().describe('The secure token from the URL.'),
  pin: z.string().length(6).describe('The 6-digit PIN entered by the user.'),
});
export type VerifyPinInput = z.infer<typeof VerifyPinInputSchema>;

export const VerifyPinOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  document: z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string(),
    imageHint: z.string(),
    attachmentFilename: z.string().optional(),
    attachmentDataUri: z.string().optional(),
  }).optional(),
});
export type VerifyPinOutput = z.infer<typeof VerifyPinOutputSchema>;
