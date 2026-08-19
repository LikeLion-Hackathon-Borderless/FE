import { useInfiniteQuery } from "@tanstack/react-query";
import { agreementLogService } from "../api/agreementLog";

// cursor 페이지네이션 (API.md 2.4/12.1: before/hasMore/nextBefore)
export function useAgreementLogs(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: ["agreement-logs", conversationId],
    enabled: !!conversationId,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => agreementLogService.list(conversationId as string, pageParam),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextBefore ?? undefined : undefined),
  });
}