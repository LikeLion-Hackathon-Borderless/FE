export type OnboardingStep = "PROFILE" | "WORK_CONTEXT" | "WORKSPACE" | "COMPLETED";
export type WorkDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

// 본인 조회/설정 변경에서만 반환되는 전체 유저 정보 (API.md 5.6절 - 검색결과엔 이메일 등 미포함)
export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  customRole: string | null;
  profileImageUrl: string | null;
  timeZoneId: string;
  preferredLanguage: string;
  workStart: string; // "09:00:00"
  workEnd: string;
  workDays: WorkDay[];
  emailVerified: boolean;
  onboardingStep: OnboardingStep;
}

// 검색 결과, 대화 상대 등 다른 사용자에게 공개 가능한 정보만 (API.md 5.6절)
export interface UserSummaryResponse {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
  role: string;
  customRole: string | null;
  timeZoneId: string;
  preferredLanguage: string;
}

export interface RoleOption {
  code: string;
  label: string;
  customInputRequired: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
  user: UserResponse;
}
