import { USE_MOCK } from "@/shared/api/client";
import { usersApi } from "./usersApi";
import { usersMock } from "./mock/usersMock";

export const usersService = USE_MOCK ? usersMock : usersApi;
