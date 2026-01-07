/**
 * Email Sending Utility
 * 
 * Sends emails using Resend (production) or logs to console (dev mode).
 * Environment-driven configuration.
 */

import { render } from '@react-email/render';
import { Resend } from 'resend';
import { logger } from '../logger';

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@hyrelog.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'HyreLog';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3001';

// Initialize Resend client if API key is provided
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

/**
 * Send an email
 * 
 * In development without RESEND_API_KEY, logs the email payload and link to console.
 * In production with RESEND_API_KEY, sends via Resend.
 */
export async function sendEmail({ to, subject, react }: EmailOptions): Promise<void> {
  if (!resend) {
    // Dev mode: log email to console
    const html = await render(react);
    const text = await render(react, { plainText: true });
    
    logger.log('='.repeat(80));
    logger.log(`📧 EMAIL (DEV MODE - Not Sent)`);
    logger.log(`To: ${to}`);
    logger.log(`Subject: ${subject}`);
    logger.log(`HTML Preview:`, html.substring(0, 500) + '...');
    logger.log(`Text Preview:`, text.substring(0, 500) + '...');
    
    // Extract links from HTML for easy testing
    const linkMatches = html.match(/href="([^"]+)"/g);
    if (linkMatches) {
      logger.log(`\n🔗 Links in email:`);
      linkMatches.forEach((match) => {
        const url = match.replace(/href="|"/g, '');
        logger.log(`   ${url}`);
      });
    }
    logger.log('='.repeat(80));
    return;
  }

  // Production: send via Resend
  try {
    const html = await render(react);
    const text = await render(react, { plainText: true });

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      logger.error('[Email] Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logger.log(`[Email] Sent email to ${to} (ID: ${data?.id})`);
  } catch (error) {
    logger.error('[Email] Exception sending email:', error);
    throw error;
  }
}

/**
 * Get the base URL for email links
 */
export function getEmailBaseUrl(): string {
  return BASE_URL;
}
