import { mockDelay } from "@/shared/api/mockDelay";
import type {
  AiReview,
  CreateAiReviewRequest,
  ConfirmAiReviewRequest,
  SendAiReviewRequest,
  AnswerAmbiguityRequest,
} from "@/types/aiReview";
import type { MessageResponse } from "@/types/conversation";
import { pushMockMessage } from "@/features/conversation/api/mock/conversationMock";
import { understandingCardMock } from "@/features/understanding-card/api/mock/understandingCardMock";

// 메모리에만 저장하는 초간단 mock 저장소. 새로고침하면 초기화됨 - 데모 스코프라 충분함.
const reviewStore = new Map<string, AiReview>();

let reviewCounter = 0;

// 실제 메시지 내용을 보고 모호성 질문을 만들어냄 - 이전엔 내용과 무관하게 항상 똑같은
// 가짜 질문 2개("기한", "조금 더 고민해보면?")가 고정으로 떴었음. mock도 최소한 입력에
// 반응하게 만들어서, 실서버의 agentSession 흐름을 제대로 흉내낸다.
function buildAgentSession(content: string): AiReview["agentSession"] {
  if (content.includes("고민해")) {
    return {
      threadId: `mock-thread-${Date.now()}`,
      status: "INTERRUPT",
      step: 1,
      total: 1,
      item: {
        span: "조금 더 고민해 보면 어떨까요?",
        category: "REQUEST_INTENT",
        reason: "여러 의도로 해석될 수 있습니다.",
        candidates: ["현재 방향 유지 + 세부 보완 요청", "완곡한 반대", "추가 논의 요청"],
        suggestion: "실제 의도를 선택해 주세요.",
      },
    };
  }
  return null; // 모호한 표현이 없으면 질문 없이 바로 DONE 취급
}

export const aiReviewMock = {
  createReview: (conversationId: string, req: CreateAiReviewRequest): Promise<AiReview> => {
    reviewCounter += 1;
    const id = `mock-review-${reviewCounter}`;
    const agentSession = buildAgentSession(req.content);

    // 날짜 표현이 상대적/모호하면(예: "내일까지") deadline을 null로 두고, 구체적이면 값 채움 -
    // 실제로 파싱하는 게 아니라 최소한의 흉내: "내일"/"이번주" 등이 있으면 모호 처리
    const hasVagueDeadline = /내일|모레|이번\s?주|다음\s?주/.test(req.content);

    const review: AiReview = {
      id,
      conversationId,
      status: "READY",
      originalContent: req.content,
      sourceLanguage: "ko",
      recipientLanguage: "en",
      translatedContent: "Please review the draft specification.",
      structuredFields: {
        task: { value: "문서 검토", confidence: "HIGH", confirmed: false },
        assigneeUserId: { value: "e54839db-5a97-433f-bec9-35d85cc0ea12", confidence: "HIGH", confirmed: false },
        deadline: hasVagueDeadline
          ? {
              value: null,
              confidence: "LOW",
              confirmed: false,
            }
          : {
              value: "2026-07-30T09:00:00Z",
              senderLocal: "2026-07-30T18:00:00+09:00[Asia/Seoul]",
              recipientLocal: "2026-07-30T02:00:00-07:00[America/Los_Angeles]",
              confidence: "MEDIUM",
              confirmed: false,
            },
        expectedOutcome: { value: "방향 유지 및 세부 수정 제안", confidence: "MEDIUM", confirmed: false },
      },
      evidence: req.attachmentIds?.length
        ? [
            {
              attachmentId: req.attachmentIds[0],
              fileName: "V2_기획안.pdf",
              locator: "p.3",
              excerpt: "3번 섹션",
              confidence: "HIGH",
            },
          ]
        : [],
      warnings: hasVagueDeadline
        ? []
        : [
            {
              code: "OUTSIDE_RECIPIENT_WORK_HOURS",
              message: "7/30 18:00 Seoul = 7/30 02:00 LA (PDT) — Alex 근무시간 밖입니다.",
              suggestedDeadline: "2026-07-30T17:00:00-07:00",
            },
          ],
      agentSession,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    reviewStore.set(id, review);
    return mockDelay(review, 600);
  },

  getReview: (reviewId: string): Promise<AiReview> => {
    const review = reviewStore.get(reviewId);
    if (!review) return Promise.reject({ code: "AI_REVIEW_NOT_FOUND", status: 404 });
    return mockDelay(review, 200);
  },

  // 질문 1개만 흉내냄 (실제 서버는 여러 개 연속으로 낼 수 있음) - 답변 받으면 DONE으로 전환하고
  // 그 답변을 expectedOutcome에 반영한다 (API.md 10.3절: "모든 모호성을 확인하면 DONE이 되고
  // 구조화 필드에 agent 결과가 반영된다")
  answerAmbiguity: (reviewId: string, req: AnswerAmbiguityRequest): Promise<AiReview> => {
    const review = reviewStore.get(reviewId);
    if (!review) return Promise.reject({ code: "AI_REVIEW_NOT_FOUND", status: 404 });

    const updated: AiReview = {
      ...review,
      structuredFields: {
        ...review.structuredFields,
        expectedOutcome: { value: req.answer, confidence: "HIGH", confirmed: false },
      },
      agentSession: {
        threadId: review.agentSession?.threadId ?? `mock-thread-${Date.now()}`,
        status: "DONE",
        step: 1,
        total: 1,
        item: null,
      },
    };
    reviewStore.set(reviewId, updated);
    return mockDelay(updated, 400);
  },

  confirmReview: (reviewId: string, req: ConfirmAiReviewRequest): Promise<AiReview> => {
    const review = reviewStore.get(reviewId);
    if (!review) return Promise.reject({ code: "AI_REVIEW_NOT_FOUND", status: 404 });

    const updated: AiReview = {
      ...review,
      status: req.confirmed ? "CONFIRMED" : review.status,
      structuredFields: {
        task: { value: req.task, confidence: "HIGH", confirmed: true },
        assigneeUserId: { value: req.assigneeUserId, confidence: "HIGH", confirmed: true },
        deadline: { ...review.structuredFields.deadline, value: req.deadline, confirmed: true },
        expectedOutcome: { value: req.expectedOutcome, confidence: "HIGH", confirmed: true },
      },
    };
    reviewStore.set(reviewId, updated);
    return mockDelay(updated, 300);
  },

  sendReview: (reviewId: string, req: SendAiReviewRequest): Promise<MessageResponse> => {
    const review = reviewStore.get(reviewId);
    if (!review) return Promise.reject({ code: "AI_REVIEW_NOT_FOUND", status: 404 });
    if (review.status !== "CONFIRMED") {
      return Promise.reject({ code: "AI_REVIEW_NOT_CONFIRMED", status: 409 });
    }

    reviewStore.set(reviewId, { ...review, status: "SENT" });

    const messageId = `mock-message-${reviewId}`;
    const message: MessageResponse = {
      id: messageId,
      conversationId: review.conversationId,
      sender: { id: "self", displayName: "이서연", timeZoneId: "Asia/Seoul" },
      content: req.content,
      sentAt: new Date().toISOString(),
      senderLocalSentAt: new Date().toISOString(),
      viewerLocalSentAt: new Date().toISOString(),
      deliveryMode: "AI_REVIEW_CONFIRMED",
      deliveryStatus: req.scheduledFor ? "SCHEDULED" : "SENT",
      confirmationStatus: "REVIEW", // 10.4절: 카드 초기상태 REVIEW, 메시지도 REVIEW
      scheduledFor: req.scheduledFor ?? null,
    };

    // 실서버(10.5절)는 /send가 메시지+카드를 한 트랜잭션으로 만들어서 응답에 포함시킴.
    // mock도 동일하게: 대화 메시지 목록에 실제로 밀어넣고, 확정된 값으로 카드까지 같이 만들어 응답에 붙인다.
    pushMockMessage(review.conversationId, message);
    const card = understandingCardMock.createConfirmedCard(messageId, {
      task: review.structuredFields.task.value ?? "",
      assigneeDisplayName: "Alex",
      deadlineInstant: review.structuredFields.deadline.value ?? new Date().toISOString(),
      recipientTimeZoneId: "America/Los_Angeles",
      expectedOutcome: review.structuredFields.expectedOutcome.value ?? "",
      originalContent: review.originalContent,
      translatedContent: review.translatedContent,
    });
    message.understandingCard = card;

    return mockDelay(message, 500);
  },
};
