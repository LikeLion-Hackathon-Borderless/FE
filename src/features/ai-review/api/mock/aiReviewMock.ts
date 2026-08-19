import { mockDelay } from "@/shared/api/mockDelay";
import type { AiReview, CreateAiReviewRequest, ConfirmAiReviewRequest, SendAiReviewRequest } from "@/types/aiReview";
import type { MessageResponse } from "@/types/conversation";
import { pushMockMessage } from "@/features/conversation/api/mock/conversationMock";
import { understandingCardMock } from "@/features/understanding-card/api/mock/understandingCardMock";

// 메모리에만 저장하는 초간단 mock 저장소. 새로고침하면 초기화됨 - 데모 스코프라 충분함.
const reviewStore = new Map<string, AiReview>();

let reviewCounter = 0;

export const aiReviewMock = {
  createReview: (conversationId: string, req: CreateAiReviewRequest): Promise<AiReview> => {
    reviewCounter += 1;
    const id = `mock-review-${reviewCounter}`;

    // 와이어프레임 이미지4: "내일까지"(deadline 모호) + "조금 더 고민해보면"(intent 모호)
    const review: AiReview = {
      id,
      conversationId,
      status: "READY",
      originalContent: req.content,
      sourceLanguage: "ko",
      recipientLanguage: "en",
      translatedContent: "Please review the draft specification. This direction looks good, but could you think it over a bit more?",
      structuredFields: {
        task: { value: "문서 3번 섹션 검토", confidence: "HIGH", confirmed: false },
        assigneeUserId: { value: "e54839db-5a97-433f-bec9-35d85cc0ea12", confidence: "HIGH", confirmed: false },
        deadline: {
          value: "2026-07-30T09:00:00Z",
          senderLocal: "2026-07-30T18:00:00+09:00[Asia/Seoul]",
          recipientLocal: "2026-07-30T02:00:00-07:00[America/Los_Angeles]",
          confidence: "MEDIUM",
          confirmed: false,
        },
        expectedOutcome: { value: "방향 자체 재검토 의견", confidence: "MEDIUM", confirmed: false },
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
      warnings: [
        {
          code: "OUTSIDE_RECIPIENT_WORK_HOURS",
          message: "7/30 18:00 Seoul = 7/30 02:00 LA (PDT) — Alex 근무시간 밖입니다.",
          suggestedDeadline: "2026-07-30T17:00:00-07:00",
        },
      ],
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
