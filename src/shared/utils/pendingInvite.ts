// 초대 링크(/invitations/{token})를 비로그인 상태로 열었을 때 token을 잠깐 들고 있다가,
// 로그인/회원가입이 끝나면 그 token으로 자동으로 수락 API를 호출하기 위한 저장소.
// (API.md 7.7절: "로그인하지 않았다면 프론트가 token을 보존한 채 로그인/회원가입으로 이동한다")
const STORAGE_KEY = "ditto_pending_invite_token";

export function setPendingInviteToken(token: string) {
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function getPendingInviteToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearPendingInviteToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}
