import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { getOrCreateUser, consumeMagicToken } from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: 'magic-link',
      credentials: {
        token: { type: 'text' },
        email: { type: 'text' },
      },
      async authorize(credentials) {
        const token = credentials?.token as string;
        const email = (credentials?.email as string)?.toLowerCase().trim();
        if (!token || !email) return null;

        const valid = await consumeMagicToken(token, email);
        if (!valid) return null;

        const user = await getOrCreateUser(email);
        return { id: user.id as string, email, name: (user as any).name ?? undefined };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        await getOrCreateUser(user.email, user.name ?? undefined, user.image ?? undefined);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
