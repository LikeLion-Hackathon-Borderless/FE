import { useNavigate } from "react-router-dom";
import { workspaceService } from "@/features/workspace/api/workspace";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";

// 로그인 시점엔 accessToken/user만 오고 workspaceId는 안 옴 (별도 GET /workspaces 필요).
// onboardingStep=COMPLETED로 로그인했는데 로컬에 workspaceId가 없는 경우
// (다른 브라우저 최초 로그인, localStorage 초기화 등)를 위한 보정 로직.
export function usePostLoginWorkspaceResolve() {
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);
  const currentWorkspaceId = useWorkspaceStore((s) => s.workspaceId);
  const navigate = useNavigate();

  return async () => {
    if (currentWorkspaceId) {
      navigate("/");
      return;
    }

    try {
      const workspaces = await workspaceService.list();
      if (workspaces.length === 1) {
        // 하나뿐이면 바로 선택하고 진입 - 매번 선택화면 거치게 하지 않음
        setWorkspaceId(workspaces[0].id);
        navigate("/");
      } else {
        // 0개(삭제됨 등) 또는 여러 개면 직접 고르거나 만들게 함
        navigate("/workspaces");
      }
    } catch {
      navigate("/workspaces");
    }
  };
}
