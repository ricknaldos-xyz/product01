import { prisma } from '@/lib/prisma'
import { GoalStatus, GoalType, Prisma, SkillTier } from '@prisma/client'

// Tier thresholds on 0-100 scale, matching lib/skill-score.ts
const TIER_THRESHOLDS: Record<SkillTier, number> = {
  UNRANKED: 0,
  BRONCE: 0,
  PLATA: 40,
  ORO: 55,
  PLATINO: 70,
  DIAMANTE: 85,
}

interface RoadmapStep {
  type: string
  label?: string
  completed: boolean
  linkedId?: string | null
}

/**
 * Updates goal progress after an analysis is completed.
 * Called from the analysis processing pipeline.
 *
 * Safe to call multiple times for the same analysis (idempotent via upserts).
 */
export async function updateGoalProgress(
  userId: string,
  analysisId: string
): Promise<void> {
  // 1. Get the completed analysis with technique info
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: {
      id: true,
      userId: true,
      techniqueId: true,
      overallScore: true,
    },
  })

  if (!analysis) {
    console.log(`[goals/progress] Analysis ${analysisId} not found, skipping goal update`)
    return
  }

  if (analysis.userId !== userId) {
    console.log(`[goals/progress] Analysis ${analysisId} does not belong to user ${userId}, skipping`)
    return
  }

  if (analysis.overallScore === null || analysis.overallScore === undefined) {
    console.log(`[goals/progress] Analysis ${analysisId} has no overallScore, skipping goal update`)
    return
  }

  const score = analysis.overallScore

  // 2. Find all ACTIVE goals for this user that have techniques matching the analysis
  const activeGoals = await prisma.improvementGoal.findMany({
    where: {
      userId,
      status: GoalStatus.ACTIVE,
      techniques: {
        some: {
          techniqueId: analysis.techniqueId,
        },
      },
    },
    include: {
      techniques: true,
    },
  })

  if (activeGoals.length === 0) {
    console.log(
      `[goals/progress] No active goals found for user ${userId} matching technique ${analysis.techniqueId}`
    )
    return
  }

  console.log(
    `[goals/progress] Found ${activeGoals.length} active goal(s) for user ${userId} matching analysis ${analysisId}`
  )

  // 3. Process each matching goal
  for (const goal of activeGoals) {
    try {
      await prisma.$transaction(async (tx) => {
        // 3a. Determine baseline and current scores
        const isFirstAnalysis = goal.baselineScore === null
        const baselineScore = isFirstAnalysis ? score : goal.baselineScore!
        const currentScore = score

        // 3a. Create GoalAnalysis link record (upsert for idempotency)
        const scoreDelta = isFirstAnalysis ? 0 : currentScore - baselineScore

        await tx.goalAnalysis.upsert({
          where: {
            goalId_analysisId: {
              goalId: goal.id,
              analysisId: analysis.id,
            },
          },
          create: {
            goalId: goal.id,
            analysisId: analysis.id,
            scoreDelta,
          },
          update: {
            scoreDelta,
          },
        })

        // 3d. Calculate progressPercent based on goal type
        let progressPercent = 0

        switch (goal.type) {
          case GoalType.TECHNIQUE: {
            // Relative improvement: how much of the remaining range has been covered
            const denominator = 10 - baselineScore
            if (denominator <= 0) {
              progressPercent = 100
            } else {
              progressPercent = ((currentScore - baselineScore) / denominator) * 100
            }
            break
          }

          case GoalType.SCORE_TARGET: {
            const targetScore = goal.targetScore
            if (targetScore === null || targetScore === undefined) {
              console.log(
                `[goals/progress] Goal ${goal.id} is SCORE_TARGET but has no targetScore, skipping progress calc`
              )
              break
            }
            const denominator = targetScore - baselineScore
            if (denominator <= 0) {
              progressPercent = 100
            } else {
              progressPercent = ((currentScore - baselineScore) / denominator) * 100
            }
            break
          }

          case GoalType.TIER_TARGET: {
            if (!goal.targetTier) {
              console.log(
                `[goals/progress] Goal ${goal.id} is TIER_TARGET but has no targetTier, skipping progress calc`
              )
              break
            }

            // Get the player's current compositeScore (0-100 scale)
            const profile = await tx.playerProfile.findUnique({
              where: { userId },
              select: { compositeScore: true },
            })

            // Convert analysis score to 0-100 for comparison
            const scoreOn100 = currentScore * 10
            // Use whichever is higher: profile composite or this analysis score
            const effectiveScore = Math.max(
              scoreOn100,
              profile?.compositeScore ?? 0
            )

            const targetThreshold = TIER_THRESHOLDS[goal.targetTier]
            const baseThreshold = TIER_THRESHOLDS.BRONCE // 0

            if (targetThreshold <= baseThreshold) {
              progressPercent = 100
            } else {
              progressPercent =
                ((effectiveScore - baseThreshold) / (targetThreshold - baseThreshold)) * 100
            }
            break
          }
        }

        // 3e. Clamp to 0-100
        progressPercent = Math.max(0, Math.min(100, progressPercent))

        // 3f. Mark roadmap steps as completed
        let roadmap = goal.roadmap as RoadmapStep[] | null
        if (roadmap && Array.isArray(roadmap)) {
          const firstUncompletedAnalysis = roadmap.find(
            (step) => step.type === 'analysis' && !step.completed
          )
          if (firstUncompletedAnalysis) {
            firstUncompletedAnalysis.completed = true
            firstUncompletedAnalysis.linkedId = analysisId
          }
        }

        // 3g. Check completion
        const isCompleted = progressPercent >= 100
        const status = isCompleted ? GoalStatus.COMPLETED : GoalStatus.ACTIVE
        const completedAt = isCompleted ? new Date() : goal.completedAt

        // 3h. Update the goal record
        await tx.improvementGoal.update({
          where: { id: goal.id },
          data: {
            baselineScore: isFirstAnalysis ? baselineScore : undefined,
            currentScore,
            progressPercent,
            roadmap: roadmap ? (roadmap as unknown as Prisma.InputJsonValue) : undefined,
            status,
            completedAt,
          },
        })

        console.log(
          `[goals/progress] Updated goal ${goal.id}: score=${currentScore.toFixed(1)}, progress=${progressPercent.toFixed(1)}%, status=${status}`
        )
      })
    } catch (error) {
      console.log(
        `[goals/progress] Error updating goal ${goal.id} for analysis ${analysisId}:`,
        error
      )
    }
  }
}

/**
 * Links a training plan to a goal and marks the corresponding roadmap step as completed.
 */
export async function linkTrainingPlanToGoal(
  userId: string,
  trainingPlanId: string,
  goalId: string
): Promise<void> {
  const goal = await prisma.improvementGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  })

  if (!goal) {
    console.log(
      `[goals/progress] Goal ${goalId} not found for user ${userId}, skipping training plan link`
    )
    return
  }

  if (goal.status !== GoalStatus.ACTIVE) {
    console.log(
      `[goals/progress] Goal ${goalId} is not ACTIVE (status=${goal.status}), skipping training plan link`
    )
    return
  }

  await prisma.$transaction(async (tx) => {
    // Create GoalTrainingPlan link (upsert for idempotency)
    await tx.goalTrainingPlan.upsert({
      where: {
        goalId_trainingPlanId: {
          goalId,
          trainingPlanId,
        },
      },
      create: {
        goalId,
        trainingPlanId,
      },
      update: {},
    })

    // Update roadmap: find first uncompleted "training" step
    let roadmap = goal.roadmap as RoadmapStep[] | null
    if (roadmap && Array.isArray(roadmap)) {
      const firstUncompletedTraining = roadmap.find(
        (step) => step.type === 'training' && !step.completed
      )
      if (firstUncompletedTraining) {
        firstUncompletedTraining.completed = true
        firstUncompletedTraining.linkedId = trainingPlanId
      }

      await tx.improvementGoal.update({
        where: { id: goalId },
        data: {
          roadmap: roadmap as unknown as Prisma.InputJsonValue,
        },
      })
    }

    console.log(
      `[goals/progress] Linked training plan ${trainingPlanId} to goal ${goalId}`
    )
  })
}
