'use client'

import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { GlassCard } from '@/components/ui/glass-card'
import { Loader2 } from 'lucide-react'

function LoginLoading() {
  return (
    <div className="w-full max-w-md">
      <GlassCard intensity="medium" padding="xl" className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </GlassCard>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
