"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

export interface WizardState {
  currentStep: number;
  language: "ru" | "uz" | "en";
  botLanguages: string[];
  businessType: string;
  customBusinessType?: string;
  capabilities: string[];
  businessInfo: {
    name: string;
    description: string;
    workingHoursFrom: string;
    workingHoursTo: string;
    workingDays: string[];
    address: string;
    managerContact: string;
  };
  products: Array<{
    name: string;
    price: number;
    category: string;
    description: string;
    imageUrl?: string;
  }>;
  faqItems: Array<{ question: string; answer: string; isAutoGen: boolean }>;
  telegramToken: string;
  personality: "formal" | "friendly" | "fun";
  botName: string;
  welcomeMessage: string;
}

const defaultState: WizardState = {
  currentStep: 1,
  language: "ru",
  botLanguages: [],
  businessType: "",
  customBusinessType: undefined,
  capabilities: [],
  businessInfo: {
    name: "",
    description: "",
    workingHoursFrom: "09:00",
    workingHoursTo: "18:00",
    workingDays: ["mon", "tue", "wed", "thu", "fri"],
    address: "",
    managerContact: "",
  },
  products: [],
  faqItems: [],
  telegramToken: "",
  personality: "friendly",
  botName: "",
  welcomeMessage: "",
};

interface WizardContextValue {
  state: WizardState;
  setStepData: (data: Partial<WizardState>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  getCurrentStep: () => number;
  direction: number;
  completeWizard: () => Promise<{ id: string; name: string } | null>;
  isCompleting: boolean;
  completeError: string | null;
  isInitialized: boolean;
}

const WizardContext = createContext<WizardContextValue | null>(null);

const STORAGE_KEY = "jovob_wizard_state";

function getClientId(): string {
  if (typeof window === "undefined") return "server";
  let clientId = localStorage.getItem("jovob_client_id");
  if (!clientId) {
    clientId = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("jovob_client_id", clientId);
  }
  return clientId;
}

function loadState(): WizardState {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultState;
}

function saveState(state: WizardState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);
  const [direction, setDirection] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialized = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tRPC hooks — always called (rules of hooks), but we guard actual usage
  const saveStepMutation = trpc.wizard.saveStep.useMutation();
  const completeMutation = trpc.wizard.complete.useMutation();

  useEffect(() => {
    if (!initialized.current) {
      setState(loadState());
      initialized.current = true;
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      saveState(state);
    }
  }, [state]);

  // Debounced save to backend
  const debounceSaveToBackend = useCallback(
    (step: number, data: Record<string, unknown>) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        try {
          saveStepMutation.mutate({
            step,
            data,
            clientId: getClientId(),
          });
        } catch {
          // Silently fail — localStorage is the primary store
        }
      }, 1000);
    },
    [saveStepMutation]
  );

  const setStepData = useCallback(
    (data: Partial<WizardState>) => {
      setState((prev) => {
        const next = { ...prev, ...data };
        // Debounce save to backend for the current step
        debounceSaveToBackend(prev.currentStep, data as Record<string, unknown>);
        return next;
      });
    },
    [debounceSaveToBackend]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 10),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => {
      setDirection(step > prev.currentStep ? 1 : -1);
      return { ...prev, currentStep: Math.max(1, Math.min(step, 10)) };
    });
  }, []);

  const getCurrentStep = useCallback(() => state.currentStep, [state.currentStep]);

  const completeWizard = useCallback(async (): Promise<{ id: string; name: string } | null> => {
    setIsCompleting(true);
    setCompleteError(null);

    try {
      // Build steps data from current state to pass to backend
      const stepsForBackend: Record<string, unknown> = {
        "1": { language: state.language },
        "2": { botLanguages: state.botLanguages },
        "3": { businessType: state.businessType },
        "4": { capabilities: state.capabilities },
        "5": {
          name: state.businessInfo.name || state.botName,
          description: state.businessInfo.description,
          address: state.businessInfo.address,
          managerContact: state.businessInfo.managerContact,
          workingHours: {
            start: state.businessInfo.workingHoursFrom,
            end: state.businessInfo.workingHoursTo,
            days: state.businessInfo.workingDays,
          },
          welcomeMessage: state.welcomeMessage,
        },
        "6": { products: state.products },
        "7": { faqItems: state.faqItems },
        "8": { telegramToken: state.telegramToken },
        "9": { personality: state.personality },
      };

      const result = await completeMutation.mutateAsync({
        clientId: getClientId(),
        steps: stepsForBackend,
      });
      // Clear localStorage on success
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      return result as { id: string; name: string } | null;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create bot. Please try again.";
      setCompleteError(message);
      return null;
    } finally {
      setIsCompleting(false);
    }
  }, [completeMutation]);

  return (
    <WizardContext.Provider
      value={{
        state,
        setStepData,
        goNext,
        goBack,
        goToStep,
        getCurrentStep,
        direction,
        completeWizard,
        isCompleting,
        completeError,
        isInitialized,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
