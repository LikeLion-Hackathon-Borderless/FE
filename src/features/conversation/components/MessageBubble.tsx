import { useState } from "react";
import { useT } from "@/shared/i18n/i18n";
import type { MessageResponse } from "@/types/conversation";

export function MessageBubble({ message, isMine }: { message: MessageResponse; isMine: boolean }) {
  const t = useT();
  const [showTranslation, setShowTranslation] = useState(false);

  // 백엔드가 수신자 언어로 번역을 주면 그 필드를 사용 (아직 없으면 준비중 안내).
  // MessageResponse에 translatedContent가 추가되면 자동으로 실제 번역이 표시됨.
  const translated = (message as { translatedContent?: string }).translatedContent;

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-md rounded-lg px-4 py-2 text-sm ${
          isMine ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {message.content}
      </div>

      {/* 번역 링크: 상대가 보낸 메시지에만 (내 메시지는 번역 불필요) */}
      {!isMine && (
        <div className="mt-0.5">
          <button
            onClick={() => setShowTranslation((v) => !v)}
            className="text-[11px] text-gray-400 underline underline-offset-2 hover:text-gray-600"
          >
            {showTranslation ? t("msg.showOriginal") : t("msg.translate")}
          </button>
          {showTranslation && (
            <div className="mt-0.5 max-w-md rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
              {translated ?? t("msg.translating")}
            </div>
          )}
        </div>
      )}

      {/* AS_IS 전송은 미확정 상태 표시 (E02, API.md 13.1절) */}
      {message.deliveryMode === "AS_IS" && (
        <span className="mt-1 text-[11px] text-gray-400">
          {t("bubble.notReviewed")}
        </span>
      )}
    </div>
  );
}