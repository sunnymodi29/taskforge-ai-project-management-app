import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (used by middleware).
 * Full providers + Prisma adapter live in `auth.ts`.
 */
export default {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
