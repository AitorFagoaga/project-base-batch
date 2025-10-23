"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../styles/globals.css";

// Create QueryClient outside component to avoid recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5000, // 5 seconds
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>CredFund | Reputation-Based Crowdfunding on Blockchain</title>
        <meta name="description" content="CredFund is a decentralized crowdfunding platform that rewards contributors with reputation tokens. Create projects, earn badges, and build your on-chain reputation on Base blockchain." />
        <meta name="keywords" content="crowdfunding, blockchain, Base, cryptocurrency, reputation, web3, decentralized, DeFi, NFT badges, events" />
        <meta name="author" content="CredFund" />
        <link rel="icon" href="/logo.png" type="image/png" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://credfund.app/" />
        <meta property="og:title" content="CredFund | Reputation-Based Crowdfunding on Blockchain" />
        <meta property="og:description" content="Decentralized crowdfunding platform that rewards contributors with reputation tokens. Build your on-chain reputation on Base." />
        <meta property="og:image" content="/logo.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://credfund.app/" />
        <meta name="twitter:title" content="CredFund | Reputation-Based Crowdfunding" />
        <meta name="twitter:description" content="Decentralized crowdfunding platform on Base blockchain. Earn reputation tokens for your contributions." />
        <meta name="twitter:image" content="/logo.png" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="canonical" href="https://credfund.app/" />
      </head>
      <body className="flex flex-col min-h-screen">
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider locale="en-US">
              <Toaster position="top-right" />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
