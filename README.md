# Ditto

비동기 원격 협업에서 발생하는 "이해의 어긋남"을 줄여주는 AI 기반 커뮤니케이션 도구입니다.

서로 다른 시간대와 언어로 일하는 팀은 텍스트 메시지만으로 의도, 기한, 완료 기준을 전달하기 어렵습니다. Ditto는 메시지를 보내기 전 AI가 모호한 표현을 짚어주고, 발신자와 수신자가 동일한 내용을 이해했는지 구조화된 카드로 확인하며, 합의된 내용을 기록으로 남깁니다.


## 핵심 기능

- **AI 사전 검토**: 메시지 전송 전 마감 기한, 의도, 담당자 같은 모호한 표현을 감지하고 명확히 할 수 있도록 안내합니다.
- **근무시간 경고**: 수신자의 근무시간 밖으로 마감이 설정되면 대안 시각이나 예약 전송을 제안합니다.
- **공통 이해 카드**: 업무, 담당자, 기한, 기대 결과를 구조화한 카드를 자동 생성해 양측이 같은 내용을 보게 합니다.
- **수신자 확인 응답**: 이해함 · 기한 조정 요청 · 설명 요청 세 가지로 명확하게 응답합니다.
- **합의 기록**: 언제, 무엇을, 누가 합의했는지 타임라인으로 조회할 수 있습니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 언어 | TypeScript |
| 빌드 도구 | Vite |
| UI | React |
| 라우팅 | React Router |
| 서버 상태 | TanStack Query |
| 전역 상태 | Zustand |
| HTTP 클라이언트 | Axios |
| 폼 | React Hook Form + Zod |
| 스타일링 | Tailwind CSS |
| 날짜/시간 | Day.js (timezone plugin) |

## 시작하기

### 요구 사항

- Node.js 18 이상
- 백엔드 서버 (로컬 실행 시 `http://localhost:8080`)

### 설치 및 실행

```bash
npm install
cp .env.example .env
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

### 환경 변수

`.env.example`을 참고해 `.env`를 작성합니다.

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_BACKEND_ORIGIN=http://localhost:8080
VITE_USE_MOCK=true
```

`VITE_USE_MOCK`이 `true`면 아직 백엔드에 구현되지 않은 기능(워크스페이스, AI 검토, 공통 이해 카드, 합의 기록)을 mock 데이터로 대체합니다.

### 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

## 폴더 구조

기능(domain) 단위로 나눈 구조입니다.

```text
src/
├── app/                # 라우터, 전역 프로바이더
├── shared/             # 여러 feature가 공유하는 API 클라이언트, 훅, 유틸
├── features/
│   ├── auth/           # 이메일 인증, 회원가입, 로그인
│   ├── onboarding/      # 프로필 · 근무 컨텍스트 · 워크스페이스 설정
│   ├── workspace/       # 워크스페이스 생성 · 선택 · 멤버
│   ├── conversation/    # 대화 목록, 메시지 송수신
│   ├── ai-review/       # AI 사전 검토 패널
│   ├── understanding-card/  # 공통 이해 카드, 수신자 응답
│   └── agreement-log/   # 합의 기록 조회
└── types/              # API 응답/요청 타입 정의
```

각 feature는 `api/`, `components/`, `hooks/`, `pages/`로 구성됩니다. 아직 백엔드에 구현되지 않은 기능은 `api/mock/` 아래에 mock 구현을 두고, 실제 API가 배포되면 훅 파일에서 mock을 실제 구현으로 교체하는 방식으로 전환합니다.

개발 진행 방식과 API 연동 상태에 대한 자세한 내용은 [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)를 참고하세요.

## 라이선스

해커톤 출품을 위한 프로젝트로, 별도 라이선스를 명시하지 않았습니다.
