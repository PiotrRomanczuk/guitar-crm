import { AIAssistantCard } from '@/components/dashboard/admin/AIAssistantCard';

export default function AIPage() {
  return (
    <div className="container mx-auto p-8 h-screen max-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">AI Assistant Development</h1>
      <div className="flex-1 min-h-0">
        <AIAssistantCard />
      </div>
    </div>
  );
}
