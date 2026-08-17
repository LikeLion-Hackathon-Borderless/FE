import type { UserSummaryResponse } from "./user";
import type { AttachmentResponse } from "./attachment";
import type { UnderstandingCard } from "./understandingCard";

export type DeliveryMode = "AS_IS" | "AI_REVIEW_CONFIRMED";
export type DeliveryStatus = "SCHEDULED" | "SENT" | "FAILED";
export type ConfirmationStatus = "UNCONFIRMED" | "REVIEW" | "PENDING" | "AGREED";

export interface ConversationSummary {
  id: string;
  type: "DIRECT";
  otherParticipant: UserSummaryResponse;
  latestMessage: {
    id: string;
    senderId: string;
    content: string;
    sentAt: string;
  } | null;
  unreadCount: number;
  lastActivityAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    displayName: string;
    timeZoneId: string;
  };
  content: string;
  sentAt: string;
  senderLocalSentAt: string;
  viewerLocalSentAt: string;
  // AI/첨부 구현 후 추가되는 필드 (API.md 8.3절) - mock 단계부터 채워둔다
  deliveryMode?: DeliveryMode;
  deliveryStatus?: DeliveryStatus;
  confirmationStatus?: ConfirmationStatus;
  attachments?: AttachmentResponse[];
  understandingCard?: UnderstandingCard | Record<string, never>;
  scheduledFor?: string | null;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  nextBefore: string | null;
}

export interface SendMessageRequest {
  content?: string;
  attachmentIds?: string[];
  deliveryMode: DeliveryMode;
  scheduledFor?: string | null;
}
