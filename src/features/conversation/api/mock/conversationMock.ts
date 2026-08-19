import { mockDelay } from "@/shared/api/mockDelay";
import type {
  ConversationSummary,
  MessageListResponse,
  MessageResponse,
  SendMessageRequest,
} from "@/types/conversation";

export const DEMO_CONVERSATION_ID = "mock-conversation-alex";

const messageStore: Record<string, MessageResponse[]> = {
  [DEMO_CONVERSATION_ID]: [
    {
      id: "mock-msg-1",
      conversationId: DEMO_CONVERSATION_ID,
      sender: { id: "mock-alex", displayName: "Alex", timeZoneId: "America/Los_Angeles" },
      content: "Orbit 문서 초안 올려뒀어요. 확인되면 알려주세요!",
      sentAt: "2026-08-14T00:12:00Z",
      senderLocalSentAt: "2026-08-13T17:12:00-07:00",
      viewerLocalSentAt: "2026-08-14T09:12:00+09:00",
      deliveryMode: "AS_IS",
      confirmationStatus: "UNCONFIRMED",
    },
  ],
};

function getConversationSummary(): ConversationSummary {
  const messages = messageStore[DEMO_CONVERSATION_ID];
  const latest = messages[messages.length - 1];
  return {
    id: DEMO_CONVERSATION_ID,
    type: "DIRECT",
    otherParticipant: {
      id: "mock-alex",
      displayName: "Alex",
      profileImageUrl: null,
      role: "DEVELOPER",
      customRole: null,
      timeZoneId: "America/Los_Angeles",
      preferredLanguage: "en",
    },
    latestMessage: latest
      ? { id: latest.id, senderId: latest.sender.id, content: latest.content, sentAt: latest.sentAt }
      : null,
    unreadCount: 0,
    lastActivityAt: latest?.sentAt ?? new Date().toISOString(),
  };
}

export const conversationMock = {
  listConversations: (_workspaceId: string): Promise<ConversationSummary[]> =>
    mockDelay([getConversationSummary()], 300),

  createDirectConversation: (_workspaceId: string, _otherUserId: string) =>
    mockDelay({ id: DEMO_CONVERSATION_ID }, 300),

  getMessages: (conversationId: string, _before?: string): Promise<MessageListResponse> => {
    const messages = messageStore[conversationId] ?? [];
    return mockDelay({ messages, hasMore: false, nextBefore: null }, 250);
  },

  sendMessage: (conversationId: string, payload: SendMessageRequest): Promise<MessageResponse> => {
    const message: MessageResponse = {
      id: `mock-msg-${Date.now()}`,
      conversationId,
      sender: { id: "mock-user-self", displayName: "이서연", timeZoneId: "Asia/Seoul" },
      content: payload.content ?? "",
      sentAt: new Date().toISOString(),
      senderLocalSentAt: new Date().toISOString(),
      viewerLocalSentAt: new Date().toISOString(),
      deliveryMode: payload.deliveryMode,
      deliveryStatus: payload.scheduledFor ? "SCHEDULED" : "SENT",
      confirmationStatus: payload.deliveryMode === "AS_IS" ? "UNCONFIRMED" : "REVIEW",
      scheduledFor: payload.scheduledFor ?? null,
    };
    if (!messageStore[conversationId]) messageStore[conversationId] = [];
    messageStore[conversationId].push(message);
    return mockDelay(message, 300);
  },

  // 카드 응답(3버튼) 시 대화에 남는 말풍선. deliveryMode 없음 -> AS_IS 미확정 푸터 안 붙음.
  // 실제 배포: 백엔드가 POST /responses(11.4)에서 서버측으로 생성할 수 있음 -> 그때는 이 호출 대신 refetch만.
  addResponseMessage: (
    conversationId: string,
    content: string,
    sender: { id: string; displayName: string; timeZoneId: string },
  ): Promise<MessageResponse | null> => {
    const message: MessageResponse = {
      id: `mock-msg-${Date.now()}`,
      conversationId,
      sender,
      content,
      sentAt: new Date().toISOString(),
      senderLocalSentAt: new Date().toISOString(),
      viewerLocalSentAt: new Date().toISOString(),
    };
    if (!messageStore[conversationId]) messageStore[conversationId] = [];
    messageStore[conversationId].push(message);
    return mockDelay(message, 300);
  },

  markAsRead: (_conversationId: string) => mockDelay(undefined, 100),
};