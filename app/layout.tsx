import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pantry Flow — Lista de Compras Inteligente",
  description:
    "Organize suas compras de forma simples e elegante. Adicione, gerencie e acompanhe todos os itens da sua lista de compras.",
  keywords: ["lista de compras", "mercado", "organização", "pantry flow"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
