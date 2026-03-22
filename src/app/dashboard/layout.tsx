import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DemoProvider } from "@/components/dashboard/DemoContext";
import DemoBanner from "@/components/dashboard/DemoBanner";

export const metadata = {
  title: "Панель управления — BotUz v2",
  description: "Управляйте вашим AI-ботом",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <div className="flex flex-col h-screen">
        <DemoBanner />
        <div className="flex-1 min-h-0">
          <DashboardLayout>{children}</DashboardLayout>
        </div>
      </div>
    </DemoProvider>
  );
}
