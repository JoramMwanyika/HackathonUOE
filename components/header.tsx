"use client";

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Leaf, User, Mic } from 'lucide-react'
import { Button } from "./ui/button";

export function Header({ title }: { title?: string }) {
  const pathname = usePathname()

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tasks', href: '/tasks' },  // Renamed from calendar
    { name: 'Market', href: '/market' },
    { name: 'Scan Crops', href: '/scan' }, // Renamed from advisor
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-800 text-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-green-500 rounded-full p-1 border-2 border-slate-800">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <Link href="/dashboard" className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
            AgriTwin
            {title && (
              <>
                <span className="text-slate-500 mx-2">/</span>
                <span className="text-slate-300 font-medium text-base">{title}</span>
              </>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white ${isActive
                    ? 'text-green-400 border-b-2 border-green-400 py-5'
                    : 'text-slate-400'
                  }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Right Section: Profile & Chat Trigger */}
        <div className="flex items-center gap-4">
          {/* Voice/Chat trigger could go here if not floating */}

          <div className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 pl-2 pr-3 py-1.5 rounded-full cursor-pointer transition-colors border border-slate-600">
            <div className="h-7 w-7 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden border border-slate-500">
              {/* Placeholder Image can go here */}
              <User className="h-4 w-4 text-slate-300" />
            </div>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-slate-400">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}
