"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";
import { useIsContractOwner } from "@/hooks/useIsContractOwner";

interface SharedPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function SharedPageLayout({ children, title, description }: SharedPageLayoutProps) {
  const pathname = usePathname();
  const { isOwner } = useIsContractOwner();

  const baseNavItems = [
    { href: "/", label: "📊 Projects", pattern: /^\/$/ },
    { href: "/create", label: "✨ Create Project", pattern: /^\/create$/ },
    { href: "/reputation", label: "⭐ Reputation", pattern: /^\/reputation$/ },
  ];
  const adminNavItem = { href: "/admin", label: "👑 Admin", pattern: /^\/admin$/ };
  const navItems = isOwner ? [...baseNavItems, adminNavItem] : baseNavItems;
  const isActive = (pattern: RegExp) => pattern.test(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <header className="glass-card border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 drop-shadow-sm">
                🚀 Meritocratic Launchpad
              </h1>
              <p className="text-gray-800 mt-1 font-medium">
                Reputation-based crowdfunding on Base Sepolia
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <nav className="glass-card border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(item.pattern)
                    ? "text-gray-900 bg-white/40 shadow-md scale-105"
                    : "text-gray-800 hover:text-gray-900 hover:bg-white/20"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="text-center animate-fadeIn">
            <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm mb-3">
              {title}
            </h2>
            <p className="text-gray-800 text-lg font-medium">
              {description}
            </p>
          </div>
        </div>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {children}
        </main>
      </div>

      <footer className="mt-auto border-t border-white/20 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Built on Base Sepolia · Open Source</span>
          <span className="text-gray-500">
            Empowering reputation-backed crowdfunding.
          </span>
        </div>
      </footer>
    </div>
  );
}
