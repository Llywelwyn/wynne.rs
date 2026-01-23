import GitHub from '@auth/core/providers/github';
import { defineConfig } from 'auth-astro';

export default defineConfig({
  providers: [
    GitHub({
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = String(token.id);
      }
      return session;
    },
  },
});
