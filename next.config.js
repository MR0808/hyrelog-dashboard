/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // Next.js 16: reactCompiler moved out of experimental
  // Disabled until babel-plugin-react-compiler is properly installed
  // reactCompiler: true,
};

module.exports = nextConfig;
