// next-auth.d.ts
import NextAuth from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      name: string;
      role: string;
      band_id: string | null;
    };
  }
  interface User {
    id: string;
    username: string;
    name: string;
    role: string;
    band_id: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    name: string;
    role: string;
    band_id: string | null;
  }
}
