"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-card border-t border-white/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="CredFund" 
                className="h-10 w-10"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                CredFund
              </span>
            </Link>
            <p className="text-sm text-gray-600 text-center md:text-left">
              Reputation-Based Crowdfunding on Blockchain
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Projects
              </Link>
              <Link href="/create" className="text-gray-600 hover:text-gray-900 transition-colors">
                Create Project
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 transition-colors">
                Events
              </Link>
              <Link href="/reputation" className="text-gray-600 hover:text-gray-900 transition-colors">
                Reputation
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <a 
                href="https://sepolia.basescan.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Base Sepolia Explorer ↗
              </a>
              <a 
                href="https://docs.base.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Base Docs ↗
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>© {currentYear} CredFund. All rights reserved.</p>
            <p className="text-center sm:text-right">
              Built on{" "}
              <a 
                href="https://base.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Base
              </a>
              {" "}with ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
