'use client';

/**
 * Client-side internal auth utilities
 */

export async function signOut() {
  await fetch('/api/internal/auth/logout', {
    method: 'POST',
  });
  window.location.href = '/internal/login';
}

