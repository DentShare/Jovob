"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "./WizardContext";
import Step1Language from "./steps/Step1Language";
import Step2BotLanguage from "./steps/Step2BotLanguage";
import Step3BusinessType from "./steps/Step3BusinessType";
import Step4Capabilities from "./steps/Step4Capabilities";
import Step5BusinessInfo from "./steps/Step5BusinessInfo";
import Step6Catalog from "./steps/Step6Catalog";
import Step7Knowledge from "./steps/Step7Knowledge";
import Step8Platforms from "./steps/Step8Platforms";
import Step9Personality from "./steps/Step9Personality";
import Step10Review from "./steps/Step10Review";

const TOTAL_STEPS = 10;

const stepLabels: Record<string, string[]> = {
  ru: ["Язык", "Язык бота", "Тип бизнеса", "Возможности", "О бизнесе", "Каталог", "Знания", "Платформы", "Личность", "Запуск"],
  uz: ["Til", "Bot tili", "Biznes turi", "Imkoniyatlar", "Biznes haqida", "Katalog", "Bilimlar", "Platformalar", "Shaxsiyat", "Ishga tushirish"],
  en: ["Language", "Bot Lang", "Business", "Capabilities", "Info", "Catalog", "Knowledge", "Platforms", "Personality", "Launch"],
};

const steps: Record<number, React.ComponentType> = {
  1: Step1Language,
  2: Step2BotLanguage,
  3: Step3BusinessType,
  4: Step4Capabilities,
  5: Step5BusinessInfo,
  6: Step6Catalog,
  7: Step7Knowledge,
  8: Step8Platforms,
  9: Step9Personality,
  10: Step10Review,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function WizardLayout() {
  const { state, goBack, direction, isInitialized } = useWizard();
  const { currentStep, language } = state;
  const labels = stepLabels[language] || stepLabels.ru;
  const isFirstRender = useRef(true);

  const StepComponent = steps[currentStep] || Step1Language;

  // Don't render until localStorage state is loaded to avoid hydration mismatch
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header with progress */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            {currentStep > 1 && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">
                  {language === "ru" ? "Назад" : language === "uz" ? "Orqaga" : "Back"}
                </span>
              </button>
            )}
            <div className="flex-1 text-center">
              <span className="text-sm font-semibold text-slate-700">
                {currentStep}/{TOTAL_STEPS}
              </span>
              <span className="text-sm text-slate-400 ml-2 hidden sm:inline">
                {labels[currentStep - 1]}
              </span>
            </div>
            <div className="w-16" /> {/* spacer for alignment */}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={false}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 flex items-start justify-center overflow-hidden">
        <div className="w-full max-w-3xl px-4 py-8">
          <AnimatePresence mode="wait" custom={direction} onExitComplete={() => { isFirstRender.current = false; }}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial={isFirstRender.current ? "center" : "enter"}
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
