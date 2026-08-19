import { useState } from "react";
import dayjs from "dayjs";
import type { AiReview } from "@/types/aiReview";
import type { MessageResponse } from "@/types/conversation";
import { DateTimePicker } from "@/shared/ui/DateTimePicker";
import { ErrorCode } from "@/shared/api/errorCodes";
import { zoneShort } from "@/shared/utils/timezoneLabel";
import { useConfirmAIReview, useSendAIReview, useAnswerAmbiguity } from "../hooks/useAIReview";

interface Props {
  review: AiReview;
  originalContent: string;
  onClose: () => void;
  // 실서버는 /send가 메시지+카드를 한 트랜잭션으로 만들어서 응답에 포함시킴(API.md 10.5절).
  // 부모(ConversationPage)가 그 카드를 바로 쓸 수 있게 응답 전체를 넘겨준다.
  onSent: (message: MessageResponse) => void;
  // optional 확장 (기존 호출부 그대로 동작). 없으면 deadline의 [Zone] 접미사에서 유추.
  recipientName?: string;
  recipientTimeZoneId?: string;
  senderTimeZoneId?: string;
  senderName?: string;
}

function parseZone(annotated?: string): string | null {
  return annotated?.match(/\[(.+)\]$/)?.[1] ?? null;
}

// AI가 값을 확신하지 못하면 서버가 null을 반환할 수 있음 (API.md E09: "AI는 모르는 값을
// 추측하지 않고 null과 낮은 confidence로 반환한다"). 이 경우 aiCandidate가 ""가 되는데,
// 검증 없이 dayjs(...).tz(...)를 호출하면 "Invalid time value" 런타임 에러로 화면이 죽었음.
// mock은 항상 유효한 값만 넣어놔서 안 걸렸다가 실제 서버 응답에서 처음 드러난 버그.
function isValidInstant(value: string | null | undefined): value is string {
  return !!value && dayjs(value).isValid();
}

// 위 문제를 원천적으로 막기 위한 안전 포맷터. 유효하지 않으면 fallback 텍스트를 보여준다.
function formatInZone(value: string | null | undefined, zone: string, fallback = "확인 필요"): string {
  if (!isValidInstant(value)) return fallback;
  return dayjs(value).tz(zone).format("M/D HH:mm");
}

export function AIReviewPanel({
  review: initialReview,
  originalContent,
  onClose,
  onSent,
  recipientName,
  recipientTimeZoneId,
  senderTimeZoneId,
  senderName,
}: Props) {
  // 이전엔 review를 prop 그대로만 읽었는데, AI 모호성 질문에 답변할 때마다 서버가 새
  // AiReview(다음 질문 또는 DONE)를 돌려주므로 그 최신 상태를 들고 있어야 함. prop은
  // 최초 1회 초기값으로만 쓰고, 그 이후는 이 로컬 상태를 기준으로 렌더링한다.
  const [review, setReview] = useState<AiReview>(initialReview);
  const sf = review.structuredFields;

  const senderZone = senderTimeZoneId ?? parseZone(sf.deadline.senderLocal) ?? "Asia/Seoul";
  const recipientZone =
    recipientTimeZoneId ?? parseZone(sf.deadline.recipientLocal) ?? "America/Los_Angeles";
  const recipientLabel = recipientName ?? sf.assigneeUserId.value ?? "수신자";
  const senderLabel = senderName ?? "이서연";

  // C-3: AI 후보를 넣어두되 "자동 확정 금지" — 명시 확정해야 전송 가능.
  const aiCandidate = sf.deadline.value ?? "";
  const hasAiCandidate = isValidInstant(aiCandidate);
  const [deadline, setDeadline] = useState("");
  const [deadlineConfirmed, setDeadlineConfirmed] = useState(false);
  // AI가 시각을 못 정했으면(hasAiCandidate=false) 처음부터 직접입력 패널을 열어준다
  const [showPicker, setShowPicker] = useState(!hasAiCandidate);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const confirmReview = useConfirmAIReview();
  const sendReview = useSendAIReview();
  const answerAmbiguity = useAnswerAmbiguity();
  const busy = confirmReview.isPending || sendReview.isPending;

  // AI가 원문에서 모호하다고 판단한 부분에 실시간으로 묻는 질문. 이전엔 메시지 내용과
  // 무관하게 항상 똑같은 가짜 질문("조금 더 고민해보면?")이 고정으로 떴었는데,
  // 이제 서버가 실제로 만들어주는 agentSession을 그대로 반영한다 (API.md 10.1/10.3절).
  const pendingQuestion = review.agentSession?.status === "INTERRUPT" ? review.agentSession.item : null;

  const handleAnswer = async (answer: string) => {
    setErrorMsg(null);
    try {
      const updated = await answerAmbiguity.mutateAsync({ reviewId: review.id, req: { answer } });
      setReview(updated);
    } catch {
      setErrorMsg("답변 처리에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const warning = review.warnings.find((w) => w.code === ErrorCode.OUTSIDE_RECIPIENT_WORK_HOURS);
  // suggestedDeadline도 형식이 이상할 수 있으니 검증 후에만 파싱 (안 그러면 dayjs().toISOString()에서 같은 종류의 에러가 날 수 있음)
  const altInstant = isValidInstant(warning?.suggestedDeadline)
    ? dayjs(warning!.suggestedDeadline).toISOString()
    : null;
  // 기한 확정 후 AI 후보(충돌 시각)를 고른 상태 = 충돌 중
  const isConflicting = !!warning && deadlineConfirmed && deadline === aiCandidate;
  // 경고가 있으면 기한 확정 후 카드를 계속 보여준다 (충돌 → 조정됨 상태로 전환, B안)
  const showConflictCard = !!warning && deadlineConfirmed;

  const pickDeadline = (instant: string) => {
    // 같은 시각을 다시 고르면 선택 해제(미확정으로 되돌림)
    if (deadlineConfirmed && deadline === instant) {
      setDeadline("");
      setDeadlineConfirmed(false);
      return;
    }
    setDeadline(instant);
    setDeadlineConfirmed(true);
    setErrorMsg(null);
  };

  // AI 질문에 아직 답 안 한 게 남아있으면 확정/전송 자체를 막는다 - 질문을 다 풀어야
  // structuredFields가 최종값으로 안정되므로.
  const canSend = !pendingQuestion && !!sf.task.value && !!deadline && deadlineConfirmed && !busy;

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
          expectedOutcome: sf.expectedOutcome.value ?? "",
          confirmedEvidenceIds: review.evidence.map((e) => e.attachmentId),
          confirmed: true,
        },
      });
      const sentMessage = await sendReview.mutateAsync({
        reviewId: review.id,
        req: { content: originalContent, scheduledFor: null },
      });
      onSent(sentMessage);
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
        <div className="rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
          AI 검토를 완료하지 못했어요. 패널을 닫고 원문 그대로 보낼 수 있어요.
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell onClose={onClose}>
      {/* 상단 읽기전용 요약 */}
      <dl className="mb-4 flex flex-col gap-5 text-sm">
        <SummaryRow label="업무" value={sf.task.value ?? "-"} />
        <SummaryRow label="담당자" value={recipientLabel} />
        <SummaryRow
          label="기한"
          value={
            deadlineConfirmed
              ? `${formatInZone(deadline, recipientZone)} (${zoneShort(recipientZone)})`
              : "미확정"
          }
          danger={!deadlineConfirmed}
        />
        <SummaryRow label="근거" value={review.evidence[0]?.fileName ?? "최근 대화"} />
      </dl>

      {/* 요약/질문 구분선 (시안 #C8D2DF) */}
      <div className="mb-4 h-px bg-[#C8D2DF]" />

      {/* AI 모호성 질문 - 서버가 실제로 이 메시지에서 모호하다고 판단한 부분만 동적으로 뜬다.
          질문이 남아있는 동안은 기한 확정/전송 UI를 아직 안 보여준다 (다음 질문이 또 있을 수 있어서). */}
      {pendingQuestion ? (
        <AmbiguityQuestionBlock
          item={pendingQuestion}
          onAnswer={handleAnswer}
          isPending={answerAmbiguity.isPending}
        />
      ) : (
        <>
          {/* 질문블록 — 기한 확정 (C-3) */}
          <QuestionBlock message={'"기한"의 정확한 기준 시각이 필요해요. 어떤 시간으로 확정할까요?'}>
            {hasAiCandidate ? (
              <Pill
                selected={deadlineConfirmed && deadline === aiCandidate}
                onClick={() => pickDeadline(aiCandidate)}
              >
                {formatInZone(aiCandidate, senderZone)} {senderZone}
              </Pill>
            ) : (
              // AI가 확신 있는 값을 못 찾은 경우 (API.md E09) - 추측값을 보여주는 대신 직접입력을 유도
              <p className="text-xs text-gray-400">AI가 시각을 특정하지 못했어요. 직접 입력해주세요.</p>
            )}
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
                  previewOutsideHours={isConflicting}
                />
              </div>
            )}
          </QuestionBlock>

          {/* 근무시간 충돌 (C-6 / E04) — 충돌 중이면 경고+대안, 대안 선택하면 조정됨 표시 (B안) */}
          {showConflictCard &&
            (isConflicting ? (
              <div className="mb-3 rounded-lg bg-white p-3">
                <p className="mb-1 text-sm font-medium tracking-[-0.28px] text-warn">근무 시간 충돌</p>
                <p className="mb-2.5 text-sm tracking-[-0.28px] text-[#161719]">{warning?.message}</p>
                <div className="flex flex-wrap gap-1.5">
                  {hasAiCandidate && (
                    <Pill selected onClick={() => pickDeadline(aiCandidate)}>
                      {formatInZone(aiCandidate, senderZone)} {senderZone}
                    </Pill>
                  )}
                  {altInstant && (
                    <Pill onClick={() => pickDeadline(altInstant)}>
                      대안: {formatInZone(altInstant, recipientZone)} {zoneShort(recipientZone)}
                    </Pill>
                  )}
                  <Pill disabled title="P1 범위">
                    예약 전송
                  </Pill>
                </div>
              </div>
            ) : (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-white p-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                  ✓
                </span>
                <p className="text-sm tracking-[-0.28px] text-[#161719]">
                  {formatInZone(deadline, recipientZone)} {zoneShort(recipientZone)}로 조정됨 · Alex 근무시간 내
                </p>
              </div>
            ))}

          {errorMsg && <p className="mb-3 rounded-md bg-warn/10 p-2.5 text-xs text-warn">{errorMsg}</p>}

          <div className="pt-1">
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-full rounded-pill bg-ink px-3 py-2 text-xl font-medium tracking-[-0.4px] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "전송 중…" : "카드 생성 후 전송하기"}
            </button>
            {!deadlineConfirmed && (
              <p className="mt-1.5 text-center text-[11px] text-gray-400">기한을 확정하면 전송할 수 있어요.</p>
            )}
          </div>
        </>
      )}
    </PanelShell>
  );
}

// AI가 실제로 감지한 모호성 질문 UI. candidates 중 하나를 고르거나 직접 입력할 수 있음 (API.md 10.3절)
function AmbiguityQuestionBlock({
  item,
  onAnswer,
  isPending,
}: {
  item: NonNullable<AiReview["agentSession"]>["item"];
  onAnswer: (answer: string) => void;
  isPending: boolean;
}) {
  const [customAnswer, setCustomAnswer] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  if (!item) return null;

  return (
    <div className="mb-3 rounded-lg bg-block-gray p-3">
      <p className="mb-1 text-xs text-gray-400">"{item.span}"</p>
      <p className="mb-2 text-sm font-medium tracking-[-0.28px] text-[#161719]">{item.reason}</p>
      <div className="flex flex-wrap gap-1.5">
        {item.candidates.map((c) => (
          <Pill key={c} onClick={() => onAnswer(c)} disabled={isPending}>
            {c}
          </Pill>
        ))}
        <Pill selected={showCustom} onClick={() => setShowCustom((v) => !v)} disabled={isPending}>
          직접 입력
        </Pill>
      </div>
      {showCustom && (
        <div className="mt-2 flex gap-2">
          <input
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            placeholder={item.suggestion}
            className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm"
          />
          <button
            onClick={() => customAnswer.trim() && onAnswer(customAnswer.trim())}
            disabled={isPending || !customAnswer.trim()}
            className="rounded bg-primary-500 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
}

function PanelShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      {/* md 미만: 패널 뒤 어두운 배경 (전체화면 오버레이처럼 동작) */}
      <div onClick={onClose} className="fixed inset-0 z-20 bg-black/30 md:hidden" aria-hidden="true" />

      {/* md 미만: 화면 전체 폭을 채우는 하단/전체 오버레이. md 이상: 기존처럼 우측 고정폭 패널 */}
      <aside
        className="fixed inset-x-0 bottom-0 top-16 z-30 flex flex-col border-l border-gray-100 bg-surface
          md:static md:inset-auto md:w-panel md:flex-shrink-0"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary-100 px-2 py-1.5 text-xs font-medium text-[#148280]">
              AI 검토
            </span>
            <span className="text-base font-medium tracking-[-0.32px] text-[#171717]">공동 이해 준비</span>
          </div>
          <button onClick={onClose} aria-label="닫기" className="text-gray-400 hover:opacity-70">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.0001 1L1 19.0001" stroke="#9299A3" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 1L19.0001 19.0001" stroke="#9299A3" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  );
}

function SummaryRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex gap-4 text-sm font-medium tracking-[-0.28px]">
      <dt className="w-14 flex-shrink-0 text-[#9299A3]">{label}</dt>
      <dd className={danger ? "text-warn" : "text-[#323538]"}>{value}</dd>
    </div>
  );
}

function QuestionBlock({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-lg bg-block-gray p-3">
      <p className="mb-2 text-sm font-medium tracking-[-0.28px] text-[#161719]">{message}</p>
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
      className={`rounded-pill px-3 py-1.5 text-sm font-medium tracking-[-0.28px] transition-colors ${
        selected ? "bg-primary-500 text-white" : "bg-pill-gray text-[#9299A3] hover:brightness-95"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}
