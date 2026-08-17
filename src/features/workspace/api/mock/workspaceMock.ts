import { mockDelay } from "@/shared/api/mockDelay";
import type { WorkspaceResponse } from "@/types/workspace";

// 온보딩/워크스페이스는 오늘 스코프에서 화면 stub만 - 로직은 신규예정 API 붙을 때 교체
export const workspaceMock = {
  list: (): Promise<WorkspaceResponse[]> =>
    mockDelay([
      {
        id: "mock-workspace-1",
        name: "Likelion Global",
        organizationDomain: null,
        myMembershipRole: "OWNER" as const,
        memberCount: 3,
        createdAt: new Date().toISOString(),
      },
    ]),

  // API.md 7.1절 요청/응답 형태 그대로 흉내
  create: (name: string, organizationDomain?: string): Promise<WorkspaceResponse> =>
    mockDelay({
      id: `mock-workspace-${Date.now()}`,
      name,
      organizationDomain: organizationDomain ?? null,
      myMembershipRole: "OWNER" as const,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    }),
};
