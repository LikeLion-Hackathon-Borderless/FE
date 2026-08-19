import { USE_MOCK } from "@/shared/api/client";
import { invitationApi } from "./invitationApi";
import { invitationMock } from "./mock/invitationMock";

export const invitationService = USE_MOCK ? invitationMock : invitationApi;
