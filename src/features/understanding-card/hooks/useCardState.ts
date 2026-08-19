import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { understandingCardService } from "../api/understandingCard";
import type { CardResponseRequest, CardRevisionRequest } from "@/types/understandingCard";

// 이전엔 여기서 항상 understandingCardMock을 직접 썼음 (USE_MOCK=false여도 mock 강제 사용).
// understandingCard.ts 스위처가 이미 만들어져 있었는데 이 훅 파일만 그걸 안 쓰고 있었던 것.
// 그래서 실서버가 준 진짜 카드ID로 조회해도 mock 저장소에서 못 찾아 404가 나고,
// 화면에 카드가 전혀 안 뜨는 버그가 있었음. 스위처를 쓰도록 교체.
const impl = understandingCardService;

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
