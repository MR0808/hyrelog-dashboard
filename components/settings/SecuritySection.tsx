'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, Monitor, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { changePassword, listSessions, revokeOtherSessions, revokeSession } from '@/lib/auth-client';
import { toast } from 'sonner';

interface SessionListItem {
  session: {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    updatedAt: string;
    expiresAt: string | null;
    token?: string | null;
  };
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown device';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Browser';
}

function passwordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' };
  let level = 0;
  if (password.length >= 8) level++;
  if (password.length >= 12) level++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) level++;
  if (/\d/.test(password)) level++;
  if (/[^A-Za-z0-9]/.test(password)) level++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  return { level: Math.min(level, 5), label: labels[Math.min(level, 5)] };
}

export function SecuritySection() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof listSessions>> | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [revokeAllPending, setRevokeAllPending] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    listSessions().then(setSessions);
  }, []);

  const strength = passwordStrength(passwordForm.newPassword);
  const passwordsMatch =
    !passwordForm.newPassword || passwordForm.newPassword === passwordForm.confirmPassword;
  const canChangePassword =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.newPassword.length >= 8 &&
    passwordsMatch;

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!canChangePassword) return;
    startTransition(async () => {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (result.error) {
        toast.error(result.error.message ?? 'Failed to change password');
        return;
      }
      toast.success('Password changed');
      setChangePasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      router.refresh();
    });
  }

  function handleRevokeAllOtherSessions() {
    setRevokeAllPending(true);
    revokeOtherSessions()
      .then(() => {
        toast.success('All other sessions signed out');
        setRevokeAllOpen(false);
        listSessions().then(setSessions);
        router.refresh();
      })
      .catch(() => toast.error('Failed to revoke sessions'))
      .finally(() => setRevokeAllPending(false));
  }

  const sessionList: SessionListItem[] = sessions?.sessions ?? [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password. Use a strong, unique password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can change your password at any time. We recommend updating it periodically.
          </p>
          <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
            Change password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active sessions
          </CardTitle>
          <CardDescription>
            Devices where you are currently signed in. Sign out of sessions you don’t recognize.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading sessions…</p>
          ) : (
            <ul className="divide-y divide-border">
              {sessionList.map((s) => (
                <li
                  key={s.session.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 first:pt-0"
                >
                  <div>
                    <p className="font-medium">{parseUserAgent(s.session.userAgent)}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.session.ipAddress ?? 'Unknown location'} · Last active{' '}
                      {s.session.updatedAt
                        ? new Date(s.session.updatedAt).toLocaleString()
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {s.session.expiresAt ? new Date(s.session.expiresAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  {s.session.token && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive shrink-0"
                      onClick={() => {
                        revokeSession({ token: s.session.token! }).then(() => {
                          toast.success('Session signed out');
                          listSessions().then(setSessions);
                          router.refresh();
                        });
                      }}
                    >
                      Sign out
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {sessionList.length > 1 && (
            <Button
              variant="outline"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={() => setRevokeAllOpen(true)}
            >
              Sign out of all other sessions
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security activity
          </CardTitle>
          <CardDescription>
            Recent security-related events for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Login, password changes, and session revocations will appear here. This view will show
            the last 5–10 events once wired to your audit log.
          </p>
        </CardContent>
      </Card>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one. Use at least 8 characters.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                }
                disabled={isPending}
              />
              {passwordForm.newPassword && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(strength.level / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{strength.label}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                disabled={isPending}
              />
              {passwordForm.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canChangePassword || isPending}>
                {isPending ? 'Changing…' : 'Change password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out of all other sessions?</DialogTitle>
            <DialogDescription>
              This will sign you out on every device except this one. You will need to sign in again
              on those devices.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRevokeAllOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeAllOtherSessions}
              disabled={revokeAllPending}
            >
              {revokeAllPending ? 'Signing out…' : 'Sign out all others'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
