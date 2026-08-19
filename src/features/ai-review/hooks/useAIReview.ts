import { useMutation } from "@tanstack/react-query";
import { aiReviewService } from "../api/aiReview";
import type { CreateAiReviewRequest, ConfirmAiReviewRequest, SendAiReviewRequest, AnswerAiReviewRequest } from "@/types/aiReview";

// 실제 API 전환은 aiReview.ts 스위처에서 일괄 처리됨. 컴포넌트는 훅 인터페이스만 봄.
const impl = aiReviewService;

export function useCreateAIReview(conversationId: string) {
  return useMutation({
    mutationFn: (req: CreateAiReviewRequest) => impl.createReview(conversationId, req),
  });
}

export function useAnswerAIReview() {
  return useMutation({
    mutationFn: ({ reviewId, req }: { reviewId: string; req: AnswerAiReviewRequest }) =>
      impl.answerReview(reviewId, req),
  });
}

export function useConfirmAIReview() {
  return useMutation({
    mutationFn: ({ reviewId, req }: { reviewId: string; req: ConfirmAiReviewRequest }) =>
      impl.confirmReview(reviewId, req),
  });
}

export function useSendAIReview() {
  return useMutation({
    mutationFn: ({ reviewId, req }: { reviewId: string; req: SendAiReviewRequest }) =>
      impl.sendReview(reviewId, req),
  });
}