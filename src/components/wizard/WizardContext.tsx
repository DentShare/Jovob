"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

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
}

const WizardContext = createContext<WizardContextValue | null>(null);

const STORAGE_KEY = "jovob_wizard_state";

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
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setState(loadState());
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      saveState(state);
    }
  }, [state]);

  const setStepData = useCallback((data: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...data }));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 10),
    }));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => {
      setDirection(step > prev.currentStep ? 1 : -1);
      return { ...prev, currentStep: Math.max(1, Math.min(step, 10)) };
    });
  }, []);

  const getCurrentStep = useCallback(() => state.currentStep, [state.currentStep]);

  return (
    <WizardContext.Provider
      value={{ state, setStepData, goNext, goBack, goToStep, getCurrentStep, direction }}
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
