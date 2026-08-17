import { useState } from "react";
import { useRespondToCard } from "../hooks/useCardState";

export function DeadlineProposalForm({
  cardId,
  currentDeadline,
}: {
  cardId: string;
  currentDeadline: string;
}) {
  const [proposedLocal, setProposedLocal] = useState("");
  const respond = useRespondToCard(cardId);

  const handleSubmit = () => {
    if (!proposedLocal) return;
    // datetime-local 값을 그대로 보내면 로컬시각이라 서버는 UTC instant로 기대함 (API.md 2.3절)
    // 실제 붙일 때 사용자 timezone 기준으로 변환하는 로직 필요 - 지금은 mock이라 그대로 전달
    respond.mutate({
      type: "REQUEST_DEADLINE_CHANGE",
      comment: "기한 조정이 필요합니다.",
      proposedDeadline: new Date(proposedLocal).toISOString(),
    });
  };

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-3">
      <p className="mb-2 text-xs text-gray-500">현재 기한: {currentDeadline}</p>
      <div className="flex gap-2">
        <input
          type="datetime-local"
          value={proposedLocal}
          onChange={(e) => setProposedLocal(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={respond.isPending || !proposedLocal}
          className="rounded bg-primary-500 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          역제안 보내기
        </button>
      </div>
    </div>
  );
}
