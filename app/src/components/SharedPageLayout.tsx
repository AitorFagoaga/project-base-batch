"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";
import { useIsContractOwner } from "@/hooks/useIsContractOwner";
import { useAccount } from "wagmi";

interface SharedPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function SharedPageLayout({ children, title, description }: SharedPageLayoutProps) {
  const pathname = usePathname();
  const { isOwner } = useIsContractOwner();
  const { address } = useAccount();

  const baseNavItems = [
    { href: "/", label: "📊 Projects", pattern: /^\/$/ },
    { href: "/create", label: "✨ Create Project", pattern: /^\/create$/ },
    { href: "/reputation", label: "⭐ Reputation", pattern: /^\/reputation$/ },
  ];
  
  // Add profile link if connected
  const profileNavItem = address 
    ? { href: `/profile/${address}`, label: "👤 My Profile", pattern: /^\/profile\/[^/]+$/ }
    : null;
  
  const adminNavItem = { href: "/admin", label: "👑 Admin", pattern: /^\/admin$/ };
  
  const eventsNavItem = { href: "/events", label: "🎟️ Events", pattern: /^\/events(\/.*)?$/ };
  const navItems = [
    ...baseNavItems,
    eventsNavItem,
    ...(profileNavItem ? [profileNavItem] : []),
    ...(isOwner ? [adminNavItem] : [])
  ];
  
  const isActive = (pattern: RegExp) => pattern.test(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="flex w-full items-center justify-between px-6 py-4 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
              Meritocratic Launchpad
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              Reputation-based crowdfunding on Base Sepolia
            </h1>
          </div>
          <ConnectButton />
        </div>
        <div className="w-full px-4 pb-4 lg:px-10">
          <nav className="flex flex-wrap items-center gap-3 rounded-full bg-gray-100/90 p-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(item.pattern)
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <section className="mb-10 rounded-3xl bg-white px-8 py-12 shadow-[0_30px_80px_-40px_rgba(79,70,229,0.45)] ring-1 ring-gray-100">
          <h2 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-4xl text-lg text-gray-500">
            {description}
          </p>
        </section>
        <main className="space-y-12">{children}</main>
      </div>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="flex w-full flex-col gap-2 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>Built on Base Sepolia · Open Source</span>
          <span className="text-gray-400">
            Empowering reputation-backed crowdfunding.
          </span>
        </div>
      </footer>
    </div>
  );
}
