import { apiClient } from "@/shared/api/client";
import type {
  AiReview,
  CreateAiReviewRequest,
  ConfirmAiReviewRequest,
  SendAiReviewRequest,
  AnswerAiReviewRequest,
} from "@/types/aiReview";
import type { MessageResponse } from "@/types/conversation";

// 실제 서버 호출 (API.md 10장). mock 모드에서는 aiReview.ts 스위처가 aiReviewMock을 대신 씀.
// 메서드 시그니처는 aiReviewMock과 반드시 동일해야 스위처가 타입 맞음.
export const aiReviewApi = {
  createReview: (conversationId: string, req: CreateAiReviewRequest) =>
    apiClient
      .post<AiReview>(`/conversations/${conversationId}/ai-reviews`, req)
      .then((res) => res.data),

  getReview: (reviewId: string) =>
    apiClient.get<AiReview>(`/ai-reviews/${reviewId}`).then((res) => res.data),

  // 모호성 질문(agentSession.INTERRUPT)에 답하고 세션 재개 (API.md 10.3)
  answerReview: (reviewId: string, req: AnswerAiReviewRequest) =>
    apiClient.post<AiReview>(`/ai-reviews/${reviewId}/answers`, req).then((res) => res.data),

  confirmReview: (reviewId: string, req: ConfirmAiReviewRequest) =>
    apiClient.patch<AiReview>(`/ai-reviews/${reviewId}`, req).then((res) => res.data),

  sendReview: (reviewId: string, req: SendAiReviewRequest) =>
    apiClient
      .post<MessageResponse>(`/ai-reviews/${reviewId}/send`, req)
      .then((res) => res.data),
};