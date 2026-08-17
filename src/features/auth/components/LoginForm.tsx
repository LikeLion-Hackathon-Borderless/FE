import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import type { ApiErrorResponse } from "@/shared/api/errorCodes";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.login(email, password);
      setAuth(res.accessToken, res.user);

      // onboardingStep 기준으로 이어서 진행 (API.md 5절)
      if (res.user.onboardingStep === "PROFILE" || res.user.onboardingStep === "WORK_CONTEXT") {
        navigate("/onboarding");
      } else if (res.user.onboardingStep === "WORKSPACE") {
        navigate("/workspaces");
      } else {
        navigate("/");
      }
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      // INVALID_CREDENTIALS(401)만 정의되어 있음 (API.md 4.4절)
      setError(apiError.message ?? "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
      <h1 className="mb-6 text-lg font-medium text-gray-900">로그인</h1>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        required
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
      >
        로그인
      </button>

      <p className="text-center text-xs text-gray-400">
        계정이 없으신가요?{" "}
        <a href="/signup" className="text-primary-600">
          회원가입
        </a>
      </p>
    </form>
  );
}
