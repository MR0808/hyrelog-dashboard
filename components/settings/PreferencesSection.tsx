'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, LayoutGrid, Code } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const PREF_KEYS = {
  landingPage: 'hyrelog_pref_landing',
  developerMode: 'hyrelog_pref_developer'
} as const;

function getStored(key: string, defaultValue: string): string {
  if (typeof window === 'undefined') return defaultValue;
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [landingPage, setLandingPage] = useState('workspace-list');
  const [developerMode, setDeveloperMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLandingPage(getStored(PREF_KEYS.landingPage, 'workspace-list'));
    setDeveloperMode(getStored(PREF_KEYS.developerMode, 'false') === 'true');
  }, []);

  function handleLandingPage(value: string) {
    setLandingPage(value);
    setStored(PREF_KEYS.landingPage, value);
  }
  function handleDeveloperMode(checked: boolean) {
    setDeveloperMode(checked);
    setStored(PREF_KEYS.developerMode, String(checked));
  }

  if (!mounted) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">Loading preferences…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>
            Light, dark, or follow your system setting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme ?? 'system'} onValueChange={(v) => setTheme(v)}>
              <SelectTrigger id="theme" className="w-40">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Default landing page
          </CardTitle>
          <CardDescription>
            Where to go after signing in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="landing">After sign-in</Label>
            <Select value={landingPage} onValueChange={handleLandingPage}>
              <SelectTrigger id="landing" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workspace-list">Workspace list</SelectItem>
                <SelectItem value="last-workspace">Last workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Developer mode
          </CardTitle>
          <CardDescription>
            Show IDs and debug helpers in the UI. For development only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dev-mode" className="cursor-pointer">
              Enable developer mode
            </Label>
            <Switch
              id="dev-mode"
              checked={developerMode}
              onCheckedChange={handleDeveloperMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
