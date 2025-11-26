import "@/styles/globals.css";
import { Metadata, Viewport } from "next";

import CommandSearch from "@/components/CommandSearch";
import Footer from "@/components/Footer";
import Navbar from "@/components/shadcn-studio/blocks/navbar-component-01/navbar-component-01";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <Script
          defer
          strategy="afterInteractive"
          src="https://umami.dakheera47.com/script.js"
          data-website-id="b03b24bd-ab9a-4cf0-bda5-c44d05166bc0"
        />

        <Analytics />

        <NuqsAdapter>
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              fontSans.variable,
            )}
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex min-h-screen flex-col">
                <CommandSearch />

                <Navbar />
                <div className="flex-1">{children}</div>

                <Footer />
              </div>

              <TailwindIndicator />
            </ThemeProvider>
          </body>
        </NuqsAdapter>
      </html>
    </>
  );
}
