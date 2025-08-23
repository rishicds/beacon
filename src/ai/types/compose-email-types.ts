
import { z } from 'zod';

export const ComposeEmailInputSchema = z.object({
  recipient: z.string().email().describe('The email address of the recipient.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The body of the email (can contain HTML).'),
  attachmentDataUri: z.string().optional().describe("A file attachment as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  attachmentFilename: z.string().optional().describe('The name of the attachment file.'),
  companyId: z.string().describe('The ID of the company sending the email.'),
  senderId: z.string().describe('The ID of the user sending the email.'),
  linkExpires: z.boolean().describe('Whether the secure link should expire in 7 days.'),
  isGuest: z.boolean().describe('Whether the recipient is an external guest.'),
});
export type ComposeEmailInput = z.infer<typeof ComposeEmailInputSchema>;

export const ComposeEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  secureLink: z.string().optional(),
});
export type ComposeEmailOutput = z.infer<typeof ComposeEmailOutputSchema>;
