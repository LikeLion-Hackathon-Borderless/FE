import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvitationPreview, useAcceptInvitation } from "../hooks/useInvitations";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";
import { setPendingInviteToken, clearPendingInviteToken } from "@/shared/utils/pendingInvite";
import dayjs from "dayjs";
import type { ApiErrorResponse } from "@/shared/api/errorCodes";

export function InvitationPreviewPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);

  const previewQuery = useInvitationPreview(token ?? null);
  const acceptInvitation = useAcceptInvitation();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // 로그인 안 된 상태로 이 화면을 보고 있으면, 로그인/회원가입 끝나고 돌아와서 자동 수락하도록 token 보존
  useEffect(() => {
    if (!accessToken && token) {
      setPendingInviteToken(token);
    }
  }, [accessToken, token]);

  const handleAccept = async () => {
    if (!token) return;
    setAcceptError(null);
    try {
      const workspace = await acceptInvitation.mutateAsync(token);
      clearPendingInviteToken();
      setWorkspaceId(workspace.id);
      navigate("/");
    } catch (err) {
      // INVITATION_INVALID(400), INVITATION_EXPIRED(410), INVITATION_EMAIL_MISMATCH(403) (API.md 7.7절)
      const apiError = err as ApiErrorResponse;
      setAcceptError(apiError.message ?? "초대를 수락할 수 없습니다.");
    }
  };

  if (previewQuery.isLoading) {
    return <CenteredCard>불러오는 중...</CenteredCard>;
  }

  if (previewQuery.isError) {
    const apiError = previewQuery.error as unknown as ApiErrorResponse;
    return (
      <CenteredCard>
        <p className="text-sm text-red-500">
          {apiError?.message ?? "초대 링크가 유효하지 않거나 만료되었습니다."}
        </p>
      </CenteredCard>
    );
  }

  const preview = previewQuery.data;
  if (!preview) return null;

  return (
    <CenteredCard>
      <h1 className="mb-2 text-lg font-medium text-gray-900">워크스페이스 초대</h1>
      <p className="mb-1 text-sm text-gray-700">
        <strong>{preview.inviterDisplayName}</strong>님이{" "}
        <strong>{preview.workspaceName}</strong>에 초대했습니다.
      </p>
      <p className="mb-6 text-xs text-gray-400">
        {dayjs(preview.expiresAt).format("YYYY-MM-DD HH:mm")}까지 유효
      </p>

      {acceptError && <p className="mb-3 text-xs text-red-500">{acceptError}</p>}

      {accessToken ? (
        <button
          onClick={handleAccept}
          disabled={acceptInvitation.isPending}
          className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
        >
          {acceptInvitation.isPending ? "수락 중..." : "초대 수락하기"}
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">수락하려면 먼저 로그인하거나 계정을 만들어주세요.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded bg-primary-500 py-2 text-sm text-white"
          >
            로그인하고 수락
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-full rounded border border-gray-200 py-2 text-sm text-gray-600"
          >
            회원가입하고 수락
          </button>
        </div>
      )}
    </CenteredCard>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}
