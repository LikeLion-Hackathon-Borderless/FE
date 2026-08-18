import { useState } from "react";
import { useRespondToCard } from "../hooks/useCardState";

export function ClarificationForm({
  cardId,
  onSubmitted,
}: {
  cardId: string;
  onSubmitted?: (bubbleText: string) => void;
}) {
  const [comment, setComment] = useState("");
  const respond = useRespondToCard(cardId);

  const handleSubmit = () => {
    if (!comment.trim()) return;
    respond.mutate(
      { type: "REQUEST_CLARIFICATION", comment },
      { onSuccess: () => onSubmitted?.(comment) },
    );
  };

  return (
    <div className="rounded border border-gray-200 bg-block-gray p-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="불명확한 부분을 구체적으로 적어주세요."
        className="w-full resize-none rounded border border-gray-300 p-2 text-sm"
        rows={2}
      />
      <button
        onClick={handleSubmit}
        disabled={respond.isPending || !comment.trim()}
        className="mt-2 rounded bg-primary-500 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        설명 요청 보내기
      </button>
    </div>
  );
}