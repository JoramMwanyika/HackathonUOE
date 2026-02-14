"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PaymentModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!phone || phone.length < 10) {
            toast.error("Enter a valid M-PESA number");
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

            if (res.ok) {
                toast.success("STK Push Sent! Check your phone.");
                onOpenChange(false);
                // Simulate immediate success for demo if no callback
                setTimeout(() => onSuccess(), 5000);
            } else {
                toast.error(data.error || "Payment Failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Unlock Market Prices</DialogTitle>
                    <DialogDescription>
                        Pay <strong>KES 10</strong> via M-PESA to access today's market prices.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input
                        placeholder="0712345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                    />
                    <Button onClick={handlePayment} disabled={loading} className="w-full bg-[#c0ff01] text-black hover:bg-[#b0ef00]">
                        {loading ? <Loader2 className="animate-spin" /> : "Pay Now"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
