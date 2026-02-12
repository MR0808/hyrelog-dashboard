'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { SearchableTimezonePicker } from '@/components/settings/SearchableTimezonePicker';
import { SearchableLocalePicker } from '@/components/settings/SearchableLocalePicker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileSchema, type ProfileFormData } from '@/schemas/settings';
import { updateProfile, uploadAvatar } from '@/actions/settings';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export type UserProfile = {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  firstName: string;
  lastName: string;
  name: string | null;
  image: string | null;
  jobTitle: string | null;
  bio: string | null;
  timezone: string | null;
  locale: string | null;
};

interface ProfileSectionProps {
  profile: UserProfile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.name ?? '',
      jobTitle: profile.jobTitle ?? '',
      bio: profile.bio ?? '',
      timezone: profile.timezone ?? 'America/New_York',
      locale: profile.locale ?? 'en-US'
    }
  });

  useEffect(() => {
    form.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.name ?? '',
      jobTitle: profile.jobTitle ?? '',
      bio: profile.bio ?? '',
      timezone: profile.timezone ?? 'America/New_York',
      locale: profile.locale ?? 'en-US'
    });
  }, [profile, form]);

  async function onSubmit(data: ProfileFormData) {
    setIsLoading(true);
    setSuccess(false);
    try {
      const result = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.displayName || undefined,
        jobTitle: data.jobTitle || undefined,
        bio: data.bio || undefined,
        timezone: data.timezone,
        locale: data.locale
      });
      if (result.ok) {
        setSuccess(true);
        toast.success('Profile updated');
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Please choose a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }
    setAvatarUploading(true);
    e.target.value = '';
    try {
      const formData = new FormData();
      formData.set('avatar', file);
      const result = await uploadAvatar(formData);
      if (result.ok) {
        await authClient.updateUser({ image: result.imageUrl });
        toast.success('Photo updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and how you appear to others
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Picture</CardTitle>
              <CardDescription>Upload a photo to personalize your account (JPG, PNG, WebP or GIF, max 5 MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 text-2xl">
                  <AvatarImage src={profile.image ?? undefined} alt="" />
                  <AvatarFallback className="text-2xl">
                    {profile.firstName[0]}
                    {profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload photo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
              <CardDescription>Your name and display information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="How you'd like to be called"
                      />
                    </FormControl>
                    <FormDescription>This is shown in comments and activity logs</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job title (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Security Engineer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us a little about yourself"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>Maximum 500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Address</CardTitle>
              <CardDescription>Your primary email for notifications and sign in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{profile.email}</span>
                    {profile.emailVerified && (
                      <Badge
                        variant="outline"
                        className="text-success border-success/30 bg-success-subtle"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Email verified and secure</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Change email
                </Button>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Changing your email requires verification and may affect your login
              </p>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regional Settings</CardTitle>
              <CardDescription>Timezone and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <SearchableTimezonePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select timezone"
                      />
                    </FormControl>
                    <FormDescription>Used for displaying timestamps</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <SearchableLocalePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select language"
                      />
                    </FormControl>
                    <FormDescription>Language for the user interface</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            {success && (
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="h-4 w-4" />
                Changes saved
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isDirty}
              className="bg-brand-500 hover:bg-brand-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
