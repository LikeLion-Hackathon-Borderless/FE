import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { WorkDay } from "@/types/user";

dayjs.extend(utc);
dayjs.extend(timezone);

const DAY_NAMES: WorkDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const DEFAULT_WORK_DAYS: WorkDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

function toMinutes(hms: string): number {
  const [h, m] = hms.split(":").map(Number);
  return h * 60 + (m || 0);
}

// 해당 타임존의 "지금"이 근무시간 안인지. 근무요일 + 시작/종료 시각 모두 반영.
// 상대방 근무시간이 계약에 없으면(UserSummaryResponse) 기본값(09~18, 월~금) 사용 - 백엔드 확인 항목.
export function isWithinWorkHours(
  timeZoneId: string,
  workStart = "09:00:00",
  workEnd = "18:00:00",
  workDays: WorkDay[] = DEFAULT_WORK_DAYS,
): boolean {
  const now = dayjs().tz(timeZoneId);
  const today = DAY_NAMES[now.day()];
  if (!workDays.includes(today)) return false;
  const cur = now.hour() * 60 + now.minute();
  return cur >= toMinutes(workStart) && cur < toMinutes(workEnd);
}