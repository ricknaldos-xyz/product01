import { logger } from '@/lib/logger'
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

const FROM_EMAIL = process.env.FROM_EMAIL || 'SportTek <noreply@sporttek.xyz>'

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
      logger.error('Email send error:', error)
      throw error
    }

    return data
  } catch (error) {
    logger.error('Failed to send email', { to: to.slice(0, 3) + '***', subject, error })
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
  <title>Bienvenido a SportTek</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Bienvenido a SportTek</h1>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${name},
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Gracias por unirte a SportTek. Estamos emocionados de ayudarte a mejorar tu tecnica deportiva con el poder de la inteligencia artificial.
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
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #E8632B; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
          Ir al Dashboard
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
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
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/analyses/${analysisId}" style="display: inline-block; background-color: #E8632B; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
          Ver Analisis Completo
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Revisa el analisis completo para ver areas de mejora y genera un plan de entrenamiento personalizado.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
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
          <div style="background-color: #E8632B; height: 100%; width: ${progress}%;"></div>
        </div>
        <p style="color: #3f3f46; font-size: 14px; margin: 12px 0 0 0;">
          ${completedCount} de ${exerciseCount} ejercicios completados (${progress}%)
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/training/${trainingPlanId}" style="display: inline-block; background-color: #E8632B; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
          Continuar Entrenando
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Puedes desactivar estos recordatorios en la configuracion de tu cuenta.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
`
}

export function getPasswordResetEmailHtml(name: string, resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contrasena</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Restablecer Contrasena</h1>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${name},
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Recibimos una solicitud para restablecer la contrasena de tu cuenta. Haz clic en el boton de abajo para crear una nueva contrasena.
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #E8632B; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
          Restablecer Contrasena
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; margin-bottom: 16px;">
        Este enlace expirara en 1 hora por seguridad.
      </p>

      <p style="color: #71717a; font-size: 14px;">
        Si no solicitaste restablecer tu contrasena, puedes ignorar este email. Tu contrasena permanecera sin cambios.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
`
}

export function getEmailVerificationHtml(name: string, verifyUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Verifica tu Email</h1>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${name},
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Gracias por registrarte en SportTek. Por favor verifica tu direccion de email haciendo clic en el boton de abajo.
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${verifyUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Verificar Email
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px;">
        Este enlace expirara en 24 horas. Si no creaste una cuenta en SportTek, puedes ignorar este email.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
`
}

export function getStreakAtRiskEmailHtml(name: string, currentStreak: number) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu racha esta en riesgo</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🔥</div>
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Tu Racha Esta en Riesgo</h1>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${name},
      </p>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Tu racha de <strong style="color: #f97316;">${currentStreak} dias</strong> esta a punto de perderse. No dejes que todo tu progreso desaparezca.
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #f97316; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Mantener Mi Racha
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Solo necesitas completar un ejercicio o analisis para mantener tu racha.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
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
    subject: 'Bienvenido a SportTek',
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

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`
  return sendEmail({
    to: email,
    subject: 'Restablecer tu contrasena - SportTek',
    html: getPasswordResetEmailHtml(name, resetUrl),
  })
}

export async function sendEmailVerification(
  email: string,
  name: string,
  token: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}`
  return sendEmail({
    to: email,
    subject: 'Verifica tu email - SportTek',
    html: getEmailVerificationHtml(name, verifyUrl),
  })
}

export async function sendStreakAtRiskEmail(
  email: string,
  name: string,
  currentStreak: number
) {
  return sendEmail({
    to: email,
    subject: `Tu racha de ${currentStreak} dias esta en riesgo`,
    html: getStreakAtRiskEmailHtml(name, currentStreak),
  })
}

export interface OrderItem {
  productName: string
  quantity: number
  priceCents: number
}

export function getOrderConfirmationEmailHtml(
  orderNumber: string,
  items: OrderItem[],
  totalCents: number,
  shippingAddress: string
) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; color: #3f3f46;">${item.productName}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; color: #3f3f46; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; color: #3f3f46; text-align: right;">S/ ${(item.priceCents / 100).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmacion de pedido</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Pedido Confirmado</h1>
        <p style="color: #71717a; font-size: 14px; margin-top: 8px;">Pedido ${orderNumber}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="padding: 8px 0; border-bottom: 2px solid #e4e4e7; text-align: left; color: #71717a; font-size: 12px; text-transform: uppercase;">Producto</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #e4e4e7; text-align: center; color: #71717a; font-size: 12px; text-transform: uppercase;">Cant.</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #e4e4e7; text-align: right; color: #71717a; font-size: 12px; text-transform: uppercase;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-bottom: 24px;">
        <p style="color: #18181b; font-size: 18px; font-weight: bold; margin: 0;">
          Total: S/ ${(totalCents / 100).toFixed(2)}
        </p>
      </div>

      <div style="background-color: #f4f4f5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #71717a; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0;">Direccion de envio</p>
        <p style="color: #3f3f46; font-size: 14px; margin: 0;">${shippingAddress}</p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/tienda/pedidos" style="display: inline-block; background-color: #E8632B; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
          Ver Mis Pedidos
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Te notificaremos cuando tu pedido sea enviado.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
`
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  items: OrderItem[],
  totalCents: number,
  shippingAddress: string
) {
  return sendEmail({
    to: email,
    subject: `Pedido ${orderNumber} confirmado - SportTek`,
    html: getOrderConfirmationEmailHtml(orderNumber, items, totalCents, shippingAddress),
  })
}
