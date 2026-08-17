import axios from "axios";
import { ApiErrorResponse, isAuthExpired } from "./errorCodes";
import { useAuthStore } from "@/shared/hooks/useAuthStore";

// API.md 2절 서버 주소
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 토큰을 URL/로그/오류메시지에 노출하지 않는다 (FRONTEND_API_HANDOFF.md 7절)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data: ApiErrorResponse | undefined = error.response?.data;
    const hadToken = !!error.config?.headers?.Authorization;

    // 로그인/회원가입 자체의 401(비밀번호 오류 등)은 여기서 리다이렉트하면 안 됨.
    // 이미 토큰을 갖고 보낸 요청이 401일 때만 "토큰 만료/변조"로 판단한다 (API.md 7절).
    if (data && isAuthExpired(data) && hadToken) {
      useAuthStore.getState().clear();
      window.location.href = "/login";
    }
    return Promise.reject(data ?? error);
  },
);

// profileImageUrl 같은 상대경로 표시용 (FRONTEND_API_HANDOFF.md 2절)
export function toBackendOrigin(relativePath: string | null | undefined) {
  if (!relativePath) return null;
  return `${import.meta.env.VITE_BACKEND_ORIGIN}${relativePath}`;
}

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
