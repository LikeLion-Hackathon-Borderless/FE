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

export function ResponseButtonGroup({ card }: { card: UnderstandingCard }) {
  const [selected, setSelected] = useState<CardResponseType | null>(null);
  const respond = useRespondToCard(card.id);

  // AGREED 상태면 같은 revision에 재응답 불가 (API.md 11.4절) -> 버튼 다 비활성화
  const isLocked = card.state === "AGREED";

  const handleAgree = () => {
    setSelected("AGREE");
    respond.mutate({ type: "AGREE", comment: null });
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
        <DeadlineProposalForm cardId={card.id} currentDeadline={card.deadline.instant} />
      )}
      {selected === "REQUEST_CLARIFICATION" && <ClarificationForm cardId={card.id} />}
    </div>
  );
}
