import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ThemeScript from "@/components/ThemeScript";
import { THEME_COLORS } from "@/lib/theme";

// 사이트 주소: SITE_URL(서버 전용) → Vercel 프로덕션 도메인 → localhost (rss.xml과 같은 규칙)
function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

const DESCRIPTION =
  "만든 게임과 개발 과정을 기록하는 유니티 개발 일지 / 포트폴리오";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Unity Devlog & Portfolio",
    template: "%s | Unity Devlog",
  },
  description: DESCRIPTION,
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: {
    type: "website",
    siteName: "Unity Devlog & Portfolio",
    title: "Unity Devlog & Portfolio",
    description: DESCRIPTION,
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Header />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
