"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DemoProvider } from "@/components/dashboard/DemoContext";
import { BotProvider, useBotContext } from "@/components/dashboard/BotContext";
import DemoBanner from "@/components/dashboard/DemoBanner";

function DemoBannerWrapper() {
  const { isDemo } = useBotContext();
  if (!isDemo) return null;
  return <DemoBanner />;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <BotProvider>
        <div className="flex flex-col h-screen">
          <DemoBannerWrapper />
          <div className="flex-1 min-h-0">
            <DashboardLayout>{children}</DashboardLayout>
          </div>
        </div>
      </BotProvider>
    </DemoProvider>
  );
}
