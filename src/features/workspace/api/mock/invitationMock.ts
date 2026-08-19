import { mockDelay } from "@/shared/api/mockDelay";
import type { InviteEmailResult, InvitationLinkResponse, InvitationPreview } from "@/types/workspace";
import type { WorkspaceResponse } from "@/types/workspace";

let mockLinkToken = "mock-invite-token";

export const invitationMock = {
  inviteByEmail: (_workspaceId: string, emails: string[]): Promise<InviteEmailResult> =>
    mockDelay(
      {
        results: emails.map((email) => ({ email, status: "SENT" as const, errorCode: null })),
      },
      400,
    ),

  createInvitationLink: (
    _workspaceId: string,
    expiresInDays = 7,
    regenerate = false,
  ): Promise<InvitationLinkResponse> => {
    if (regenerate) mockLinkToken = `mock-invite-token-${Date.now()}`;
    return mockDelay(
      {
        token: mockLinkToken,
        inviteUrl: `${window.location.origin}/invitations/${mockLinkToken}`,
        expiresAt: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
      },
      300,
    );
  },

  getPreview: (token: string): Promise<InvitationPreview> =>
    mockDelay(
      {
        workspaceId: "mock-workspace-1",
        workspaceName: "Likelion Global",
        inviterDisplayName: "이서연",
        invitedEmail: null,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "PENDING",
      },
      300,
    ),

  accept: (_token: string): Promise<WorkspaceResponse> =>
    mockDelay(
      {
        id: "mock-workspace-1",
        name: "Likelion Global",
        organizationDomain: null,
        myMembershipRole: "MEMBER" as const,
        memberCount: 2,
        createdAt: new Date().toISOString(),
      },
      400,
    ),
};
