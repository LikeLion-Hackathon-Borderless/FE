import { USE_MOCK } from "@/shared/api/client";
import { aiReviewApi } from "./aiReviewApi";
import { aiReviewMock } from "./mock/aiReviewMock";

// .env의 VITE_USE_MOCK=false면 컴포넌트/훅 수정 없이 실제 API로 전환 (conversation.ts와 동일 패턴)
export const aiReviewService = USE_MOCK ? aiReviewMock : aiReviewApi;