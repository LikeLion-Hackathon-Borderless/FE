export type AiReviewStatus = "PROCESSING" | "READY" | "FAILED" | "CONFIRMED" | "SENT" | "EXPIRED";
export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface StructuredField<T> {
  value: T | null;
  confidence: Confidence;
  confirmed: boolean;
}

export interface DeadlineField extends StructuredField<string> {
  senderLocal?: string;
  recipientLocal?: string;
}

export interface Evidence {
  attachmentId: string;
  fileName: string;
  locator: string;
  excerpt: string;
  confidence: Confidence;
}

// E04 근무시간 충돌, 그 외 warning 코드 확장 대비 (API.md 13.1절)
export interface AiReviewWarning {
  code: "OUTSIDE_RECIPIENT_WORK_HOURS" | string;
  message: string;
  suggestedDeadline?: string;
}

export interface AiReview {
  id: string;
  conversationId: string;
  status: AiReviewStatus;
  originalContent: string;
  sourceLanguage: string;
  recipientLanguage: string;
  translatedContent: string;
  structuredFields: {
    task: StructuredField<string>;
    assigneeUserId: StructuredField<string>;
    deadline: DeadlineField;
    expectedOutcome: StructuredField<string>;
  };
  evidence: Evidence[];
  warnings: AiReviewWarning[];
  createdAt: string;
  expiresAt: string;
}

export interface CreateAiReviewRequest {
  content: string;
  attachmentIds?: string[];
}

export interface ConfirmAiReviewRequest {
  task: string;
  assigneeUserId: string;
  deadline: string;
  expectedOutcome: string;
  confirmedEvidenceIds: string[];
  confirmed: boolean;
}

export interface SendAiReviewRequest {
  content: string;
  scheduledFor?: string | null;
}
