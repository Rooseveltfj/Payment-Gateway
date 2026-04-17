import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

/**
 * Utility to send emails using Resend.
 * As no verified domain exists yet, it defaults to onboarding@resend.dev.
 */
export async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'PulsePay <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected email error:', error);
    return { success: false, error };
  }
}
