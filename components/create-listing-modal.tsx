"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateListingModal({ isOpen, onClose, onSuccess }: CreateListingModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        quantity: "",
        location: "",
        imageUrl: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/market/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to create listing");

            toast.success("Listing created successfully!");
            onSuccess();
            onClose();
            setFormData({ title: "", description: "", price: "", quantity: "", location: "", imageUrl: "" }); // Reset
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sell Produce</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label>Outcome / Product Name</Label>
                        <Input
                            placeholder="e.g. Fresh Tomatoes"
                            className="bg-slate-800 border-slate-700"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Price (KES)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 1500"
                                className="bg-slate-800 border-slate-700"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                placeholder="e.g. 50 kg"
                                className="bg-slate-800 border-slate-700"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="e.g. Nakuru, Pipeline"
                            className="bg-slate-800 border-slate-700"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <Input
                            placeholder="https://..."
                            className="bg-slate-800 border-slate-700"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                        <p className="text-xs text-slate-500">Paste a link to a photo of your produce.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe quality, delivery options, etc."
                            className="bg-slate-800 border-slate-700"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Post Listing
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
