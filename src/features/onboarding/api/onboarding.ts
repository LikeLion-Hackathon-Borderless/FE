import { USE_MOCK } from "@/shared/api/client";
import { onboardingApi } from "./onboardingApi";
import { onboardingMock } from "./mock/onboardingMock";

export const onboardingService = USE_MOCK ? onboardingMock : onboardingApi;
