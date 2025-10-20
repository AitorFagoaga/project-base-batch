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
  const { isOwner, isLoading: isCheckingOwner } = useIsContractOwner();

  // Base navigation items (always visible)
  const baseNavItems = [
    { href: "/", label: "📊 Projects", pattern: /^\/$/ },
    { href: "/create", label: "✨ Create Project", pattern: /^\/create$/ },
    { href: "/reputation", label: "⭐ Reputation", pattern: /^\/reputation$/ },
  ];

  // Admin item (only for owner)
  const adminNavItem = { href: "/admin", label: "👑 Admin", pattern: /^\/admin$/ };

  // Conditionally include Admin link if user is owner
  const navItems = isOwner
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;

  const isActive = (pattern: RegExp) => pattern.test(pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
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

      {/* Navigation */}
      <nav className="glass-card border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
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

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="text-center animate-fadeIn">
          <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm mb-3">
            {title}
          </h2>
          <p className="text-gray-800 text-lg font-medium">
            {description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {children}
      </main>
    </div>
  );
}
