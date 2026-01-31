'use client'

import { useState } from 'react'
import { ChevronDown, Dumbbell } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { getCategoryLabel, SEVERITY_CONFIG, type Severity } from '@/lib/analysis-constants'
import { cn } from '@/lib/utils'

const SEVERITY_BG: Record<string, string> = {
  CRITICAL: 'bg-red-500/10',
  HIGH: 'bg-orange-500/10',
  MEDIUM: 'bg-yellow-500/10',
  LOW: 'bg-blue-500/10',
}

interface Issue {
  id: string
  title: string
  category: string
  severity: string
  description: string
  correction: string
  drills: string[]
}

interface IssueAccordionProps {
  issues: Issue[]
}

export function IssueAccordion({ issues }: IssueAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allExpanded = issues.length > 0 && issues.every(i => expandedIds.has(i.id))

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(issues.map(i => i.id)))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={toggleAll}
          className="text-xs text-primary hover:underline"
        >
          {allExpanded ? 'Colapsar todos' : 'Expandir todos'}
        </button>
      </div>
      {issues.map((issue, index) => {
        const isExpanded = expandedIds.has(issue.id)
        const { label: categoryLabel, icon: categoryIcon } = getCategoryLabel(issue.category)
        const severity = SEVERITY_CONFIG[issue.severity as Severity]

        return (
          <GlassCard key={issue.id} intensity="light" padding="none">
            {/* Header - always visible */}
            <button
              onClick={() => toggleExpand(issue.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-glass-light/30 transition-colors rounded-xl"
            >
              {/* Number circle */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                SEVERITY_BG[issue.severity] ?? 'glass-ultralight'
              )}>
                <span className={severity?.color ?? 'text-muted-foreground'}>{index + 1}</span>
              </div>

              {/* Title + category */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{issue.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {categoryIcon} {categoryLabel}
                </span>
              </div>

              {/* Severity badge */}
              <GlassBadge variant={severity?.variant ?? 'default'} size="sm">
                {severity?.label ?? issue.severity}
              </GlassBadge>

              {/* Expand icon */}
              <ChevronDown className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
                isExpanded && 'rotate-180'
              )} />
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 space-y-4 border-t border-glass ml-11">
                <p className="text-muted-foreground text-sm pt-4">{issue.description}</p>

                <div className="glass-ultralight border-glass rounded-xl p-4">
                  <h4 className="font-medium text-sm mb-2">Como corregirlo:</h4>
                  <p className="text-sm text-muted-foreground">{issue.correction}</p>
                </div>

                {issue.drills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Ejercicios recomendados:</h4>
                    <ul className="space-y-1">
                      {issue.drills.map((drill, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Dumbbell className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          {drill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        )
      })}
    </div>
  )
}
