import { apiClient } from "@/shared/api/client";
import type { AuthResponse } from "@/types/user";

export const authApi = {
  sendVerificationCode: (email: string) =>
    apiClient.post<void>("/auth/email-verifications", { email }),

  confirmVerificationCode: (email: string, code: string) =>
    apiClient
      .post<{ verificationToken: string; verifiedAt: string }>(
        "/auth/email-verifications/confirm",
        { email, code },
      )
      .then((res) => res.data),

  signup: (payload: {
    email: string;
    password: string;
    displayName: string;
    emailVerificationToken: string;
    termsAccepted: true;
  }) => apiClient.post<AuthResponse>("/auth/signup", payload).then((res) => res.data),

  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }).then((res) => res.data),

  getMe: () => apiClient.get("/users/me").then((res) => res.data),
};
