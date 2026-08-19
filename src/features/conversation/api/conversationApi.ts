import { apiClient } from "@/shared/api/client";
import type {
  ConversationSummary,
  MessageListResponse,
  SendMessageRequest,
  MessageResponse,
} from "@/types/conversation";

// 실제 서버 호출. mock 모드에서는 conversation.ts 스위처가 conversationMock을 대신 씀
export const conversationApi = {
  // workspaceId로 스코프 지정 (API.md 3.4절 확장 - GET /conversations?workspaceId=)
  listConversations: (workspaceId: string) =>
    apiClient
      .get<ConversationSummary[]>("/conversations", { params: { workspaceId } })
      .then((res) => res.data),

  createDirectConversation: (workspaceId: string, otherUserId: string) =>
    apiClient
      .post<{ id: string }>("/conversations/direct", { workspaceId, otherUserId })
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

  // 실서버는 POST /responses(11.4)에서 응답 메시지를 서버측 생성한다고 가정 -> 여기선 no-op, refetch로 반영.
  // 백엔드가 안 만들면 이 자리에서 POST /messages로 전환 (연동 6번에서 결정).
  addResponseMessage: (
    _conversationId: string,
    _content: string,
    _sender: { id: string; displayName: string; timeZoneId: string },
  ): Promise<MessageResponse | null> => Promise.resolve(null),

  markAsRead: (conversationId: string) =>
    apiClient.put<void>(`/conversations/${conversationId}/read`),
};

// 대화 목록 3~5초 polling 요구사항 (FRONTEND_API_HANDOFF.md 6절) -> react-query refetchInterval로 처리
export const CONVERSATION_POLL_INTERVAL_MS = 4000;