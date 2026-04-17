import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

/**
 * Utility to send emails using Resend.
 * Uses the verified domain 'pulsepay.com.br' as configured in .env
 */
export async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    const from = process.env.EMAIL_FROM || 'PulsePay <noreply@pulsepay.com.br>';
    
    console.log(`[Mail] Sending email to ${to} from ${from}...`);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }

    console.log('[Mail] Email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected email error:', error);
    return { success: false, error };
  }
}
