import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@solana/wallet-adapter-react-ui/styles.css"
import { ThemeProvider } from "next-themes"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SolSense",
  description: "SolSense is a portfolio tracker for Solana",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      </body>
    </html>
  )
}

