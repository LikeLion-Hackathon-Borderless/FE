import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { UnderstandingCard as UnderstandingCardType } from "@/types/understandingCard";
import { CardVersionBadge } from "./CardVersionBadge";
import { ResponseButtonGroup } from "./ResponseButtonGroup";
import { SenderRevisionActions } from "./SenderRevisionActions";
import { zoneShort } from "@/shared/utils/timezoneLabel";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  card: UnderstandingCardType;
  // 발신자 화면인지 수신자 화면인지에 따라 3버튼 노출 여부가 다름 (와이어프레임 이미지2 vs 이미지5)
  viewerRole: "sender" | "recipient";
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

export function UnderstandingCard({ card, viewerRole, onResponded, onRevised, superseded }: Props) {
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
          <span className="text-sm font-medium text-gray-400">공통 이해 카드</span>
          <CardVersionBadge revision={card.revision} state={card.state} superseded />
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-gray-400">기한</span>
          <span className="text-gray-400">{deadlineText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-primary-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">공통 이해 카드</span>
        <CardVersionBadge revision={card.revision} state={card.state} />
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="업무" value={card.task} />
        <Row label="담당자" value={card.assignee.displayName} />
        <Row label="기한" value={deadlineText} emphasize />
        <Row label="기대 결과" value={card.expectedOutcome} />
        {/* 백엔드엔 decisionType이 없고 needsClarification(boolean)만 있음.
            와이어프레임의 "결정 상태" 행은 대응 필드가 없어 제거 - 확인 필요 시에만 표시. (PM 확인 항목) */}
        {card.needsClarification && <Row label="상태" value="확인 필요" />}

        {/* 첨부 + 원문 보기 (Image 2/5) */}
        <div className="flex justify-between gap-4">
          <dt className="w-20 flex-shrink-0 text-gray-400">첨부</dt>
          <dd className="text-gray-700">
            {fileNames && <span>{fileNames} · </span>}
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="text-primary-600 hover:underline"
            >
              {showOriginal ? "원문 접기" : "원문 보기"}
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
        <SenderRevisionActions card={card} onRevised={onRevised} />
      ) : (
        viewerRole === "recipient" && (
          <div className="mt-4">
            <ResponseButtonGroup card={card} onResponded={onResponded} />
          </div>
        )
      )}
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="w-20 flex-shrink-0 text-gray-400">{label}</dt>
      <dd className={emphasize ? "font-medium text-gray-900" : "text-gray-700"}>{value}</dd>
    </div>
  );
}