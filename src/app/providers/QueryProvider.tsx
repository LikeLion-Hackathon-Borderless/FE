import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // mock 데이터(배열 길이가 바뀌는 응답)에서 구조적 비교가 오작동해
      // 실제로 데이터가 바뀌었는데도 리렌더가 안 되는 문제가 있어서 껐음.
      // 실제 API로 전환한 뒤에도 이 옵션은 유지하는 게 안전함 (불필요한 리렌더 방지 효과만 없어지고
      // 정합성 문제는 원천적으로 막아줌).
      structuralSharing: false,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
