export function safeReturnTo(path?: string) {
  if (!path) return '/';
  if (!path.startsWith('/')) return '/';
  if (path.startsWith('//')) return '/';
  if (path.startsWith('/\\')) return '/';
  return path;
}

export function toLogin(returnTo?: string) {
  const rt = safeReturnTo(returnTo);
  return `/auth/login?callbackURL=${encodeURIComponent(rt)}`;
}

export function toCheckEmail(email: string, returnTo?: string) {
  const rt = safeReturnTo(returnTo);
  return `/auth/check-email?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(rt)}`;
}

export function toOnboarding(workspaceId: string, returnTo?: string) {
  const rt = safeReturnTo(returnTo);
  return `/onboarding?workspaceId=${encodeURIComponent(workspaceId)}&returnTo=${encodeURIComponent(rt)}`;
}
