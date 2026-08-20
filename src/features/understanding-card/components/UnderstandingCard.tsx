import { useT } from "@/shared/i18n/i18n";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { UnderstandingCard as UnderstandingCardType } from "@/types/understandingCard";
import { CardVersionBadge } from "./CardVersionBadge";
import { ResponseButtonGroup } from "./ResponseButtonGroup";
import { SenderRevisionActions } from "./SenderRevisionActions";
import { zoneShort } from "@/shared/utils/timezoneLabel";
import { LabelValueRow } from "@/shared/ui/LabelValueRow";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  card: UnderstandingCardType;
  // 발신자 화면인지 수신자 화면인지에 따라 3버튼 노출 여부가 다름 (와이어프레임 이미지2 vs 이미지5)
  viewerRole: "sender" | "recipient";
  // 카드에는 수신자(assignee) 정보만 있고 발신자 정보가 없음 - 이전엔 그래서
  // DeadlineProposalForm/SenderRevisionActions가 발신자 이름/타임존을 "이서연"/"Asia/Seoul"로
  // 하드코딩해뒀었음. 실제 로그인 유저가 다른 사람/다른 시간대여도 항상 그렇게 떴던 버그.
  // 부모(ConversationPage)는 어느 쪽이 발신자인지 이미 알고 있으므로 여기로 실제 값을 전달받는다.
  senderName?: string;
  senderTimeZoneId?: string;
  // 수신자가 3버튼으로 응답하면 대화에 남길 말풍선 텍스트를 부모로 올려보냄 (Image 6/10/12)
  onResponded?: (bubbleText: string) => void;
  // 발신자가 카드를 재생성하면 이전 revision을 부모가 "대체됨"으로 보관 (Image 7)
  onRevised?: (supersededCard: UnderstandingCardType) => void;
  // 이전 버전(대체됨) 접힘 표시
  superseded?: boolean;
}

// 첨부 데이터 모델은 첨부 배치(29)에서 확정 - 지금은 fileName류 필드가 있으면 방어적으로 표시
function attachmentName(a: unknown): string | null {
  if (a && typeof a === "object") {
    const o = a as Record<string, unknown>;
    const n = o.originalFileName ?? o.fileName;
    if (typeof n === "string") return n;
  }
  return null;
}

export function UnderstandingCard({
  card,
  viewerRole,
  senderName,
  senderTimeZoneId,
  onResponded,
  onRevised,
  superseded,
}: Props) {
  const t = useT();
  const [showOriginal, setShowOriginal] = useState(false);

  // 기한: 수신자 현지시각 + 존 라벨 (Image 2/5 "7/30 17:00 (LA)")
  const deadlineText = `${dayjs(card.deadline.instant)
    .tz(card.deadline.viewerTimeZoneId)
    .format("M/D HH:mm")} (${zoneShort(card.deadline.viewerTimeZoneId)})`;

  const fileNames = card.attachments.map(attachmentName).filter(Boolean).join(", ");

  // 이전 버전: 접힘 표시 (기한만, 회색) - Image 7
  if (superseded) {
    return (
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-80">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">{t("card.title")}</span>
          <CardVersionBadge revision={card.revision} state={card.state} superseded />
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-gray-400">{t("card.deadline")}</span>
          <span className="text-gray-400">{deadlineText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-primary-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{t("card.title")}</span>
        <CardVersionBadge revision={card.revision} state={card.state} />
      </div>

      <dl className="space-y-2 text-sm">
        <LabelValueRow labelWidth="w-20" label={t("card.task")} value={card.task} />
        <LabelValueRow labelWidth="w-20" label={t("card.assignee")} value={card.assignee.displayName} />
        <LabelValueRow labelWidth="w-20" label={t("card.deadline")} value={deadlineText} emphasize />
        <LabelValueRow labelWidth="w-20" label={t("card.expectedOutcome")} value={card.expectedOutcome} />
        {/* 백엔드엔 decisionType이 없고 needsClarification(boolean)만 있음.
            와이어프레임의 "결정 상태" 행은 대응 필드가 없어 제거 - 확인 필요 시에만 표시. (PM 확인 항목) */}
        {card.needsClarification && <LabelValueRow labelWidth="w-20" label={t("card.status")} value={t("card.needsCheck")} />}

        {/* 첨부 + 원문 보기 (Image 2/5) */}
        <div className="flex justify-between gap-4">
          <dt className="w-20 flex-shrink-0 text-gray-400">{t("card.attachment")}</dt>
          <dd className="text-gray-700">
            {fileNames && <span>{fileNames} · </span>}
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="text-primary-600 hover:underline"
            >
              {showOriginal ? t("card.hideOriginal") : t("card.showOriginal")}
            </button>
          </dd>
        </div>
      </dl>

      {showOriginal && (
        <div className="mt-3 space-y-1.5 rounded-md bg-gray-50 p-3 text-xs">
          <p className="text-gray-700">{card.originalContent}</p>
          {card.translatedContent && card.translatedContent !== card.originalContent && (
            <p className="text-gray-400">{card.translatedContent}</p>
          )}
        </div>
      )}

      {/* PENDING = 발신자 카드 재생성 (Image 7/8) / REVIEW·AGREED + 수신자 = 3버튼 */}
      {card.state === "PENDING" ? (
        <SenderRevisionActions
          card={card}
          senderName={senderName}
          senderZone={senderTimeZoneId}
          onRevised={onRevised}
        />
      ) : (
        viewerRole === "recipient" && (
          <div className="mt-4">
            <ResponseButtonGroup
              card={card}
              senderName={senderName}
              senderZone={senderTimeZoneId}
              onResponded={onResponded}
            />
          </div>
        )
      )}
    </div>
  );
}