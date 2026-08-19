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
  needsClarification: boolean; // 백엔드 실제 필드 (decisionType 대체)
  createdAt: string;
  updatedAt: string;
}

export type CardResponseType = "AGREE" | "REQUEST_DEADLINE_CHANGE" | "REQUEST_CLARIFICATION";

export interface CardResponseRequest {
  type: CardResponseType;
  comment: string | null;
  proposedDeadline?: string; // REQUEST_DEADLINE_CHANGE일 때만
}

export interface CardResponse {
  id?: string;
  revision?: number;
  type: CardResponseType;
  comment: string | null;
  proposedDeadline?: string | null;
  responderId?: string;
  respondedAt?: string;
}

export interface CardRevisionRequest {
  task: string;
  deadline: string;
  expectedOutcome: string;
  changeNote: string;
}