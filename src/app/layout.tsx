import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
import { TWAWrapper } from "@/components/TWAWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Jovob — AI-конструктор ботов для бизнеса в Узбекистане",
    template: "%s | Jovob",
  },
  description:
    "Создайте AI-помощника для вашего бизнеса за 7 минут — без программирования. Telegram, Instagram, WhatsApp на русском и узбекском.",
  keywords: [
    "AI бот", "чат-бот", "Telegram бот", "Узбекистан", "конструктор ботов",
    "бот для бизнеса", "автоматизация", "Jovob", "chatbot", "no-code",
  ],
  authors: [{ name: "Jovob", url: "https://jovob.uz" }],
  creator: "Jovob",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://jovob.uz"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: "uz_UZ",
    siteName: "Jovob",
    title: "Jovob — AI-конструктор ботов для бизнеса",
    description: "Создайте AI-помощника для бизнеса за 7 минут. Telegram, Instagram, WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jovob — AI-конструктор ботов для бизнеса",
    description: "Создайте AI-помощника за 7 минут без программирования.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jovob",
  },
  icons: {
    apple: "/icons/icon.svg",
  },
  other: {
    "telegram:channel": "@jovob_uz",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <TRPCProvider>
          <TWAWrapper>{children}</TWAWrapper>
        </TRPCProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
  }
`,
          }}
        />
      </body>
    </html>
  );
}
