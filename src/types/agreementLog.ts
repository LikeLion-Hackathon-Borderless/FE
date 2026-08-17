export type AgreementLogStatus = "AGREED" | "PENDING";

export interface AgreementLogEntry {
  id: string;
  cardId: string;
  revision: number;
  status: AgreementLogStatus;
  task: string;
  deadline: string;
  agreedBy: {
    userId: string;
    displayName: string;
  } | null;
  agreedAt: string | null;
  fileReferences: Array<{
    attachmentId: string;
    fileName: string;
    locator: string;
  }>;
}

export interface AgreementLogListResponse {
  logs: AgreementLogEntry[];
  hasMore: boolean;
  nextBefore: string | null;
}
