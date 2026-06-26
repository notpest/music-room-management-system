import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'bcryptjs'],
  transpilePackages: [],
};

module.exports = nextConfig;
