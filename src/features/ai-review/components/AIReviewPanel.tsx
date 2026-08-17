import { useState } from "react";
import type { AiReview } from "@/types/aiReview";
import { useConfirmAIReview, useSendAIReview } from "../hooks/useAIReview";

interface Props {
  review: AiReview;
  originalContent: string;
  onClose: () => void;
  onSent: () => void;
}

export function AIReviewPanel({ review, originalContent, onClose, onSent }: Props) {
  // 사용자가 확정한 deadline (경고의 suggestedDeadline을 기본 선택지로 노출)
  const [confirmedDeadline, setConfirmedDeadline] = useState(
    review.warnings[0]?.suggestedDeadline ?? review.structuredFields.deadline.value ?? "",
  );

  const confirmReview = useConfirmAIReview();
  const sendReview = useSendAIReview();

  const workHoursWarning = review.warnings.find((w) => w.code === "OUTSIDE_RECIPIENT_WORK_HOURS");

  const handleConfirmAndSend = async () => {
    if (!confirmedDeadline) return;

    await confirmReview.mutateAsync({
      reviewId: review.id,
      req: {
        task: review.structuredFields.task.value ?? "",
        assigneeUserId: review.structuredFields.assigneeUserId.value ?? "",
        deadline: confirmedDeadline,
        expectedOutcome: review.structuredFields.expectedOutcome.value ?? "",
        confirmedEvidenceIds: review.evidence.map((e) => e.attachmentId),
        confirmed: true,
      },
    });

    await sendReview.mutateAsync({
      reviewId: review.id,
      req: { content: originalContent, scheduledFor: null },
    });

    onSent();
  };

  return (
    <aside className="w-80 flex-shrink-0 border-l border-gray-100 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-primary-600">AI 검토 · 공동 이해 준비</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <dl className="mb-4 space-y-2 text-sm">
        <Row label="업무" value={review.structuredFields.task.value ?? "-"} />
        <Row
          label="담당자"
          value={review.evidence[0]?.fileName ?? review.structuredFields.assigneeUserId.value ?? "-"}
        />
        <Row label="근거" value="최근 대화" />
      </dl>

      {/* 기한 모호성 확정 - 와이어프레임 "내일까지"의 정확한 기준 시각 */}
      <ConfirmBlock
        message='"기한"의 정확한 기준 시각이 필요해요. 어떤 시간으로 확정할까요?'
        primaryLabel={confirmedDeadline || "시각 미확정"}
        onPrimarySelect={() => {
          /* 실제 구현 시 datetime picker 오픈 */
        }}
      />

      {/* 의도 모호성 확정 - "조금 더 고민해보면" 두 가지 해석 */}
      <ConfirmBlock
        message='"조금 더 고민해보면?" — 두 가지로 읽힙니다. 실제 의도를 선택해주세요.'
        primaryLabel="현재 방향 유지 + 세부만 보완"
        secondaryLabel="방향 자체를 재검토 요청"
      />

      {workHoursWarning && (
        <div className="mb-4 rounded border border-red-100 bg-red-50 p-3">
          <p className="mb-2 text-xs font-medium text-red-500">근무 시간 충돌</p>
          <p className="mb-2 text-xs text-gray-600">{workHoursWarning.message}</p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                workHoursWarning.suggestedDeadline &&
                setConfirmedDeadline(workHoursWarning.suggestedDeadline)
              }
              className="flex-1 rounded bg-primary-500 px-2 py-1 text-xs text-white"
            >
              {workHoursWarning.suggestedDeadline ?? "대안 시각 적용"}
            </button>
            <button className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500">
              예약 전송
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirmAndSend}
        disabled={confirmReview.isPending || sendReview.isPending || !confirmedDeadline}
        className="w-full rounded bg-gray-900 py-2 text-sm text-white disabled:opacity-50"
      >
        카드 생성 후 전송하기
      </button>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="w-16 flex-shrink-0 text-gray-400">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}

function ConfirmBlock({
  message,
  primaryLabel,
  secondaryLabel,
  onPrimarySelect,
}: {
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimarySelect?: () => void;
}) {
  return (
    <div className="mb-3 rounded border border-gray-100 bg-gray-50 p-3">
      <p className="mb-2 text-xs text-gray-600">{message}</p>
      <div className="flex flex-col gap-1">
        <button
          onClick={onPrimarySelect}
          className="rounded bg-primary-500 px-2 py-1 text-xs text-white"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && (
          <button className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500">
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
