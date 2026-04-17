import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
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
    default: "Black Gate",
    template: "%s | Black Gate",
  },
  description: "Gateway de pagamento seguro e eficiente para o seu negócio digital.",
  keywords: ["gateway de pagamento", "pix", "boleto", "cartão de crédito", "checkout"],
};

import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body antialiased bg-bg-void text-text-primary`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
