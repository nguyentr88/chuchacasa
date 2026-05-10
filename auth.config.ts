import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Define protected routes here if needed in the future
      return true;
    },
  },
  providers: [], // Providers are added in auth.ts to avoid Edge Runtime issues with Prisma/Bcrypt
} satisfies NextAuthConfig;
