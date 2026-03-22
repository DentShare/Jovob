import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata = {
  title: "Панель управления — BotUz v2",
  description: "Управляйте вашим AI-ботом",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
