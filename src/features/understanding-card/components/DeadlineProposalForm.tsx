import { useState } from "react";
import { DateTimePicker } from "@/shared/ui/DateTimePicker";
import { useRespondToCard } from "../hooks/useCardState";

export function DeadlineProposalForm({
  cardId,
  currentDeadline,
  recipientZone = "America/Los_Angeles",
  senderZone = "Asia/Seoul",
  recipientName = "나",
  senderName = "발신자",
  onSubmitted,
}: {
  cardId: string;
  currentDeadline: string; // UTC instant
  recipientZone?: string;
  senderZone?: string;
  recipientName?: string;
  senderName?: string;
  onSubmitted?: (bubbleText: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [proposedInstant, setProposedInstant] = useState("");
  const respond = useRespondToCard(cardId);

  const handleSubmit = () => {
    if (!comment.trim() || !proposedInstant) return;
    // 수신자가 자기 존(LA) 벽시계로 고르면 DateTimePicker가 UTC instant로 변환해준다 (타임존 버그 해결)
    respond.mutate(
      { type: "REQUEST_DEADLINE_CHANGE", comment, proposedDeadline: proposedInstant },
      { onSuccess: () => onSubmitted?.(comment) },
    );
  };

  return (
    <div className="rounded border border-gray-200 bg-block-gray p-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="예: 지금 다른 릴리스 대응 중이라 오늘 17:00은 빠듯해요. 내일 12:00(LA)로 조정 가능할까요?"
        rows={2}
        className="mb-2 w-full resize-none rounded border border-gray-300 p-2 text-sm"
      />
      <DateTimePicker
        value={proposedInstant || currentDeadline}
        onChange={setProposedInstant}
        editZone={recipientZone}
        editLabel={recipientName}
        previewZone={senderZone}
        previewLabel={senderName}
      />
      <button
        onClick={handleSubmit}
        disabled={respond.isPending || !comment.trim() || !proposedInstant}
        className="mt-2 rounded bg-primary-500 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        역제안 보내기
      </button>
    </div>
  );
}