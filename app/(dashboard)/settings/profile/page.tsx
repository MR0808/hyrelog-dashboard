import { getProfile } from '@/actions/settings';
import { ProfileSection } from '@/components/settings/ProfileSection';

export default async function ProfileSettingsPage() {
  const result = await getProfile();
  if (!result.ok) {
    return (
      <div className="text-destructive text-sm">
        {result.error}
      </div>
    );
  }
  return (
    <ProfileSection
      profile={result.profile}
    />
  );
}
