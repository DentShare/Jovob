import BotSettings from "@/components/dashboard/BotSettings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки бота</h1>
        <p className="mt-1 text-sm text-gray-500">
          Конфигурация имени, описания, личности и режима работы
        </p>
      </div>
      <BotSettings />
    </div>
  );
}
