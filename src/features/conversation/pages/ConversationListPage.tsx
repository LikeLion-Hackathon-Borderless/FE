import { ConversationList } from "../components/ConversationList";

export function ConversationListPage() {
  return (
    <div className="mx-auto max-w-md">
      <header className="border-b border-gray-100 px-4 py-3">
        <h1 className="text-sm font-medium text-gray-900">대화</h1>
      </header>
      <ConversationList />
    </div>
  );
}
