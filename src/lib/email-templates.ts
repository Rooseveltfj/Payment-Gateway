/**
 * Email Templates for PulsePay
 * Styled with dark theme, electric purple (#A020F0) and neon glow effects.
 */

const LOGO_URL = "https://www.pulsepay.com.br/assets/logo-png.png"; 
const ACCENT_COLOR = "#BF00FF";
const BG_COLOR = "#030507";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=JetBrains+Mono:wght@700&display=swap');
  body { font-family: 'Inter', -apple-system, system-ui, sans-serif; background-color: ${BG_COLOR}; margin: 0; padding: 0; color: #f0f4f8; }
  .container { max-width: 600px; margin: 40px auto; background-color: #0d1117; border: 1px solid #ffffff0f; border-radius: 24px; overflow: hidden; }
  .header { padding: 40px 40px 20px 40px; text-align: center; }
  .content { padding: 0 40px 40px 40px; text-align: center; }
  .headline { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 12px; text-transform: uppercase; letter-spacing: -0.5px; font-style: italic; }
  .text { font-size: 15px; line-height: 1.6; color: #7a8fa6; margin-bottom: 24px; }
  .button { display: inline-block; padding: 16px 36px; background-color: ${ACCENT_COLOR}; color: #000000; text-decoration: none; border-radius: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; box-shadow: 0 0 25px ${ACCENT_COLOR}40; margin-top: 20px; }
  .footer { padding: 30px; text-align: center; font-size: 11px; color: #3d5166; border-top: 1px solid #ffffff05; }
`;

export const getTwoFactorEmailTemplate = (code: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifique sua conta - PulsePay</title>
  <style>
    ${SHARED_STYLES}
    .code-container { margin: 20px auto; padding: 25px; border-radius: 20px; background-color: #111820; border: 1px solid ${ACCENT_COLOR}30; display: inline-block; box-shadow: 0 0 40px ${ACCENT_COLOR}10; }
    .code { font-family: 'JetBrains Mono', monospace; font-size: 52px; font-weight: 800; letter-spacing: 14px; color: ${ACCENT_COLOR}; text-shadow: 0 0 15px ${ACCENT_COLOR}70; margin: 0; padding-left: 14px; }
    .expiry { font-size: 11px; color: ${ACCENT_COLOR}; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="PulsePay" width="160" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="headline">Código de Verificação</h1>
      <p class="text">Proteja sua conta PulsePay. Use o código abaixo para completar o acesso.</p>
      
      <div class="code-container">
        <div class="code">${code}</div>
      </div>
      
      <p class="expiry">Expira em 5 minutos</p>
      
      <a href="https://www.pulsepay.com.br/auth/verify" class="button">Confirmar Acesso</a>
    </div>
    <div class="footer">
      <p>PulsePay Intermediação LTDA. Se não solicitou, ignore.</p>
      <p>&copy; 2024 PULSEPAY. PAGAMENTOS QUE IMPULSIONAM SEU NEGÓCIO.</p>
    </div>
  </div>
</body>
</html>
`;

export const getWelcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à PulsePay</title>
  <style>
    ${SHARED_STYLES}
    .feature-list { text-align: left; margin: 25px 0; background-color: #111820; border-radius: 16px; padding: 20px; border: 1px solid #ffffff05; }
    .feature-item { padding: 10px 0; font-size: 13px; color: #7a8fa6; display: flex; align-items: center; }
    .feature-icon { color: ${ACCENT_COLOR}; margin-right: 12px; font-weight: 800; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="PulsePay" width="160" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="headline">Bem-vindo à Elite 🚀</h1>
      <p class="text">Olá <strong>${name}</strong>, sua conta foi ativada. Prepare-se para a era da escala imediata.</p>
      
      <div class="feature-list">
        <div class="feature-item"><span class="feature-icon">✓</span> Taxa imbatível de 0.8% no PIX</div>
        <div class="feature-item"><span class="feature-icon">✓</span> Split automático sem demora</div>
        <div class="feature-item"><span class="feature-icon">✓</span> Dashboard em tempo real</div>
      </div>
      
      <a href="https://www.pulsepay.com.br/dashboard" class="button">Acessar Painel</a>
    </div>
    <div class="footer">
      <p>&copy; 2024 PulsePay. O futuro dos pagamentos digitais.</p>
    </div>
  </div>
</body>
</html>
`;

export const getForgotPasswordTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - PulsePay</title>
  <style>
    ${SHARED_STYLES}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="PulsePay" width="160" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="headline">Recuperação de Senha</h1>
      <p class="text">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para escolher uma nova senha.</p>
      
      <a href="${resetLink}" class="button">Redefinir minha senha</a>
      
      <p class="text" style="margin-top: 30px; font-size: 12px;">Link válido por apenas 1 hora. Se você não solicitou, por favor ignore este e-mail.</p>
    </div>
    <div class="footer">
      <p>Este é um e-mail automático. Favor não responder.</p>
      <p>&copy; 2024 PulsePay. Segurança em cada transação.</p>
    </div>
  </div>
</body>
</html>
`;
