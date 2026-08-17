import { useMutation } from "@tanstack/react-query";
import { USE_MOCK } from "@/shared/api/client";
import { aiReviewMock } from "../api/mock/aiReviewMock";
import type { CreateAiReviewRequest, ConfirmAiReviewRequest, SendAiReviewRequest } from "@/types/aiReview";

// 실제 API 배포되면 이 파일에서 aiReviewMock -> aiReviewApi(신규 작성)로 바꾸기만 하면 됨.
// 컴포넌트 쪽은 훅 인터페이스만 보고 있어서 안 건드려도 됨.
const impl = USE_MOCK ? aiReviewMock : aiReviewMock; // TODO: 실제 aiReviewApi 구현되면 교체

export function useCreateAIReview(conversationId: string) {
  return useMutation({
    mutationFn: (req: CreateAiReviewRequest) => impl.createReview(conversationId, req),
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
