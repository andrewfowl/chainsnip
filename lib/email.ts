import "server-only"
import nodemailer, { type Transporter } from "nodemailer"

const SMTP_USER = process.env.SMTP_USER || "admin@kabeiri.com"

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  const password = process.env.SMTP_PASSWORD
  if (!password) {
    throw new Error("SMTP_PASSWORD is not set")
  }
  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: SMTP_USER, pass: password },
  })
  return transporter
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html: string
}): Promise<void> {
  await getTransporter().sendMail({
    from: `"ChainSnip" <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  })
}
