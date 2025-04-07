import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })
const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: "SolSense",
  description: "Solana-based advertising platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@solana/wallet-adapter-react-ui@0.9.34/styles.css" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

