export type AiReviewStatus = "PROCESSING" | "READY" | "FAILED" | "CONFIRMED" | "SENT" | "EXPIRED";
export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type AgentSessionStatus = "INTERRUPT" | "DONE" | "FAILED";

// AI가 모호하다고 판단한 부분에 대해 실시간으로 던지는 질문 (API.md 10.1/10.3절)
export interface AgentSessionItem {
  span: string; // 원문에서 모호한 부분 그대로
  category: string; // 예: REQUEST_INTENT, AMBIGUOUS_DEADLINE 등
  reason: string; // 왜 모호한지
  candidates: string[]; // 선택 가능한 후보들
  suggestion: string; // AI 추천 문구 (placeholder 용도로도 씀)
}

export interface AgentSession {
  threadId: string;
  status: AgentSessionStatus;
  step: number;
  total: number;
  item: AgentSessionItem | null;
}

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
  // AI 서비스가 비활성화된 로컬 fallback에서는 null (API.md 10.1절)
  agentSession: AgentSession | null;
  provider?: string;
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

// AI 모호성 질문에 답변 (API.md 10.3절)
export interface AnswerAmbiguityRequest {
  answer: string;
}
