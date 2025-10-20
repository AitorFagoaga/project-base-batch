"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "./ConnectButton";
import { usePathname } from "next/navigation";

export function Header() {
  const { address } = useAccount();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="glass-card border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-2"
            >
              <span className="text-3xl">🚀</span>
              <span className="hidden sm:inline">Meritocratic Launchpad</span>
              <span className="sm:hidden">ML</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/') 
                    ? 'bg-white/40 text-gray-900 shadow-sm' 
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                📊 Proyectos
              </Link>
              <Link 
                href="/create" 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/create') 
                    ? 'bg-white/40 text-gray-900 shadow-sm' 
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                ✨ Crear
              </Link>
              <Link 
                href="/reputation" 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/reputation') 
                    ? 'bg-white/40 text-gray-900 shadow-sm' 
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`}
              >
                ⭐ Reputación
              </Link>
              {address && (
                <>
                  <Link 
                    href={`/profile/${address}`}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      pathname?.startsWith('/profile/') && !pathname?.includes('/edit')
                        ? 'bg-white/40 text-gray-900 shadow-sm' 
                        : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                    }`}
                  >
                    👤 Mi Perfil
                  </Link>
                  <Link 
                    href="/profile/edit"
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      isActive('/profile/edit')
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-purple-500/80 text-white hover:bg-purple-600 shadow-sm'
                    }`}
                  >
                    ✏️ Editar
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex flex-wrap gap-2">
          <Link 
            href="/" 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive('/') 
                ? 'bg-white/40 text-gray-900 shadow-sm' 
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            📊 Proyectos
          </Link>
          <Link 
            href="/create" 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive('/create') 
                ? 'bg-white/40 text-gray-900 shadow-sm' 
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            ✨ Crear
          </Link>
          <Link 
            href="/reputation" 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive('/reputation') 
                ? 'bg-white/40 text-gray-900 shadow-sm' 
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            ⭐ Reputación
          </Link>
          {address && (
            <>
              <Link 
                href={`/profile/${address}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname?.startsWith('/profile/') && !pathname?.includes('/edit')
                    ? 'bg-white/40 text-gray-900 shadow-sm' 
                    : 'text-gray-700 hover:bg-white/20'
                }`}
              >
                👤 Perfil
              </Link>
              <Link 
                href="/profile/edit"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/profile/edit')
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-purple-500/80 text-white hover:bg-purple-600'
                }`}
              >
                ✏️ Editar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
