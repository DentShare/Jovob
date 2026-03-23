"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { trpc } from "@/lib/trpc";
import { useDemo, type DemoBotData } from "./DemoContext";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Bot {
  id: string;
  name: string;
  description: string;
  businessType: string;
  isActive: boolean;
  personality: string;
  welcomeMessage: string;
  telegramToken: string | null;
  telegramBotName: string | null;
  botLanguages: string[];
  capabilities: string[];
  workingHours: unknown;
  address: string | null;
  managerContact: string | null;
  createdAt: Date;
  _count?: {
    orders: number;
    conversations: number;
    products: number;
  };
}

interface BotContextType {
  currentBot: Bot | DemoBotData | null;
  currentBotId: string | null;
  bots: Bot[];
  switchBot: (id: string) => void;
  isDemo: boolean;
  isLoading: boolean;
}

const BotContext = createContext<BotContextType | null>(null);

const LOCAL_STORAGE_KEY = "jovob_currentBotId";

// ─── Provider ───────────────────────────────────────────────────────────────

export function BotProvider({ children }: { children: ReactNode }) {
  const [currentBotId, setCurrentBotId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCAL_STORAGE_KEY);
    }
    return null;
  });

  // Try to fetch user's bots via tRPC
  const botsQuery = trpc.bot.getByUserId.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const bots = (botsQuery.data as Bot[] | undefined) ?? [];
  const isLoading = botsQuery.isLoading;
  const hasBots = bots.length > 0;
  const isDemo = !hasBots && !isLoading;

  // Auto-select first bot if none selected (or stored bot no longer exists)
  useEffect(() => {
    if (hasBots) {
      const storedId = currentBotId;
      const botExists = bots.some((b) => b.id === storedId);
      if (!botExists) {
        setCurrentBotId(bots[0].id);
      }
    }
  }, [hasBots, bots, currentBotId]);

  // Persist currentBotId to localStorage
  useEffect(() => {
    if (currentBotId && typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, currentBotId);
    }
  }, [currentBotId]);

  const switchBot = useCallback((id: string) => {
    setCurrentBotId(id);
  }, []);

  const currentBot = hasBots
    ? bots.find((b) => b.id === currentBotId) ?? bots[0]
    : null;

  return (
    <BotContext.Provider
      value={{
        currentBot,
        currentBotId: hasBots ? (currentBot as Bot)?.id ?? null : null,
        bots,
        switchBot,
        isDemo,
        isLoading,
      }}
    >
      {children}
    </BotContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useBotContext(): BotContextType {
  const ctx = useContext(BotContext);
  if (!ctx) {
    // Fallback when BotProvider is not in the tree
    return {
      currentBot: null,
      currentBotId: null,
      bots: [],
      switchBot: () => {},
      isDemo: true,
      isLoading: false,
    };
  }
  return ctx;
}
