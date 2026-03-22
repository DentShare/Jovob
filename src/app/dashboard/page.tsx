"use client";

import MetricsCards from "@/components/dashboard/MetricsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentDialogs from "@/components/dashboard/RecentDialogs";
import UnansweredQuestions from "@/components/dashboard/UnansweredQuestions";
import { useDemo } from "@/components/dashboard/DemoContext";

export default function DashboardPage() {
  const { currentBot } = useDemo();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
        <p className="mt-1 text-sm text-gray-500">
          Обзор активности бота <span className="font-medium text-gray-700">{currentBot.name}</span> за сегодня
        </p>
      </div>

      {/* Metrics */}
      <MetricsCards />

      {/* Quick actions */}
      <QuickActions />

      {/* Two-column layout for dialogs and unanswered */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentDialogs />
        </div>
        <div className="lg:col-span-2">
          <UnansweredQuestions />
        </div>
      </div>
    </div>
  );
}
