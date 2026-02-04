import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        technique: {
          include: { sport: true },
        },
        issues: {
          orderBy: { severity: 'desc' },
        },
        user: {
          select: { name: true },
        },
      },
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      )
    }

    if (analysis.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (analysis.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'El análisis aún no está completo' },
        { status: 400 }
      )
    }

    const date = new Date(analysis.createdAt).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const strengths = (analysis.strengths as string[]) || []
    const severityLabels: Record<string, string> = {
      CRITICAL: 'Crítico',
      HIGH: 'Alto',
      MEDIUM: 'Medio',
      LOW: 'Bajo',
    }

    // Generate printable HTML that users can save as PDF
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Análisis de ${analysis.technique.name} - SportTek</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
    .header {
      border-bottom: 3px solid #256F50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #256F50;
      margin-bottom: 8px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .score-box {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .score-label {
      color: #666;
      font-size: 14px;
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      color: #256F50;
    }
    .score-max {
      font-size: 18px;
      color: #999;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #256F50;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .strength-item {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    .strength-item::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #256F50;
      font-weight: bold;
    }
    .issue-card {
      background: #fafafa;
      border-left: 4px solid #256F50;
      padding: 15px;
      margin-bottom: 12px;
      border-radius: 0 8px 8px 0;
    }
    .issue-name {
      font-weight: bold;
      margin-bottom: 6px;
    }
    .issue-description {
      color: #555;
      font-size: 14px;
      margin-bottom: 6px;
    }
    .issue-correction {
      color: #256F50;
      font-size: 14px;
      font-style: italic;
    }
    .issue-severity {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      margin-top: 8px;
    }
    .severity-CRITICAL { background: #fee2e2; color: #b91c1c; }
    .severity-HIGH { background: #ffedd5; color: #c2410c; }
    .severity-MEDIUM { background: #fef3c7; color: #b45309; }
    .severity-LOW { background: #d1fae5; color: #047857; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #256F50;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-btn:hover {
      background: #1a5038;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SportTek</div>
    <h1 class="title">Análisis de ${escapeHtml(analysis.technique.name)}</h1>
    <p class="subtitle">${escapeHtml(analysis.technique.sport.name)} • ${date}</p>
  </div>

  <div class="score-box">
    <span class="score-label">Puntuación:</span>
    <span class="score-value">${analysis.overallScore?.toFixed(1) ?? '--'}</span>
    <span class="score-max">/ 100</span>
  </div>

  ${strengths.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Fortalezas</h2>
    ${strengths.map(s => `<div class="strength-item">${escapeHtml(s)}</div>`).join('')}
  </div>
  ` : ''}

  ${analysis.issues.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Áreas de mejora</h2>
    ${analysis.issues.map(issue => `
      <div class="issue-card">
        <div class="issue-name">${escapeHtml(issue.title)}</div>
        ${issue.description ? `<div class="issue-description">${escapeHtml(issue.description)}</div>` : ''}
        ${issue.correction ? `<div class="issue-correction">💡 ${escapeHtml(issue.correction)}</div>` : ''}
        <span class="issue-severity severity-${issue.severity}">${severityLabels[issue.severity] || issue.severity}</span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    Generado por SportTek • sporttek.pe • ${date}
  </div>

  <button class="print-btn no-print" onclick="window.print()">
    📄 Guardar como PDF
  </button>
</body>
</html>
`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Error al generar el informe' },
      { status: 500 }
    )
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
