'use client';
import { createAuthClient } from '@neondatabase/auth/next';

// Create the Neon Auth client for use in React client components
export const authClient = createAuthClient();
export const { useSession } = authClient;
