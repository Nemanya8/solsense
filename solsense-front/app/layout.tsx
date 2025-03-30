import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@solana/wallet-adapter-react-ui/styles.css"
import { SidebarProvider } from "@/app/user/sidebar-provider"
import { WalletContextProvider } from "@/components/wallet-provider"
import { AuthProvider } from "@/lib/auth-context"

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
        <WalletContextProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}

