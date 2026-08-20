// 카드/패널에서 "라벨: 값" 형태로 보여주는 행. 이전엔 UnderstandingCard.tsx의 Row와
// AIReviewPanel.tsx의 SummaryRow가 각자 따로 정의되어 있어서 라벨 너비(w-20 vs w-14),
// 색상(tailwind 기본 gray vs 하드코딩 hex), 글자크기가 서로 미묘하게 달랐음. 하나로 통합.
export function LabelValueRow({
  label,
  value,
  emphasize,
  danger,
  labelWidth = "w-16",
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  danger?: boolean;
  labelWidth?: string;
}) {
  return (
    <div className="flex gap-4 text-sm">
      <dt className={`${labelWidth} flex-shrink-0 text-label`}>{label}</dt>
      <dd className={danger ? "font-medium text-warn" : emphasize ? "font-medium text-ink" : "text-ink"}>
        {value}
      </dd>
    </div>
  );
}
