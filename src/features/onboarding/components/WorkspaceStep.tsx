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
    // 워크스페이스 API 배포 전까지는 onboardingStep=COMPLETED로 서버 상태를 임의 전환하지 않음
    // (FRONTEND_API_HANDOFF.md 14.1절) - 프론트 라우팅에서만 완료 취급
    setWorkspaceId(workspace.id);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-sm font-medium text-gray-900">워크스페이스 만들기</h2>
      <p className="text-xs text-gray-400">
        아직 실제 서버 API가 없어서 mock으로 생성됩니다. 워크스페이스 API 배포되면 실제로 저장됩니다.
      </p>
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
