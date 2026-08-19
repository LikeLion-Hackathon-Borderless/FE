import { USE_MOCK } from "@/shared/api/client";
import { workspaceApi } from "./workspaceApi";
import { workspaceMock } from "./mock/workspaceMock";

export const workspaceService = USE_MOCK ? workspaceMock : workspaceApi;
