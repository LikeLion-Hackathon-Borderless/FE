import { apiClient } from "@/shared/api/client";
import type {
  UnderstandingCard,
  CardResponseRequest,
  CardRevisionRequest,
} from "@/types/understandingCard";

// 실제 서버 호출 (BE UnderstandingCardController). mock 모드에선 understandingCard.ts 스위처가 mock을 씀.
// 메서드 시그니처는 understandingCardMock과 동일해야 스위처가 타입 맞음.
export const understandingCardApi = {
  // POST /messages/{messageId}/understanding-cards → 생성(201) 또는 기존(200)
  createFromMessage: (messageId: string) =>
    apiClient
      .post<UnderstandingCard>(`/messages/${messageId}/understanding-cards`)
      .then((res) => res.data),

  getCard: (cardId: string) =>
    apiClient.get<UnderstandingCard>(`/understanding-cards/${cardId}`).then((res) => res.data),

  respond: (cardId: string, req: CardResponseRequest) =>
    apiClient
      .post<UnderstandingCard>(`/understanding-cards/${cardId}/responses`, req)
      .then((res) => res.data),

  // BE는 CreateCardRevisionRequest {task, deadline, expectedOutcome, changeNote} - 우리 타입과 일치
  submitRevision: (cardId: string, req: CardRevisionRequest) =>
    apiClient
      .post<UnderstandingCard>(`/understanding-cards/${cardId}/revisions`, req)
      .then((res) => res.data),
};