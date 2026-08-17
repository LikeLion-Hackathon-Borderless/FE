import { useNavigate } from "react-router-dom";
import { useWorkspaceList } from "../hooks/useWorkspace";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";

export function WorkspaceHub() {
  const { data: workspaces, isLoading } = useWorkspaceList();
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    setWorkspaceId(id);
    navigate("/");
  };

  if (isLoading) return <p className="p-6 text-sm text-gray-400">불러오는 중...</p>;

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-4 text-lg font-medium text-gray-900">워크스페이스 선택</h1>
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
