# Ditto Frontend 개발 가이드

API.md / FRONTEND_API_HANDOFF.md v0.3 기준으로 짠 구조. mock으로 개발 시작해서
백엔드 서버가 뜨는 대로 단계적으로 실제 API로 전환하는 방식을 씀.

## 설치

```bash
npm install
cp .env.example .env
npm run dev
```

`.env`의 `VITE_USE_MOCK=true`면 백엔드 서버 없이도 회원가입부터 대화, AI검토,
이해카드 응답까지 전체 흐름을 mock 데이터로 테스트할 수 있다.

로그인 화면에 있는 "데모 계정으로 시작하기" 버튼(mock 모드에서만 노출)을 누르면
바로 mock 유저로 로그인된다. 이메일/비밀번호를 아무 값이나 입력해서 로그인해도
mock 모드에서는 통과한다.

---

## 1. mock/실제 전환 구조

각 feature는 이런 패턴으로 되어 있다.

```text
features/{name}/api/
├── {name}Api.ts        # 실제 axios 호출
├── {name}.ts           # 스위처: USE_MOCK 값 보고 mock/실제 중 골라서 export
└── mock/
    └── {name}Mock.ts   # mock 구현
```

컴포넌트와 훅은 항상 스위처(`{name}.ts`)만 import한다. 절대 `{name}Api.ts`나
`{name}Mock.ts`를 직접 import하지 않는다 - 그래야 `.env` 값 하나로 전체가 전환된다.

```ts
// features/auth/api/auth.ts
import { USE_MOCK } from "@/shared/api/client";
import { authApi } from "./authApi";
import { authMock } from "./mock/authMock";

export const authService = USE_MOCK ? authMock : authApi;
```

현재 이 패턴이 적용된 feature: `auth`, `onboarding`, `conversation`, `workspace`,
`ai-review`, `understanding-card`.

---

## 2. 단계별 작업 순서

### 2-1. 지금 (mock 개발 단계)

`VITE_USE_MOCK=true`로 두고 작업한다. 이 단계에서 할 일:

- 화면 스타일링, 레이아웃 다듬기
- 화면 전환 흐름 확인 (로그인 → 온보딩 → 워크스페이스 → 대화)
- 에러 처리 UI, 빈 상태 UI 보강
- mock 데이터는 새로고침하면 초기화된다 (메모리 저장). 필요하면 개발 중
  localStorage로 임시 보강해도 되지만, 실제 전환 전에 다시 걷어낼 것.

### 2-2. 백엔드에 서버 요청하기 전 체크리스트

- 로컬 포트가 `8080`인지 (다르면 `.env`의 `VITE_API_BASE_URL` 수정)
- `{서버주소}/swagger-ui.html`에서 실제로 뜨는 API 목록이 API.md 3.1절
  (인증·사용자·온보딩), 3.4절(대화·메시지 중 구현완료 표시된 것)과 일치하는지
- CORS 설정에 프론트 로컬 주소(`http://localhost:5173`)가 허용되어 있는지

### 2-3. 서버가 뜨면: `.env` 한 줄만 변경

```env
VITE_USE_MOCK=false
```

이 시점에 자동으로 실제 API를 타게 되는 건 **API.md 기준 "구현 완료" 상태인
feature뿐**이다. 현재는 `auth`, `onboarding`, `conversation`.

`workspace`, `ai-review`, `understanding-card`, `agreement-log`는 아직
`{name}Api.ts` 자체가 없으므로 스위처에서 여전히 mock을 쓴다. 이 부분은
해당 API가 실제로 배포된 뒤 개별적으로 전환한다 (2-5절 참고).

### 2-4. 전환 직후 검증 순서

하나씩 순서대로 확인한다. 앞 단계가 안 되면 뒷 단계로 넘어가지 않는다.

1. **회원가입** - 이메일 인증코드가 실제로 오는지, 코드 확인이 통과하는지,
   가입이 완료되는지
2. **로그인** - 방금 가입한 계정으로 로그인되는지. 브라우저 devtools Network
   탭에서 `accessToken`이 정상적으로 오는지 확인
3. **`GET /users/me`** - 응답의 `onboardingStep` 값을 보고 온보딩 화면이
   올바른 단계로 진입하는지
4. **프로필/근무컨텍스트 저장** - 저장 후 `onboardingStep`이 실제로
   `PROFILE → WORK_CONTEXT → WORKSPACE`로 바뀌는지
5. **대화목록** - `GET /conversations`가 빈 배열이면 정상(아직 DM 없음),
   에러면 문제
6. **메시지 전송** - 실제로 전송되는지, 새로고침해도 남아있는지 (mock과
   달리 실제 서버는 새로고침해도 유지되어야 정상)

### 2-5. 안 맞는 부분 발견 시

- **필드명이 API.md 문서와 실제 응답이 다름** → 그때그때 고치지 말고
  모아뒀다가 백엔드와 한 번에 맞추는 자리를 가질 것. API.md 11절 계약변경
  규칙에 따라 문서 버전을 올리고 공유한다.
- **정의되지 않은 에러코드가 옴** → `src/shared/api/errorCodes.ts`에 추가

### 2-6. 나머지 mock(workspace, ai-review, understanding-card, agreement-log) 전환

해당 API가 배포되면 같은 패턴을 반복한다. 예를 들어 워크스페이스라면:

1. `features/workspace/api/workspaceApi.ts`를 새로 만들어 API.md 7절 기준으로
   axios 호출 작성 (`types/workspace.ts` 타입 그대로 재사용)
2. `features/workspace/hooks/useWorkspace.ts`에서 쓰던 `workspaceMock`을
   스위처 방식으로 바꾸거나, `features/workspace/api/workspace.ts` 스위처
   파일을 새로 만들어 연결
3. 2-4절과 같은 방식으로 기능별 검증

AI검토, 이해카드, 합의기록도 순서만 다르고 방식은 동일하다.

---

## 3. 백엔드에 확인이 필요한 항목

- `types/understandingCard.ts`의 `decisionType` 필드 - 와이어프레임에는
  "결정 상태(필수 반영 · 제안 아님)"가 있는데 API.md 11.1절 카드 모델에는
  없음. 지금은 optional 필드로 임시 처리해뒀다.
- `AIReviewPanel.tsx`의 datetime picker - API.md에는 값 형식만 정의되어
  있고 UI 컴포넌트 스펙은 없어서 지금은 버튼 자리만 잡아뒀다.

---

## 4. 폴더 구조 참고

```text
src/
├── app/                     # 라우터, 전역 프로바이더
├── shared/                  # 공통 API 클라이언트, 훅, 유틸
├── features/
│   ├── auth/                # 이메일 인증, 회원가입, 로그인
│   ├── onboarding/          # 프로필 · 근무 컨텍스트 · 워크스페이스 설정
│   ├── workspace/           # 워크스페이스 생성 · 선택 · 멤버
│   ├── conversation/        # 대화 목록, 메시지 송수신
│   ├── ai-review/           # AI 사전 검토 패널
│   ├── understanding-card/  # 공통 이해 카드, 수신자 응답
│   └── agreement-log/       # 합의 기록 조회
└── types/                   # API 요청/응답 타입 정의 (API.md 기준으로 고정)
```

`types/` 폴더는 API.md 계약을 그대로 옮긴 것이므로 임의로 수정하지 않는다.
필드가 바뀌어야 하면 먼저 팀과 논의하고 API.md 버전을 올린 뒤 함께 바꾼다.
