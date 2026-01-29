// app/auth/check-email/check-email-client.tsx
'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';

import { resendVerificationEmail } from '@/actions/emails';
import { Button } from '@/components/ui/button';

export default function CheckEmailClient({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();

  const [cooldown, setCooldown] = useState<number>(60);
  const [status, setStatus] = useState<{ type: 'idle' | 'ok' | 'err'; message?: string }>({
    type: 'idle'
  });

  const canResend = useMemo(() => cooldown <= 0 && !isPending, [cooldown, isPending]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function onResend() {
    if (!email) {
      setStatus({ type: 'err', message: 'Missing email. Please go back and try again.' });
      return;
    }
    if (!canResend) return;

    setStatus({ type: 'idle' });

    startTransition(async () => {
      const res = await resendVerificationEmail({ email });

      if (res.success) {
        setStatus({ type: 'ok', message: 'Sent. Check your inbox.' });
        setCooldown(60); // restart 60s cooldown
      } else {
        setStatus({ type: 'err', message: res.message ?? 'Could not resend. Please try again.' });
        // If server says rate-limited, still enforce a short cooldown on UI
        setCooldown(Math.max(10, cooldown));
      }
    });
  }

  return (
    <>
      {status.type !== 'idle' && (
        <div
          className={`p-3 text-sm ${status.type === 'ok' ? 'text-success bg-success-subtle border-success/20' : 'text-white bg-destructive border-red-600/20'} border rounded-md text-center`}
        >
          {status.message}
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">{"Didn't receive the email?"}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResend}
          disabled={!canResend}
          className="text-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Sending…' : cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend email'}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <a
            href={
              email ? `/auth/verify-code?email=${encodeURIComponent(email)}` : '/auth/verify-code'
            }
            className="text-sm font-medium underline underline-offset-4"
          >
            Use a code instead
          </a>
        </div>
      </div>
    </>
  );
}
