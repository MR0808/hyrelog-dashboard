import { render } from '@react-email/render';
import { Resend } from 'resend';
import { WelcomeEmail } from '../emails/welcome';
import { PasswordResetEmail } from '../emails/password-reset';
import { AlertThresholdEmail } from '../emails/alert-threshold';
import { GdprRequestEmail } from '../emails/gdpr-request';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email sending function using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ RESEND_API_KEY not configured. Email would be sent to:', {
        to: options.to,
        subject: options.subject,
      });
      return;
    }
    throw new Error('RESEND_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@hyrelog.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        id: data?.id,
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(
  to: string,
  options: { userName?: string; loginUrl?: string }
): Promise<void> {
  const html = render(WelcomeEmail(options));
  const text = render(WelcomeEmail(options), { plainText: true });

  await sendEmail({
    to,
    subject: 'Welcome to HyreLog!',
    html,
    text,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  options: { resetUrl: string; userName?: string }
): Promise<void> {
  const html = render(PasswordResetEmail(options));
  const text = render(PasswordResetEmail(options), { plainText: true });

  await sendEmail({
    to,
    subject: 'Reset Your HyreLog Password',
    html,
    text,
  });
}

export async function sendAlertThresholdEmail(
  to: string,
  options: {
    companyName?: string;
    meterType?: string;
    currentUsage?: number;
    threshold?: number;
    thresholdType?: 'soft' | 'hard';
    dashboardUrl?: string;
  }
): Promise<void> {
  const html = render(AlertThresholdEmail(options));
  const text = render(AlertThresholdEmail(options), { plainText: true });

  await sendEmail({
    to,
    subject: `Usage Alert: ${options.companyName || 'Your company'} - ${options.meterType || 'EVENTS'}`,
    html,
    text,
  });
}

export async function sendGdprRequestEmail(
  to: string,
  options: {
    requestType?: 'DELETE' | 'ANONYMIZE';
    requestId?: string;
    status?: string;
    dashboardUrl?: string;
  }
): Promise<void> {
  const html = render(GdprRequestEmail(options));
  const text = render(GdprRequestEmail(options), { plainText: true });

  await sendEmail({
    to,
    subject: `GDPR ${options.requestType === 'DELETE' ? 'Deletion' : 'Anonymization'} Request ${options.status === 'DONE' ? 'Completed' : 'Update'}`,
    html,
    text,
  });
}

