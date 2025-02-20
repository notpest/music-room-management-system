// app/api/auth/[...nextauth]/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import User from "@/models/User";
import LoginHistory from "@/models/LoginHistory";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials");
        const user = await User.findOne({ 
          where: { username: credentials.username }
        });
        
        if (!user) throw new Error("User not found");
        const isValid = await compare(credentials.password, user.hashed_password);
        return isValid ? {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          band_id: user.band_id ?? "",
        } : null;
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.band_id = user.band_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        username: token.username as string,
        name: token.name as string,
        role: token.role as string,
        band_id: token.band_id as string,
      };
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      await LoginHistory.create({
        user_id: user.id,
        login_time: new Date(),
        logout_time: null
      });
    },
    async signOut({ token }) {
      const loginRecord = await LoginHistory.findOne({
        where: { user_id: token.id, logout_time: null },
        order: [["login_time", "DESC"]]
      });
      if (loginRecord) {
        await loginRecord.update({ logout_time: new Date() });
      }
    }
  },
};