// 오류 상태 + 재시도 (화면 분기는 HTTP status 아니라 code 기준, API.md 2.5/9절)
const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "로그인이 만료됐어요. 다시 로그인해 주세요.",
  ACCESS_DENIED: "이 작업을 할 권한이 없어요.",
  TIME_ZONE_REQUIRED: "타임존을 먼저 등록해 주세요.",
  AI_REVIEW_FAILED: "AI 검토에 실패했어요. 원문 그대로 보낼 수 있어요.",
  INTERNAL_SERVER_ERROR: "서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
};

function messageFor(error: unknown): string {
  const e = error as { code?: string; message?: string; response?: { data?: { code?: string; message?: string } } };
  const code = e?.code ?? e?.response?.data?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  const msg = e?.response?.data?.message ?? e?.message;
  return typeof msg === "string" && msg ? msg : "문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
}

export function ErrorState({
  error,
  message,
  onRetry,
}: {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-red-100 bg-red-50 py-8 text-center">
      <p className="text-sm text-red-600">{message ?? messageFor(error)}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}