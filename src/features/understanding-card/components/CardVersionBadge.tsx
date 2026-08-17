import type { CardState } from "@/types/understandingCard";

export function CardVersionBadge({ revision, state }: { revision: number; state: CardState }) {
  const colorClass =
    state === "AGREED"
      ? "bg-primary-50 text-primary-600"
      : "bg-red-50 text-red-500";

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      D-{revision}
    </span>
  );
}
