import { Resend } from 'resend';

// Só constrói o client quando há chave — evita `new Resend(undefined)` no import
// e habilita o modo dry-run abaixo.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  const from = process.env.EMAIL_FROM || 'PulsePay <noreply@pulsepay.com.br>';

  // Dry-run: sem RESEND_API_KEY não estoura — loga o HTML e retorna sucesso.
  if (!resend) {
    console.warn(`[Mail][dry-run] RESEND_API_KEY ausente — e-mail NÃO enviado. to=${to} subject="${subject}"`);
    console.info(`[Mail][dry-run] HTML:\n${html}`);
    return { success: true, dryRun: true };
  }

  try {
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
