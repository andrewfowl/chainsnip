import { createNeonAuth } from '@neondatabase/auth/next/server';

// Create the Neon Auth server instance for use in server components, server actions, and API routes
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
