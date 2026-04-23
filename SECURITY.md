# Security Policy

## Reporting Vulnerabilities

Se você encontrou uma vulnerabilidade de segurança no PulsePay, por favor reporte de forma responsável:

- Email: security@pulsepay.com.br
- NÃO abra issues públicas para vulnerabilidades de segurança
- Responderemos em até 48 horas
- Agradecemos e damos crédito a pesquisadores responsáveis

## Scope

Em escopo:
- `pulsepay.com.br`
- `api.pulsepay.com.br`
- `pay.pulsepay.com.br`

Fora de escopo: 
- Serviços de terceiros (Woovi, Supabase, Vercel)
- Vulnerabilidades de engenharia social
- Ataques de negação de serviço (DoS/DDoS)

## Implemented Security Layers

- **Encryption**: AES-256-GCM for sensitive fields (API Keys, Webhook Secrets, 2FA Tokens).
- **Authentication**: Multi-factor authentication (TOTP/Email) with trusted IP bypass.
- **Audit**: Comprehensive audit logging for all critical actions.
- **Rate Limiting**: Protection against brute force and resource exhaustion.
- **Validation**: Strict Zod schemas for all API inputs.
- **Isolation**: Row Level Security (RLS) on all database tables.
