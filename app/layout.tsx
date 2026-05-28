import type { Metadata, Viewport } from "next"
import { Source_Serif_4, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "KAAL AI - Mental Wellness Companion",
  description:
    "Your safe space for emotional support, guided meditation, and mental wellness. Connect with AI-powered conversations, meditation exercises, and professional therapists.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable}`}
      suppressHydrationWarning // Prevents extensions from breaking HTML-level attributes
    >
      <body 
        className="font-sans antialiased bg-background text-foreground min-h-screen"
        suppressHydrationWarning // Prevents extensions from breaking body-level attributes (like cz-shortcut-listen)
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}