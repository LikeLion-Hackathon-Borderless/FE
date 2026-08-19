import { useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { MessageInput } from "../components/MessageInput";
import { MessageBubble } from "../components/MessageBubble";
import { AIReviewPanel } from "@/features/ai-review/components/AIReviewPanel";
import { UnderstandingCard } from "@/features/understanding-card/components/UnderstandingCard";
import { useCreateAIReview } from "@/features/ai-review/hooks/useAIReview";
import { useCreateUnderstandingCard, useUnderstandingCard } from "@/features/understanding-card/hooks/useCardState";
import { useMessages, useConversationList } from "../hooks/useConversations";
import { conversationService } from "../api/conversation";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { isWithinWorkHours } from "@/shared/utils/workHours";
import { zoneShort } from "@/shared/utils/timezoneLabel";
import { USE_MOCK } from "@/shared/api/client";
import { useQueryClient } from "@tanstack/react-query";
import type { AiReview } from "@/types/aiReview";

dayjs.extend(utc);
dayjs.extend(timezone);

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const queryClient = useQueryClient();

  const [activeReview, setActiveReview] = useState<AiReview | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [inputClearSignal, setInputClearSignal] = useState(0);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [supersededCards, setSupersededCards] = useState<import("@/types/understandingCard").UnderstandingCard[]>([]);

  const messagesQuery = useMessages(conversationId ?? null);
  const conversationsQuery = useConversationList();
  const other = conversationsQuery.data?.find((c) => c.id === conversationId)?.otherParticipant;
  const authUser = useAuthStore((s) => s.user);

  // 두 데모 정체성: 이서연(로그인 유저, 근무시간 실데이터) / Alex(대화 상대, 계약에 근무시간 없어 기본값)
  const ME = {
    id: authUser?.id ?? "mock-user-self",
    name: authUser?.displayName ?? "이서연",
    tz: authUser?.timeZoneId ?? "Asia/Seoul",
    workStart: authUser?.workStart,
    workEnd: authUser?.workEnd,
    workDays: authUser?.workDays,
  };
  const ALEX = {
    id: other?.id ?? "mock-alex",
    name: other?.displayName ?? "Alex",
    tz: other?.timeZoneId ?? "America/Los_Angeles",
    workStart: undefined,
    workEnd: undefined,
    workDays: undefined,
  };

  // 현재 보는 시점. 기본=로그인 유저(=배포 정답). 토글은 데모 전용 (실배포 제거).
  const [viewerId, setViewerId] = useState<string>(ME.id);
  const viewingAsMe = viewerId !== ALEX.id;
  const partner = viewingAsMe ? ALEX : ME; // 헤더엔 상대가 뜸
  const cardViewerRole: "sender" | "recipient" = viewingAsMe ? "sender" : "recipient";
  const partnerOffHours = !isWithinWorkHours(
    partner.tz,
    partner.workStart,
    partner.workEnd,
    partner.workDays,
  );

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

    // 확정 전송: 발신자 원문 메시지를 대화에 남긴다 (시안: 민트 말풍선 + 카드).
    // 실서버(10.4)는 /send가 메시지+카드를 함께 생성하므로, 연동 시엔 이 수동 추가를 제거.
    await conversationService.addResponseMessage(conversationId, draftContent, {
      id: ME.id,
      displayName: ME.name,
      timeZoneId: ME.tz,
    });
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });

    // 확정 전송되면 이해카드가 생성됨 (10.4절) - 데모에서는 mock으로 별도 생성
    const card = await createCard.mutateAsync(`local-message-${Date.now()}`);
    setActiveCardId(card.id);
    setActiveReview(null);
    setInputClearSignal((n) => n + 1); // 입력창 비우기
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
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 bg-primary-50 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-200" />
          <span className="truncate text-sm font-medium text-gray-900">{partner.name}</span>
          <span className="flex-shrink-0 whitespace-nowrap rounded bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-600">
            {zoneShort(partner.tz)} {dayjs().tz(partner.tz).format("HH:mm")}
          </span>
          <span className="hidden flex-shrink-0 whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 xs:inline-block">
            {partnerOffHours ? "근무 외 시간" : "근무 시간"}
          </span>

          {/* 데모 전용: 시점 전환. USE_MOCK일 때만 노출 → 실배포(USE_MOCK=false)면 자동 숨김.
              좁은 화면에서는 줄바꿈되어 다음 줄 전체 폭을 차지하게 함(md 이상은 원래대로 오른쪽 정렬). */}
          {USE_MOCK && (
            <div className="order-last flex w-full items-center gap-1 rounded-md bg-white p-0.5 text-xs sm:order-none sm:ml-auto sm:w-auto">
              <button
                onClick={() => setViewerId(ME.id)}
                className={`flex-1 rounded px-2 py-1 sm:flex-none ${viewingAsMe ? "bg-primary-500 text-white" : "text-gray-500"}`}
              >
                {ME.name} 시점
              </button>
              <button
                onClick={() => setViewerId(ALEX.id)}
                className={`flex-1 rounded px-2 py-1 sm:flex-none ${!viewingAsMe ? "bg-primary-500 text-white" : "text-gray-500"}`}
              >
                {ALEX.name} 시점
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messagesQuery.data?.messages.map((m) => (
            <MessageBubble key={m.id} message={m} isMine={m.sender.id === viewerId} />
          ))}

          {/* 카드는 발신자(이서연)가 만든 것 → 발신자 시점=오른쪽, 수신자 시점=왼쪽 (말풍선과 동일 정렬) */}
          {supersededCards.map((c) => (
            <div key={`sup-${c.id}-${c.revision}`} className={`flex ${viewingAsMe ? "justify-end" : "justify-start"}`}>
              <UnderstandingCard card={c} viewerRole={cardViewerRole} superseded />
            </div>
          ))}

          {cardQuery.data && (
            <div className={`flex ${viewingAsMe ? "justify-end" : "justify-start"}`}>
              <UnderstandingCard
                card={cardQuery.data}
                viewerRole={cardViewerRole}
                onResponded={handleCardResponded}
                onRevised={(old) => setSupersededCards((prev) => [...prev, old])}
              />
            </div>
          )}
        </div>

        <MessageInput
          onSendAsIs={handleSendAsIs}
          onRequestAIReview={handleRequestAIReview}
          clearSignal={inputClearSignal}
        />
      </div>

      {activeReview && (
        <AIReviewPanel
          review={activeReview}
          originalContent={draftContent}
          recipientName={other?.displayName}
          recipientTimeZoneId={other?.timeZoneId}
          onClose={() => setActiveReview(null)}
          onSent={handleReviewSent}
        />
      )}
    </div>
  );
}