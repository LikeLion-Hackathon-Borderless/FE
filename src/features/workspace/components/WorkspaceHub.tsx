import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceList, useCreateWorkspace } from "../hooks/useWorkspace";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";

export function WorkspaceHub() {
  const { data: workspaces, isLoading } = useWorkspaceList();
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [newName, setNewName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSelect = (id: string) => {
    setWorkspaceId(id);
    navigate("/");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const workspace = await createWorkspace.mutateAsync({ name: newName });
    handleSelect(workspace.id);
  };

  if (isLoading) return <p className="p-6 text-sm text-gray-400">불러오는 중...</p>;

  const hasWorkspaces = workspaces && workspaces.length > 0;

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-4 text-lg font-medium text-gray-900">워크스페이스 선택</h1>

      {!hasWorkspaces && !showCreateForm && (
        // 목록이 비었을 때(삭제됨, 신규 브라우저 등) 그냥 빈 화면으로 끝나지 않게 안내 + 생성 유도
        <div className="mb-4 rounded border border-gray-100 bg-gray-50 p-4 text-center">
          <p className="mb-3 text-sm text-gray-500">아직 속한 워크스페이스가 없습니다.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded bg-primary-500 px-4 py-2 text-sm text-white"
          >
            워크스페이스 만들기
          </button>
        </div>
      )}

      {(showCreateForm || hasWorkspaces) && (
        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="새 워크스페이스 이름"
            maxLength={80}
            className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={createWorkspace.isPending || !newName.trim()}
            className="rounded bg-primary-500 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            만들기
          </button>
        </form>
      )}

      <div className="space-y-2">
        {workspaces?.map((ws) => (
          <button
            key={ws.id}
            onClick={() => handleSelect(ws.id)}
            className="w-full rounded border border-gray-200 px-4 py-3 text-left text-sm hover:border-primary-500"
          >
            <span className="font-medium">{ws.name}</span>
            <span className="ml-2 text-xs text-gray-400">멤버 {ws.memberCount}명</span>
          </button>
        ))}
      </div>
    </div>
  );
}
