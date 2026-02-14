"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, ArrowRight, Check, Plus, Trash2, Map, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Block = {
    id: number;
    name: string;
    crop: string;
    size: string;
};

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // step 1: Farm Details
    const [farmName, setFarmName] = useState("");
    const [farmLocation, setFarmLocation] = useState("");
    const [farmSize, setFarmSize] = useState("");
    const [sizeUnit, setSizeUnit] = useState("Acres");

    // step 2: Blocks
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [newBlock, setNewBlock] = useState({ name: "", crop: "", size: "" });

    const totalBlockSize = blocks.reduce((acc, b) => acc + (parseFloat(b.size) || 0), 0);
    const farmSizeNum = parseFloat(farmSize) || 0;
    const coveragePercent = farmSizeNum > 0 ? (totalBlockSize / farmSizeNum) * 100 : 0;

    const handleAddBlock = () => {
        if (!newBlock.name || !newBlock.size) return;

        setBlocks([...blocks, { ...newBlock, id: Date.now() }]);
        setNewBlock({ name: "", crop: "", size: "" });
    };

    const handleRemoveBlock = (id: number) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const currentStepIsValid = () => {
        if (step === 1) return farmName && farmSize;
        if (step === 2) return blocks.length > 0;
        return true;
    };

    const handleNext = async () => {
        if (step === 1) {
            setStep(2);
        } else {
            // Submit
            setIsLoading(true);
            try {
                const response = await fetch("/api/farm/onboarding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        farmName,
                        farmLocation,
                        farmSize,
                        sizeUnit,
                        blocks
                    })
                });

                if (response.ok) {
                    toast.success("Farm Setup Complete!");
                    router.push("/farm");
                } else {
                    throw new Error("Failed to save farm setup");
                }
            } catch (e) {
                toast.error("Something went wrong. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 text-slate-200 shadow-2xl z-10">
                <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-slate-700'}`} />
                        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-slate-700'}`} />
                    </div>
                    <CardTitle className="text-2xl font-serif text-white flex items-center gap-2">
                        {step === 1 ? <Map className="text-green-500" /> : <LayoutGrid className="text-green-500" />}
                        {step === 1 ? "Tell us about your Farm" : "Map your Fields"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        {step === 1 ? "Let's start with the basics to create your Digital Twin." : "Add your crop blocks to visualize your farm layout."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label>Farm Name</Label>
                                    <Input
                                        value={farmName}
                                        onChange={e => setFarmName(e.target.value)}
                                        placeholder="e.g. Green Valley Farm"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Location (Optional)</Label>
                                    <Input
                                        value={farmLocation}
                                        onChange={e => setFarmLocation(e.target.value)}
                                        placeholder="e.g. Nairobi, Kenya"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Total Size</Label>
                                        <Input
                                            type="number"
                                            value={farmSize}
                                            onChange={e => setFarmSize(e.target.value)}
                                            placeholder="10"
                                            className="bg-slate-950 border-slate-800"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Unit</Label>
                                        <Select value={sizeUnit} onValueChange={setSizeUnit}>
                                            <SelectTrigger className="bg-slate-950 border-slate-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Acres">Acres</SelectItem>
                                                <SelectItem value="Hectares">Hectares</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                                        <span>Total Farm Size: {farmSize} {sizeUnit}</span>
                                        <span>Points Used: {totalBlockSize.toFixed(1)} {sizeUnit}</span>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${coveragePercent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(coveragePercent, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-right text-xs mt-1 text-slate-500">{coveragePercent.toFixed(0)}% Covered</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Block Name (e.g. North Field)"
                                            value={newBlock.name}
                                            onChange={e => setNewBlock({ ...newBlock, name: e.target.value })}
                                            className="bg-slate-950 border-slate-800 flex-[2]"
                                        />
                                        <Input
                                            placeholder="Crop"
                                            value={newBlock.crop}
                                            onChange={e => setNewBlock({ ...newBlock, crop: e.target.value })}
                                            className="bg-slate-950 border-slate-800 flex-[2]"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Size"
                                            value={newBlock.size}
                                            onChange={e => setNewBlock({ ...newBlock, size: e.target.value })}
                                            className="bg-slate-950 border-slate-800 flex-[1]"
                                        />
                                        <Button onClick={handleAddBlock} size="icon" className="shrink-0 bg-green-600 hover:bg-green-700">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                        {blocks.map(block => (
                                            <div key={block.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                <div>
                                                    <p className="font-medium text-white">{block.name}</p>
                                                    <p className="text-xs text-slate-400">{block.crop} • {block.size} {sizeUnit}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveBlock(block.id)} className="text-red-400 hover:bg-red-950/30">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {blocks.length === 0 && (
                                            <div className="text-center py-8 text-slate-500 italic border-2 border-dashed border-slate-800 rounded-xl">
                                                No blocks added yet. Start adding above.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-slate-800 pt-6">
                    {step === 1 ? (
                        <Button variant="ghost" onClick={() => router.push('/')}>Cancel</Button>
                    ) : (
                        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    )}

                    <Button
                        onClick={handleNext}
                        className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-8"
                        disabled={!currentStepIsValid() || isLoading}
                    >
                        {isLoading ? "Setting up..." : (step === 2 ? "Finish Setup" : "Next Step")}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
