import { apiClient } from "@/shared/api/client";
import type { RoleOption, UserResponse, WorkDay } from "@/types/user";

export const onboardingApi = {
  getRoles: () => apiClient.get<RoleOption[]>("/users/roles").then((res) => res.data),

  saveProfile: (payload: {
    displayName: string;
    role: string;
    customRole: string | null;
    preferredLanguage: string;
  }) => apiClient.patch<UserResponse>("/users/me/profile", payload).then((res) => res.data),

  saveWorkContext: (payload: {
    timeZoneId: string;
    workStart: string;
    workEnd: string;
    workDays: WorkDay[];
  }) => apiClient.patch<UserResponse>("/users/me/work-context", payload).then((res) => res.data),
};
