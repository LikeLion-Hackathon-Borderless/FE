import { apiClient } from "@/shared/api/client";
import type { WorkspaceResponse, WorkspaceMemberResponse } from "@/types/workspace";

// 실제 서버 호출. mock 모드에서는 workspace.ts 스위처가 workspaceMock을 대신 씀 (API.md 3.3, 7절)
export const workspaceApi = {
  list: () => apiClient.get<WorkspaceResponse[]>("/workspaces").then((res) => res.data),

  create: (name: string, organizationDomain?: string) =>
    apiClient
      .post<WorkspaceResponse>("/workspaces", { name, organizationDomain })
      .then((res) => res.data),

  getDetail: (workspaceId: string) =>
    apiClient.get<WorkspaceResponse>(`/workspaces/${workspaceId}`).then((res) => res.data),

  getMembers: (workspaceId: string) =>
    apiClient
      .get<WorkspaceMemberResponse[]>(`/workspaces/${workspaceId}/members`)
      .then((res) => res.data),

  // OWNER만 가능. 프론트에서 워크스페이스 이름 재입력을 요구해야 함 (API.md 6절 확정정책)
  remove: (workspaceId: string): Promise<void> =>
    apiClient.delete<void>(`/workspaces/${workspaceId}`).then(() => undefined),
};
