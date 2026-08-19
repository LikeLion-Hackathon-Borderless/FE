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

// AI 에이전트 세션 (실서버 agentSession) - 애매한 표현이 있으면 INTERRUPT로 질문을 던진다
export type AgentSessionStatus = "INTERRUPT" | "DONE" | "FAILED";

export interface AmbiguityItem {
  span: string; // 애매한 원문 조각 (예: "조금 더 고민해 보면?")
  category: string;
  reason: string;
  candidates: string[]; // 사용자가 고를 후보들
  suggestion: string; // 안내 문구
}

export interface AgentSession {
  threadId: string;
  status: AgentSessionStatus;
  step?: number | null;
  total?: number | null;
  item?: AmbiguityItem | null;
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
  agentSession?: AgentSession | null; // 없거나 null이면 애매함 없음
  createdAt: string;
  expiresAt: string;
}

export interface AnswerAiReviewRequest {
  answer: string;
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