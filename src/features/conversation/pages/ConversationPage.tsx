import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { MessageInput } from "../components/MessageInput";
import { MessageBubble } from "../components/MessageBubble";
import { AIReviewPanel } from "@/features/ai-review/components/AIReviewPanel";
import { UnderstandingCard } from "@/features/understanding-card/components/UnderstandingCard";
import { useCreateAIReview } from "@/features/ai-review/hooks/useAIReview";
import { useUnderstandingCard } from "@/features/understanding-card/hooks/useCardState";
import { useMessages, useConversationList } from "../hooks/useConversations";
import { conversationService } from "../api/conversation";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { isWithinWorkHours } from "@/shared/utils/workHours";
import { zoneShort } from "@/shared/utils/timezoneLabel";
import { USE_MOCK } from "@/shared/api/client";
import { useQueryClient } from "@tanstack/react-query";
import type { AiReview } from "@/types/aiReview";
import type { MessageResponse } from "@/types/conversation";

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

  // 대화방에 들어오면 읽음 처리 - 이전엔 markAsRead API가 정의만 되어있고 어디서도
  // 호출을 안 해서, 대화목록의 unreadCount 뱃지가 한번 쌓이면 영원히 안 줄어드는 문제가 있었음.
  useEffect(() => {
    if (!conversationId) return;
    conversationService.markAsRead(conversationId).then(() => {
      // 대화목록의 unreadCount를 다시 불러와서 뱃지를 갱신
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [conversationId, queryClient]);

  // 로그인한 나 / 대화 상대. authUser·other가 아직 로딩 중이면 잠깐 기본값을 씀
  // (로딩 끝나면 실제 데이터로 바로 교체됨 - 이 기본값 자체가 화면에 오래 남으면 안 됨).
  const viewerSelf = {
    id: authUser?.id ?? "unknown-self",
    name: authUser?.displayName ?? "나",
    tz: authUser?.timeZoneId ?? "Asia/Seoul",
    workStart: authUser?.workStart,
    workEnd: authUser?.workEnd,
    workDays: authUser?.workDays,
  };
  const viewerPartner = {
    id: other?.id ?? "unknown-partner",
    name: other?.displayName ?? "상대방",
    tz: other?.timeZoneId ?? "America/Los_Angeles",
    workStart: undefined,
    workEnd: undefined,
    workDays: undefined,
  };

  // 현재 보는 시점. 기본=로그인 유저(=배포 정답). 토글은 데모 전용 (실배포 제거).
  const [viewerId, setViewerId] = useState<string>(viewerSelf.id);

  // useState(viewerSelf.id)는 최초 렌더 시점에만 평가됨. 로그인 유저 정보(authUser)가
  // 그 이후에 늦게 로딩 완료되면(흔한 타이밍) viewerId가 임시값("unknown-self")에
  // 고정된 채로 안 바뀌는 버그가 있었음. 그 결과 실제 서버가 보내는 진짜 UUID인
  // sender.id와 viewerId가 서로 안 맞아서, 본인이 보낸 메시지도 "상대방이 보낸 것"으로
  // 표시(회색)되는 문제가 있었음. authUser.id가 갱신되면 (상대방 시점 데모 토글 중이
  // 아닐 때만) viewerId를 실제 로그인 유저 id로 다시 맞춰준다.
  useEffect(() => {
    if (authUser?.id && viewerId !== viewerPartner.id) {
      setViewerId(authUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  const viewingAsMe = viewerId !== viewerPartner.id;
  const partner = viewingAsMe ? viewerPartner : viewerSelf; // 헤더엔 상대가 뜸
  const partnerOffHours = !isWithinWorkHours(
    partner.tz,
    partner.workStart,
    partner.workEnd,
    partner.workDays,
  );

  const createReview = useCreateAIReview(conversationId ?? "");
  const cardQuery = useUnderstandingCard(activeCardId);

  // 데모(mock)에서는 한 브라우저에서 "이서연 시점 / Alex 시점" 토글로 양쪽 다 미리보기 할 수 있게
  // 만들어놨는데, 이 토글 자체가 USE_MOCK일 때만 화면에 노출됨. 근데 cardViewerRole 계산은
  // 이 토글에만 의존하고 있어서, 실서버(USE_MOCK=false)로 실제 두 계정이 각자 로그인해서
  // 보면 토글이 아예 없으니 viewingAsMe가 항상 true로 고정되고, 그 결과 수신자 계정으로
  // 봐도 "발신자"로만 취급되어 3버튼 응답 UI가 영원히 안 뜨는 문제가 있었음.
  // 실서버에서는 로그인한 실제 유저ID와 카드의 담당자(assignee.userId)를 직접 비교해서
  // 판정한다 - 데모 토글에 기대지 않음.
  const cardViewerRole: "sender" | "recipient" = USE_MOCK
    ? (viewingAsMe ? "sender" : "recipient")
    : cardQuery.data && authUser?.id === cardQuery.data.assignee.userId
      ? "recipient"
      : "sender";

  // activeCardId는 컴포넌트 로컬 상태라서, 다른 탭 갔다가 돌아오면(리마운트) 초기화되어
  // 방금 만든 카드가 사라지는 것처럼 보이는 문제가 있었음. 서버 응답(GET /messages)에
  // 이미 각 메시지의 understandingCard가 포함되어 있으므로(API.md 8.3절), 메시지 목록을
  // 다시 불러올 때마다 실제로 카드가 있는 가장 최근 메시지를 찾아서 activeCardId를
  // 맞춰준다 - 화면이 아니라 실제 데이터를 기준으로 삼는다.
  useEffect(() => {
    const messages = messagesQuery.data?.messages ?? [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const card = messages[i].understandingCard;
      if (card && "id" in card) {
        setActiveCardId(card.id);
        return;
      }
    }
  }, [messagesQuery.data]);

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

  const handleReviewSent = async (message: MessageResponse) => {
    if (!conversationId) return;

    // 실서버(10.5절)는 /send가 메시지+카드를 한 트랜잭션으로 만들어서 응답에 포함시킴.
    // 예전엔 여기서 가짜 messageId로 별도 카드 생성을 시도했는데, 실서버엔 그런 메시지가
    // 존재하지 않아서 404가 났고 그 여파로 패널까지 같이 사라지는 버그가 있었음.
    // 이제는 서버가 이미 만들어준 카드를 응답에서 그대로 꺼내 쓴다.
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });

    const card = message.understandingCard;
    if (card && "id" in card) {
      setActiveCardId(card.id);
    }
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
                onClick={() => setViewerId(viewerSelf.id)}
                className={`flex-1 rounded px-2 py-1 sm:flex-none ${viewingAsMe ? "bg-primary-500 text-white" : "text-gray-500"}`}
              >
                {viewerSelf.name} 시점
              </button>
              <button
                onClick={() => setViewerId(viewerPartner.id)}
                className={`flex-1 rounded px-2 py-1 sm:flex-none ${!viewingAsMe ? "bg-primary-500 text-white" : "text-gray-500"}`}
              >
                {viewerPartner.name} 시점
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messagesQuery.data?.messages.map((m) => (
            <MessageBubble key={m.id} message={m} isMine={m.sender.id === viewerId} />
          ))}

          {/* 카드 위치: 발신자로 보는 사람=오른쪽, 수신자로 보는 사람=왼쪽 (말풍선과 동일 정렬).
              전엔 viewingAsMe(데모토글 전용, 실서버에선 항상 true로 고정)를 그대로 써서
              실서버에선 항상 오른쪽에만 붙는 버그가 있었음. 위에서 이미 mock/실서버 모두
              올바르게 계산해둔 cardViewerRole을 그대로 재사용한다. */}
          {supersededCards.map((c) => (
            <div key={`sup-${c.id}-${c.revision}`} className={`flex ${cardViewerRole === "sender" ? "justify-end" : "justify-start"}`}>
              <UnderstandingCard card={c} viewerRole={cardViewerRole} superseded />
            </div>
          ))}

          {cardQuery.data && (
            <div className={`flex ${cardViewerRole === "sender" ? "justify-end" : "justify-start"}`}>
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