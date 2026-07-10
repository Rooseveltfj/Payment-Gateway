// ============================================================
// PulsePay — Fontes dos templates de checkout (next/font, subset latin, swap)
// Um único módulo carrega todas as famílias usadas pelos 8 temas.
// A className exportada expõe as CSS vars (--font-*) que os temas referenciam.
// Usada tanto no preview do builder quanto na página pública → nunca divergem.
// ============================================================
import { Inter, Playfair_Display, Oswald, Nunito, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-ck-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
  variable: "--font-ck-playfair",
});

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-ck-oswald",
});

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
  variable: "--font-ck-nunito",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
  variable: "--font-ck-mono",
});

/** Aplique em um ancestral do checkout para disponibilizar todas as CSS vars de fonte. */
export const checkoutFontVars = [
  inter.variable,
  playfair.variable,
  oswald.variable,
  nunito.variable,
  jetbrains.variable,
].join(" ");
