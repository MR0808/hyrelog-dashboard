import Image from 'next/image';
import { Mail } from 'lucide-react';

import CheckEmailClient from '@/components/auth/CheckEmailClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authCheckAuth } from '@/lib/authCheck';

export default async function CheckEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  await authCheckAuth();

  const { email } = await searchParams;
  const features = [
    'Complete audit trail visibility',
    'Real-time compliance monitoring',
    'Enterprise-grade security',
    'Unlimited team members'
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B0F14] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#121821] to-[#0B0F14]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Image
              src="/images/logoDark.png"
              alt="HyreLog"
              width={200}
              height={60}
              className="mb-8"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-[#E5EAF0] leading-tight text-balance">
              Check your inbox
            </h1>
            <p className="text-[#7B8794] text-lg leading-relaxed max-w-md">
              {"We've sent you a secure link to reset your password. The link expires in 24 hours."}
            </p>
          </div>
          <div className="text-[#7B8794] text-sm">© 2026 HyreLog. All rights reserved.</div>
        </div>
      </div>

      {/* Right Side - Confirmation */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Image
              src="/images/logoLight.png"
              alt="HyreLog"
              width={180}
              height={54}
            />
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="space-y-1 pb-4 text-center">
              <div className="mx-auto w-16 h-16 bg-ice-200 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-brand-500" />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Check your email
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We sent a password reset link to
                <br />
                <span className="font-medium text-foreground">{email || 'your email'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CheckEmailClient email={email || ''} />
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-ice-200 rounded-lg border border-ice-300">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">Tip:</span> If you {"don't"} see the
              email, check your spam folder or search for emails from{' '}
              <span className="font-medium">noreply@hyrelog.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
