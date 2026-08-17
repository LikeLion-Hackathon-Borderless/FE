import { USE_MOCK } from "@/shared/api/client";
import { conversationApi } from "./conversationApi";
import { conversationMock } from "./mock/conversationMock";

export const conversationService = USE_MOCK ? conversationMock : conversationApi;
