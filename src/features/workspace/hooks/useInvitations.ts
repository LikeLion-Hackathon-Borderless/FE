import { useMutation, useQuery } from "@tanstack/react-query";
import { invitationService } from "../api/invitation";

export function useInviteByEmail() {
  return useMutation({
    mutationFn: ({ workspaceId, emails }: { workspaceId: string; emails: string[] }) =>
      invitationService.inviteByEmail(workspaceId, emails),
  });
}

export function useCreateInvitationLink() {
  return useMutation({
    mutationFn: ({
      workspaceId,
      expiresInDays,
      regenerate,
    }: {
      workspaceId: string;
      expiresInDays?: number;
      regenerate?: boolean;
    }) => invitationService.createInvitationLink(workspaceId, expiresInDays, regenerate),
  });
}

export function useInvitationPreview(token: string | null) {
  return useQuery({
    queryKey: ["invitation-preview", token],
    queryFn: () => invitationService.getPreview(token as string),
    enabled: !!token,
    retry: false, // INVITATION_INVALID/EXPIRED는 재시도해도 의미없음
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (token: string) => invitationService.accept(token),
  });
}
