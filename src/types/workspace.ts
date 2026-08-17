export type MembershipRole = "OWNER" | "MEMBER";

export interface WorkspaceResponse {
  id: string;
  name: string;
  organizationDomain: string | null;
  myMembershipRole: MembershipRole;
  memberCount: number;
  createdAt: string;
}

export interface WorkspaceMemberResponse {
  membershipId: string;
  membershipRole: MembershipRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    profileImageUrl: string | null;
    workRole: string;
    timeZoneId: string;
    preferredLanguage: string;
  };
}

export type InvitationEmailStatus = "SENT" | "ALREADY_INVITED" | "ALREADY_MEMBER" | "FAILED";

export interface InviteEmailResult {
  results: Array<{
    email: string;
    status: InvitationEmailStatus;
    errorCode: string | null;
  }>;
}

export interface InvitationLinkResponse {
  token: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface InvitationPreview {
  workspaceId: string;
  workspaceName: string;
  inviterDisplayName: string;
  invitedEmail: string | null;
  expiresAt: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
}
