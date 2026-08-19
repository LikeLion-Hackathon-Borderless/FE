import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useConversationList } from "@/features/conversation/hooks/useConversations";
import { useAgreementLogs } from "../hooks/useAgreementLogs";
import type { AgreementLogEntry } from "@/types/agreementLog";
import { Spinner } from "@/shared/ui/Spinner";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";

dayjs.extend(utc);
dayjs.extend(timezone);

export function AgreementLogPage() {
  // 데모: 현재 워크스페이스의 첫 대화 기준. 실배포는 라우트 param 또는 선택된 대화로 스코프.
  const conversationsQuery = useConversationList();
  const conversationId = conversationsQuery.data?.[0]?.id ?? null;

  const logsQuery = useAgreementLogs(conversationId);
  const logs = logsQuery.data?.pages.flatMap((p) => p.logs) ?? [];
  const lastIndex = logs.length - 1; // 최신 이벤트 강조 (API는 과거→현재 순, API.md 2.4)

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-medium text-gray-900">합의 기록</h1>

      {logsQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : logsQuery.isError ? (
        <ErrorState error={logsQuery.error} onRetry={() => logsQuery.refetch()} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="아직 합의 기록이 없어요."
          description="AI 검토로 확정 전송하면 여기에 남아요."
        />
      ) : (
        <>
          {/* 헤더 라벨: 좁은 화면(카드형으로 쌓이는 md 미만)에서는 각 행 안에 라벨이 이미 붙으므로 숨김 */}
          <div className="hidden border-b border-gray-100 pb-2 text-xs text-gray-400 md:grid md:grid-cols-[140px_1fr_120px]">
            <span>언제</span>
            <span>무엇에</span>
            <span>누가</span>
          </div>
          {logs.map((log, i) => (
            <LogRow key={log.id} log={log} highlight={i === lastIndex} />
          ))}

          {logsQuery.hasNextPage && (
            <button
              onClick={() => logsQuery.fetchNextPage()}
              disabled={logsQuery.isFetchingNextPage}
              className="mt-4 w-full rounded-md border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              {logsQuery.isFetchingNextPage ? "불러오는 중…" : "더 보기"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function LogRow({ log, highlight }: { log: AgreementLogEntry; highlight: boolean }) {
  // 언제: agreedAt이 null(PENDING)이면 현재시각으로 새지 않게 "—" 처리 (기존 버그 수정)
  const when = log.agreedAt
    ? `${dayjs(log.agreedAt).tz("Asia/Seoul").format("M/D HH:mm")} KST`
    : "—";

  const deadline = `${dayjs(log.deadline).tz("America/Los_Angeles").format("M/D HH:mm")} (LA)`;
  const statusLabel = log.status === "AGREED" ? "합의 완료" : "확인 대기";
  const who = log.agreedBy?.displayName ? `${log.agreedBy.displayName} →` : "—";

  return (
    <div
      className={`flex flex-col gap-1 border-b border-gray-50 px-3 py-3 text-sm
        md:grid md:grid-cols-[140px_1fr_120px] md:items-start md:gap-0 md:px-0 ${
        highlight ? "bg-primary-50" : ""
      }`}
    >
      {/* md 미만: 라벨을 행 안에 같이 표시(헤더를 숨겼으므로) */}
      <span className="text-gray-500">
        <span className="mr-1 text-gray-300 md:hidden">언제</span>
        {when}
      </span>
      <div className="text-gray-800">
        {statusLabel} · 공통 이해 카드 v{log.revision} (마감 {deadline})
        {log.fileReferences.length > 0 && (
          <div className="mt-0.5 text-xs text-gray-400">
            {log.fileReferences.map((f) => `${f.fileName} ${f.locator}`).join(", ")}
          </div>
        )}
      </div>
      <span className={highlight ? "text-primary-600" : "text-gray-500"}>
        <span className="mr-1 text-gray-300 md:hidden">누가</span>
        {who}
      </span>
    </div>
  );
}