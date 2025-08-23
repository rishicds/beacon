
'use server';

/**
 * @fileOverview A flow to verify a PIN and unlock secure content.
 * 
 * - verifyPinAndGetContent - A function that handles the PIN verification.
 */

import { ai } from '@/ai/genkit';
import { data } from '@/lib/data';
import { VerifyPinInputSchema, VerifyPinOutputSchema, type VerifyPinInput, type VerifyPinOutput } from '@/ai/types/unlock-content-types';
import bcrypt from 'bcryptjs';
import { Timestamp } from 'firebase/firestore';
import { generateIncidentReport } from './incident-report-flow';

const FAILED_ATTEMPTS_THRESHOLD = 3;

export async function verifyPinAndGetContent(input: VerifyPinInput): Promise<VerifyPinOutput> {
  return verifyPinFlow(input);
}

const verifyPinFlow = ai.defineFlow(
  {
    name: 'verifyPinFlow',
    inputSchema: VerifyPinInputSchema,
    outputSchema: VerifyPinOutputSchema,
  },
  async ({ token, pin }) => {
    const email = await data.emails.findByToken(token);

    if (!email) {
      return { success: false, error: 'Invalid or expired link.' };
    }

    if (email.revoked) {
        return { success: false, error: 'This secure link has been revoked by the sender.' };
    }

    if (email.expiresAt && (email.expiresAt as Timestamp).toDate() < new Date()) {
      return { success: false, error: 'This secure link has expired.' };
    }

    // Guest access bypass
    if (email.isGuest) {
      if (pin === 'GUEST_ACCESS') {
         return {
            success: true,
            document: {
              title: `Confidential Document: ${email.subject}`,
              description: email.body,
              imageUrl: 'https://placehold.co/800x600.png',
              imageHint: 'confidential document',
              attachmentFilename: email.attachmentFilename,
              attachmentDataUri: email.attachmentDataUri,
            },
          };
      } else {
        return { success: false, error: 'Invalid guest access attempt.'}
      }
    }

    const sender = await data.users.findById(email.senderId);
    if (!sender || !sender.pinHash) {
        return { success: false, error: 'Could not identify the sender or sender has not set a PIN.'}
    }
    
    const logDetails = {
      emailId: email.id,
      user: email.recipient.split('@')[0],
      email: email.recipient,
      ip: '127.0.0.1', // Placeholder IP
      device: 'Chrome on macOS', // Placeholder device
      companyId: email.companyId,
    };

    const isPinValid = await bcrypt.compare(pin, sender.pinHash);

    if (isPinValid) {
      await data.accessLogs.create({
        ...logDetails,
        status: 'Success',
      });
      return {
        success: true,
        document: {
          title: `Confidential Document: ${email.subject}`,
          description: email.body,
          imageUrl: 'https://placehold.co/800x600.png',
          imageHint: 'financial report',
          attachmentFilename: email.attachmentFilename,
          attachmentDataUri: email.attachmentDataUri,
        },
      };
    } else {
        await data.accessLogs.create({
            ...logDetails,
            status: 'Failed',
        });
        
        const failedAttempts = await data.accessLogs.countFailedAttempts(email.id);

        if (failedAttempts >= FAILED_ATTEMPTS_THRESHOLD) {
            const alertExists = await data.alerts.checkExisting(email.id, 'Multiple Failed PINs');
            if (!alertExists) {
                const recentLogs = await data.accessLogs.getLogsForEmail(email.id, 10);
                const reportResult = await generateIncidentReport({
                    eventType: 'Multiple Failed PINs',
                    recipientEmail: email.recipient,
                    logs: JSON.stringify(recentLogs, null, 2),
                });
                
                await data.alerts.create({
                    companyId: email.companyId,
                    emailId: email.id,
                    recipientEmail: email.recipient,
                    type: 'Multiple Failed PINs',
                    message: `Multiple failed PIN attempts detected for a secure link sent to ${email.recipient}.`,
                    incidentReport: reportResult.report,
                });
            }
        }
        
      return { success: false, error: 'Invalid PIN. Please try again.' };
    }
  }
);
