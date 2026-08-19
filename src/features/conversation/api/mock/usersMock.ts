import { mockDelay } from "@/shared/api/mockDelay";
import type { UserSummaryResponse } from "@/types/user";

const MOCK_MEMBERS: UserSummaryResponse[] = [
  {
    id: "mock-alex",
    displayName: "Alex",
    profileImageUrl: null,
    role: "DEVELOPER",
    customRole: null,
    timeZoneId: "America/Los_Angeles",
    preferredLanguage: "en",
  },
];

export const usersMock = {
  search: (_workspaceId: string, query: string): Promise<UserSummaryResponse[]> => {
    const filtered = query
      ? MOCK_MEMBERS.filter((u) => u.displayName.toLowerCase().includes(query.toLowerCase()))
      : MOCK_MEMBERS;
    return mockDelay(filtered, 300);
  },
};
