import { useMutation, useQuery } from "@tanstack/react-query";
import { conversationService } from "../api/conversation";
import { CONVERSATION_POLL_INTERVAL_MS } from "../api/conversationApi";

// 대화목록 3~5초 polling (FRONTEND_API_HANDOFF.md 6절, MVP는 WebSocket 없이 polling으로 시작)
export function useConversationList() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: conversationService.listConversations,
    refetchInterval: CONVERSATION_POLL_INTERVAL_MS,
  });
}

export function useCreateDirectConversation() {
  return useMutation({
    mutationFn: (otherUserId: string) => conversationService.createDirectConversation(otherUserId),
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
