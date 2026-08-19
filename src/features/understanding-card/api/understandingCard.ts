import { USE_MOCK } from "@/shared/api/client";
import { understandingCardApi } from "./understandingCardApi";
import { understandingCardMock } from "./mock/understandingCardMock";

// .env의 VITE_USE_MOCK=false면 컴포넌트/훅 수정 없이 실제 API로 전환 (conversation.ts 패턴)
export const understandingCardService = USE_MOCK ? understandingCardMock : understandingCardApi;