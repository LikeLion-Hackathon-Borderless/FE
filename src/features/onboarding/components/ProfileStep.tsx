import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { onboardingService } from "../api/onboarding";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import type { ApiErrorResponse } from "@/shared/api/errorCodes";

export function ProfileStep({ onDone }: { onDone: () => void }) {
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: onboardingService.getRoles,
  });

  const currentUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? "");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("ko");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoleOption = roles?.find((r) => r.code === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await onboardingService.saveProfile({
        displayName,
        role,
        // role=OTHER면 customRole 필수, 그 외엔 null (API.md 5.3절)
        customRole: selectedRoleOption?.customInputRequired ? customRole : null,
        preferredLanguage,
      });
      if (accessToken) setAuth(accessToken, updated);
      onDone();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError.message ?? "프로필 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-sm font-medium text-gray-900">프로필</h2>

      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="이름"
        required
        maxLength={50}
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
      >
        <option value="">역할 선택</option>
        {roles?.map((r) => (
          <option key={r.code} value={r.code}>
            {r.label}
          </option>
        ))}
      </select>

      {selectedRoleOption?.customInputRequired && (
        <input
          value={customRole}
          onChange={(e) => setCustomRole(e.target.value)}
          placeholder="역할을 직접 입력하세요"
          required
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
        />
      )}

      <select
        value={preferredLanguage}
        onChange={(e) => setPreferredLanguage(e.target.value)}
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
      >
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>

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
