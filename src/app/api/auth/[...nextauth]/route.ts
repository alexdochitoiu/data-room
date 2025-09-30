import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

interface JWTParams {
  token: Record<string, unknown> & { id?: string };
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

interface SessionParams {
  session: {
    expires: string;
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  };
  token: Record<string, unknown> & { id: string };
}

interface RedirectParams {
  url: string;
  baseUrl: string;
}

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt(params: JWTParams) {
      const { token, user } = params;
      if (user) {
        token.id = user.id;
      }
      return { ...token, id: token.id || 'default-id' };
    },
    async session(params: SessionParams) {
      const { session, token } = params;
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect(params: RedirectParams) {
      const { url, baseUrl } = params;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
