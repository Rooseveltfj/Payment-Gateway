/**
 * Email Templates for PulsePay
 * Styled with dark theme, electric purple (#A020F0) and neon glow effects.
 */

// URL base dos links dos e-mails. Fallback = valor atual (não muda comportamento sem a env).
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.pulsepay.com.br";
const LOGO_URL = `${APP_URL}/assets/logo-png.png`;
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
      
      <a href="${APP_URL}/auth/verify" class="button">Confirmar Acesso</a>
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
      
      <a href="${APP_URL}/dashboard" class="button">Acessar Painel</a>
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

export const getOrderConfirmationTemplate = (buyerName: string, productName: string, amount: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compra Confirmada - PulsePay</title>
  <style>
    ${SHARED_STYLES}
    .order-box { background-color: #111820; border-radius: 16px; padding: 25px; border: 1px solid #ffffff08; margin: 20px 0; }
    .price { font-size: 32px; font-weight: 800; color: ${ACCENT_COLOR}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="PulsePay" width="160" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="headline">Pagamento Confirmado ✅</h1>
      <p class="text">Olá <strong>${buyerName}</strong>, sua compra de <strong>${productName}</strong> foi processada com sucesso.</p>
      
      <div class="order-box">
        <p style="margin: 0; font-size: 11px; color: #7a8fa6; text-transform: uppercase; letter-spacing: 1px;">Valor Pago</p>
        <div class="price">R$ ${amount.toFixed(2).replace('.', ',')}</div>
      </div>
      
      <p class="text">O acesso ao seu produto será enviado em breve pelo vendedor ou já está disponível na sua plataforma de origem.</p>
      
      <a href="${APP_URL}" class="button">Ver Detalhes</a>
    </div>
    <div class="footer">
      <p>&copy; 2024 PulsePay. Transação segura via PIX.</p>
    </div>
  </div>
</body>
</html>
`;

export const getNewSaleTemplate = (userName: string, productName: string, amount: number, netAmount: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Venda! 🚀</title>
  <style>
    ${SHARED_STYLES}
    .stats-box { display: flex; gap: 10px; margin: 20px 0; }
    .stat-card { flex: 1; background-color: #111820; padding: 15px; border-radius: 12px; border: 1px solid #ffffff08; }
    .stat-label { font-size: 10px; color: #7a8fa6; text-transform: uppercase; margin-bottom: 5px; }
    .stat-val { font-size: 18px; font-weight: 800; color: #fff; }
    .stat-val.highlight { color: ${ACCENT_COLOR}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="PulsePay" width="160" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="headline">Venda Realizada! 🚀</h1>
      <p class="text">Parabéns <strong>${userName}</strong>, você acaba de realizar uma venda do produto <strong>${productName}</strong>.</p>
      
      <div class="stats-box" style="display: table; width: 100%; border-spacing: 10px; border-collapse: separate;">
        <div style="display: table-cell; background-color: #111820; padding: 15px; border-radius: 12px; border: 1px solid #ffffff08;">
          <p style="margin: 0; font-size: 10px; color: #7a8fa6; text-transform: uppercase;">Valor Bruto</p>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 800; color: #fff;">R$ ${amount.toFixed(2).replace('.', ',')}</p>
        </div>
        <div style="display: table-cell; background-color: #111820; padding: 15px; border-radius: 12px; border: 1px solid ${ACCENT_COLOR}30;">
          <p style="margin: 0; font-size: 10px; color: ${ACCENT_COLOR}; text-transform: uppercase;">Você Recebe</p>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 800; color: ${ACCENT_COLOR};">R$ ${netAmount.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>
      
      <p class="text" style="font-size: 12px;">O saldo líquido ficará disponível para saque após o período de maturação.</p>
      
      <a href="${APP_URL}/dashboard/vendas" class="button">Ver Dashboard</a>
    </div>
    <div class="footer">
      <p>&copy; 2024 PulsePay. Escalando seu negócio.</p>
    </div>
  </div>
</body>
</html>
`;

export const getKycApprovedTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="${LOGO_URL}" width="160"></div>
    <div class="content">
      <h1 class="headline">KYC Aprovado! 💎</h1>
      <p class="text">Olá ${name}, seus documentos foram verificados. Sua conta está agora totalmente liberada para saques.</p>
      <a href="${APP_URL}/dashboard/financeiro" class="button">Realizar Saque</a>
    </div>
  </div>
</body>
</html>
`;

export const getBadgeEarnedTemplate = (name: string, badgeName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>${SHARED_STYLES} .badge-icon { font-size: 64px; margin: 20px 0; }</style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="${LOGO_URL}" width="160"></div>
    <div class="content">
      <h1 class="headline">Nova Conquista! 🏆</h1>
      <div class="badge-icon">💎</div>
      <p class="text">Incrível! <strong>${name}</strong>, você desbloqueou a plaquinha de <strong>${badgeName}</strong> em vendas acumuladas.</p>
      <p class="text">Você faz parte do nosso grupo de elite. Continue escalando!</p>
      <a href="${APP_URL}/dashboard" class="button">Ver minhas conquistas</a>
    </div>
  </div>
</body>
</html>
`;

export const getNewOrderGeneratedTemplate = (sellerName: string, productName: string, amount: number) => `
<!DOCTYPE html>
<html>
<head><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="header"><img src="${LOGO_URL}" width="160"></div>
    <div class="content">
      <h1 class="headline">Interesse em seu produto! 🔥</h1>
      <p class="text">Olá <strong>${sellerName}</strong>, um cliente acabou de gerar um PIX para o seu produto <strong>${productName}</strong>.</p>
      <div style="background-color: #111820; padding: 20px; border-radius: 12px; border: 1px solid #ffffff08; margin: 20px 0;">
        <span style="font-size: 11px; color: #7a8fa6; text-transform: uppercase;">Valor do Interesse</span>
        <div style="font-size: 24px; font-weight: 800; color: #fff; margin-top: 5px;">R$ ${amount.toFixed(2).replace('.', ',')}</div>
      </div>
      <p class="text">Você receberá outro e-mail assim que o pagamento for confirmado.</p>
      <a href="${APP_URL}/dashboard/vendas" class="button">Ver no Painel</a>
    </div>
  </div>
</body>
</html>
`;

export const getPixGeneratedTemplate = (buyerName: string, productName: string, amount: number, brCode: string, qrCodeUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${SHARED_STYLES}
    .pix-box { background-color: #111820; border-radius: 20px; padding: 30px; border: 1px solid ${ACCENT_COLOR}20; margin: 25px 0; }
    .pix-code { background: #000; padding: 15px; border-radius: 12px; font-family: monospace; font-size: 11px; color: #7a8fa6; word-break: break-all; border: 1px solid #ffffff10; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="${LOGO_URL}" width="160"></div>
    <div class="content">
      <h1 class="headline">Seu PIX está pronto! ⚡</h1>
      <p class="text">Olá <strong>${buyerName}</strong>, falta pouco para você garantir o seu <strong>${productName}</strong>.</p>
      
      <div class="pix-box">
        <p style="margin: 0; font-size: 11px; color: #7a8fa6; text-transform: uppercase;">Valor do Pedido</p>
        <div style="font-size: 28px; font-weight: 800; color: #fff; margin: 5px 0 20px 0;">R$ ${amount.toFixed(2).replace('.', ',')}</div>
        
        <img src="${qrCodeUrl}" width="180" style="border-radius: 12px; border: 4px solid #fff;">
        
        <p style="margin: 20px 0 5px 0; font-size: 11px; color: #7a8fa6;">OU COPIE O CÓDIGO ABAIXO:</p>
        <div class="pix-code">${brCode}</div>
      </div>
      
      <p class="text" style="font-size: 13px;">Após o pagamento, você receberá a confirmação por e-mail automaticamente.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 PulsePay. Pagamentos rápidos e seguros.</p>
    </div>
  </div>
</body>
</html>
`;
