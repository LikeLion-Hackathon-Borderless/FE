import { mockDelay } from "@/shared/api/mockDelay";
import type { AgreementLogListResponse } from "@/types/agreementLog";

export const agreementLogMock = {
  list: (_conversationId: string, _before?: string): Promise<AgreementLogListResponse> =>
    mockDelay(
      {
        logs: [
          {
            id: "mock-log-1",
            cardId: "mock-card-1",
            revision: 1,
            status: "PENDING",
            task: "문서 3번 섹션 검토",
            deadline: "2026-07-30T09:00:00Z",
            agreedBy: null,
            agreedAt: null,
            fileReferences: [
              { attachmentId: "mock-att-1", fileName: "V2_기획안.pdf", locator: "p.3" },
            ],
          },
        ],
        hasMore: false,
        nextBefore: null,
      },
      300,
    ),
};