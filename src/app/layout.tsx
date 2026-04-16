import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-text-primary`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
