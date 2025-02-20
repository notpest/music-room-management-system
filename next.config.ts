import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sequelize"],
  // If you have other packages to transpile, list them here—but remove "sequelize".
  transpilePackages: [],
};

module.exports = nextConfig;
