import { apiClient } from "@/shared/api/client";
import type { AgreementLogListResponse } from "@/types/agreementLog";

// 실제 서버 호출 (API.md 12.1). mock 모드에서는 agreementLog.ts 스위처가 agreementLogMock을 대신 씀.
export const agreementLogApi = {
  list: (conversationId: string, before?: string) =>
    apiClient
      .get<AgreementLogListResponse>(`/conversations/${conversationId}/agreement-logs`, {
        params: { before, size: 50 },
      })
      .then((res) => res.data),
};