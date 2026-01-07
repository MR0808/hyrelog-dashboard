'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { verifyEmailAction } from '@/app/actions/email-verification';
import { clientLogger } from '@/lib/logger';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('Missing verification token');
      return;
    }

    startTransition(async () => {
      const result = await verifyEmailAction(token);
      if (result.success) {
        setStatus('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setStatus('error');
        setError(result.error);
      }
    });
  }, [searchParams, router]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verifying your email...
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email verified!
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Your email has been successfully verified. You can now access all features of
              HyreLog.
            </p>
            <p className="text-sm text-gray-500 text-center">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verification failed
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/verify-email-sent')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Request new verification email
          </button>
        </div>
      </div>
    </div>
  );
}
