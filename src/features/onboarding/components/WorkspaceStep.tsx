import { useState } from "react";
import { useCreateWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";

export function WorkspaceStep({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const createWorkspace = useCreateWorkspace();
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const workspace = await createWorkspace.mutateAsync({ name });
    // 워크스페이스 생성 성공 시 서버가 onboardingStep을 COMPLETED로 전환함 (API.md 5절, 14.1절)
    // -> useHydrateAuth 또는 다음 GET /users/me 호출에서 최신 user가 갱신됨
    setWorkspaceId(workspace.id);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-sm font-medium text-gray-900">워크스페이스 만들기</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="워크스페이스 이름"
        required
        maxLength={80}
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={createWorkspace.isPending}
        className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
      >
        시작하기
      </button>
    </form>
  );
}
