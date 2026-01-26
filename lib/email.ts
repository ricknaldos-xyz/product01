import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'SportTech <noreply@sporttech.app>'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const client = getResendClient()
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Email send error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Email Templates

export function getWelcomeEmailHtml(name: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a SportTech</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Bienvenido a SportTech</h1>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${name},
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Gracias por unirte a SportTech. Estamos emocionados de ayudarte a mejorar tu tecnica deportiva con el poder de la inteligencia artificial.
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        <strong>Esto es lo que puedes hacer:</strong>
      </p>

      <ul style="color: #3f3f46; font-size: 16px; line-height: 28px; margin-bottom: 32px; padding-left: 20px;">
        <li>Sube videos o imagenes de tu tecnica</li>
        <li>Recibe analisis detallados con IA</li>
        <li>Genera planes de entrenamiento personalizados</li>
        <li>Sigue tu progreso a lo largo del tiempo</li>
      </ul>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ir al Dashboard
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} SportTech. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
`
}

export function getAnalysisCompleteEmailHtml(
  name: string,
  techniqueName: string,
  score: number,
  analysisId: string
) {
  const scoreColor = score >= 7 ? '#22c55e' : score >= 5 ? '#eab308' : '#ef4444'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu analisis esta listo</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Tu Analisis Esta Listo</h1>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${name},
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Tu analisis de <strong>${techniqueName}</strong> ha sido completado. Aqui tienes un resumen rapido:
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #f4f4f5; border-radius: 12px; padding: 24px 48px;">
          <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">Puntuacion General</p>
          <p style="color: ${scoreColor}; font-size: 48px; font-weight: bold; margin: 0;">${score.toFixed(1)}/10</p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/analyses/${analysisId}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ver Analisis Completo
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Revisa el analisis completo para ver areas de mejora y genera un plan de entrenamiento personalizado.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} SportTech. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
`
}

export function getTrainingReminderEmailHtml(
  name: string,
  planTitle: string,
  exerciseCount: number,
  completedCount: number,
  trainingPlanId: string
) {
  const progress = Math.round((completedCount / exerciseCount) * 100)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de entrenamiento</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Es Hora de Entrenar</h1>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${name},
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Es momento de continuar con tu plan <strong>${planTitle}</strong>. La consistencia es clave para mejorar tu tecnica.
      </p>

      <div style="background-color: #f4f4f5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="color: #71717a; font-size: 14px; margin: 0 0 12px 0;">Tu progreso</p>
        <div style="background-color: #e4e4e7; border-radius: 8px; height: 12px; overflow: hidden;">
          <div style="background-color: #2563eb; height: 100%; width: ${progress}%;"></div>
        </div>
        <p style="color: #3f3f46; font-size: 14px; margin: 12px 0 0 0;">
          ${completedCount} de ${exerciseCount} ejercicios completados (${progress}%)
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/training/${trainingPlanId}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Continuar Entrenando
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Puedes desactivar estos recordatorios en la configuracion de tu cuenta.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} SportTech. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
`
}

// Helper functions to send specific emails

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Bienvenido a SportTech',
    html: getWelcomeEmailHtml(name),
  })
}

export async function sendAnalysisCompleteEmail(
  email: string,
  name: string,
  techniqueName: string,
  score: number,
  analysisId: string
) {
  return sendEmail({
    to: email,
    subject: `Tu analisis de ${techniqueName} esta listo`,
    html: getAnalysisCompleteEmailHtml(name, techniqueName, score, analysisId),
  })
}

export async function sendTrainingReminderEmail(
  email: string,
  name: string,
  planTitle: string,
  exerciseCount: number,
  completedCount: number,
  trainingPlanId: string
) {
  return sendEmail({
    to: email,
    subject: 'Es hora de entrenar',
    html: getTrainingReminderEmailHtml(
      name,
      planTitle,
      exerciseCount,
      completedCount,
      trainingPlanId
    ),
  })
}
