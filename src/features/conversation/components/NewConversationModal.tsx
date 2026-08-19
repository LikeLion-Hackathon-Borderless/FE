import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "../api/users";
import { useCreateDirectConversation } from "../hooks/useConversations";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";
import type { UserSummaryResponse } from "@/types/user";

// 워크스페이스 멤버 검색 -> 클릭 -> POST /conversations/direct -> 대화방 이동 (API.md 3.1, 3.4절)
export function NewConversationModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const navigate = useNavigate();
  const createConversation = useCreateDirectConversation();

  const searchQuery = useQuery({
    queryKey: ["user-search", workspaceId, query],
    queryFn: () => usersService.search(workspaceId as string, query),
    enabled: !!workspaceId,
  });

  const handleSelect = async (user: UserSummaryResponse) => {
    // 동일 워크스페이스·동일 상대 조합은 서버가 기존 DM을 그대로 반환함 (API.md 6절 확정정책)
    const conversation = await createConversation.mutateAsync(user.id);
    onClose();
    navigate(`/conversations/${conversation.id}`);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">새 대화 시작</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="닫기">
            ✕
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름 또는 이메일로 검색"
          autoFocus
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
        />

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {searchQuery.isLoading && <p className="py-4 text-center text-sm text-gray-400">검색 중...</p>}

          {!searchQuery.isLoading && searchQuery.data?.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">
              {query ? "일치하는 멤버가 없습니다." : "워크스페이스 멤버가 없습니다."}
            </p>
          )}

          {searchQuery.data?.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              disabled={createConversation.isPending}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-200" />
              <span className="truncate">{user.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
