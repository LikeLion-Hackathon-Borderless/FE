import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// API.md 2.3절: 절대시각은 항상 instant(UTC), 표시는 IANA timezone 기준 viewerLocal
// 서버가 계산해서 내려주는 값이 있으면 그걸 우선 쓰고, 프론트 자체 표시가 필요할 때만 이 함수를 쓴다.

export function formatViewerLocal(instant: string, timeZoneId: string) {
  return dayjs(instant).tz(timeZoneId).format("M/D HH:mm");
}

// 와이어프레임의 "LA 02:47" 같은 짧은 시각 뱃지용
export function formatShortLocalTime(instant: string, timeZoneId: string) {
  return dayjs(instant).tz(timeZoneId).format("HH:mm");
}

// 근무외시간 뱃지 판단 (E04 관련, 서버 warnings와 별개로 UI 표시용 보조 계산)
export function isOutsideWorkHours(
  instant: string,
  timeZoneId: string,
  workStart: string, // "09:00:00"
  workEnd: string, // "18:00:00"
  workDays: string[],
): boolean {
  const local = dayjs(instant).tz(timeZoneId);
  const dayName = local.format("dddd").toUpperCase(); // MONDAY..SUNDAY
  if (!workDays.includes(dayName)) return true;

  const [startH, startM] = workStart.split(":").map(Number);
  const [endH, endM] = workEnd.split(":").map(Number);
  const minutesNow = local.hour() * 60 + local.minute();
  const minutesStart = startH * 60 + startM;
  const minutesEnd = endH * 60 + endM;

  return minutesNow < minutesStart || minutesNow > minutesEnd;
}
