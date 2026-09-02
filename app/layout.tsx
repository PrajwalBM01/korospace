import {
  Geist,
  Geist_Mono,
  Inter,
  Noto_Sans,
  Quantico,
  Khand,
} from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Metadata, Viewport } from "next"
import { siteUrl } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Korospace",
    template: "%s — korospace",
  },
  description:
    "Branch any AI answer into its own thread on an infinite canvas. Wire threads together, control exactly what context each node inherits, and switch models per node.",
  applicationName: "korospace",
  keywords: [
    "canvas ai chat",
    "branching conversations",
    "ai chat graph",
    "non-linear ai chat",
    "context graph",
    "multi-model chat",
    "bring your own key ai",
  ],
  authors: [{ name: "Prajwal BM" }],
  creator: "Prajwal BM",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "korospace",
    title: "korospace",
    description:
      "Branch any AI answer into its own thread on an infinite canvas. Wire threads together, control exactly what context each node inherits, and switch models per node.",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "korospace — canvas-based AI chat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "korospace",
    description:
      "Branch any AI answer into its own thread on an infinite canvas. Wire threads together, control exactly what context each node inherits, and switch models per node.",
    creator: "@xshadowdev",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
}

const notoSansHeading = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const quantico = Quantico({
  subsets: ["latin"],
  variable: "--font-quantico",
  weight: ["400", "700"],
})

const khand = Khand({
  subsets: ["latin"],
  variable: "--font-khand",
  weight: ["400", "700"],
})
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        notoSansHeading.variable,
        quantico.variable,
        khand.variable
      )}
    >
      <body>
        <Analytics />
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
