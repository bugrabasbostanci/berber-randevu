import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    AUTH_URL: process.env.AUTH_URL,
  }
};

export default nextConfig;
