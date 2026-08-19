import { useMutation, useQuery } from "@tanstack/react-query";
import { workspaceMock } from "../api/mock/workspaceMock";

// 실제 API 배포되면 workspaceMock -> workspaceApi로 교체
const impl = workspaceMock; // TODO: 신규예정 API 구현되면 workspaceApi로 교체

export function useWorkspaceList() {
  return useQuery({ queryKey: ["workspaces"], queryFn: impl.list });
}

export function useCreateWorkspace() {
  return useMutation({
    mutationFn: ({ name, organizationDomain }: { name: string; organizationDomain?: string }) =>
      impl.create(name, organizationDomain),
  });
}
