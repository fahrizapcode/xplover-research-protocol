/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
    NEXT_PUBLIC_ARBITRUM_RPC: "https://sepolia-rollup.arbitrum.io/rpc",
    NEXT_PUBLIC_ARBITRUM_CHAIN_ID: "421614",
  },
};

export default nextConfig;
