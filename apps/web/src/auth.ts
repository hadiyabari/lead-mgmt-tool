import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@leadpilot/db';
import { verifyPassword } from '@/lib/password';
import { verifyMfaToken } from '@/lib/mfa';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  workspaceSlug: z.string().min(1).default('threezero'),
  mfaToken: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8 hours
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        workspaceSlug: { label: 'Workspace', type: 'text' },
        mfaToken: { label: 'MFA Code', type: 'text' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password, workspaceSlug, mfaToken } = parsed.data;
        const workspace = await prisma.workspace.findFirst({
          where: { slug: workspaceSlug, deletedAt: null },
        });
        if (!workspace) return null;

        const user = await prisma.user.findFirst({
          where: {
            workspaceId: workspace.id,
            email: email.toLowerCase(),
            deletedAt: null,
          },
        });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(user.passwordHash, password);
        if (!valid) return null;

        if (user.mfaEnabled) {
          if (!user.mfaSecret || !mfaToken) {
            // Signal MFA required – caller should show MFA step
            throw new Error('MFA_REQUIRED');
          }
          if (!verifyMfaToken(user.mfaSecret, mfaToken)) {
            return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspaceId,
          mfaEnabled: user.mfaEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.workspaceId = (user as { workspaceId?: string }).workspaceId;
        token.mfaEnabled = (user as { mfaEnabled?: boolean }).mfaEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { workspaceId?: string }).workspaceId = token.workspaceId as string;
        (session.user as { mfaEnabled?: boolean }).mfaEnabled = token.mfaEnabled as boolean;
      }
      return session;
    },
  },
  trustHost: true,
});
