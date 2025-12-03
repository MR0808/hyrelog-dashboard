'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAlertThreshold } from '@/app/actions/alerts';

interface NotificationThreshold {
  id: string;
  meterType: string;
  softLimitPercent: number;
  hardLimitPercent: number;
  channel: string;
}

export function AlertSettings({ thresholds }: { thresholds: NotificationThreshold[] }) {
  const router = useRouter();
  const [settings, setSettings] = useState(
    thresholds.reduce(
      (acc, threshold) => {
        acc[threshold.id] = {
          softLimitPercent: threshold.softLimitPercent,
          hardLimitPercent: threshold.hardLimitPercent,
        };
        return acc;
      },
      {} as Record<string, { softLimitPercent: number; hardLimitPercent: number }>
    )
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = async (thresholdId: string) => {
    setError(null);
    setSuccess(false);

    // Note: The schema uses softLimitPercent/hardLimitPercent, not thresholdValue
    // For now, we'll save softLimitPercent as the threshold value
    // You may need to update the server action to handle both fields
    const formData = new FormData();
    formData.append('thresholdId', thresholdId);
    formData.append('thresholdValue', settings[thresholdId]?.softLimitPercent.toString() || '0');
    formData.append('enabled', 'true');

    startTransition(async () => {
      const result = await updateAlertThreshold(formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          router.refresh();
        }, 2000);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Thresholds</CardTitle>
        <CardDescription>Configure when alerts should be triggered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}
        {thresholds.map((threshold) => (
          <div key={threshold.id} className="space-y-4 rounded-lg border p-4">
            <Label className="font-medium">{threshold.meterType}</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`soft-${threshold.id}`}>Soft Limit (%)</Label>
                <Input
                  id={`soft-${threshold.id}`}
                  type="number"
                  min="0"
                  max="100"
                  value={settings[threshold.id]?.softLimitPercent ?? threshold.softLimitPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      [threshold.id]: {
                        ...settings[threshold.id],
                        softLimitPercent: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hard-${threshold.id}`}>Hard Limit (%)</Label>
                <Input
                  id={`hard-${threshold.id}`}
                  type="number"
                  min="0"
                  max="100"
                  value={settings[threshold.id]?.hardLimitPercent ?? threshold.hardLimitPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      [threshold.id]: {
                        ...settings[threshold.id],
                        hardLimitPercent: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  disabled={isPending}
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave(threshold.id)}
              disabled={isPending}
              size="sm"
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
