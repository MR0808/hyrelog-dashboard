'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { resendVerificationEmail, verifyCodeAction } from '@/actions/emails';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { otpSchema, type OtpFormData } from '@/schemas/emails';

export default function VerifyCodeClient({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: defaultEmail,
      otp: ''
    }
  });

  async function onSubmit(data: OtpFormData) {
    setError(null);
    startTransition(async () => {
      const result = await verifyCodeAction({ email, code: data.otp });

      if (result.success) {
        router.replace('/');
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    });
  }

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormControl>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="w-12 h-12 text-lg"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-12 h-12 text-lg"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-12 h-12 text-lg"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="w-12 h-12 text-lg"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-12 h-12 text-lg"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-12 h-12 text-lg"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-600 text-white"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify code'
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">{"Didn't"} receive the code?</p>
          <Button
            type="button"
            variant="ghost"
            onClick={onResend}
            disabled={!canResend}
            className="text-sm text-brand-500 hover:text-brand-600"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : cooldown > 0 ? (
              `Resend email (${cooldown}s)`
            ) : (
              'Resend email'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
