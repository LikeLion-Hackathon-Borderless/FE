export type CardState = "REVIEW" | "PENDING" | "AGREED";

export interface UnderstandingCard {
  id: string;
  messageId: string;
  state: CardState;
  revision: number;
  task: string;
  assignee: {
    userId: string;
    displayName: string;
  };
  deadline: {
    instant: string;
    viewerLocal: string;
    viewerTimeZoneId: string;
  };
  expectedOutcome: string;
  originalContent: string;
  translatedContent: string;
  attachments: unknown[];
  evidence: unknown[];
  latestResponse: CardResponse | null;
  createdAt: string;
  updatedAt: string;
  // TODO: 와이어프레임의 "결정 상태 (필수 반영 · 제안 아님)" 필드가 API.md에 없음.
  // 백엔드 확인 필요 - 추가되기 전까지 프론트에서 optional로 두고 없으면 뱃지 숨김.
  decisionType?: "REQUIRED" | "SUGGESTION" | null;
}

export type CardResponseType = "AGREE" | "REQUEST_DEADLINE_CHANGE" | "REQUEST_CLARIFICATION";

export interface CardResponseRequest {
  type: CardResponseType;
  comment: string | null;
  proposedDeadline?: string; // REQUEST_DEADLINE_CHANGE일 때만
}

export interface CardResponse {
  type: CardResponseType;
  comment: string | null;
  proposedDeadline?: string;
  respondedAt?: string;
}

export interface CardRevisionRequest {
  task: string;
  deadline: string;
  expectedOutcome: string;
  changeNote: string;
}
