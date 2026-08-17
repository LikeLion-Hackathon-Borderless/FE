import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { USE_MOCK } from "@/shared/api/client";
import { understandingCardMock } from "../api/mock/understandingCardMock";
import type { CardResponseRequest, CardRevisionRequest } from "@/types/understandingCard";

// 실제 API 배포되면 understandingCardMock -> understandingCardApi로 교체
const impl = USE_MOCK ? understandingCardMock : understandingCardMock; // TODO: 실제 구현 연결

export function useUnderstandingCard(cardId: string | null) {
  return useQuery({
    queryKey: ["understanding-card", cardId],
    queryFn: () => impl.getCard(cardId as string),
    enabled: !!cardId,
  });
}

export function useCreateUnderstandingCard() {
  return useMutation({
    mutationFn: (messageId: string) => impl.createFromMessage(messageId),
  });
}

// AGREED 상태면 버튼 비활성화 처리는 컴포넌트에서 card.state로 분기 (API.md 11.4절 - 재응답 불가)
export function useRespondToCard(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CardResponseRequest) => impl.respond(cardId, req),
    onSuccess: (updated) => {
      queryClient.setQueryData(["understanding-card", cardId], updated);
    },
  });
}

export function useSubmitCardRevision(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CardRevisionRequest) => impl.submitRevision(cardId, req),
    onSuccess: (updated) => {
      queryClient.setQueryData(["understanding-card", cardId], updated);
    },
  });
}
