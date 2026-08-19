import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "../api/conversation";
import { CONVERSATION_POLL_INTERVAL_MS } from "../api/conversationApi";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";

// 대화목록 3~5초 polling (FRONTEND_API_HANDOFF.md 6절, MVP는 WebSocket 없이 polling으로 시작)
// workspaceId는 선택된 워크스페이스 기준 (API.md 3.4절 확장) - 없으면 조회 자체를 안 함
export function useConversationList() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  return useQuery({
    queryKey: ["conversations", workspaceId],
    queryFn: () => conversationService.listConversations(workspaceId as string),
    enabled: !!workspaceId,
    refetchInterval: CONVERSATION_POLL_INTERVAL_MS,
  });
}

export function useCreateDirectConversation() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) =>
      conversationService.createDirectConversation(workspaceId as string, otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", workspaceId] });
    },
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => conversationService.getMessages(conversationId as string),
    enabled: !!conversationId,
    refetchInterval: CONVERSATION_POLL_INTERVAL_MS,
  });
}
