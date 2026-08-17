import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { ProfileStep } from "../components/ProfileStep";
import { WorkContextStep } from "../components/WorkContextStep";
import { WorkspaceStep } from "../components/WorkspaceStep";

export function OnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // GET /users/me의 onboardingStep으로 이어서 진행 (API.md 5절)
  const step = user?.onboardingStep ?? "PROFILE";

  const goToNextStep = () => {
    // 각 Step 컴포넌트가 저장 성공 시 useAuthStore를 갱신하므로
    // user.onboardingStep이 최신값으로 바뀌고 이 컴포넌트가 다시 렌더링됨
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        {step === "PROFILE" && <ProfileStep onDone={goToNextStep} />}
        {step === "WORK_CONTEXT" && <WorkContextStep onDone={goToNextStep} />}
        {step === "WORKSPACE" && <WorkspaceStep onDone={() => navigate("/")} />}
      </div>
    </div>
  );
}
