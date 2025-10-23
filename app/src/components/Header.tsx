"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "./ConnectButton";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { CONTRACTS } from "@/lib/contracts";
import { EVENT_MANAGER } from "@/lib/eventManager";

// Hardcoded admin addresses (lowercase for comparison)
const ADMIN_ADDRESSES = [
  "0xaa860e97f1a50ca6ce786aef9b835052dfd0ee25",
  "0x31a42406422e72dc790cf42ed978458b0b00bd06",
];

export function Header() {
  const { address } = useAccount();
  const pathname = usePathname();

  // Check if user is admin
  const { data: reputationOwner } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "owner",
  });

  const { data: adminRole } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "ADMIN_ROLE",
    query: {
      enabled: !!address
    }
  });
  
  const { data: isEventAdmin } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "hasRole", 
    args: adminRole && address ? [adminRole as `0x${string}`, address] : undefined,
    query: { 
      enabled: !!address && !!adminRole 
    } 
  });

  const isReputationOwner = address && reputationOwner && address.toLowerCase() === reputationOwner.toLowerCase();
  const isHardcodedAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase());
  const isAdmin = isReputationOwner || isEventAdmin === true || isHardcodedAdmin;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="glass-card border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Section - Logo and Name */}
        <div className="py-4 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center justify-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/logo.png" 
              alt="CredFund" 
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                CredFund
              </span>
              <span className="text-xs text-gray-600 hidden sm:block">Reputation-Based Crowdfunding</span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isActive('/')
                    ? 'bg-white/40 text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                <Icon name="chart" size="sm" />
                Projects
              </Link>
              <Link
                href="/create"
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isActive('/create')
                    ? 'bg-white/40 text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                <Icon name="sparkles" size="sm" />
                Create
              </Link>
              <Link
                href="/reputation"
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isActive('/reputation')
                    ? 'bg-white/40 text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                <Icon name="star" size="sm" />
                Reputation
              </Link>
              <Link
                href="/events"
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  pathname?.startsWith('/events')
                    ? 'bg-white/40 text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                <Icon name="calendar" size="sm" />
                Events
              </Link>
              {address && (
                <>
                  <Link
                    href={`/profile/${address}`}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      pathname?.startsWith('/profile/') && !pathname?.includes('/edit')
                        ? 'bg-white/40 text-gray-900 shadow-sm'
                        : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                    }`}
                  >
                    <Icon name="user" size="sm" />
                    My Profile
                  </Link>
                  <Link
                    href="/profile/edit"
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      isActive('/profile/edit')
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-purple-500/80 text-white hover:bg-purple-600 shadow-sm'
                    }`}
                  >
                    <Icon name="edit" size="sm" />
                    Edit
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        pathname?.startsWith('/admin')
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-red-500/80 text-white hover:bg-red-600 shadow-sm'
                      }`}
                    >
                      <Icon name="settings" size="sm" />
                      Admin
                    </Link>
                  )}
                </>
              )}
            </nav>
            
            <div className="flex items-center gap-4 md:ml-auto">
              <ConnectButton />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-3 flex flex-wrap gap-2 justify-center">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/')
                  ? 'bg-white/40 text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              <Icon name="chart" size="xs" />
              Projects
            </Link>
            <Link
              href="/create"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/create')
                  ? 'bg-white/40 text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              <Icon name="sparkles" size="xs" />
              Create
            </Link>
            <Link
              href="/reputation"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/reputation')
                  ? 'bg-white/40 text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              <Icon name="star" size="xs" />
              Reputation
            </Link>
            <Link
              href="/events"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                pathname?.startsWith('/events')
                  ? 'bg-white/40 text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              <Icon name="calendar" size="xs" />
              Events
            </Link>
            {address && (
              <>
                <Link
                  href={`/profile/${address}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    pathname?.startsWith('/profile/') && !pathname?.includes('/edit')
                      ? 'bg-white/40 text-gray-900 shadow-sm'
                      : 'text-gray-700 hover:bg-white/20'
                  }`}
                >
                  <Icon name="user" size="xs" />
                  Profile
                </Link>
                <Link
                  href="/profile/edit"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive('/profile/edit')
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-500/80 text-white hover:bg-purple-600'
                  }`}
                >
                  <Icon name="edit" size="xs" />
                  Edit
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      pathname?.startsWith('/admin')
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-red-500/80 text-white hover:bg-red-600'
                    }`}
                  >
                    <Icon name="settings" size="xs" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
