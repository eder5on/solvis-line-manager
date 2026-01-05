import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutComponent from "~/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solvis Line Manager",
  description: "Gerenciador de linhas telefônicas da Solvis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <LayoutComponent>{children}</LayoutComponent>
      </body>
    </html>
  );
}
