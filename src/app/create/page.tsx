"use client";

import { WizardProvider } from "@/components/wizard/WizardContext";
import WizardLayout from "@/components/wizard/WizardLayout";

export default function CreatePage() {
  return (
    <WizardProvider>
      <WizardLayout />
    </WizardProvider>
  );
}
