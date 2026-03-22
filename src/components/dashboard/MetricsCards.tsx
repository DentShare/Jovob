"use client";

import { useEffect, useState } from "react";

interface MetricCard {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  color: string;
  bgColor: string;
}

const metrics: MetricCard[] = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    value: 127,
    label: "Сообщений сегодня",
    change: "+12% от вчера",
    changeType: "up",
    color: "text-[#3B82F6]",
    bgColor: "bg-[#3B82F6]/10",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    value: 23,
    label: "Заказов всего",
    change: "+3 новых",
    changeType: "up",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    value: 8,
    label: "Новых клиентов",
    change: "+2 от вчера",
    changeType: "up",
    color: "text-[#8B5CF6]",
    bgColor: "bg-[#8B5CF6]/10",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    value: 89,
    suffix: "%",
    label: "AI ответил",
    change: "Выше на 5%",
    changeType: "up",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
];

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (current !== start) {
        start = current;
        setCount(current);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const displayValue = useCountUp(metric.value);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${metric.bgColor} ${metric.color}`}>
          {metric.icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            metric.changeType === "up"
              ? "bg-green-50 text-green-700"
              : metric.changeType === "down"
              ? "bg-red-50 text-red-700"
              : "bg-gray-50 text-gray-600"
          }`}
        >
          {metric.changeType === "up" && "↑"}
          {metric.changeType === "down" && "↓"}
          {metric.change}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">
          {displayValue}
          {metric.suffix}
        </p>
        <p className="mt-1 text-sm text-gray-500">{metric.label}</p>
      </div>
    </div>
  );
}

export default function MetricsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => (
        <MetricCardComponent key={i} metric={metric} />
      ))}
    </div>
  );
}
