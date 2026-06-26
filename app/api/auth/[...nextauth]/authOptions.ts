// app/api/auth/[...nextauth]/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { db } from "@/db";
import { user, loginHistory, userBand } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password:   { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const [userRecord] = await db
            .select()
            .from(user)
            .where(eq(user.email, credentials.email))
            .limit(1);

          if (!userRecord) return null;

          const isValid = await compare(credentials.password, userRecord.hashed_password);
          if (!isValid) return null;

          const userBands = await db
            .select({ band_id: userBand.band_id })
            .from(userBand)
            .where(eq(userBand.user_id, userRecord.id))
            .limit(1);

          return {
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            role: userRecord.role,
            band_id: userBands[0]?.band_id || null,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.band_id = user.band_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        band_id: token.band_id as string | null,
      };
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await db.insert(loginHistory).values({
        user_id: user.id,
        login_time: new Date(),
        logout_time: null,
      });
    },
    async signOut({ token }) {
      const [loginRecord] = await db
        .select()
        .from(loginHistory)
        .where(and(eq(loginHistory.user_id, token.id), isNull(loginHistory.logout_time)))
        .orderBy(desc(loginHistory.login_time))
        .limit(1);

      if (loginRecord) {
        await db
          .update(loginHistory)
          .set({ logout_time: new Date() })
          .where(eq(loginHistory.id, loginRecord.id));
      }
    },
  },
};
