import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`)
    console.log(html)
    return { id: 'mock-' + Date.now() }
  }

  const { data, error } = await resend.emails.send({
    from: 'FinanceFlow <onboarding@resend.dev>',
    to,
    subject,
    html,
  })

  if (error) throw new Error(error.message)
  return data
}

export function verificationEmail(name: string, token: string, baseUrl: string) {
  const url = `${baseUrl}/verify-email?token=${token}`
  return {
    subject: 'Verify your FinanceFlow account',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#6366F1">Welcome${name ? ', '+name : ''}!</h1><p>Verify your email:</p><a href="${url}" style="display:inline-block;background:#6366F1;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px">Verify Email</a><p style="color:#999;font-size:12px;margin-top:20px">Link expires in 24 hours.</p></div>`,
  }
}

export function resetPasswordEmail(name: string, token: string, baseUrl: string) {
  const url = `${baseUrl}/reset-password?token=${token}`
  return {
    subject: 'Reset your FinanceFlow password',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#6366F1">Reset Password</h1><p>Click to reset:</p><a href="${url}" style="display:inline-block;background:#6366F1;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px">Reset Password</a><p style="color:#999;font-size:12px;margin-top:20px">Link expires in 1 hour.</p></div>`,
  }
}
