import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { useHydrateAuth } from "@/shared/hooks/useHydrateAuth";
import { ProfileStep } from "../components/ProfileStep";
import { WorkContextStep } from "../components/WorkContextStep";
import { WorkspaceStep } from "../components/WorkspaceStep";

export function OnboardingPage() {
  // 새로고침 시 토큰은 남아있는데 user(onboardingStep 포함)가 비어있는 문제 방지
  useHydrateAuth();

  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // GET /users/me의 onboardingStep으로 이어서 진행 (API.md 5절)
  const step = user?.onboardingStep ?? "PROFILE";

  const goToNextStep = () => {
    // 각 Step 컴포넌트가 저장 성공 시 useAuthStore를 갱신하므로
    // user.onboardingStep이 최신값으로 바뀌고 이 컴포넌트가 다시 렌더링됨
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        {step === "PROFILE" && <ProfileStep onDone={goToNextStep} />}
        {step === "WORK_CONTEXT" && <WorkContextStep onDone={goToNextStep} />}
        {step === "WORKSPACE" && <WorkspaceStep onDone={() => navigate("/")} />}
      </div>
    </div>
  );
}
