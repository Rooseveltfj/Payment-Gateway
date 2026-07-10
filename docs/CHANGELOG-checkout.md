# Changelog — Checkout Builder (passo de qualidade WYSIWYG)

Data: 2026-07-10 · Branch: `feat/checkout-themes`

## Adicionado
- **`src/components/checkout/CheckoutRenderer.tsx`** — componente ÚNICO de render do checkout, usado pelo preview do builder (`mode="preview"`) e pela página pública `/c/[slug]` (`mode="live"`). Recebe `{ config, product, mode, form }`. A lógica de pagamento entra pela `CheckoutFormApi` (exportada); o renderer só desenha.
- **`@tailwindcss/container-queries`** (devDependency) + `@container/checkout` no renderer: a responsividade passa a ser por largura do **container** (`@md`, `@3xl`), não do viewport.
- Builder: indicador de estado no topo (**Salvando… / Não salvo ● / Tudo salvo ✓**) e aviso de saída com alterações não salvas (`beforeunload` + confirmação no botão "Produtos").

## Alterado
- **`src/components/checkout-builder/CheckoutPreview.tsx`** — virou wrapper fino: `→ <CheckoutRenderer mode="preview" />`. Prop `isMobile` marcada como deprecated (responsividade agora é por container-query).
- **`src/app/c/[slug]/CheckoutClient.tsx`** — reduzido de ~660 para ~150 linhas: mantém 100% do estado + lógica de pagamento (PIX, cartão, boleto, polling, back-redirect, multistep) e delega TODO o desenho ao `CheckoutRenderer`. Removida a duplicação de JSX/tema.
- **`src/app/dashboard/produtos/[id]/checkout/CheckoutBuilderClient.tsx`** — dirty-state (`dirty`, `mounted` ref); `handleSave` limpa dirty ao persistir; autosave debounce (1.5s) não dispara no mount; botão "Salvar" com loading ("Salvando") + confirmação ("Salvo!"); botão voltar usa `leaveBuilder` (confirma se dirty).
- **`tailwind.config.ts`** — registra o plugin de container-queries.
- **Mobile toggle** — o preview mobile renderiza o layout mobile REAL (container 390px + `@container`), não um desktop encolhido. O desktop mantém 2 colunas.

## Corrigido / unificado (regressões verificadas)
- **Paridade WYSIWYG**: preview e página pública são o MESMO componente → não podem divergir (antes eram duas árvores JSX copy-paste; ver audit bug #7). Verificado por screenshot: `/c/[slug]` == preview (só o CTA muda: preview mostra `buttonText`, live mostra "Pagar R$ X" — esperado).
- **Multistep** unificado em 2 etapas nos dois lados (antes o preview dizia "Etapa 1 de 3" e a pública tinha 2).
- **Vídeo no banner** renderiza `<video muted loop playsInline>` em ambos.
- **Trocar layout (Padrão/3 Etapas/Longo)** só altera `appearance.layoutType` → conteúdo/tema preservados.
- **Trocar template** só altera `templateId` (+ `themeOverrides`) → textos/ofertas/campos do formulário preservados.
- **Campos da aba Conteúdo** refletem no preview em tempo real (estado `config` → re-render).
- **Bundle público limpo**: `/c/[slug]` NÃO importa código do editor (tabs, `AssetUpload`, `CheckoutBuilderClient`) — verificado por grep no caminho de render. Página pública = 4,17 kB.

## Não alterado (deliberado)
- Lógica de pagamento (webhook/split/valores/PIX/cartão/boleto) — intacta, só movida a entrada de dados para a `form` API.
- Erros de lint PRÉ-EXISTENTES do restante do repo (centenas; o projeto builda com `eslint.ignoreDuringBuilds`). Os arquivos deste passo passam lint (`next lint` limpo neles) e type-check.

## Verificação
- `npm run build` → exit 0. `tsc --noEmit` nos arquivos tocados → 0 erros. `next lint` nos arquivos de render → limpo.
- Screenshots: desktop 2 colunas, mobile real 390px 1 coluna, e `/c/testando` idêntico ao preview (produto restaurado após o teste).
