import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import type { Severity } from '@prisma/client'

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#d97706',
  LOW: '#65a30d',
}

const SEVERITY_LABELS: Record<string, string> = {
  CRITICAL: 'Critico',
  HIGH: 'Alto',
  MEDIUM: 'Medio',
  LOW: 'Bajo',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E8632B',
    paddingBottom: 12,
  },
  logo: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#E8632B',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  headerPlayer: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 16,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 40,
    fontFamily: 'Helvetica-Bold',
    color: '#E8632B',
  },
  scoreMax: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 14,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#1e3a5f',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  strengthItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  strengthBullet: {
    color: '#16a34a',
    marginRight: 6,
    fontSize: 10,
  },
  strengthText: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
  },
  priorityBox: {
    padding: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#E8632B',
  },
  priorityText: {
    fontSize: 10,
    color: '#9A3412',
    lineHeight: 1.5,
  },
  issueCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  issueSeverity: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  issueCategory: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  issueDescription: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
    marginBottom: 6,
  },
  correctionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
    marginBottom: 2,
  },
  correctionText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  drillLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#B45309',
    marginBottom: 2,
  },
  drillItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 1,
    paddingLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

function getScoreColor(score: number): string {
  if (score >= 8) return '#16a34a'
  if (score >= 6) return '#E8632B'
  if (score >= 4) return '#d97706'
  return '#dc2626'
}

interface AnalysisData {
  technique: { name: string; sport: { name: string } }
  variant: { name: string } | null
  overallScore: number | null
  summary: string | null
  strengths: string[]
  priorityFocus: string | null
  createdAt: Date
  issues: Array<{
    category: string
    title: string
    description: string
    severity: Severity
    correction: string
    drills: string[]
  }>
  user: { name: string | null }
}

function AnalysisPDF({ analysis }: { analysis: AnalysisData }) {
  const date = new Date(analysis.createdAt).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>SportTek</Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerPlayer}>{analysis.user.name || 'Jugador'}</Text>
            <Text style={styles.headerDate}>{date}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {analysis.technique.name}
          {analysis.variant ? ` - ${analysis.variant.name}` : ''}
        </Text>
        <Text style={styles.subtitle}>{analysis.technique.sport.name}</Text>

        {/* Score */}
        {analysis.overallScore != null && (
          <View style={styles.scoreSection}>
            <Text style={[styles.scoreValue, { color: getScoreColor(analysis.overallScore) }]}>
              {analysis.overallScore.toFixed(1)}
            </Text>
            <Text style={styles.scoreMax}>/10</Text>
          </View>
        )}

        {/* Summary */}
        {analysis.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>
        )}

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fortalezas</Text>
            {analysis.strengths.map((s, i) => (
              <View key={i} style={styles.strengthItem}>
                <Text style={styles.strengthBullet}>✓</Text>
                <Text style={styles.strengthText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Priority Focus */}
        {analysis.priorityFocus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enfoque Prioritario</Text>
            <View style={styles.priorityBox}>
              <Text style={styles.priorityText}>{analysis.priorityFocus}</Text>
            </View>
          </View>
        )}

        {/* Issues */}
        {analysis.issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Problemas Detectados ({analysis.issues.length})
            </Text>
            {analysis.issues.map((issue, i) => (
              <View
                key={i}
                style={[
                  styles.issueCard,
                  { borderLeftColor: SEVERITY_COLORS[issue.severity] || '#6b7280' },
                ]}
                wrap={false}
              >
                <View style={styles.issueHeader}>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <Text
                    style={[
                      styles.issueSeverity,
                      { backgroundColor: SEVERITY_COLORS[issue.severity] || '#6b7280' },
                    ]}
                  >
                    {SEVERITY_LABELS[issue.severity] || issue.severity}
                  </Text>
                </View>
                <Text style={styles.issueCategory}>{issue.category}</Text>
                <Text style={styles.issueDescription}>{issue.description}</Text>

                <Text style={styles.correctionLabel}>Correccion:</Text>
                <Text style={styles.correctionText}>{issue.correction}</Text>

                {issue.drills.length > 0 && (
                  <>
                    <Text style={styles.drillLabel}>Ejercicios:</Text>
                    {issue.drills.map((drill, j) => (
                      <Text key={j} style={styles.drillItem}>
                        • {drill}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generado por SportTek — sporttek.xyz</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const analysis = await prisma.analysis.findFirst({
    where: { id, userId: session.user.id },
    include: {
      technique: { include: { sport: true } },
      variant: true,
      issues: { orderBy: { severity: 'desc' } },
      user: { select: { name: true } },
    },
  })

  if (!analysis) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (analysis.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Analysis not completed' }, { status: 400 })
  }

  const buffer = await renderToBuffer(<AnalysisPDF analysis={analysis} />)
  const uint8 = new Uint8Array(buffer)

  const filename = `SportTek-${analysis.technique.name.replace(/\s+/g, '_')}-${new Date(analysis.createdAt).toISOString().slice(0, 10)}.pdf`

  return new NextResponse(uint8 as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
