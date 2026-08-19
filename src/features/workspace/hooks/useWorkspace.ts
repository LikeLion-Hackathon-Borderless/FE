import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "../api/workspace";

export function useWorkspaceList() {
  return useQuery({ queryKey: ["workspaces"], queryFn: workspaceService.list });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, organizationDomain }: { name: string; organizationDomain?: string }) =>
      workspaceService.create(name, organizationDomain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useWorkspaceDetail(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getDetail(workspaceId as string),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => workspaceService.getMembers(workspaceId as string),
    enabled: !!workspaceId,
  });
}

// OWNER만 가능, 프론트에서 워크스페이스 이름 재입력 확인 후 호출 (API.md 6절)
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.remove(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
