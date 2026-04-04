import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/components/auth/auth-guard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinanceFlow - Your Money. Your Future. Crystal Clear.",
  description: "Empower individuals to take complete control of their financial life through intelligent tracking, predictive insights, and beautiful design.",
  keywords: ["finance", "budget", "money", "tracking", "expenses", "savings", "goals"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}