'use client';

import { useForm, useWatch, type SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Loader2, Building2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { registerInitial } from '@/actions/register';
import { RegisterSchema } from '@/schemas/register';
import { checkPasswordRequirements } from '@/utils/checkPassword';
import Link from 'next/link';

const RegisterForm = () => {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      password: '',
      terms: false
    }
  });

  const password = useWatch({ control: form.control, name: 'password' });
  const requirements = checkPasswordRequirements(password || '');

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    startTransition(async () => {
      setError(null);
      const result = await registerInitial(values);
      if (!result.success || !result.data) {
        toast.error(result.message, { position: 'top-center' });
      } else if (result.data.userId) {
        router.push(`/auth/check-email?email=${result.data.email}`);
      }
    });
  };

  const onError: SubmitErrorHandler<z.infer<typeof RegisterSchema>> = (errors) => {
    const errorMessages = Object.entries(errors).map(([field, error]) => (
      <li key={field}>{error.message || `Invalid ${field}`}</li>
    ));
    setError(errorMessages);

    // toast.dismiss();
    // toast.error('Please fix the following errors:', {
    //   position: 'top-center',
    //   description: <ul className="list-disc ml-4 space-y-1">{errorMessages}</ul>,
    //   closeButton: true,
    //   duration: Number.POSITIVE_INFINITY
    // });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-4"
      >
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <ul className="list-disc ml-4 space-y-1">{error}</ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      placeholder="John"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company name (optional)</FormLabel>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    placeholder="Acme Inc."
                    className="pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    className="pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password requirements indicator */}
        {password && (
          <div className="space-y-1.5 p-3 bg-muted rounded-lg text-xs">
            <div
              className={`flex items-center gap-2 ${
                requirements.minLength ? 'text-success' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  requirements.minLength ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
              At least 8 characters
            </div>
            <div
              className={`flex items-center gap-2 ${
                requirements.hasUppercase ? 'text-success' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  requirements.hasUppercase ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
              One uppercase letter
            </div>
            <div
              className={`flex items-center gap-2 ${
                requirements.hasLowercase ? 'text-success' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  requirements.hasLowercase ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
              One lowercase letter
            </div>
            <div
              className={`flex items-center gap-2 ${
                requirements.hasNumber ? 'text-success' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  requirements.hasNumber ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
              One number
            </div>
            <div
              className={`flex items-center gap-2 ${
                requirements.hasSpecial ? 'text-success' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  requirements.hasSpecial ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
              One special character
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer flex flex-row gap-1">
                  <div>I agree to the</div>
                  <Link
                    href="/terms"
                    className="text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  <div>and</div>
                  <Link
                    href="/privacy"
                    className="text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </FormLabel>
                <FormMessage />
              </div>
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
