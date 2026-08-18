import { useId } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// API.md 2.3 / E-3 이중 시각 / E-14 서머타임:
// 값은 항상 UTC instant(ISO)로 주고받고, 사용자는 editZone(발신자 IANA 존) 벽시계로 고른다.
// previewZone(수신자)이 있으면 같은 순간을 동시에 보여준다. 고정 오프셋은 저장하지 않는다.

interface Props {
  value: string; // UTC instant(ISO), 미확정이면 ""
  onChange: (instantUtc: string) => void;
  editZone: string; // 사용자가 고르는 기준 존 (보통 발신자)
  editLabel?: string;
  previewZone?: string; // 함께 보여줄 상대 존 (보통 수신자)
  previewLabel?: string;
  previewOutsideHours?: boolean; // 수신자 근무외 강조 (E04)
  disabled?: boolean;
}

function toWall(instant: string, zone: string): string {
  if (!instant) return "";
  return dayjs(instant).tz(zone).format("YYYY-MM-DDTHH:mm");
}

function fromWall(wall: string, zone: string): string {
  if (!wall) return "";
  return dayjs.tz(wall, zone).utc().toISOString();
}

export function DateTimePicker({
  value,
  onChange,
  editZone,
  editLabel = editZone,
  previewZone,
  previewLabel = previewZone,
  previewOutsideHours = false,
  disabled = false,
}: Props) {
  const inputId = useId();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-gray-500">
        기준 시각 · {editLabel}
      </label>
      <input
        id={inputId}
        type="datetime-local"
        value={toWall(value, editZone)}
        disabled={disabled}
        onChange={(e) => onChange(fromWall(e.target.value, editZone))}
        className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
      />

      {value && previewZone && (
        <div className="mt-2.5 flex items-stretch gap-2 text-xs">
          <ZoneChip label={editLabel} instant={value} zone={editZone} />
          <span className="flex items-center text-gray-300">=</span>
          <ZoneChip label={previewLabel} instant={value} zone={previewZone} outside={previewOutsideHours} />
        </div>
      )}
    </div>
  );
}

function ZoneChip({
  label,
  instant,
  zone,
  outside = false,
}: {
  label?: string;
  instant: string;
  zone: string;
  outside?: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-md border px-2.5 py-1.5 ${
        outside ? "border-warn/30 bg-warn/10" : "border-gray-100 bg-gray-50"
      }`}
    >
      <div className="text-[11px] text-gray-400">{label}</div>
      <div className={`font-medium ${outside ? "text-warn" : "text-gray-900"}`}>
        {dayjs(instant).tz(zone).format("M/D (ddd) HH:mm")}
      </div>
    </div>
  );
}