// 로딩 스피너 (후반5 공통 UI)
export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className={`inline-block animate-spin rounded-full border-2 border-gray-200 border-t-primary-500 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}