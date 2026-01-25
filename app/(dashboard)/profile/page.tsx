import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User, Mail, Calendar, Trophy } from 'lucide-react'
import { formatDate } from '@/lib/utils'

async function getUserStats(userId: string) {
  const [user, analysesCount, plansCount, completedPlans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteSports: {
          include: { sport: true },
        },
      },
    }),
    prisma.analysis.count({ where: { userId } }),
    prisma.trainingPlan.count({ where: { userId } }),
    prisma.trainingPlan.count({ where: { userId, status: 'COMPLETED' } }),
  ])

  return { user, analysesCount, plansCount, completedPlans }
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { user, analysesCount, plansCount, completedPlans } = await getUserStats(
    session.user.id
  )

  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>

      {/* User Info */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Miembro desde:</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Plan:</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
              {user.subscription}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Estadisticas</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{analysesCount}</div>
            <div className="text-sm text-muted-foreground">Analisis</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{plansCount}</div>
            <div className="text-sm text-muted-foreground">Planes</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{completedPlans}</div>
            <div className="text-sm text-muted-foreground">Completados</div>
          </div>
        </div>
      </div>

      {/* Favorite Sports */}
      {user.favoriteSports.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Deportes Favoritos</h3>
          <div className="flex flex-wrap gap-2">
            {user.favoriteSports.map((fs) => (
              <span
                key={fs.id}
                className="bg-muted px-3 py-1.5 rounded-full text-sm"
              >
                {fs.sport.name}
                {fs.level && (
                  <span className="text-muted-foreground ml-1">({fs.level})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
