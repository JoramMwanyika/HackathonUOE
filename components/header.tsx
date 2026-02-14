"use client";

import { Leaf, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function Header({ title = "AgriVoice" }: { title?: string }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1e293b] border-b border-slate-700 shadow-lg shadow-black/20">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-inner">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              {title === "AgriVoice" ? "AgriVoice" : title}
            </h1>
            <p className="text-[10px] sm:text-xs text-white/90 font-medium -mt-0.5">Your Smart Farm Assistant</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-xs font-medium text-white">AI Active</span>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold shadow-md">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
