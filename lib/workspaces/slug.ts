import GithubSlugger from 'github-slugger';
import { prisma } from '@/lib/prisma';

/**
 * Generate a unique project slug within a workspace.
 * Tries base, base-2, base-3, ... then fallback with random suffix.
 */
export async function uniqueProjectSlug(workspaceId: string, base: string): Promise<string> {
  const slugger = new GithubSlugger();
  const root = base.trim() || 'project';
  for (let i = 0; i < 50; i++) {
    const label = i === 0 ? root : `${root} ${i + 1}`;
    const candidate = slugger.slug(label);
    const exists = await prisma.project.findFirst({
      where: { workspaceId, slug: candidate, deletedAt: null },
      select: { id: true }
    });
    if (!exists) return candidate;
  }
  return `${slugger.slug(root)}-${crypto.randomUUID().slice(0, 8)}`;
}
