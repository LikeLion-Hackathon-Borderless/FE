import { USE_MOCK } from "@/shared/api/client";
import { authApi } from "./authApi";
import { authMock } from "./mock/authMock";

// .env의 VITE_USE_MOCK=false로 바꾸면 컴포넌트 수정 없이 실제 API로 전환됨
export const authService = USE_MOCK ? authMock : authApi;
