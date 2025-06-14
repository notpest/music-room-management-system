// app/api/auth/[...nextauth]/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { Op } from "sequelize";     
import User from "@/models/User";
import LoginHistory from "@/models/LoginHistory";
import UserBand from "@/models/UserBand"; 

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
          const user = await User.findOne({ 
            where: { email: credentials.email }
          });
          
          if (!user) return null;
          
          const isValid = await compare(credentials.password, user.hashed_password);
          if (!isValid) return null;
          
          const userBands = await UserBand.findAll({
            where: { user_id: user.id },
            attributes: ["band_id"],
            limit: 1
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            band_id: userBands[0]?.band_id || null
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
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