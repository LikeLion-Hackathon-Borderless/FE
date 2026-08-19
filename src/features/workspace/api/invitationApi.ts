import { apiClient } from "@/shared/api/client";
import type { InviteEmailResult, InvitationLinkResponse, InvitationPreview } from "@/types/workspace";
import type { WorkspaceResponse } from "@/types/workspace";

// 실제 서버 호출. mock 모드에서는 invitation.ts 스위처가 invitationMock을 대신 씀
export const invitationApi = {
  // OWNER만 가능, 최대 20개 (API.md 7.5절)
  inviteByEmail: (workspaceId: string, emails: string[]) =>
    apiClient
      .post<InviteEmailResult>(`/workspaces/${workspaceId}/invitations`, { emails })
      .then((res) => res.data),

  // regenerate=true면 기존 링크 무효화 후 재발급 (API.md 7.6절)
  createInvitationLink: (workspaceId: string, expiresInDays = 7, regenerate = false) =>
    apiClient
      .post<InvitationLinkResponse>(`/workspaces/${workspaceId}/invitation-links`, {
        expiresInDays,
        regenerate,
      })
      .then((res) => res.data),

  // 인증 불필요 - 로그인 안 한 사람도 미리보기 가능해야 함 (API.md 7.7절)
  getPreview: (token: string) =>
    apiClient.get<InvitationPreview>(`/workspace-invitations/${token}`).then((res) => res.data),

  // 인증 필요
  accept: (token: string) =>
    apiClient
      .post<WorkspaceResponse>(`/workspace-invitations/${token}/accept`)
      .then((res) => res.data),
};
