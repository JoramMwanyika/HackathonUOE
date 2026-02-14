"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Lock, TrendingUp, TrendingDown, RefreshCcw, Store, ShoppingCart, MapPin, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/payment-modal";
import { CreateListingModal } from "@/components/create-listing-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Image from "next/image";

// Mock Market Data (Premium)
const MARKET_DATA = [
    { crop: "Maize (90kg)", price: 4500, change: +120, location: "Nairobi", trend: "up" },
    { crop: "Beans (90kg)", price: 8200, change: -50, location: "Mombasa", trend: "down" },
    { crop: "Potatoes (50kg)", price: 3500, change: +200, location: "Nakuru", trend: "up" },
    { crop: "Tomatoes (crate)", price: 6000, change: +500, location: "Eldoret", trend: "up" },
    { crop: "Onions (net)", price: 1200, change: -100, location: "Kisumu", trend: "down" },
    { crop: "Avocado (kg)", price: 80, change: +5, location: "Meru", trend: "up" },
];

export default function MarketPage() {
    const { data: session } = useSession();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [listings, setListings] = useState<any[]>([]);
    const [loadingListings, setLoadingListings] = useState(false);

    // Premium Access Check
    const hasAccess = session?.user?.marketAccessExpiry
        ? new Date(session.user.marketAccessExpiry) > new Date()
        : false;

    const fetchListings = async () => {
        setLoadingListings(true);
        try {
            const res = await fetch("/api/market/listings");
            if (res.ok) {
                const data = await res.json();
                setListings(data);
            }
        } catch (error) {
            console.error("Failed to load listings", error);
        } finally {
            setLoadingListings(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleUnlockSuccess = () => {
        toast.success("Payment initiated! Access will be granted shortly.");
        setTimeout(() => window.location.reload(), 5000);
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-20 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Marketplace</h1>
                        <p className="text-slate-400">Track prices & trade with other farmers.</p>
                    </div>
                </div>

                <Tabs defaultValue="prices" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
                        <TabsTrigger value="prices" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Market Prices (Premium)
                        </TabsTrigger>
                        <TabsTrigger value="trading" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                            <Store className="w-4 h-4 mr-2" />
                            Farmer Trading (Free)
                        </TabsTrigger>
                    </TabsList>

                    {/* === TAB 1: PREMIUM PRICES === */}
                    <TabsContent value="prices" className="space-y-6 mt-6">
                        <div className="relative">
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
                                    {/* Simulation Button Removed for Cleanliness, but logic remains if desired */}
                                </div>
                            )}

                            <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${!hasAccess ? 'filter blur-md select-none opacity-50' : ''}`}>
                                {MARKET_DATA.map((item, i) => (
                                    <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-10">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>


                    {/* === TAB 2: FARMER TRADING === */}
                    <TabsContent value="trading" className="space-y-6 mt-6">
                        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="text-white font-bold text-lg">Buy & Sell Produce</h3>
                                <p className="text-sm text-slate-400">Directly trade with other farmers.</p>
                            </div>
                            <Button onClick={() => setIsListingModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                                <Store className="w-4 h-4 mr-2" />
                                Sell Produce
                            </Button>
                        </div>

                        {loadingListings ? (
                            <div className="text-center py-20 text-slate-500">Loading listings...</div>
                        ) : listings.length === 0 ? (
                            <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
                                <ShoppingCart className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                                <h3 className="text-white font-bold text-lg mb-2">No listings yet</h3>
                                <p className="text-slate-400 mb-6">Be the first to create a listing!</p>
                                <Button onClick={() => setIsListingModalOpen(true)} variant="outline" className="border-slate-600 text-slate-300">
                                    Start Selling
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {listings.map((listing) => (
                                    <div key={listing.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg hover:border-slate-600 transition-all flex flex-col">
                                        {listing.imageUrl ? (
                                            <div className="relative h-48 w-full bg-slate-900">
                                                <Image
                                                    src={listing.imageUrl}
                                                    alt={listing.title}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        // Fallback if image fails
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-slate-700 flex items-center justify-center text-slate-500">
                                                <Store className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}

                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-white line-clamp-1">{listing.title}</h3>
                                                <div className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                                                    {listing.quantity}
                                                </div>
                                            </div>

                                            <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">{listing.description}</p>

                                            <div className="space-y-3 mt-auto">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center text-slate-300">
                                                        <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                                                        {listing.location}
                                                    </div>
                                                    <div className="text-green-400 font-bold text-lg">
                                                        KES {listing.price.toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                                            {listing.seller?.image ? (
                                                                <Image src={listing.seller.image} alt={listing.seller.name || "User"} width={24} height={24} />
                                                            ) : (
                                                                <User className="w-3 h-3 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-slate-400 truncate max-w-[100px]">
                                                            {listing.seller?.name || "Farmer"}
                                                        </span>
                                                    </div>
                                                    <Button size="sm" onClick={() => toast.success(`Contacting ${listing.seller?.name || 'Seller'}...`)}>
                                                        Contact
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                amount={10}
                onSuccess={handleUnlockSuccess}
            />

            <CreateListingModal
                isOpen={isListingModalOpen}
                onClose={() => setIsListingModalOpen(false)}
                onSuccess={fetchListings}
            />
        </div>
    );
}
