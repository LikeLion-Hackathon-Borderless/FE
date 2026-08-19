import type { ReactNode } from "react";

// 빈 상태 (DM 없음/메시지 없음/합의기록 없음 등, API.md 13.3)
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 py-12 text-center">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}