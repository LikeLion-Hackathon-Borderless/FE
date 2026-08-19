import { apiClient } from "@/shared/api/client";
import type { UserSummaryResponse } from "@/types/user";

// 실제 서버 호출. mock 모드에서는 users.ts 스위처가 usersMock을 대신 씀 (API.md 3.1절)
export const usersApi = {
  search: (workspaceId: string, query: string) =>
    apiClient
      .get<UserSummaryResponse[]>("/users", { params: { workspaceId, query, size: 20 } })
      .then((res) => res.data),
};
