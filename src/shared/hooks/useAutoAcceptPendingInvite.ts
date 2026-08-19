import { useNavigate } from "react-router-dom";
import { useAcceptInvitation } from "@/features/workspace/hooks/useInvitations";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";
import { getPendingInviteToken, clearPendingInviteToken } from "@/shared/utils/pendingInvite";

// 로그인/회원가입 직후 호출. 대기 중인 초대 토큰이 있으면 자동 수락하고 "/"로 이동시키고 true 반환.
// 없으면(또는 수락 실패하면) false를 반환해서 호출한 쪽이 원래 라우팅 로직(onboardingStep 기준)을 그대로 타게 함.
export function useAutoAcceptPendingInvite() {
  const acceptInvitation = useAcceptInvitation();
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);
  const navigate = useNavigate();

  return async (): Promise<boolean> => {
    const token = getPendingInviteToken();
    if (!token) return false;

    try {
      const workspace = await acceptInvitation.mutateAsync(token);
      clearPendingInviteToken();
      setWorkspaceId(workspace.id);
      navigate("/");
      return true;
    } catch {
      // 만료/무효 토큰이면 그냥 지우고 일반 로그인 흐름으로 넘어감 (API.md 7.7절 오류코드 참고)
      clearPendingInviteToken();
      return false;
    }
  };
}
