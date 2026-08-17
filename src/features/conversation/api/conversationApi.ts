import { apiClient } from "@/shared/api/client";
import type {
  ConversationSummary,
  MessageListResponse,
  SendMessageRequest,
  MessageResponse,
} from "@/types/conversation";

// 실제 서버 호출. mock 모드에서는 conversation.ts 스위처가 conversationMock을 대신 씀
export const conversationApi = {
  // 현재는 workspaceId 없이 호출, 워크스페이스 API 배포되면 쿼리 추가 (API.md 8.2절)
  listConversations: () =>
    apiClient.get<ConversationSummary[]>("/conversations").then((res) => res.data),

  createDirectConversation: (otherUserId: string) =>
    apiClient
      .post<{ id: string }>("/conversations/direct", { otherUserId })
      .then((res) => res.data),

  getMessages: (conversationId: string, before?: string) =>
    apiClient
      .get<MessageListResponse>(`/conversations/${conversationId}/messages`, {
        params: { before, size: 50 },
      })
      .then((res) => res.data),

  // 현재 구현은 content만 받음. attachmentIds/deliveryMode/scheduledFor는 확장 예정 (API.md 8.4절)
  sendMessage: (conversationId: string, payload: SendMessageRequest) =>
    apiClient
      .post<MessageResponse>(`/conversations/${conversationId}/messages`, payload)
      .then((res) => res.data),

  markAsRead: (conversationId: string) =>
    apiClient.put<void>(`/conversations/${conversationId}/read`),
};

// 대화 목록 3~5초 polling 요구사항 (FRONTEND_API_HANDOFF.md 6절) -> react-query refetchInterval로 처리
export const CONVERSATION_POLL_INTERVAL_MS = 4000;
