"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";

// Seed Data for Market Prices
const MARKET_DATA = [
    { crop: "Maize (90kg)", price: "KES 5,200", trend: "+2%" },
    { crop: "Beans (Yellow)", price: "KES 12,000", trend: "-1%" },
    { crop: "Potatoes (50kg)", price: "KES 3,500", trend: "+5%" },
    { crop: "Tomatoes (Crate)", price: "KES 8,000", trend: "+10%" },
];

export default function MarketPage() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    return (
        <div className="min-h-screen bg-[#f0efe9] pb-24">
            <Header title="Market Prices" />

            <main className="container px-4 py-6 max-w-md mx-auto space-y-6">
                <h2 className="text-2xl font-serif font-bold text-[#0a1f16]">Today's Prices</h2>

                <div className="grid gap-4">
                    {MARKET_DATA.map((item, i) => (
                        <div key={i} className="relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center overflow-hidden">
                            {/* Blurred Content if Locked */}
                            <div className={`flex justify-between w-full items-center ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                                <div>
                                    <h3 className="font-bold text-gray-800">{item.crop}</h3>
                                    <p className="text-xs text-gray-500">Nairobi Market</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#14532d]">{item.price}</p>
                                    <p className={`text-xs font-medium ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.trend}
                                    </p>
                                </div>
                            </div>

                            {/* Lock Overlay */}
                            {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!isUnlocked && (
                    <div className="bg-[#0a1f16] p-6 rounded-2xl text-center text-white space-y-4 shadow-xl">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                            <Lock className="w-6 h-6 text-[#c0ff01]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Unlimited Access</h3>
                            <p className="text-gray-400 text-sm">Unlock daily market prices for 24 hours.</p>
                        </div>
                        <Button
                            onClick={() => setShowPayment(true)}
                            className="w-full bg-[#c0ff01] text-[#0a1f16] hover:bg-[#b0ef00] font-bold"
                        >
                            Unlock for KES 10
                        </Button>
                    </div>
                )}

                <PaymentModal
                    open={showPayment}
                    onOpenChange={setShowPayment}
                    onSuccess={() => setIsUnlocked(true)}
                />
            </main>

            <BottomNav />
        </div>
    );
}
