// ============================================================
// HRMS — Edge-Compatible NextAuth v5 Configuration
// Safe to import in Edge Runtime (middleware) — NO Node.js / DB imports
// ============================================================

import type { NextAuthConfig, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      isSuperAdmin: boolean;
      organizationId?: string;
      organizationName?: string;
      roles: string[];
      permissions: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    isSuperAdmin: boolean;
    organizationId?: string;
    organizationName?: string;
    roles: string[];
    permissions: string[];
  }
}

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token['userId'] = user.id;
        token['isSuperAdmin'] = user.isSuperAdmin;
        token['organizationId'] = user.organizationId;
        token['organizationName'] = user.organizationName;
        token['roles'] = user.roles;
        token['permissions'] = user.permissions;
        token['avatar'] = user.avatar;
      }
      return token;
    },

    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        user: {
          id: (token['userId'] as string) ?? token.sub ?? '',
          email: token.email ?? '',
          name: token.name ?? '',
          avatar: token['avatar'] as string | undefined,
          isSuperAdmin: (token['isSuperAdmin'] as boolean) ?? false,
          organizationId: token['organizationId'] as string | undefined,
          organizationName: token['organizationName'] as string | undefined,
          roles: (token['roles'] as string[]) ?? [],
          permissions: (token['permissions'] as string[]) ?? [],
        },
      };
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  cookies: {
    sessionToken: {
      name: 'hrms-session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
