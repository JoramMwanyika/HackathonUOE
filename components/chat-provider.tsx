"use client";

import React, { createContext, useContext, useState } from "react";
import { ChatOverlay } from "./chat-overlay";
import { useSession } from "next-auth/react";

interface ChatContextType {
    isChatOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    return (
        <ChatContext.Provider
            value={{
                isChatOpen: isOpen,
                openChat: () => setIsOpen(true),
                closeChat: () => setIsOpen(false),
                toggleChat: () => setIsOpen((prev) => !prev),
            }}
        >
            {children}
            {session && <ChatOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
