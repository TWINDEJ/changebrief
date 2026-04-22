import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Geist_Mono, Instrument_Serif } from "next/font/google";
import { LocaleProvider } from "./locale-provider";
import { type Locale } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  // "cv11" = single-story 'a', "ss01" = slashed zero för data-läsbarhet.
  // "cv02" = öppen '4'. Håller text kristallklar utan att kosta bytes.
  // Inter levererar dessa som OpenType-features när vi aktiverar dem via CSS.
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Editorial serif för display-text (wordmark, stora rubriker, hero-nummer).
// Används sparsamt — kontrast mot Inter-kroppen ger "redaktionellt SaaS"-känsla
// utan att appen blir en tidning.
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('cb-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}})()` }} />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <LocaleProvider initialLocale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
