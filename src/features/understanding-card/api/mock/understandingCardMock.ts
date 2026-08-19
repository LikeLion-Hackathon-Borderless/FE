import { mockDelay } from "@/shared/api/mockDelay";
import type {
  UnderstandingCard,
  CardResponseRequest,
  CardResponse,
  CardRevisionRequest,
} from "@/types/understandingCard";

const cardStore = new Map<string, UnderstandingCard>();

function makeInitialCard(messageId: string): UnderstandingCard {
  return {
    id: `mock-card-${messageId}`,
    messageId,
    state: "REVIEW",
    revision: 1,
    task: "문서 3번 섹션 검토",
    assignee: { userId: "mock-alex", displayName: "Alex" },
    deadline: {
      instant: "2026-07-31T00:00:00Z", // 7/30 17:00 LA (PDT) - Image 2/5와 시각 일치
      viewerLocal: "2026-07-30T17:00:00-07:00",
      viewerTimeZoneId: "America/Los_Angeles",
    },
    expectedOutcome: "방향 자체 재검토 의견",
    originalContent: "이 부분 검토 부탁드려요. 방향 자체를 한번 재검토해 주시면 좋겠어요.",
    translatedContent: "Could you review this section? I'd like you to reconsider the direction itself.",
    attachments: [],
    evidence: [],
    latestResponse: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    needsClarification: false,
  };
}

export const understandingCardMock = {
  createFromMessage: (messageId: string): Promise<UnderstandingCard> => {
    const existingKey = [...cardStore.values()].find((c) => c.messageId === messageId);
    if (existingKey) return mockDelay(existingKey, 200);

    const card = makeInitialCard(messageId);
    cardStore.set(card.id, card);
    return mockDelay(card, 400);
  },

  getCard: (cardId: string): Promise<UnderstandingCard> => {
    const card = cardStore.get(cardId);
    if (!card) return Promise.reject({ code: "UNDERSTANDING_CARD_NOT_FOUND", status: 404 });
    return mockDelay(card, 150);
  },

  // 3버튼 응답: AGREE / REQUEST_DEADLINE_CHANGE / REQUEST_CLARIFICATION (API.md 11.4절)
  respond: (cardId: string, req: CardResponseRequest): Promise<UnderstandingCard> => {
    const card = cardStore.get(cardId);
    if (!card) return Promise.reject({ code: "UNDERSTANDING_CARD_NOT_FOUND", status: 404 });
    if (card.state === "AGREED") {
      return Promise.reject({ code: "CARD_INVALID_STATE", status: 409 });
    }

    const response: CardResponse = {
      type: req.type,
      comment: req.comment,
      proposedDeadline: req.proposedDeadline,
      respondedAt: new Date().toISOString(),
    };

    const nextState = req.type === "AGREE" ? "AGREED" : "PENDING";
    const updated: UnderstandingCard = {
      ...card,
      state: nextState,
      latestResponse: response,
      updatedAt: new Date().toISOString(),
    };
    cardStore.set(cardId, updated);
    return mockDelay(updated, 350);
  },

  // 발신자 수정본 제출 - 역제안 수락(이미지8 "수락·카드 재생성") 시 이 흐름 (API.md 11.5절)
  submitRevision: (cardId: string, req: CardRevisionRequest): Promise<UnderstandingCard> => {
    const card = cardStore.get(cardId);
    if (!card) return Promise.reject({ code: "UNDERSTANDING_CARD_NOT_FOUND", status: 404 });
    if (card.state !== "PENDING") {
      return Promise.reject({ code: "CARD_INVALID_STATE", status: 409 });
    }

    const updated: UnderstandingCard = {
      ...card,
      state: "REVIEW",
      revision: card.revision + 1,
      task: req.task,
      deadline: { ...card.deadline, instant: req.deadline },
      expectedOutcome: req.expectedOutcome,
      latestResponse: null,
      updatedAt: new Date().toISOString(),
    };
    cardStore.set(cardId, updated);
    return mockDelay(updated, 350);
  },
};