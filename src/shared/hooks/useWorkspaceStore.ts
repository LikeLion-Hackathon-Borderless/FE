import { create } from "zustand";

// 선택된 워크스페이스는 서버에 저장 안 함 -> 프론트가 관리 (API.md 7.2절)
interface WorkspaceState {
  workspaceId: string | null;
  setWorkspaceId: (id: string) => void;
  clearWorkspaceId: () => void;
}

const STORAGE_KEY = "ditto_workspace_id";

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: localStorage.getItem(STORAGE_KEY),
  setWorkspaceId: (id) => {
    localStorage.setItem(STORAGE_KEY, id);
    set({ workspaceId: id });
  },
  clearWorkspaceId: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ workspaceId: null });
  },
}));
