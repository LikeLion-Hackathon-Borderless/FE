import { useState } from "react";
import { onboardingService } from "../api/onboarding";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import type { ApiErrorResponse } from "@/shared/api/errorCodes";
import type { WorkDay } from "@/types/user";

const ALL_DAYS: WorkDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABEL: Record<WorkDay, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

// IANA timezone 목록 일부 - 필요하면 팀 논의해서 전체 목록으로 확장 가능
const TIMEZONE_OPTIONS = [
  "Asia/Seoul",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Asia/Shanghai",
];

export function WorkContextStep({ onDone }: { onDone: () => void }) {
  const [timeZoneId, setTimeZoneId] = useState("Asia/Seoul");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [workDays, setWorkDays] = useState<WorkDay[]>([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  const toggleDay = (day: WorkDay) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // workStart < workEnd 검증 (API.md 5.5절, 야간 교대근무 MVP 제외)
    if (workStart >= workEnd) {
      setError("근무 시작 시각은 종료 시각보다 빨라야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await onboardingService.saveWorkContext({
        timeZoneId,
        workStart: `${workStart}:00`,
        workEnd: `${workEnd}:00`,
        workDays,
      });
      if (accessToken) setAuth(accessToken, updated);
      onDone();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      // TIME_ZONE_REQUIRED 등은 여기선 발생 안 함 (E05는 AI검토 확정 시점) - 일반 오류만 처리
      setError(apiError.message ?? "근무 정보 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-sm font-medium text-gray-900">근무 컨텍스트</h2>

      <select
        value={timeZoneId}
        onChange={(e) => setTimeZoneId(e.target.value)}
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
      >
        {TIMEZONE_OPTIONS.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <input
          type="time"
          value={workStart}
          onChange={(e) => setWorkStart(e.target.value)}
          className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
        />
        <span className="self-center text-gray-400">~</span>
        <input
          type="time"
          value={workEnd}
          onChange={(e) => setWorkEnd(e.target.value)}
          className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-1">
        {ALL_DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={`flex-1 rounded border py-1 text-xs ${
              workDays.includes(day)
                ? "border-primary-500 bg-primary-50 text-primary-600"
                : "border-gray-200 text-gray-400"
            }`}
          >
            {DAY_LABEL[day]}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
      >
        다음
      </button>
    </form>
  );
}
