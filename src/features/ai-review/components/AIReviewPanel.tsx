import { useState } from "react";
import dayjs from "dayjs";
import type { AiReview } from "@/types/aiReview";
import { DateTimePicker } from "@/shared/ui/DateTimePicker";
import { ErrorCode } from "@/shared/api/errorCodes";
import { useConfirmAIReview, useSendAIReview } from "../hooks/useAIReview";

interface Props {
  review: AiReview;
  originalContent: string;
  onClose: () => void;
  onSent: () => void;
  // optional 확장 (기존 호출부 그대로 동작). 없으면 deadline의 [Zone] 접미사에서 유추.
  recipientName?: string;
  recipientTimeZoneId?: string;
  senderTimeZoneId?: string;
  senderName?: string;
}

function parseZone(annotated?: string): string | null {
  return annotated?.match(/\[(.+)\]$/)?.[1] ?? null;
}

function zoneShort(zone: string): string {
  if (zone === "America/Los_Angeles") return "LA";
  if (zone === "Asia/Seoul") return "Seoul";
  return zone.split("/").pop() ?? zone;
}

// C-4 의미 모호성 "조금 더 고민해보면?" 두 갈래 (기획안 3-1 step5)
const INTENT_OPTIONS = ["현재 방향 유지 + 세부만 보완", "방향 자체를 재검토 요청"];

export function AIReviewPanel({
  review,
  originalContent,
  onClose,
  onSent,
  recipientName,
  recipientTimeZoneId,
  senderTimeZoneId,
  senderName,
}: Props) {
  const sf = review.structuredFields;

  const senderZone = senderTimeZoneId ?? parseZone(sf.deadline.senderLocal) ?? "Asia/Seoul";
  const recipientZone =
    recipientTimeZoneId ?? parseZone(sf.deadline.recipientLocal) ?? "America/Los_Angeles";
  const recipientLabel = recipientName ?? sf.assigneeUserId.value ?? "수신자";
  const senderLabel = senderName ?? "이서연";

  // C-3: AI 후보를 넣어두되 "자동 확정 금지" — 명시 확정해야 전송 가능.
  const aiCandidate = sf.deadline.value ?? "";
  const [deadline, setDeadline] = useState("");
  const [deadlineConfirmed, setDeadlineConfirmed] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // 의도: AI 추정값을 미리 하이라이트하되 사용자가 바꿀 수 있음
  const [intent, setIntent] = useState<number>(sf.expectedOutcome.value?.includes("재검토") ? 1 : 0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const confirmReview = useConfirmAIReview();
  const sendReview = useSendAIReview();
  const busy = confirmReview.isPending || sendReview.isPending;

  const warning = review.warnings.find((w) => w.code === ErrorCode.OUTSIDE_RECIPIENT_WORK_HOURS);
  const altInstant = warning?.suggestedDeadline ? dayjs(warning.suggestedDeadline).toISOString() : null;
  const conflictActive = !!warning && (!altInstant || deadline !== altInstant);

  const pickDeadline = (instant: string) => {
    setDeadline(instant);
    setDeadlineConfirmed(true);
    setErrorMsg(null);
  };

  const canSend = !!sf.task.value && !!deadline && deadlineConfirmed && !busy;

  const handleSend = async () => {
    setErrorMsg(null);
    if (!canSend) return;
    try {
      await confirmReview.mutateAsync({
        reviewId: review.id,
        req: {
          task: sf.task.value ?? "",
          assigneeUserId: sf.assigneeUserId.value ?? "",
          deadline,
          expectedOutcome: INTENT_OPTIONS[intent],
          confirmedEvidenceIds: review.evidence.map((e) => e.attachmentId),
          confirmed: true,
        },
      });
      await sendReview.mutateAsync({
        reviewId: review.id,
        req: { content: originalContent, scheduledFor: null },
      });
      onSent();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === ErrorCode.TIME_ZONE_REQUIRED) {
        setErrorMsg("수신자 타임존이 없어 현지 시각을 확정할 수 없어요. 프로필에서 타임존을 먼저 등록해 주세요.");
      } else {
        setErrorMsg("전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    }
  };

  if (review.status === "FAILED") {
    return (
      <PanelShell onClose={onClose}>
        {/* E10: 막지 않는다 — 원문 전송 안내 */}
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          AI 검토를 완료하지 못했어요. 패널을 닫고 원문 그대로 보낼 수 있어요.
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell onClose={onClose}>
      {/* 상단 읽기전용 요약 */}
      <dl className="mb-4 space-y-2 text-sm">
        <SummaryRow label="업무" value={sf.task.value ?? "-"} />
        <SummaryRow label="담당자" value={recipientLabel} />
        <SummaryRow
          label="기한"
          value={
            deadlineConfirmed
              ? `${dayjs(deadline).tz(recipientZone).format("M/D HH:mm")} (${zoneShort(recipientZone)})`
              : "미확정"
          }
          danger={!deadlineConfirmed}
        />
        <SummaryRow label="근거" value={review.evidence[0]?.fileName ?? "최근 대화"} />
      </dl>

      {/* 질문블록 A — 기한 확정 (C-3) */}
      <QuestionBlock message={'"기한"의 정확한 기준 시각이 필요해요. 어떤 시간으로 확정할까요?'}>
        <Pill
          selected={deadlineConfirmed && deadline === aiCandidate}
          onClick={() => pickDeadline(aiCandidate)}
        >
          {dayjs(aiCandidate).tz(senderZone).format("M/D HH:mm")} {senderZone}
        </Pill>
        <Pill selected={showPicker} onClick={() => setShowPicker((v) => !v)}>
          직접 입력
        </Pill>
        {showPicker && (
          <div className="mt-2 w-full">
            <DateTimePicker
              value={deadline || aiCandidate}
              onChange={pickDeadline}
              editZone={senderZone}
              editLabel={senderLabel}
              previewZone={recipientZone}
              previewLabel={recipientLabel}
              previewOutsideHours={conflictActive}
            />
          </div>
        )}
      </QuestionBlock>

      {/* 질문블록 B — 의도 확정 (C-4) */}
      <QuestionBlock message={'"조금 더 고민해 보면?" — 두 가지로 읽힙니다. 실제 의도를 선택해주세요.'}>
        {INTENT_OPTIONS.map((opt, i) => (
          <Pill key={i} selected={intent === i} onClick={() => setIntent(i)}>
            {opt}
          </Pill>
        ))}
      </QuestionBlock>

      {/* 근무시간 충돌 (C-6 / E04) */}
      {conflictActive && (
        <div className="mb-3 rounded-lg border border-red-100 bg-white p-3">
          <p className="mb-1 text-xs font-medium text-red-600">근무 시간 충돌</p>
          <p className="mb-2.5 text-xs text-gray-600">{warning?.message}</p>
          <div className="flex flex-wrap gap-1.5">
            <Pill selected={deadlineConfirmed && deadline === aiCandidate} onClick={() => pickDeadline(aiCandidate)}>
              {dayjs(aiCandidate).tz(senderZone).format("M/D HH:mm")} {senderZone}
            </Pill>
            {altInstant && (
              <Pill onClick={() => pickDeadline(altInstant)}>
                대안: {dayjs(altInstant).tz(recipientZone).format("M/D HH:mm")} {zoneShort(recipientZone)}
              </Pill>
            )}
            <Pill disabled title="P1 범위">
              예약 전송
            </Pill>
          </div>
        </div>
      )}

      {errorMsg && <p className="mb-3 rounded-md bg-red-50 p-2.5 text-xs text-red-600">{errorMsg}</p>}

      <div className="pt-1">
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "전송 중…" : "카드 생성 후 전송하기"}
        </button>
        {!deadlineConfirmed && (
          <p className="mt-1.5 text-center text-[11px] text-gray-400">기한을 확정하면 전송할 수 있어요.</p>
        )}
      </div>
    </PanelShell>
  );
}

function PanelShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <aside className="flex w-96 flex-shrink-0 flex-col border-l border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[11px] font-medium text-primary-600">
            AI 검토
          </span>
          <span className="text-sm font-medium text-gray-900">공동 이해 준비</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="닫기">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  );
}

function SummaryRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex gap-4">
      <dt className="w-14 flex-shrink-0 text-gray-400">{label}</dt>
      <dd className={danger ? "font-medium text-red-600" : "text-gray-800"}>{value}</dd>
    </div>
  );
}

function QuestionBlock({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-lg bg-gray-50 p-3">
      <p className="mb-2 text-xs text-gray-600">{message}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  children,
  selected = false,
  disabled = false,
  onClick,
  title,
}: {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        selected ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${disabled ? "cursor-not-allowed opacity-50 hover:bg-gray-100" : ""}`}
    >
      {children}
    </button>
  );
}