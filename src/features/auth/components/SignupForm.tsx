import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import type { ApiErrorResponse } from "@/shared/api/errorCodes";
import { useAutoAcceptPendingInvite } from "@/shared/hooks/useAutoAcceptPendingInvite";

type Step = "EMAIL" | "CODE" | "PROFILE";

export function SignupForm() {
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const tryAutoAcceptInvite = useAutoAcceptPendingInvite();

  const handleError = (err: unknown, fallback: string) => {
    const apiError = err as ApiErrorResponse;
    setError(apiError.message ?? fallback);
  };

  // 재발송 쿨다운 60초 (API.md 4.1절)
  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authService.sendVerificationCode(email);
      startCooldown();
      setStep("CODE");
    } catch (err) {
      handleError(err, "인증코드 발송에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.confirmVerificationCode(email, code);
      setVerificationToken(res.verificationToken);
      setStep("PROFILE");
    } catch (err) {
      // INVALID_VERIFICATION_CODE(400), VERIFICATION_CODE_EXPIRED(410) (API.md 4.2절)
      handleError(err, "인증코드가 올바르지 않거나 만료되었습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.signup({
        email,
        password,
        displayName,
        emailVerificationToken: verificationToken,
        termsAccepted: true,
      });
      setAuth(res.accessToken, res.user);
      // 초대 링크로 들어왔다가 회원가입한 경우, 대기 중인 초대를 먼저 자동 수락 (API.md 7.7절)
      // 수락 성공하면 onboardingStep도 서버가 COMPLETED로 처리하므로 온보딩 화면을 건너뛰어도 됨
      const accepted = await tryAutoAcceptInvite();
      if (!accepted) navigate("/onboarding");
    } catch (err) {
      handleError(err, "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-6 text-lg font-medium text-gray-900">회원가입</h1>

      {step === "EMAIL" && (
        <form onSubmit={handleSendCode} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
            maxLength={320}
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
          >
            인증코드 받기
          </button>
        </form>
      )}

      {step === "CODE" && (
        <form onSubmit={handleConfirmCode} className="space-y-3">
          <p className="text-xs text-gray-400">{email}로 발송된 6자리 코드를 입력하세요.</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6자리 코드"
            required
            maxLength={6}
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
          >
            확인
          </button>
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={handleSendCode}
            className="w-full text-xs text-gray-400 disabled:opacity-50"
          >
            {resendCooldown > 0 ? `재발송 (${resendCooldown}s)` : "코드 재발송"}
          </button>
        </form>
      )}

      {step === "PROFILE" && (
        <form onSubmit={handleSignup} className="space-y-3">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="이름"
            required
            maxLength={50}
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (8~72자)"
            required
            minLength={8}
            maxLength={72}
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
          >
            가입 완료
          </button>
        </form>
      )}
    </div>
  );
}
