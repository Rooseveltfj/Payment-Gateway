# Auditoria — Checkout Builder do PulsePay

- **Data:** 2026-07-10 · **Branch:** `perf/fase-3` (commit `82239b2`) · **Escopo:** somente leitura, nada foi alterado
- **Método:** leitura de código + consultas read-only ao Supabase (buckets, policies, decodificação de JWT das chaves). Nenhum upload de teste foi executado para não gravar no storage.

---

## 1. Inventário de arquivos

### Builder (dashboard)
| Papel | Arquivo |
|---|---|
| Rota (server, auth + fetch do produto) | `src/app/dashboard/produtos/[id]/checkout/page.tsx` |
| Shell do builder (estado, tabs, autosave, preview desktop/mobile) | `src/app/dashboard/produtos/[id]/checkout/CheckoutBuilderClient.tsx` |
| Aba Geral (nome/preço/slug/descrição) | `src/components/checkout-builder/tabs/GeneralTab.tsx` |
| Aba Aparência (layout, templates, cores, logo/banner, fonte, botão) | `src/components/checkout-builder/tabs/AppearanceTab.tsx` |
| Aba Conteúdo (headline, benefícios, vídeo VSL por URL) | `src/components/checkout-builder/tabs/ContentTab.tsx` |
| Aba Ofertas (order bumps + upsell) | `src/components/checkout-builder/tabs/BumpUpsellTab.tsx` |
| Aba Formulário (campos opcionais + custom) | `src/components/checkout-builder/tabs/FormFieldsTab.tsx` |
| Abas Gatilhos / Prova Social / Avançado | `TriggersTab.tsx`, `SocialProofTab.tsx`, `AdvancedTab.tsx` |
| **Órfã** (existe mas NÃO é montada em nenhuma tab) | `src/components/checkout-builder/tabs/PixelsTab.tsx` |
| Preview | `src/components/checkout-builder/CheckoutPreview.tsx` + `preview/{CountdownTimer,ReviewCarousel,SocialPopup}.tsx` |
| Componente de upload (compartilhado) | `src/components/ui/ImageUpload.tsx` |

### Página pública
`src/app/c/[slug]/page.tsx` (server, `force-dynamic`) → `src/app/c/[slug]/CheckoutClient.tsx` (654 linhas, client).

### Estado / tipos / persistência
- **Estado:** `useState` local no `CheckoutBuilderClient` (sem store global). Autosave com debounce de 1,5s ([CheckoutBuilderClient.tsx:99-104](../src/app/dashboard/produtos/[id]/checkout/CheckoutBuilderClient.tsx)).
- **Tipos:** `src/types/checkout-config.ts` — `CheckoutConfig` completo + `DEFAULT_CHECKOUT_CONFIG`.
- **Prisma:** `Product.checkoutConfig Json?` ([schema.prisma:101](../prisma/schema.prisma)) — blob único. `CheckoutLink` (schema.prisma:246) existe mas o fluxo usa `Product.slug`. `Order.buyerData Json` guarda campos custom.

### Rotas de API
| Rota | Uso |
|---|---|
| `PATCH /api/products/[id]/checkout-config` | salva o JSON do builder; revalida `/c/[slug]` |
| `PATCH /api/products/[id]` | salva nome/preço/slug (zod ✅) |
| `POST /api/products/upload-image` | upload de TODAS as imagens (logo, banner, bump, avatar, imagem de produto) → bucket `products` |
| `POST /api/checkout/[slug]/pix` | cria pedido + cobrança Woovi |
| `POST /api/checkout/[slug]/create-order` | caminho CARTÃO/BOLETO do front (⚠ ver bug #2) |
| `POST /api/checkout/[slug]/credit-card` e `/boleto` | integração Pagar.me — **nunca chamadas pelo front** |
| `GET /api/checkout/orders/[orderId]/status` | polling do PIX |

---

## 2. Como um template é representado hoje

**Um template NÃO é um objeto de dados persistido.** Ao clicar num template, o builder grava apenas **2 campos** ([AppearanceTab.tsx:83-87](../src/components/checkout-builder/tabs/AppearanceTab.tsx)):

```ts
onChange({ themePreset: t.theme, templateId: t.id })
```

A paleta completa existe, mas **hardcoded dentro dos renderers**: `getTemplateStyles()` em [CheckoutPreview.tsx:37-146](../src/components/checkout-builder/CheckoutPreview.tsx) e **duplicada** em [CheckoutClient.tsx:96-107](../src/app/c/[slug]/CheckoutClient.tsx). Cada template define: `bg, cardBg, cardBorder, text, subtext, accent, fieldBg, fieldBorder, labelColor, isDark`.

### Por que "só muda a cor de um texto" (causa raiz do sintoma (a))

Depois de calcular o tema do template, o renderer faz o merge ([CheckoutPreview.tsx:149-161](../src/components/checkout-builder/CheckoutPreview.tsx), idêntico em CheckoutClient.tsx:110-122):

```ts
const ts = {
  bg:        a.bgColor       || baseTs.bg,       // ← a.bgColor default = "#09090b" (truthy!)
  cardBg:    a.widgetBgColor || baseTs.cardBg,   // ← default "rgba(255,255,255,0.06)" (truthy!)
  text:      a.textColor     || baseTs.text,     // ← default "#f4f4f5" (truthy!)
  accent:    a.buttonColor   || baseTs.accent,   // ← default "#7c3aed" (truthy!)
  fieldBg:   a.inputBgColor  || baseTs.fieldBg,  // ← truthy!
  labelColor:a.inputTextColor|| baseTs.labelColor,// ← truthy!
  subtext:   baseTs.subtext,      // ← só estes vêm
  cardBorder:baseTs.cardBorder,   //    de fato do
  fieldBorder:baseTs.fieldBorder, //    template
  isDark:    baseTs.isDark,
};
```

`DEFAULT_CHECKOUT_CONFIG.appearance` ([checkout-config.ts:211-228](../src/types/checkout-config.ts)) preenche **todas** as 8 cores com valores não-vazios. Como o clique no template não limpa nem sobrescreve essas cores, o `||` faz as cores default (tema roxo-escuro) **vencerem o template sempre**. O que sobra visível de um template: `subtext` (cor de UM texto — o sintoma relatado), bordas, `isDark` e os efeitos por `templateId` (glow neon, pulse urgency, título "⚡ COMPLETE SEU PEDIDO").

Consequência extrema: selecionar **Clean Light** ou **Ocean Light** mantém fundo `#09090b` (escuro) com `isDark=false` — textos de apoio claros sobre fundo escuro, ilegível.

O rótulo da seção de cores até denuncia a intenção: *"Cores Customizadas (Sobrescreve Template)"* — mas como os defaults já vêm preenchidos, o override é permanente. O template só se manifesta se o usuário **apagar manualmente** cada cor (botão “–” seta `""`).

### Quem consome cada propriedade (preview e pública)
- `ts.bg` → fundo da página · `ts.cardBg/cardBorder` → card do formulário · `ts.text` → headline/títulos · `ts.subtext` → subheadline/descrição/selos · `ts.accent` → CTA, badges, benefícios, avatares do buyerCount, garantia · `ts.fieldBg/fieldBorder` → inputs/benefícios/banner placeholder · `ts.labelColor` → labels do form · `ts.isDark` → variações pontuais.
- `buttonTextColor` → **ignorado no preview** ([CheckoutPreview.tsx:451](../src/components/checkout-builder/CheckoutPreview.tsx): ternário morto `? "#fff" : "#fff"`); usado na pública (CheckoutClient.tsx:540).
- `themePreset` → **gravado mas nunca lido** por nenhum renderer (só `templateId` importa). Campo redundante.

---

## 3. Fluxo de upload de logo/banner — e o ponto exato da quebra

```
AppearanceTab (ImageUpload logo 1MB / banner 3MB)
  → ImageUpload.handleUpload()            [ImageUpload.tsx:37-89]
      valida image/* + tamanho, preview local otimista
  → POST /api/products/upload-image (FormData)   [upload-image/route.ts:37]
      createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)  ← ❌ AQUI
      ensureBucketExists(): listBuckets → createBucket se faltar
      supabase.storage.from("products").upload(fileName)
      getPublicUrl() → { url }
  → onChange(url) → config.appearance.logoUrl/bannerUrl (estado)
  → autosave 1,5s → PATCH /api/products/[id]/checkout-config
      → Product.checkoutConfig (Json) + revalidatePath(/c/[slug])
  → preview e pública leem a.logoUrl / a.bannerUrl / a.bannerExternal
```

**Ponto exato da quebra: a credencial.** Evidência coletada (read-only):

1. `.env` → `SUPABASE_SERVICE_ROLE_KEY` é **byte a byte igual** à `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Decodificando o JWT: **`"role": "anon"`** — não é a service_role.
2. Bucket `products` **existe** e é público (`SELECT id, public FROM storage.buckets` → `[{"id":"products","public":true}]`) — o bucket não é o problema.
3. **Zero policies** no schema storage (`SELECT * FROM pg_policies WHERE schemaname='storage'` → `[]`).
4. `listBuckets()` executado com a chave exata que a rota usa → retorna `[]` (anon não enxerga buckets).

Cadeia de falha em runtime: `ensureBucketExists()` não vê o bucket → tenta `createBucket` → **falha** (anon não pode criar; erro é engolido, [route.ts:29-31](../src/app/api/products/upload-image/route.ts)) → `upload()` → **INSERT em `storage.objects` bloqueado por RLS** (role anon + nenhuma policy) → rota devolve 500 → `ImageUpload` mostra "Falha no upload da imagem: new row violates row-level security policy".

Correções possíveis (para a fase de fix, em ordem de preferência): (a) colocar a **service_role key real** no `.env` — resolve sem tocar em RLS; e/ou (b) criar policies de INSERT/SELECT no bucket `products`. Registrar também que a mesma chave quebra **todos** os uploads do app: imagem de produto (`BasicInfoStep`), imagem de bump (`BumpUpsellTab:114`), avatar (`PerfilClient:168`) e **documentos de KYC** (`/api/upload/kyc` usa a mesma env).

**Sobre "vídeo":** não existe upload de vídeo em lugar nenhum — por design, vídeo é só **URL externa** (YouTube/Vimeo) na aba Conteúdo ([ContentTab.tsx:65-71](../src/components/checkout-builder/tabs/ContentTab.tsx)), que vira embed. O hint do banner ("O vídeo VSL tem prioridade") refere-se a isso. Se a expectativa do produto é upload de vídeo próprio, é feature inexistente, não bug.

---

## 4. Preview vs página pública: MESMO componente?

**Não. São duas implementações copy-paste independentes** (~560 vs ~654 linhas) que já divergiram:

| Aspecto | Preview (`CheckoutPreview.tsx`) | Pública (`CheckoutClient.tsx`) |
|---|---|---|
| `getTemplateStyles()` + merge | cópia 1 | cópia 2 (bg default do "classic": `#09090b` via config vs `#07070f` hardcoded) |
| Multistep | rotula **"Etapa 1 de 3"** (builder vende "3 Etapas") | implementa **2 etapas** ("Etapa {n} de 2") |
| CTA multistep | sempre visível | **etapa 1 não renderiza botão** (submit está no bloco da etapa 2) — usuário só avança com Enter |
| Texto do CTA | `a.buttonText` | ignora `buttonText`; hardcoded "Pagar R$ X" |
| Cor do texto do CTA | hardcoded `#fff` (ternário morto, linha 451) | `a.buttonTextColor` ✅ |
| `c.description` | renderiza | **não renderiza** |
| Benefícios | só se `length > 0` | header "O que você vai receber:" sempre |
| SocialPopup | `config={sp.popup}` — **prop inexistente**, interval cai no fallback 10s | `interval={sp.popup.interval}` ✅ |
| Fontes Google | pesos 400-800 | pesos 400-700 (headline usa 800 → fallback) |
| Embed de vídeo | `?autoplay=0&controls=1&rel=0` | sem params |
| Banner urgência | `toUpperCase()` | texto como digitado |
| Método de pagamento | não simula tabs | tabs PIX/CARTÃO/BOLETO |
| Garantia | ícone Shield local | hotlink `flaticon.com` (dependência externa) |

Qualquer ajuste visual feito numa cópia precisa ser replicado manualmente na outra — o estado atual mostra que isso já não acontece. **Recomendação estrutural para a fase de fix:** extrair um `<CheckoutRenderer config mode="preview"|"live">` único.

---

## 5. Tabela de bugs

| # | Arquivo | Linha ~ | Descrição | Severidade |
|---|---|---|---|---|
| 1 | `.env` (`SUPABASE_SERVICE_ROLE_KEY`) + `storage` (0 policies) | — | Chave "service_role" é na verdade a anon key (JWT `role:"anon"`); sem policies no storage, todo upload morre em RLS. **Root cause do sintoma (b)**; quebra logo, banner, bump, avatar, produto e KYC | **CRÍTICA** |
| 2 | `src/app/c/[slug]/CheckoutClient.tsx` + `api/checkout/[slug]/create-order/route.ts` | 156-173 / 32-53 | CARTÃO/BOLETO: front cria pedido PENDING via `create-order` (que não cobra nada) e **redireciona para página de obrigado sem pagamento**. Rotas Pagar.me (`credit-card`, `boleto`) existem mas nunca são chamadas; não há UI de cartão/tokenização | **CRÍTICA** |
| 3 | `CheckoutPreview.tsx` / `CheckoutClient.tsx` | 149-161 / 110-122 | Merge `a.cor \|\| template` com defaults truthy: template nunca aplica tema completo (só subtext/bordas/isDark). Templates claros ficam com fundo escuro. **Root cause do sintoma (a)** | **ALTA** |
| 4 | `src/app/c/[slug]/CheckoutClient.tsx` | 339-553 | Layout "3 Etapas": na etapa 1 nenhum botão de submit é renderizado (CTA só existe no bloco da etapa 2) — fluxo de compra travado no mouse | **ALTA** |
| 5 | `src/app/api/products/upload-image/route.ts` | 37 | Rota de upload **sem autenticação** — qualquer visitante pode subir arquivos ao bucket público quando o storage funcionar | **ALTA** |
| 6 | `src/app/api/products/[id]/checkout-config/route.ts` | 13-19 | `checkoutConfig` salvo **sem validação de schema** (cast `as any`): JSON arbitrário aceito; configs malformadas quebram preview/pública em runtime | **ALTA** |
| 7 | preview + pública (arquitetura) | — | Renderização duplicada (tabela §4) — preview mente para o vendedor em ≥10 pontos já hoje | **ALTA** |
| 8 | `PixelsTab.tsx` + pública | — | Aba Pixels órfã (não montada) e pixels/scripts **nunca injetados** na página pública: rastreamento configurável não existe de fato | MÉDIA |
| 9 | `CheckoutBuilderClient.tsx` | 66-104 | Autosave dispara no mount (grava sem mudança a cada abertura) e faz 2 PATCHes **sequenciais** por alteração; sem tratamento de corrida entre digitação e resposta | MÉDIA |
| 10 | `CheckoutBuilderClient.tsx` | 44-46 | Config carregada do banco não passa por deep-merge com `DEFAULT_CHECKOUT_CONFIG`: configs antigas/parciais (sem `bumpUpsell`, `redirects`…) causam crash em campos acessados sem guard (`sp.popup.enabled`, `t.urgency.enabled`) | MÉDIA |
| 11 | `src/app/c/[slug]/page.tsx` | 39-49 | Fallback de erro em **server component** com `onClick` → se o catch renderizar, o Next lança novo erro (digest) em vez da tela de retry | MÉDIA |
| 12 | `CheckoutPreview.tsx` | 451 | `buttonTextColor` ignorado (ternário morto `? "#fff" : "#fff"`) | MÉDIA |
| 13 | `CheckoutClient.tsx` | 550 | `a.buttonText` ignorado na pública (CTA sempre "Pagar R$ X") — o que o vendedor configura não aparece | MÉDIA |
| 14 | `CheckoutBuilderClient.tsx` | 106-108 | "Visualizar" abre `/c/{slug \|\| productId}` — fallback para productId nunca resolve (lookup é por slug) → 404 para produto sem slug | BAIXA |
| 15 | `CheckoutPreview.tsx` | 555 | `<SocialPopup config={...}>` — prop inexistente (interface é `{interval, primaryColor}`); intervalo configurado ignorado no preview (salvo pelo fallback de 10s). `purchaseCount`/`purchaseCountText` não são usados por ninguém | BAIXA |
| 16 | `CheckoutClient.tsx` | 444-456 | `CustomField.type` ignorado: select/textarea/checkbox/date renderizam como `<input type="text">`; `options` de select é código morto | BAIXA |
| 17 | `types/checkout-config.ts` | 26 | `themePreset` gravado mas nunca lido (renderers só usam `templateId`) — estado redundante que pode divergir | BAIXA |
| 18 | `CheckoutClient.tsx` | 296 | Selo de garantia via hotlink `cdn-icons-png.flaticon.com` (dependência externa em página de venda) | BAIXA |
| 19 | `CheckoutBuilderClient.tsx` | 267, 342 | URL cosmética do preview: "pay.PulsePay.com" (domínio real: pay.pulsepay.com.br) | BAIXA |

### Ordem de correção sugerida (quando autorizado)
1. **#1** (chave/policies — destrava uploads no app inteiro, incl. KYC) → 2. **#2** (caminho fantasma de pagamento — ou esconder CARTÃO/BOLETO, ou ligar as rotas Pagar.me) → 3. **#3** (templates: aplicar paleta completa ao clicar OU tratar `""` como "sem override") → 4. **#4/#13** (multistep + buttonText na pública) → 5. **#7** (unificar renderer — elimina a classe inteira de divergências) → demais.

*Relatório gerado por auditoria somente leitura; nenhuma correção foi aplicada.*
