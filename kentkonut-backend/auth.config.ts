import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyBcryptPassword } from "@/lib/crypto";
import { db } from "@/lib/db";
import { ENV_CONFIG } from "@/config/environment";

export default {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔥 [AUTH] AUTHORIZE FUNCTION CALLED!');
        console.log('🔥 [AUTH] Credentials received:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          credentialsType: typeof credentials,
          credentialsKeys: credentials ? Object.keys(credentials) : 'no credentials'
        });
        
        try {
          if (!credentials?.email || !credentials?.password) {
             console.log('❌ [AUTH] Missing credentials');
             return null;
           }
           
           console.log('[AUTH] Looking up user in database...');
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          console.log('[AUTH] User found:', !!user, 'Has password:', user ? !!user.password : false);
          
          if (!user || !user.password) {
            console.log('[AUTH] User not found or no password');
            return null;
          }

          console.log('[AUTH] Verifying password...');
          const isPasswordValid = await verifyBcryptPassword(
            credentials.password as string,
            user.password
          );
          
          console.log('[AUTH] Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('[AUTH] Invalid password');
            return null;
          }

          const result = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
          
          console.log('[AUTH] Returning user:', result);
          return result;
        } catch (error) {
          console.error("[AUTH] Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: ENV_CONFIG.AUTH.SESSION_MAX_AGE,
  },
  secret: ENV_CONFIG.AUTH.SECRET,
  debug: ENV_CONFIG.DEBUG.MODE,
  trustHost: ENV_CONFIG.AUTH.TRUST_HOST,
  skipCSRFCheck: ENV_CONFIG.AUTH.SKIP_CSRF_CHECK,
  experimental: {
    enableWebAuthn: false,
  },
  useSecureCookies: ENV_CONFIG.AUTH.USE_SECURE_COOKIES,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // Normalize role to lowercase for consistent authorization checks
        session.user.role = typeof token.role === 'string' ? (token.role as string).toLowerCase() : (token.role as string);
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Normalize role to lowercase to avoid case-sensitivity issues across the app
        token.role = typeof user.role === 'string' ? user.role.toLowerCase() : user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
