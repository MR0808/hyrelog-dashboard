import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  features?: string[];
}

export type SessionShape = {
  user: { id: string; email: string; emailVerified: boolean };
  company: { id: string; createdByUserId: string | null };
};
