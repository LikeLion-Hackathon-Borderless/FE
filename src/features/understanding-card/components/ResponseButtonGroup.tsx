import { useState } from "react";
import type { UnderstandingCard, CardResponseType } from "@/types/understandingCard";
import { useRespondToCard } from "../hooks/useCardState";
import { DeadlineProposalForm } from "./DeadlineProposalForm";
import { ClarificationForm } from "./ClarificationForm";

const OPTIONS: Array<{ type: CardResponseType; label: string }> = [
  { type: "AGREE", label: "이해한 내용이 맞습니다." },
  { type: "REQUEST_DEADLINE_CHANGE", label: "기한 조정이 필요합니다." },
  { type: "REQUEST_CLARIFICATION", label: "요청 결과가 불명확합니다." },
];

const AGREE_MESSAGE = "이해한 내용이 맞습니다. 지금 바로 착수할게요.";

// 응답이 확정되면 대화에 남길 말풍선 텍스트를 부모(ConversationPage)로 올려보냄
export function ResponseButtonGroup({
  card,
  onResponded,
}: {
  card: UnderstandingCard;
  onResponded?: (bubbleText: string) => void;
}) {
  const [selected, setSelected] = useState<CardResponseType | null>(null);
  const respond = useRespondToCard(card.id);

  // AGREED 상태면 같은 revision에 재응답 불가 (API.md 11.4절) -> 버튼 다 비활성화
  const isLocked = card.state === "AGREED";

  const handleAgree = () => {
    setSelected("AGREE");
    respond.mutate(
      { type: "AGREE", comment: null },
      { onSuccess: () => onResponded?.(AGREE_MESSAGE) },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            disabled={isLocked || respond.isPending}
            onClick={() => (opt.type === "AGREE" ? handleAgree() : setSelected(opt.type))}
            className={`flex-1 rounded border px-3 py-2 text-xs transition-colors ${
              selected === opt.type
                ? "border-primary-500 text-primary-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            } ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {selected === "REQUEST_DEADLINE_CHANGE" && (
        <DeadlineProposalForm
          cardId={card.id}
          currentDeadline={card.deadline.instant}
          recipientZone={card.deadline.viewerTimeZoneId}
          recipientName={card.assignee.displayName}
          onSubmitted={(text) => onResponded?.(text)}
        />
      )}
      {selected === "REQUEST_CLARIFICATION" && (
        <ClarificationForm cardId={card.id} onSubmitted={(text) => onResponded?.(text)} />
      )}
    </div>
  );
}