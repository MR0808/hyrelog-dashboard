'use client';

import React from 'react';
import { useTransition } from 'react';
import { resendVerificationAction } from '@/app/actions/email-verification';
import { clientLogger } from '@/lib/logger';

export default function VerifyEmailSentPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = React.useState<string>('');

  const handleResend = () => {
    setMessage('');
    startTransition(async () => {
      const result = await resendVerificationAction();
      if (result.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            We've sent a verification email to your inbox. Please click the link in the email to
            verify your account.
          </p>
          <p className="text-sm text-gray-500">
            Email verification is required before you can create API keys or send events.
          </p>
          <p className="text-sm text-gray-500">
            The verification link will expire in 24 hours.
          </p>
          {message && (
            <div
              className={`p-3 rounded ${
                message.includes('sent')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}
          <button
            onClick={handleResend}
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Resend verification email'}
          </button>
        </div>
      </div>
    </div>
  );
}
