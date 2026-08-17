export type ProcessingStatus = "PROCESSING" | "READY" | "EXTRACTION_FAILED" | "UNSUPPORTED";

export interface AttachmentResponse {
  id: string;
  conversationId: string;
  originalFileName: string;
  contentType: string;
  size: number;
  processingStatus: ProcessingStatus;
  extractionErrorCode: string | null;
  createdAt: string;
  downloadUrl?: string;
}
