import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-inline' required for Culqi payment SDK integration
              "script-src 'self' 'unsafe-inline' https://checkout.culqi.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: *.public.blob.vercel-storage.com *.vercel-storage.com lh3.googleusercontent.com",
              "font-src 'self'",
              "connect-src 'self' https://checkout.culqi.com *.upstash.io vitals.vercel-insights.com *.sentry.io https://vercel.com *.public.blob.vercel-storage.com *.vercel-storage.com",
              "media-src 'self' blob: *.public.blob.vercel-storage.com *.vercel-storage.com",
              "frame-src 'self' https://checkout.culqi.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Suppress source map upload logs in CI
  silent: true,

  // Upload source maps for better stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps when SENTRY_AUTH_TOKEN is set
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Hide source maps from users
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
})
