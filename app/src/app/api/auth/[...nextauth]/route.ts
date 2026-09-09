import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DEFAULT_PNL_STATEMENT, INR_SAMPLE_PNL_STATEMENT } from '@/lib/report-store';

// Demo users — hardcoded for demo purposes only, not production auth
const DEMO_USERS = [
  {
    id: 'user-apex',
    email: 'apex@demo.com',
    password: 'apex123',
    name: 'Apex Retail',
    datasetId: DEFAULT_PNL_STATEMENT.id,
  },
  {
    id: 'user-bharat',
    email: 'bharat@demo.com',
    password: 'bharat123',
    name: 'Bharat Precision Works',
    datasetId: INR_SAMPLE_PNL_STATEMENT.id,
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Demo Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        const user = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name, datasetId: user.datasetId };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.datasetId = (user as { datasetId?: string }).datasetId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { datasetId?: string }).datasetId = token.datasetId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'bizai-demo-secret-key-2024',
});

export const { GET, POST } = handlers;
