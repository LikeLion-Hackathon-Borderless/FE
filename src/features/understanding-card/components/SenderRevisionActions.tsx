import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { UnderstandingCard } from "@/types/understandingCard";
import { DateTimePicker } from "@/shared/ui/DateTimePicker";
import { useSubmitCardRevision } from "../hooks/useCardState";
import { useAuthStore } from "@/shared/hooks/useAuthStore";

dayjs.extend(utc);
dayjs.extend(timezone);

// 카드 PENDING(수신자가 기한조정/설명요청) 상태에서 발신자가 카드를 다시 만드는 액션 (Image 7/8).
// 지금은 뷰어 구분이 없어 state 기준으로 노출 - B-5 붙으면 발신자 뷰에서만 보이게 정리.
// 발신자 = 로그인 유저
export function SenderRevisionActions({
  card,
  senderZone = "Asia/Seoul",
  onRevised,
}: {
  card: UnderstandingCard;
  senderZone?: string;
  onRevised?: (supersededCard: UnderstandingCard) => void;
}) {
  const recipientZone = card.deadline.viewerTimeZoneId;
  const latest = card.latestResponse;
  const proposed = latest?.proposedDeadline ?? null;

  const [showCounter, setShowCounter] = useState(false);
  const [counterInstant, setCounterInstant] = useState("");
  const [clarifyText, setClarifyText] = useState("");

  const revision = useSubmitCardRevision(card.id);

  const submit = (deadline: string, expectedOutcome: string, changeNote: string) => {
    revision.mutate(
      { task: card.task, deadline, expectedOutcome, changeNote },
      { onSuccess: () => onRevised?.(card) }, // 이전 revision을 부모가 "대체됨"으로 보관
    );
  };

  const fmt = (instant: string, zone: string) =>
    `${dayjs(instant).tz(zone).format("M/D HH:mm")} (${zone === "America/Los_Angeles" ? "LA" : zone.split("/").pop()})`;

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-block-gray p-3">
      {/* 수신자 요청 요약 */}
      {latest && (
        <div className="mb-2.5 text-xs text-gray-600">
          <span className="font-medium text-gray-700">수신자 응답: </span>
          {latest.comment}
          {proposed && <span className="text-gray-500"> · 역제안 {fmt(proposed, recipientZone)}</span>}
        </div>
      )}

      {/* 기한 조정 요청: 수락 / 역제안 */}
      {proposed ? (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={revision.isPending}
            onClick={() => submit(proposed, card.expectedOutcome, "역제안 기한 반영")}
            className="rounded-pill bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            수락 · 카드 재생성
          </button>
          <button
            disabled={revision.isPending}
            onClick={() => setShowCounter((v) => !v)}
            className="rounded-pill bg-pill-gray px-3 py-1.5 text-xs font-medium text-gray-600 hover:brightness-95 disabled:opacity-50"
          >
            역제안
          </button>
        </div>
      ) : (
        /* 설명 요청(불명확): 기대 결과 보강 후 재생성 */
        <div>
          <textarea
            value={clarifyText}
            onChange={(e) => setClarifyText(e.target.value)}
            rows={2}
            placeholder="요건을 보강해 주세요 (예: 코멘트만 남기면 됩니다 / 문서 직접 수정까지)"
            className="mb-2 w-full resize-none rounded border border-gray-300 p-2 text-sm"
          />
          <button
            disabled={revision.isPending || !clarifyText.trim()}
            onClick={() => submit(card.deadline.instant, clarifyText, "요건 보강")}
            className="rounded-pill bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            보강 · 카드 재생성
          </button>
        </div>
      )}

      {/* 역제안 시각 선택 */}
      {showCounter && (
        <div className="mt-2.5">
          <DateTimePicker
            value={counterInstant}
            onChange={setCounterInstant}
            editZone={senderZone}
            editLabel={useAuthStore.getState().user?.displayName ?? "발신자"}
            previewZone={recipientZone}
            previewLabel={card.assignee.displayName}
          />
          <button
            disabled={revision.isPending || !counterInstant}
            onClick={() => submit(counterInstant, card.expectedOutcome, "발신자 역제안 기한")}
            className="mt-2 w-full rounded-pill bg-ink px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            역제안 시각으로 카드 재생성
          </button>
        </div>
      )}
    </div>
  );
}