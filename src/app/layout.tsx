import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { PageTransition } from "@/components/animations/PageTransition";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["500"],
});

export const metadata: Metadata = {
  title: {
    default: "PulsePay",
    template: "%s | PulsePay",
  },
  description: "Gateway de pagamento seguro e eficiente para o seu negcio digital.",
  keywords: ["gateway de pagamento", "pix", "boleto", "carto de crdito", "checkout", "pulsepay"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body antialiased bg-[#030507] text-[#f0f4f8]`}
      >
        <SessionProvider>
          <ToastProvider />
          <PageTransition>
            {children}
          </PageTransition>
        </SessionProvider>
      </body>
    </html>
  );
}
