import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "AI Consortium — Enterprise Financial Intelligence & AI Co-Founder Platform",
  description: "AI Consortium is an enterprise customer intelligence and business growth platform. Deep financial ratio audits, solvency diagnostics, cohort retention matrices, and strategic AI co-founder action command.",
  keywords: ["AI Consortium", "business intelligence", "financial analytics", "MSME", "P&L audit", "cohort analysis", "AI co-founder"],
  authors: [{ name: "AI Consortium" }],
  openGraph: {
    title: "AI Consortium — Financial Intelligence & Co-Founder Platform",
    description: "Enterprise multi-statement reasoning and business growth intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#070B14" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
