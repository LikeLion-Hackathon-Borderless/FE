import { USE_MOCK } from "@/shared/api/client";
import { agreementLogApi } from "./agreementLogApi";
import { agreementLogMock } from "./mock/agreementLogMock";

// .env의 VITE_USE_MOCK=false면 페이지/훅 수정 없이 실제 API로 전환 (conversation.ts와 동일 패턴)
export const agreementLogService = USE_MOCK ? agreementLogMock : agreementLogApi;