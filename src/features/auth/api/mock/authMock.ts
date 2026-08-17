import { mockDelay } from "@/shared/api/mockDelay";
import type { AuthResponse } from "@/types/user";
import { getMockUser, updateMockUser, resetMockUser } from "./mockUserStore";

const FAKE_TOKEN = "mock-access-token";

export const authMock = {
  sendVerificationCode: (_email: string) => mockDelay(undefined, 300),

  confirmVerificationCode: (_email: string, _code: string) =>
    mockDelay({ verificationToken: "mock-verification-token", verifiedAt: new Date().toISOString() }, 300),

  signup: (payload: {
    email: string;
    password: string;
    displayName: string;
    emailVerificationToken: string;
    termsAccepted: true;
  }): Promise<AuthResponse> => {
    resetMockUser();
    const user = updateMockUser({ email: payload.email, displayName: payload.displayName });
    return mockDelay(
      {
        accessToken: FAKE_TOKEN,
        tokenType: "Bearer" as const,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        user,
      },
      400,
    );
  },

  // 이메일/비밀번호 아무 값이나 넣어도 통과 - 백엔드 없이 흐름 테스트하려는 목적
  login: (email: string, _password: string): Promise<AuthResponse> => {
    const user = updateMockUser({ email });
    return mockDelay(
      {
        accessToken: FAKE_TOKEN,
        tokenType: "Bearer" as const,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        user,
      },
      400,
    );
  },

  getMe: () => mockDelay(getMockUser(), 200),
};
