// ============================================================
// HRMS — NextAuth v5 Configuration (Node.js runtime only)
// HTTP-only cookies, JWT strategy, credentials provider
// ============================================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { loadUserPermissions } from '@/lib/permissions';
import { authConfig } from '@/lib/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        organizationId: { label: 'Organization ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const { User } = await import('@/models/User');
        const { UserRole } = await import('@/models/UserRole');
        const { Organization } = await import('@/models/Organization');

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
          isActive: true,
        }).select('+passwordHash');

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        let orgId = credentials.organizationId as string | undefined;
        let orgName: string | undefined;

        if (orgId) {
          const org = await Organization.findOne({ _id: orgId, isActive: true }).lean();
          if (!org) return null;
          if (!user.isSuperAdmin) {
            const isMember = user.organizationIds.some((id) => id.toString() === orgId);
            if (!isMember) return null;
          }
          orgName = org.name;
        } else if (user.organizationIds && user.organizationIds.length > 0) {
          const firstOrgId = user.organizationIds[0];
          if (firstOrgId) {
            orgId = firstOrgId.toString();
            const org = await Organization.findById(firstOrgId).lean();
            orgName = org?.name;
          }
        } else {
          const org = await Organization.findOne({ isActive: true }).lean();
          if (org) {
            orgId = org._id.toString();
            orgName = org.name;
          }
        }


        let roles: string[] = [];
        let permissions: string[] = [];

        if (orgId) {
          const userRoles = await UserRole.find({
            userId: user._id,
            organizationId: orgId,
            isActive: true,
          }).populate<{ roleId: { slug: string } }>('roleId');

          roles = userRoles
            .map((ur) => ur.roleId?.slug ?? '')
            .filter(Boolean);

          permissions = await loadUserPermissions(user._id.toString(), orgId);
        }

        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isSuperAdmin: user.isSuperAdmin,
          organizationId: orgId,
          organizationName: orgName,
          roles,
          permissions,
        };
      },
    }),
  ],
});
