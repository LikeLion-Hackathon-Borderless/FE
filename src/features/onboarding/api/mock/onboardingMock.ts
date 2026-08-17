import { mockDelay } from "@/shared/api/mockDelay";
import { getMockUser, updateMockUser } from "@/features/auth/api/mock/mockUserStore";
import type { UserResponse, WorkDay, RoleOption } from "@/types/user";

// API.md 5.2절 역할 목록 그대로
const MOCK_ROLES: RoleOption[] = [
  { code: "DEVELOPER", label: "개발자", customInputRequired: false },
  { code: "PROJECT_MANAGER", label: "프로젝트 매니저(PM)", customInputRequired: false },
  { code: "PRODUCT_MANAGER", label: "프로덕트 매니저", customInputRequired: false },
  { code: "DESIGNER", label: "디자이너", customInputRequired: false },
  { code: "MARKETER", label: "마케팅", customInputRequired: false },
  { code: "DATA_ANALYST", label: "데이터 분석가", customInputRequired: false },
  { code: "QA_ENGINEER", label: "QA 엔지니어", customInputRequired: false },
  { code: "SALES", label: "영업", customInputRequired: false },
  { code: "CUSTOMER_SUCCESS", label: "고객 성공/고객 지원", customInputRequired: false },
  { code: "HR", label: "인사", customInputRequired: false },
  { code: "OPERATIONS", label: "운영", customInputRequired: false },
  { code: "OTHER", label: "기타", customInputRequired: true },
];

export const onboardingMock = {
  getRoles: () => mockDelay(MOCK_ROLES, 150),

  saveProfile: (payload: {
    displayName: string;
    role: string;
    customRole: string | null;
    preferredLanguage: string;
  }): Promise<UserResponse> => {
    const updated = updateMockUser({ ...payload, onboardingStep: "WORK_CONTEXT" });
    return mockDelay(updated, 300);
  },

  saveWorkContext: (payload: {
    timeZoneId: string;
    workStart: string;
    workEnd: string;
    workDays: WorkDay[];
  }): Promise<UserResponse> => {
    const updated = updateMockUser({ ...payload, onboardingStep: "WORKSPACE" });
    return mockDelay(updated, 300);
  },

  getCurrentUser: () => mockDelay(getMockUser(), 100),
};
