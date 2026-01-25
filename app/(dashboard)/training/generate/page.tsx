'use client'

import { Suspense } from 'react'
import { GeneratePlanForm } from './generate-form'
import { Loader2 } from 'lucide-react'

function GenerateLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

export default function GeneratePlanPage() {
  return (
    <Suspense fallback={<GenerateLoading />}>
      <GeneratePlanForm />
    </Suspense>
  )
}
