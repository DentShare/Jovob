import KnowledgeBase from "@/components/dashboard/KnowledgeBase";

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">База знаний</h1>
        <p className="mt-1 text-sm text-gray-500">
          FAQ и документы для обучения AI-бота
        </p>
      </div>
      <KnowledgeBase />
    </div>
  );
}
