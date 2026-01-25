'use client'

import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { Loader2 } from 'lucide-react'

function LoginLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
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
