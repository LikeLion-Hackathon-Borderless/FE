import type { UnderstandingCard as UnderstandingCardType } from "@/types/understandingCard";
import { formatViewerLocal } from "@/shared/utils/datetime";
import { CardVersionBadge } from "./CardVersionBadge";
import { ResponseButtonGroup } from "./ResponseButtonGroup";

interface Props {
  card: UnderstandingCardType;
  // 발신자 화면인지 수신자 화면인지에 따라 3버튼 노출 여부가 다름 (와이어프레임 이미지2 vs 이미지5)
  viewerRole: "sender" | "recipient";
}

export function UnderstandingCard({ card, viewerRole }: Props) {
  return (
    <div className="w-full max-w-md rounded-lg border border-primary-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">공통 이해 카드</span>
        <CardVersionBadge revision={card.revision} state={card.state} />
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="업무" value={card.task} />
        <Row label="담당자" value={card.assignee.displayName} />
        <Row
          label="기한"
          value={formatViewerLocal(card.deadline.instant, card.deadline.viewerTimeZoneId)}
          emphasize
        />
        <Row label="기대 결과" value={card.expectedOutcome} />
        {/* TODO: decisionType 필드 백엔드 확인 전까지 옵셔널 처리 (types/understandingCard.ts 참고) */}
        {card.decisionType && (
          <Row
            label="결정 상태"
            value={card.decisionType === "REQUIRED" ? "필수 반영 · 제안 아님" : "제안"}
          />
        )}
      </dl>

      {viewerRole === "recipient" && (
        <div className="mt-4">
          <ResponseButtonGroup card={card} />
        </div>
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
