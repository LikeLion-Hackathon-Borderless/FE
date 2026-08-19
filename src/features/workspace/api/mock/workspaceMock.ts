import { mockDelay } from "@/shared/api/mockDelay";
import type { WorkspaceResponse, WorkspaceMemberResponse } from "@/types/workspace";

// 워크스페이스는 이제 실제 API 구현 완료(API.md v1.0) - mock은 USE_MOCK=true일 때만 사용됨.
// create()로 만든 값이 list()/getDetail()에도 그대로 반영되도록 메모리에 저장해둔다
// (다른 mock들과 같은 패턴 - 새로고침하면 초기화됨).
let mockWorkspaces: WorkspaceResponse[] = [
  {
    id: "mock-workspace-1",
    name: "Likelion Global",
    organizationDomain: null,
    myMembershipRole: "OWNER" as const,
    memberCount: 3,
    createdAt: new Date().toISOString(),
  },
];

export const workspaceMock = {
  list: (): Promise<WorkspaceResponse[]> => mockDelay(mockWorkspaces),

  // API.md 7.1절 요청/응답 형태 그대로 흉내
  create: (name: string, organizationDomain?: string): Promise<WorkspaceResponse> => {
    const workspace: WorkspaceResponse = {
      id: `mock-workspace-${Date.now()}`,
      name,
      organizationDomain: organizationDomain ?? null,
      myMembershipRole: "OWNER" as const,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    mockWorkspaces = [...mockWorkspaces, workspace];
    return mockDelay(workspace);
  },

  getDetail: (workspaceId: string): Promise<WorkspaceResponse> => {
    const found = mockWorkspaces.find((w) => w.id === workspaceId);
    return mockDelay(
      found ?? {
        id: workspaceId,
        name: "워크스페이스",
        organizationDomain: null,
        myMembershipRole: "OWNER" as const,
        memberCount: 1,
        createdAt: new Date().toISOString(),
      },
    );
  },

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
