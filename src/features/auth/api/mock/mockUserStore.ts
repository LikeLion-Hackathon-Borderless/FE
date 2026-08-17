import type { UserResponse } from "@/types/user";

// mock 모드에서만 쓰는 메모리 저장소. 새로고침하면 초기화됨 (다른 mock들과 동일한 패턴)
let mockUser: UserResponse = {
  id: "mock-user-self",
  email: "demo@ditto.app",
  displayName: "이서연",
  role: "PROJECT_MANAGER",
  customRole: null,
  profileImageUrl: null,
  timeZoneId: "Asia/Seoul",
  preferredLanguage: "ko",
  workStart: "09:00:00",
  workEnd: "18:00:00",
  workDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  emailVerified: true,
  onboardingStep: "PROFILE",
};

export function getMockUser(): UserResponse {
  return mockUser;
}

export function updateMockUser(patch: Partial<UserResponse>): UserResponse {
  mockUser = { ...mockUser, ...patch };
  return mockUser;
}

export function resetMockUser() {
  mockUser = { ...mockUser, onboardingStep: "PROFILE" };
}
