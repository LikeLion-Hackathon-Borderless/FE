import { useState } from "react";
import type { UnderstandingCard, CardResponseType } from "@/types/understandingCard";
import { useRespondToCard } from "../hooks/useCardState";
import { useT } from "@/shared/i18n/i18n";
import { DeadlineProposalForm } from "./DeadlineProposalForm";
import { ClarificationForm } from "./ClarificationForm";

const OPTIONS: Array<{ type: CardResponseType; labelKey: string }> = [
  { type: "AGREE", labelKey: "resp.agree" },
  { type: "REQUEST_DEADLINE_CHANGE", labelKey: "resp.requestDeadline" },
  { type: "REQUEST_CLARIFICATION", labelKey: "resp.requestClarification" },
];

const CONFIRMED_LABEL_KEY: Record<CardResponseType, string> = {
  AGREE: "resp.agreed",
  REQUEST_DEADLINE_CHANGE: "resp.deadlineRequested",
  REQUEST_CLARIFICATION: "resp.clarificationRequested",
};

// 응답이 확정되면 대화에 남길 말풍선 텍스트를 부모(ConversationPage)로 올려보냄
export function ResponseButtonGroup({
  card,
  senderName,
  senderZone,
  onResponded,
}: {
  card: UnderstandingCard;
  senderName?: string;
  senderZone?: string;
  onResponded?: (bubbleText: string) => void;
}) {
  const t = useT();
  const [selected, setSelected] = useState<CardResponseType | null>(null);
  const respond = useRespondToCard(card.id);

  // AGREED 상태면 같은 revision에 재응답 불가 (API.md 11.4절) -> 버튼 다 비활성화
  const isLocked = card.state === "AGREED";

  // 이전엔 확정된 뒤 3개 버튼이 전부 똑같이 흐려지기만 해서, 뭘 선택했는지/합의가
  // 됐는지 화면에서 구분이 안 됐음. card.latestResponse(서버가 실제로 기억하는 마지막
  // 응답)를 써서, 잠긴 상태에서는 실제로 선택했던 항목만 도장 찍힌 것처럼 남기고
  // 나머지는 흐리게 처리한다. latestResponse가 없으면(응답 전) 로컬 selected로 대체.
  const confirmedType = card.latestResponse?.type ?? (isLocked ? selected : null);

  const handleAgree = () => {
    setSelected("AGREE");
    respond.mutate(
      { type: "AGREE", comment: null },
      { onSuccess: () => onResponded?.(t("resp.agreeMessage")) },
    );
  };

  return (
    <div className="space-y-3">
      {isLocked && confirmedType ? (
        // 합의 완료 - 버튼 대신 어떤 응답으로 확정됐는지 명확한 배지로 보여줌
        <div className="flex items-center gap-2 rounded-md bg-primary-50 px-3 py-2 text-sm text-primary-600">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
            ✓
          </span>
          <span className="font-medium">{t(CONFIRMED_LABEL_KEY[confirmedType])}</span>
          <span className="text-label">{t("resp.cannotRespondAgain")}</span>
        </div>
      ) : (
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
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      )}

      {selected === "REQUEST_DEADLINE_CHANGE" && !isLocked && (
        <DeadlineProposalForm
          cardId={card.id}
          currentDeadline={card.deadline.instant}
          recipientZone={card.deadline.viewerTimeZoneId}
          recipientName={card.assignee.displayName}
          senderZone={senderZone}
          senderName={senderName}
          onSubmitted={(text) => onResponded?.(text)}
        />
      )}
      {selected === "REQUEST_CLARIFICATION" && !isLocked && (
        <ClarificationForm cardId={card.id} onSubmitted={(text) => onResponded?.(text)} />
      )}
    </div>
  );
}