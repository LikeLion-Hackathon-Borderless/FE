import { useState } from "react";
import { useParams } from "react-router-dom";
import { MessageInput } from "../components/MessageInput";
import { MessageBubble } from "../components/MessageBubble";
import { AIReviewPanel } from "@/features/ai-review/components/AIReviewPanel";
import { UnderstandingCard } from "@/features/understanding-card/components/UnderstandingCard";
import { useCreateAIReview } from "@/features/ai-review/hooks/useAIReview";
import { useCreateUnderstandingCard, useUnderstandingCard } from "@/features/understanding-card/hooks/useCardState";
import { useMessages } from "../hooks/useConversations";
import { conversationService } from "../api/conversation";
import { useQueryClient } from "@tanstack/react-query";
import type { AiReview } from "@/types/aiReview";

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const queryClient = useQueryClient();

  const [activeReview, setActiveReview] = useState<AiReview | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [supersededCards, setSupersededCards] = useState<import("@/types/understandingCard").UnderstandingCard[]>([]);

  const messagesQuery = useMessages(conversationId ?? null);
  const createReview = useCreateAIReview(conversationId ?? "");
  const createCard = useCreateUnderstandingCard();
  const cardQuery = useUnderstandingCard(activeCardId);

  const handleRequestAIReview = async (content: string) => {
    setDraftContent(content);
    const review = await createReview.mutateAsync({ content, attachmentIds: [] });
    setActiveReview(review);
  };

  const handleSendAsIs = async (content: string) => {
    if (!conversationId) return;
    // AS_IS는 미확정, 카드/합의기록 생성 안 함 (API.md 8.4절, E02)
    await conversationService.sendMessage(conversationId, { content, deliveryMode: "AS_IS" });
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
  };

  const handleReviewSent = async () => {
    if (!activeReview || !conversationId) return;

    // AI 확정 전송은 아직 신규예정 API라 mock으로 처리, 이후 실제 send API로 교체
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });

    // 확정 전송되면 이해카드가 이미 생성됨 (10.4절) - 데모에서는 수신자 쪽 카드 mock 별도 생성
    const card = await createCard.mutateAsync(`local-message-${Date.now()}`);
    setActiveCardId(card.id);
    setActiveReview(null);
  };

  // 수신자 3버튼 응답 시 대화에 말풍선을 남긴다 (A방식, Image 6/10/12).
  // 발신자는 이서연(self), 응답 주체는 수신자(카드 assignee=Alex)라 그 정체성으로 남긴다.
  const handleCardResponded = async (bubbleText: string) => {
    const card = cardQuery.data;
    if (!card || !conversationId) return;
    await conversationService.addResponseMessage(conversationId, bubbleText, {
      id: card.assignee.userId,
      displayName: card.assignee.displayName,
      timeZoneId: card.deadline.viewerTimeZoneId,
    });
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    queryClient.invalidateQueries({ queryKey: ["understanding-card", card.id] });
  };

  if (!conversationId) {
    return <p className="p-4 text-sm text-gray-400">대화를 선택하세요.</p>;
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-100 bg-primary-50 px-4 py-3">
          <span className="text-sm font-medium">대화</span>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messagesQuery.data?.messages.map((m) => (
            <MessageBubble key={m.id} message={m} isMine={m.sender.id === "self"} />
          ))}

          {/* 수신자 쪽 이해카드 데모 - 실제로는 별도 대화창(수신자 뷰)에서 보여야 함 */}
          {/* 이전 버전(대체됨) 접힘 표시 - Image 7 */}
          {supersededCards.map((c) => (
            <UnderstandingCard key={`sup-${c.id}-${c.revision}`} card={c} viewerRole="recipient" superseded />
          ))}

          {cardQuery.data && (
            <UnderstandingCard
              card={cardQuery.data}
              viewerRole="recipient"
              onResponded={handleCardResponded}
              onRevised={(old) => setSupersededCards((prev) => [...prev, old])}
            />
          )}
        </div>

        <MessageInput onSendAsIs={handleSendAsIs} onRequestAIReview={handleRequestAIReview} />
      </div>

      {activeReview && (
        <AIReviewPanel
          review={activeReview}
          originalContent={draftContent}
          onClose={() => setActiveReview(null)}
          onSent={handleReviewSent}
        />
      )}
    </div>
  );
}