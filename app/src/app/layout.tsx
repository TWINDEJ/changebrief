import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "./locale-provider";
import { type Locale } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "changebrief — AI-powered webpage change monitoring",
  description: "Monitor web pages and get AI-powered summaries of what changed. No blurry screenshots. Just clear sentences.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || 'en';

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleProvider initialLocale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
