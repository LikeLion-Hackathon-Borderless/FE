import type { MessageResponse } from "@/types/conversation";

export function MessageBubble({ message, isMine }: { message: MessageResponse; isMine: boolean }) {
  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-md rounded-lg px-4 py-2 text-sm ${
          isMine ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {message.content}
      </div>
      {/* AS_IS 전송은 미확정 상태 표시 (E02, API.md 13.1절) */}
      {message.deliveryMode === "AS_IS" && (
        <span className="mt-1 text-[11px] text-gray-400">
          미확정 · AI 검토 없이 전송됨 · 합의로 기록되지 않음
        </span>
      )}
    </div>
  );
}
