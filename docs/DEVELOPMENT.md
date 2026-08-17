# Ditto Frontend 스캐폴드

API.md / FRONTEND_API_HANDOFF.md v0.3 기준으로 짠 초기 구조.

## 설치

```bash
npm install
cp .env.example .env
npm run dev
```

## 오늘 하루 작업 순서 (권장)

1. `npm install` 후 `npm run dev` 되는지부터 확인
2. `features/ai-review/components/AIReviewPanel.tsx` - 와이어프레임 이미지4 UI 다듬기 (지금은 뼈대만 있음, datetime picker 실제 연결 안 됨)
3. `features/understanding-card/components/*` - 3버튼 응답 흐름 실제 동작 확인 (mock이라 새로고침하면 상태 날아감, 필요하면 localStorage 붙이기)
4. `features/conversation/pages/ConversationPage.tsx` - 실제 로그인 붙일 때 `DEMO_CONVERSATION_ID` 하드코딩 부분을 실제 conversationId로 교체
5. 시간 남으면 `features/auth` 붙여서 로그인 → 대화 진입 흐름 연결 (여긴 이미 백엔드 구현 완료된 API라 실제로 붙음)

## Mock → 실제 API 전환 방법

각 feature의 훅 파일에 `impl` 변수가 있음.

```ts
// features/ai-review/hooks/useAIReview.ts
const impl = USE_MOCK ? aiReviewMock : aiReviewMock; // TODO
```

실제 API 구현되면:
1. `features/ai-review/api/aiReviewApi.ts` 새로 만들어서 axios 호출 작성 (types/aiReview.ts 타입 그대로 재사용)
2. `impl` 라인을 `USE_MOCK ? aiReviewMock : aiReviewApi`로 바꿈
3. 컴포넌트는 안 건드려도 됨 - 훅 인터페이스가 동일하기 때문

같은 패턴이 `understanding-card`, `workspace`, `agreement-log`에도 적용됨.

## 백엔드에 확인 필요한 것 (지금 프론트에서 임시로 처리한 부분)

- `types/understandingCard.ts`의 `decisionType` 필드 - 와이어프레임엔 "결정 상태(필수 반영·제안 아님)"가 있는데 API.md 11.1절 카드 모델엔 없음. 임시로 optional 필드로 처리해둠.
- `AIReviewPanel.tsx`의 datetime picker - API.md엔 값 형식만 정의되어 있고 UI 컴포넌트 스펙은 없어서 지금은 버튼 자리만 잡아둠.

## 실제로 이미 붙일 수 있는 API (FRONTEND_API_HANDOFF.md 4절)

- `features/auth/api/authApi.ts`
- `features/conversation/api/conversationApi.ts`

이 두 개는 mock 아니고 실제 axios 호출로 짜여있음. `VITE_API_BASE_URL` 로컬 서버 켜져 있으면 바로 테스트 가능.
