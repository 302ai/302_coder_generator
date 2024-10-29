/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'file.302.ai',
      },
      {
        protocol: 'https',
        hostname: 'file.302ai.cn',
      },
    ],
  },
}

export default nextConfig
