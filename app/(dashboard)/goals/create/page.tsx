import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CreateGoalForm } from './CreateGoalForm'

export const metadata: Metadata = {
  title: 'Crear Objetivo | SportTech',
  description: 'Crea un nuevo objetivo de mejora deportiva.',
}

export default async function CreateGoalPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return <CreateGoalForm />
}
