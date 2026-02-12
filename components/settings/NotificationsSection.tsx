'use client';

import { useState, useEffect } from 'react';
import { Bell, Shield, Mail, Megaphone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const NOTIFICATION_KEYS = {
  security: 'hyrelog_notify_security',
  workspaceActivity: 'hyrelog_notify_workspace',
  productUpdates: 'hyrelog_notify_product'
} as const;

function getStored(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v === 'true' : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

export function NotificationsSection() {
  const [security, setSecurity] = useState(true);
  const [workspaceActivity, setWorkspaceActivity] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  useEffect(() => {
    setSecurity(getStored(NOTIFICATION_KEYS.security, true));
    setWorkspaceActivity(getStored(NOTIFICATION_KEYS.workspaceActivity, true));
    setProductUpdates(getStored(NOTIFICATION_KEYS.productUpdates, false));
  }, []);

  function handleSecurity(checked: boolean) {
    setSecurity(checked);
    setStored(NOTIFICATION_KEYS.security, checked);
  }
  function handleWorkspaceActivity(checked: boolean) {
    setWorkspaceActivity(checked);
    setStored(NOTIFICATION_KEYS.workspaceActivity, checked);
  }
  function handleProductUpdates(checked: boolean) {
    setProductUpdates(checked);
    setStored(NOTIFICATION_KEYS.productUpdates, checked);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email notifications
          </CardTitle>
          <CardDescription>
            Choose which emails you receive. Security-related emails are recommended to stay on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-info-subtle bg-(--info-subtle)/50 p-4 space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-info" />
              Security emails
            </h3>
            <p className="text-sm text-muted-foreground">
              New login, password change, email change. We recommend keeping these on.
            </p>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="notify-security"
                className="cursor-pointer"
              >
                Send security notifications
              </Label>
              <Switch
                id="notify-security"
                checked={security}
                onCheckedChange={handleSecurity}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Workspace & account activity
            </h3>
            <p className="text-sm text-muted-foreground">
              Invites received, role changes, removal from workspace or company.
            </p>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="notify-workspace"
                className="cursor-pointer"
              >
                Send workspace activity notifications
              </Label>
              <Switch
                id="notify-workspace"
                checked={workspaceActivity}
                onCheckedChange={handleWorkspaceActivity}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Product updates
            </h3>
            <p className="text-sm text-muted-foreground">Feature announcements and newsletters.</p>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="notify-product"
                className="cursor-pointer"
              >
                Send product updates
              </Label>
              <Switch
                id="notify-product"
                checked={productUpdates}
                onCheckedChange={handleProductUpdates}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
