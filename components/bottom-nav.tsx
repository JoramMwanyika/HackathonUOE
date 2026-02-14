"use client";

import { Home, Sprout, MessageSquare, Users, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "Farm", icon: Sprout, href: "/farm" },
    { name: "Market", icon: ArrowUpRight, href: "/market" },
    { name: "AgriVoice", icon: MessageSquare, href: "/advisor" },
    { name: "Team", icon: Users, href: "/team" },
    { name: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b] border-t border-slate-700 pb-safe shadow-2xl shadow-black/20">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-all duration-300 group",
                isActive
                  ? "text-[#22c55e]"
                  : "text-slate-500 hover:text-[#22c55e]"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#22c55e] rounded-full shadow-lg shadow-green-500/50 animate-in slide-in-from-top-2 duration-300" />
              )}
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive
                  ? "bg-slate-800 scale-110"
                  : "group-hover:bg-slate-800 group-hover:scale-105"
              )}>
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive && "stroke-[2.5px]"
                  )}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-wide transition-all duration-300",
                isActive && "font-bold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
