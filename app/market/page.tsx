"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Lock, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/payment-modal";
import { toast } from "sonner";

// Mock Market Data
const MARKET_DATA = [
    { crop: "Maize (90kg)", price: 4500, change: +120, location: "Nairobi", trend: "up" },
    { crop: "Beans (90kg)", price: 8200, change: -50, location: "Mombasa", trend: "down" },
    { crop: "Potatoes (50kg)", price: 3500, change: +200, location: "Nakuru", trend: "up" },
    { crop: "Tomatoes (crate)", price: 6000, change: +500, location: "Eldoret", trend: "up" },
    { crop: "Onions (net)", price: 1200, change: -100, location: "Kisumu", trend: "down" },
    { crop: "Avocado (kg)", price: 80, change: +5, location: "Meru", trend: "up" },
];

export default function MarketPage() {
    const { data: session, update } = useSession();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Check if user has active access
    // For demo purposes, we might need to refresh session to see update
    const hasAccess = session?.user?.marketAccessExpiry
        ? new Date(session.user.marketAccessExpiry) > new Date()
        : false;

    const handleUnlockSuccess = async () => {
        toast.success("Payment initiated! Access will be granted shortly.");
        // In a real app, we'd wait for the webhook to update the DB, then reload.
        // For now, let's just simulate a refresh or guide the user.
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-20 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Market Prices</h1>
                        <p className="text-slate-400">Real-time agricultural market data across Kenya.</p>
                    </div>
                    {hasAccess && (
                        <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                            PREMIUM ACTIVE
                        </div>
                    )}
                </div>

                {/* Market Grid */}
                <div className="relative">

                    {/* Access Lock Overlay */}
                    {!hasAccess && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 text-center">
                            <div className="bg-slate-800 p-4 rounded-full mb-4 shadow-xl">
                                <Lock className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Unlock Premium Market Insights</h2>
                            <p className="text-slate-300 mb-6 max-w-sm">
                                Get real-time prices, trends, and forecasts to sell at the best time.
                            </p>
                            <Button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-yellow-500/20 transition-all"
                            >
                                Unlock for KES 10
                            </Button>
                            <p className="text-xs text-slate-500 mt-4">One-time payment for 24h access</p>
                        </div>
                    )}

                    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${!hasAccess ? 'filter blur-md select-none opacity-50' : ''}`}>
                        {MARKET_DATA.map((item, i) => (
                            <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-all">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    {item.trend === 'up' ? <TrendingUp size={48} /> : <TrendingDown size={48} />}
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-slate-300 font-medium text-sm mb-1">{item.location}</h3>
                                        <p className="text-white font-bold text-lg">{item.crop}</p>
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${item.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {item.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {item.change > 0 ? '+' : ''}{item.change}
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs mb-0.5">Current Price</p>
                                        <p className="text-2xl font-bold text-white">KES {item.price.toLocaleString()}</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-8 text-xs border-slate-600 hover:bg-slate-700 text-slate-300">
                                        History
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4 text-blue-400" />
                        Market Updates
                    </h3>
                    <p className="text-sm text-slate-400">
                        Prices are updated daily at 6:00 AM EAT from major markets across Kenya.
                        Trends indicate change from previous day's closing price.
                    </p>
                </div>

            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                amount={10}
                onSuccess={handleUnlockSuccess}
            />
        </div>
    );
}
