function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please add it to your .env file or environment.`
    )
  }
  return value
}

// Validate on import (server-side only)
export const env = {
  // Required - app won't start without these
  DATABASE_URL: requireEnv('DATABASE_URL'),
  AUTH_SECRET: requireEnv('AUTH_SECRET'),
  NEXTAUTH_URL: requireEnv('NEXTAUTH_URL'),
  GOOGLE_AI_API_KEY: requireEnv('GOOGLE_AI_API_KEY'),
  CULQI_SECRET_KEY: requireEnv('CULQI_SECRET_KEY'),
  CULQI_WEBHOOK_SECRET: requireEnv('CULQI_WEBHOOK_SECRET'),
  CRON_SECRET: requireEnv('CRON_SECRET'),

  // Optional - features degrade gracefully without these
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
}
