import { mockDelay } from "@/shared/api/mockDelay";
import type { WorkspaceResponse, WorkspaceMemberResponse } from "@/types/workspace";

// 워크스페이스는 이제 실제 API 구현 완료(API.md v1.0) - mock은 USE_MOCK=true일 때만 사용됨
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

  getDetail: (workspaceId: string): Promise<WorkspaceResponse> =>
    mockDelay({
      id: workspaceId,
      name: "Likelion Global",
      organizationDomain: null,
      myMembershipRole: "OWNER" as const,
      memberCount: 3,
      createdAt: new Date().toISOString(),
    }),

  getMembers: (_workspaceId: string): Promise<WorkspaceMemberResponse[]> =>
    mockDelay([
      {
        membershipId: "mock-membership-1",
        membershipRole: "OWNER" as const,
        joinedAt: new Date().toISOString(),
        user: {
          id: "self",
          email: "demo@ditto.app",
          displayName: "이서연",
          profileImageUrl: null,
          workRole: "PROJECT_MANAGER",
          timeZoneId: "Asia/Seoul",
          preferredLanguage: "ko",
        },
      },
      {
        membershipId: "mock-membership-2",
        membershipRole: "MEMBER" as const,
        joinedAt: new Date().toISOString(),
        user: {
          id: "mock-alex",
          email: "alex@ditto.app",
          displayName: "Alex",
          profileImageUrl: null,
          workRole: "DEVELOPER",
          timeZoneId: "America/Los_Angeles",
          preferredLanguage: "en",
        },
      },
    ]),

  remove: (_workspaceId: string): Promise<void> => mockDelay(undefined),
};
