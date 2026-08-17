import { create } from "zustand";
import type { UserResponse } from "@/types/user";

interface AuthState {
  accessToken: string | null;
  user: UserResponse | null;
  setAuth: (token: string, user: UserResponse) => void;
  clear: () => void;
}

const STORAGE_KEY = "ditto_access_token";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(STORAGE_KEY),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem(STORAGE_KEY, token);
    set({ accessToken: token, user });
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ accessToken: null, user: null });
  },
}));
