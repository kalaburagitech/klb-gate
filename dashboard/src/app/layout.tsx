import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import DashboardWrapper from "@/components/DashboardWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KLB Connect | Enterprise Security Dashboard",
  description: "Next-gen multi-tenant security & community management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const saved = localStorage.getItem('klb_dashboard_theme');
              const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              if (saved === 'dark' || (!saved && mediaQuery.matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <DashboardWrapper>
              {children}
            </DashboardWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
