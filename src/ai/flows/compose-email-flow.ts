'use server';

/**
 * @fileOverview A flow to compose and send a secure email.
 * This flow generates a secure link and sends it to the recipient
 * using an SMTP service, secured by the sender's PIN.
 */

import { ai } from '@/ai/genkit';
import { randomBytes } from 'crypto';
import { data } from '@/lib/data';
import {
  ComposeEmailInputSchema,
  ComposeEmailOutputSchema,
  type ComposeEmailInput,
  type ComposeEmailOutput,
} from '@/ai/types/compose-email-types';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { Timestamp } from 'firebase/firestore';

config(); // Load environment variables

// ------------------- Flow -------------------
const composeEmailFlow = ai.defineFlow({
    name: 'composeEmailFlow',
    inputSchema: ComposeEmailInputSchema,
    outputSchema: ComposeEmailOutputSchema,
  },
  async (input: ComposeEmailInput): Promise<ComposeEmailOutput> => {
    try {
      const isSystemEmail = input.senderId === 'SYSTEM';
      const token = randomBytes(16).toString('hex');
      const now = new Date();

      if (input.isGuest) {
        // ---------- Guest Workflow ----------
        const guestExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
        const emailData = {
          recipient: input.recipient,
          subject: input.subject,
          body: input.body,
          secureLinkToken: token,
          companyId: input.companyId,
          senderId: input.senderId,
          expiresAt: Timestamp.fromDate(guestExpiresAt),
          isGuest: true,
          ...(input.attachmentDataUri && { attachmentDataUri: input.attachmentDataUri }),
          ...(input.attachmentFilename && { attachmentFilename: input.attachmentFilename }),
        };

        const email = await data.emails.create(emailData);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        const secureLink = `${baseUrl}/secure/${token}`;
        const beaconUrl = `${baseUrl}/api/beacon?emailId=${email.id}&recipientEmail=${encodeURIComponent(
          input.recipient,
        )}&companyId=${encodeURIComponent(input.companyId)}&senderUserId=${encodeURIComponent(input.senderId)}`;

        const emailHtml = `
          <h1>You've received a secure document</h1>
          <p>You have been sent a secure document with the subject: <strong>${input.subject}</strong></p>
          <p>You can view the document by clicking the secure link below. This link will expire in 24 hours.</p>
          <p><strong>Secure Link:</strong> <a href="${secureLink}">${secureLink}</a></p>
          <br/>
          <p><strong>Important:</strong> Click the secure link above to access the confidential content.</p>
        `;

        await sendEmail(
          input.recipient,
          `[Secure] ${input.subject}`,
          emailHtml,
          input.attachmentDataUri,
          input.attachmentFilename,
        );

        return {
          success: true,
          message: 'Secure guest email has been sent successfully.',
          secureLink: `/secure/${token}`,
        };
      }

      if (!isSystemEmail) {
        // ---------- Regular Employee Workflow ----------
        const sender = await data.users.findById(input.senderId);
        if (!sender || !sender.pinSet) {
          return {
            success: false,
            message: 'PIN not set. Please set your PIN in your profile before sending an email.',
          };
        }

        const emailData = {
          recipient: input.recipient,
          subject: input.subject,
          body: input.body,
          secureLinkToken: token,
          companyId: input.companyId,
          senderId: input.senderId,
          expiresAt: input.linkExpires
            ? Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))
            : null,
          isGuest: false,
          ...(input.attachmentDataUri && { attachmentDataUri: input.attachmentDataUri }),
          ...(input.attachmentFilename && { attachmentFilename: input.attachmentFilename }),
        };

        const email = await data.emails.create(emailData);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        const secureLink = `${baseUrl}/secure/${token}`;
        const beaconUrl = `${baseUrl}/api/beacon?emailId=${email.id}&recipientEmail=${encodeURIComponent(
          input.recipient,
        )}&companyId=${encodeURIComponent(input.companyId)}&senderUserId=${encodeURIComponent(input.senderId)}`;

        const emailHtml = `
          <h1>You've received a secure document from ${sender.name}</h1>
          <p>You have been sent a secure document with the subject: <strong>${input.subject}</strong></p>
          <p>Please use the following link and your confidential PIN to access it.</p>
          <p><strong>Secure Link:</strong> <a href="${secureLink}">${secureLink}</a></p>
          <p><strong>Important:</strong> You will need to enter your confidential PIN after clicking the link.</p>
          <br/>
          <p><strong>Note:</strong> The confidential content will only be visible after clicking the secure link and entering your PIN.</p>
        `;

        await sendEmail(
          input.recipient,
          `[Secure] ${input.subject}`,
          emailHtml,
          input.attachmentDataUri,
          input.attachmentFilename,
        );

        return {
          success: true,
          message: 'Secure email has been sent successfully.',
          secureLink: `/secure/${token}`,
        };
      }

      // ---------- System Email Workflow ----------
      await sendEmail(input.recipient, input.subject, input.body);
      return {
        success: true,
        message: 'System email has been sent successfully.',
      };
    } catch (error) {
      console.error('Error in composeEmailFlow:', error);
      return {
        success: false,
        message: 'Failed to send secure email. Please check SMTP configuration.',
      };
    }
  },
);

// ------------------- Email Utility -------------------
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachmentDataUri?: string,
  attachmentFilename?: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: `GuardianMail <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html,
    attachments: attachmentDataUri
      ? [
          {
            filename: attachmentFilename || 'attachment',
            path: attachmentDataUri,
          },
        ]
      : [],
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to} via SMTP.`);
}

// ------------------- Export -------------------
export async function composeAndSendEmail(input: ComposeEmailInput): Promise<ComposeEmailOutput> {
  return composeEmailFlow(input) as Promise<ComposeEmailOutput>;
}
