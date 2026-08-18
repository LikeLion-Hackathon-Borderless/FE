import type { CardState } from "@/types/understandingCard";

// superseded=이전 revision이 새 카드로 대체됨 (Image 7 "이전 버전 · 대체됨")
// 색 상세는 덩어리4에서 최종 다듬음 (지금은 REVIEW/PENDING=red, AGREED=mint, 대체됨=gray)
export function CardVersionBadge({
  revision,
  state,
  superseded = false,
}: {
  revision: number;
  state: CardState;
  superseded?: boolean;
}) {
  if (superseded) {
    return (
      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
        이전 버전 · 대체됨
      </span>
    );
  }

  const colorClass =
    state === "AGREED"
      ? "bg-primary-50 text-primary-600"
      : state === "PENDING"
        ? "bg-amber-50 text-amber-600"
        : "bg-red-50 text-red-500";

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}>D-{revision}</span>
  );
}