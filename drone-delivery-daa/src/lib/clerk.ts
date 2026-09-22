// src/lib/clerk.ts
// Clerk configuration helpers

export const clerkPublicRoutes = [
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
];

export const clerkIgnoredRoutes = [
  '/_next(.*)',
  '/favicon.ico',
  '/icons(.*)',
];
