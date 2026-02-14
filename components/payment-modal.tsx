"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount }: PaymentModalProps) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!phone.match(/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/)) {
            toast.error("Please enter a valid Safaricom phone number");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/payhero/stk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Payment failed");

            toast.success("STK Push sent! Please check your phone.");

            // In a real app, we would poll for status here. 
            // For hackathon/demo, we might optimistically succeed or wait for a webhook.
            // Let's assume user pays and we verified it (or just simulate success for now if backend poll isn't ready)

            // For now, let's just close and let the user refresh or handle the callback logic if implemented.
            // Actually, best UX is to wait a bit or tell them to check phone.

            onSuccess();
            onClose();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        M-PESA Payment
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Unlock premium market insights for <span className="text-green-400 font-bold">KES {amount}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                        <Input
                            id="phone"
                            placeholder="0712345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                        />
                        <p className="text-xs text-slate-500">Enter your M-PESA registered number.</p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending Request...
                            </>
                        ) : (
                            "Pay Now"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
