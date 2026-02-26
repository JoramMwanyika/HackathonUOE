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
import { Header } from "@/components/header";

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
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            <Header />

            <main className="container mx-auto px-4 max-w-7xl py-6 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Marketplace</h1>
                        <p className="text-slate-500 font-medium">Track prices & trade with other farmers.</p>
                    </div>
                </div>

                <Tabs defaultValue="prices" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1 rounded-xl">
                        <TabsTrigger value="prices" className="data-[state=active]:bg-white data-[state=active]:text-slate-800 text-slate-500 rounded-lg py-2.5 font-bold shadow-sm transition-all">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Market Prices (Premium)
                        </TabsTrigger>
                        <TabsTrigger value="trading" className="data-[state=active]:bg-white data-[state=active]:text-slate-800 text-slate-500 rounded-lg py-2.5 font-bold shadow-sm transition-all">
                            <Store className="w-4 h-4 mr-2" />
                            Farmer Trading (Free)
                        </TabsTrigger>
                    </TabsList>

                    {/* === TAB 1: PREMIUM PRICES === */}
                    <TabsContent value="prices" className="space-y-6 mt-6">
                        <div className="relative">
                            {!hasAccess && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md rounded-[20px] border border-slate-200 p-6 text-center shadow-sm">
                                    <div className="bg-yellow-50 p-4 rounded-full mb-4 shadow-sm border border-yellow-100">
                                        <Lock className="w-8 h-8 text-yellow-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">Unlock Premium Market Insights</h2>
                                    <p className="text-slate-600 mb-6 max-w-sm font-medium">
                                        Get real-time prices, trends, and forecasts to sell at the best time.
                                    </p>
                                    <button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-md transition-all text-lg"
                                    >
                                        Unlock for KES 10
                                    </button>
                                </div>
                            )}

                            <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${!hasAccess ? 'filter blur-md select-none opacity-50' : ''}`}>
                                {MARKET_DATA.map((item, i) => (
                                    <div key={i} className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-900 group-hover:opacity-10 transition-opacity">
                                            {item.trend === 'up' ? <TrendingUp size={64} /> : <TrendingDown size={64} />}
                                        </div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">{item.location}</h3>
                                                <p className="text-slate-800 font-bold text-xl">{item.crop}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${item.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {item.change > 0 ? '+' : ''}{item.change}
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-slate-500 text-sm font-medium mb-1">Current Price</p>
                                                <p className="text-3xl font-black text-slate-800 tracking-tight">
                                                    KES {item.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>


                    {/* === TAB 2: FARMER TRADING === */}
                    <TabsContent value="trading" className="space-y-6 mt-6">
                        <div className="flex justify-between items-center bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm">
                            <div>
                                <h3 className="text-slate-800 font-bold text-xl mb-1">Buy & Sell Produce</h3>
                                <p className="text-slate-500 font-medium">Directly trade with other farmers.</p>
                            </div>
                            <button onClick={() => setIsListingModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-md shadow-green-500/20 transition-all">
                                <Store className="w-5 h-5 mr-2" />
                                Sell Produce
                            </button>
                        </div>

                        {loadingListings ? (
                            <div className="text-center py-20 text-slate-500 font-medium">
                                <div className="h-8 w-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
                                Loading listings...
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[20px] border border-slate-200 border-dashed shadow-sm">
                                <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-slate-800 font-bold text-xl mb-2">No listings yet</h3>
                                <p className="text-slate-500 mb-6 font-medium">Be the first to create a listing!</p>
                                <Button onClick={() => setIsListingModalOpen(true)} variant="outline" className="border-slate-300 text-slate-600 font-bold rounded-xl">
                                    Start Selling
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {listings.map((listing) => (
                                    <div key={listing.id} className="bg-white rounded-[20px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                                        {listing.imageUrl ? (
                                            <div className="relative h-48 w-full bg-slate-100 border-b border-slate-100">
                                                <Image
                                                    src={listing.imageUrl}
                                                    alt={listing.title}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-48 bg-slate-50 flex items-center justify-center text-slate-300 border-b border-slate-100">
                                                <Store className="w-12 h-12 opacity-50" />
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-bold text-slate-800 line-clamp-1 pr-2">{listing.title}</h3>
                                                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-blue-100">
                                                    {listing.quantity}
                                                </div>
                                            </div>

                                            <p className="text-slate-600 font-medium text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
                                                {listing.description}
                                            </p>

                                            <div className="space-y-4 mt-auto">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center text-slate-500 font-semibold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                        <MapPin className="w-4 h-4 mr-1.5" />
                                                        {listing.location}
                                                    </div>
                                                    <div className="text-green-600 font-black text-xl tracking-tight">
                                                        KES {listing.price.toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                            {listing.seller?.image ? (
                                                                <Image src={listing.seller.image} alt={listing.seller.name || "User"} width={32} height={32} />
                                                            ) : (
                                                                <User className="w-4 h-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">
                                                            {listing.seller?.name || "Farmer"}
                                                        </span>
                                                    </div>
                                                    <Button className="rounded-xl px-5" onClick={() => toast.success(`Contacting ${listing.seller?.name || 'Seller'}...`)}>
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

            </main>

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
