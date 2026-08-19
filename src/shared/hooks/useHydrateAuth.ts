import { useEffect, useRef } from "react";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { authService } from "@/features/auth/api/auth";

// 새로고침하면 accessToken은 localStorage에 남아있지만 user 정보는 메모리 상태라 날아감.
// 이걸 그대로 두면 로그인은 유지되는데 사이드바 이름 같은 곳이 빈 값으로 보임.
// 앱 최초 마운트 시 토큰은 있고 user가 없으면 GET /users/me로 채워준다.
export function useHydrateAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);
  const attempted = useRef(false);

  useEffect(() => {
    if (!accessToken || user || attempted.current) return;
    attempted.current = true;

    authService
      .getMe()
      .then((freshUser) => {
        setAuth(accessToken, freshUser);
      })
      .catch(() => {
        // 토큰이 더 이상 유효하지 않으면 로그인 화면으로 (client.ts의 401 인터셉터가 이미 처리하지만
        // getMe 자체가 401 이전에 실패하는 경우를 대비해 한 번 더 방어)
        clear();
      });
  }, [accessToken, user, setAuth, clear]);
}
