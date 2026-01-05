import { AIAssistantCard } from '@/components/dashboard/admin/AIAssistantCard';

export default function AIPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">AI Assistant Playground</h1>
      <div className="flex-1 min-h-0 border rounded-xl shadow-sm overflow-hidden">
        <AIAssistantCard />
      </div>
    </div>
  );
}
