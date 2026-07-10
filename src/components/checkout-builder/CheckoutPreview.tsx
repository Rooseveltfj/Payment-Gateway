"use client";

import { CheckoutConfig } from "@/types/checkout-config";
import { CheckoutRenderer } from "@/components/checkout/CheckoutRenderer";

interface Props {
  config: CheckoutConfig;
  /** @deprecated responsividade agora é por container-query (largura do container). */
  isMobile?: boolean;
}

// Preview do builder = o MESMO CheckoutRenderer da página pública, em modo estático.
// A largura do container (desktop full vs mobile 390px) define o breakpoint real.
export function CheckoutPreview({ config }: Props) {
  return <CheckoutRenderer config={config} mode="preview" />;
}
