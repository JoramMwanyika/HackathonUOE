"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, X, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { startContinuousRecognition, speakText } from "@/lib/speech";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const LANGUAGES = [
    { code: "en", name: "English (US)", nativeName: "English" },
    { code: "sw", name: "Swahili (Kenya)", nativeName: "Kiswahili" },
    { code: "kik", name: "Kikuyu (Kenya)", nativeName: "Gĩkũyũ" },
    { code: "luo", name: "Luo (Kenya)", nativeName: "Dholuo" },
    { code: "ha", name: "Hausa (Nigeria)", nativeName: "Hausa" },
    { code: "ig", name: "Igbo (Nigeria)", nativeName: "Igbo" },
    { code: "yo", name: "Yoruba (Nigeria)", nativeName: "Yorùbá" },
    { code: "zu", name: "Zulu (South Africa)", nativeName: "isiZulu" },
    { code: "xh", name: "Xhosa (South Africa)", nativeName: "isiXhosa" },
    { code: "af", name: "Afrikaans (South Africa)", nativeName: "Afrikaans" },
    { code: "am", name: "Amharic (Ethiopia)", nativeName: "አማርኛ" },
    { code: "rw", name: "Kinyarwanda (Rwanda)", nativeName: "Ikinyarwanda" },
    { code: "ln", name: "Lingala (DRC)", nativeName: "Lingála" },
];

interface Message {
    id: string;
    role: "ai" | "user";
    text: string;
}

export function ChatOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [language, setLanguage] = useState("en");

    const continuousRecognitionRef = useRef<{ stop: () => void } | null>(null);

    // Stop speaking/recording if closed
    useEffect(() => {
        if (!isOpen) {
            if (continuousRecognitionRef.current) {
                continuousRecognitionRef.current.stop();
                continuousRecognitionRef.current = null;
            }
            setIsRecording(false);
            setIsSpeaking(false);
            // Speech synth cancel might be needed if using browser API, but Azure speech will cut off gracefully or just play out
        }
    }, [isOpen]);

    const startRecordingSession = async () => {
        setInputValue(""); // clear old input
        setIsRecording(true);
        try {
            continuousRecognitionRef.current = await startContinuousRecognition(
                (text) => {
                    if (text.trim()) {
                        // Immediately send continuous utterances for a snappier feel, 
                        // or accumulate. For true conversational, sending the chunk is best.
                        setInputValue(text);
                        sendToAI(text); // auto send when speech segment is recognized
                    }
                },
                (err) => {
                    console.error("Speech Recog Error:", err);
                    setIsRecording(false);
                },
                (listening) => {
                    // callback
                },
                language
            );
        } catch (e) {
            toast.error("Could not start microphone");
            setIsRecording(false);
        }
    };

    const sendToAI = async (text: string) => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setIsRecording(false);
        if (continuousRecognitionRef.current) {
            continuousRecognitionRef.current.stop();
            continuousRecognitionRef.current = null;
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        ...messages.slice(-5).map(m => ({ role: m.role, text: m.text })),
                        { role: "user", text }
                    ],
                    language
                }),
            });

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text }, { id: (Date.now() + 1).toString(), role: "ai", text: data.message }]);

            setIsLoading(false);
            setIsSpeaking(true);
            setInputValue(""); // Clear user text since AI is responding

            // Speak response
            await speakText(data.message.replace(/[*_#`\[\]]/g, ''), language);
            setIsSpeaking(false);

            // Auto-resume recording for conversational flow only if still open
            if (isOpen) {
                setTimeout(() => {
                    startRecordingSession();
                }, 500);
            }

        } catch (e) {
            toast.error("Failed to get response from AgriTwin AI");
            setIsLoading(false);
        }
    };

    const toggleRecording = async () => {
        if (isSpeaking) {
            // Can't interrupt right now or not implemented fully
            toast.info("Please wait for the response to finish.");
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            if (continuousRecognitionRef.current) {
                continuousRecognitionRef.current.stop();
                continuousRecognitionRef.current = null;
            }
            // Send what they said manually if segment didn't trigger
            if (inputValue.trim()) {
                sendToAI(inputValue);
            }
        } else {
            startRecordingSession();
        }
    };

    // Derived display text
    const displayText = inputValue || (isRecording ? "Listening..." : "Tap the microphone to start speaking");

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                    {/* Blurred background */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/60 backdrop-blur-xl pointer-events-auto"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-3xl h-full max-h-[800px] relative z-10 flex flex-col pointer-events-none items-center justify-center"
                    >
                        {/* Top Controls: Close and Language */}
                        <div className="absolute top-4 left-4 flex pointer-events-auto">
                            <div className="bg-white/90 backdrop-blur-md rounded-full border border-slate-200 shadow-sm flex items-center pr-2">
                                <div className="pl-4 pr-2 text-slate-500">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="border-0 shadow-none focus:ring-0 bg-transparent font-medium h-10 w-[160px]">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 z-[200]">
                                        {LANGUAGES.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{lang.nativeName}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{lang.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 pointer-events-auto">
                            <Button variant="outline" size="icon" onClick={onClose} className="rounded-full bg-white/90 backdrop-blur-md border-slate-200 shadow-sm hover:bg-white text-slate-600 h-10 w-10">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Top Transcript Card */}
                        <div className="absolute top-32 w-full px-4 pointer-events-none flex justify-center">
                            <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-[20px] p-6 text-center border border-slate-100 max-w-lg w-full min-h-[120px] flex items-center justify-center transition-all duration-300 transform">
                                <p className={cn("text-lg font-medium leading-relaxed transition-colors", !inputValue && !isRecording ? "text-slate-400 italic" : "text-slate-800")}>
                                    {displayText}
                                </p>
                            </div>
                        </div>

                        {/* Central Microphone Widget */}
                        <div className="relative mt-8 pointer-events-auto cursor-pointer group" onClick={toggleRecording}>
                            {/* Pulsing rings */}
                            {isRecording && (
                                <>
                                    <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full border border-green-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
                                    <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full border border-teal-300 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
                                    <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full border border-teal-200 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-25"></div>
                                </>
                            )}

                            {isSpeaking && (
                                <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-green-500/10 animate-pulse"></div>
                            )}

                            <div className={cn(
                                "relative z-10 h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                                isRecording ? "bg-slate-700 shadow-green-500/30 scale-105" : "bg-slate-800 hover:bg-slate-900 shadow-slate-900/40"
                            )}>
                                <Mic className={cn("h-14 w-14 transition-colors", isRecording ? "text-green-400" : "text-white group-hover:text-green-300")} />
                            </div>
                        </div>

                        {/* Bottom Status Card */}
                        <div className="absolute bottom-32 w-full px-8 flex justify-center pointer-events-none">
                            <AnimatePresence>
                                {(isLoading || isSpeaking || isRecording) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="bg-white/95 backdrop-blur-md shadow-lg rounded-full px-6 py-3.5 border border-slate-100 flex items-center gap-3 pointer-events-auto"
                                    >
                                        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-500" />}
                                        {isSpeaking && <div className="flex gap-1 items-center justify-center h-5">
                                            <div className="w-1.5 rounded-full bg-green-500 h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 rounded-full bg-green-500 h-4 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 rounded-full bg-green-500 h-3 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>}
                                        {isRecording && <div className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />}

                                        <span className="font-semibold text-slate-700 text-sm">
                                            {isLoading && "Processing your request..."}
                                            {isSpeaking && "AgriTwin is responding..."}
                                            {isRecording && "Listening..."}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
