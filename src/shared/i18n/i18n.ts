import { useAuthStore } from "@/shared/hooks/useAuthStore";

// 가벼운 자체 i18n (라이브러리 없이). 유저의 preferredLanguage(ko/en)로 언어를 고른다.
// 글로벌 협업 앱이므로 영어 유저에겐 영어 UI를 보여준다.
export type Lang = "ko" | "en";

// 번역 사전. 키는 화면 영역별로 묶는다. 없는 키는 키 문자열을 그대로 반환(안전).
const dict: Record<string, { ko: string; en: string }> = {
  // 공통
  "common.close": { ko: "닫기", en: "Close" },
  "common.confirm": { ko: "확인", en: "Confirm" },
  "common.cancel": { ko: "취소", en: "Cancel" },
  "common.send": { ko: "전송하기", en: "Send" },
  "common.directInput": { ko: "직접 입력", en: "Custom" },
  "common.sender": { ko: "발신자", en: "Sender" },
  "common.recipient": { ko: "수신자", en: "Recipient" },
  "common.undetermined": { ko: "미확정", en: "Undetermined" },

  // AI 검토 패널
  "aiReview.title": { ko: "공동 이해 준비", en: "Shared Understanding" },
  "aiReview.badge": { ko: "AI 검토", en: "AI Review" },
  "aiReview.task": { ko: "업무", en: "Task" },
  "aiReview.assignee": { ko: "담당자", en: "Assignee" },
  "aiReview.deadline": { ko: "기한", en: "Deadline" },
  "aiReview.expectedOutcome": { ko: "기대 결과", en: "Expected Outcome" },
  "aiReview.baseTime": { ko: "기준 시각", en: "Base Time" },
  "aiReview.createAndSend": { ko: "카드 생성 후 전송하기", en: "Create Card & Send" },
  "aiReview.deadlineQuestion": {
    ko: "정확한 마감 시각이 필요해요. 어떤 시간으로 확정할까요?",
    en: "A precise deadline is needed. Which time should we confirm?",
  },
  "aiReview.failed": {
    ko: "AI 검토를 완료하지 못했어요. 패널을 닫고 원문 그대로 보낼 수 있어요.",
    en: "AI review couldn't be completed. You can close this and send the original message.",
  },

  "aiReview.evidence": { ko: "근거", en: "Evidence" },
  "aiReview.recentConversation": { ko: "최근 대화", en: "Recent conversation" },
  "aiReview.workHoursConflict": { ko: "근무 시간 충돌", en: "Work hours conflict" },
  "aiReview.confirmDeadlineHint": {
    ko: "기한을 확정하면 전송할 수 있어요.",
    en: "Confirm the deadline to send.",
  },
  "aiReview.noTimeGuess": { ko: "AI가 시각을 특정하지 못했어요. 직접 입력해주세요.", en: "AI couldn't determine the time. Please enter it manually." },
  "aiReview.needsCheck": { ko: "확인 필요", en: "Needs check" },
  "aiReview.sending": { ko: "전송 중…", en: "Sending…" },

  // 공통 이해 카드
  "card.title": { ko: "공통 이해 카드", en: "Shared Understanding Card" },
  "card.task": { ko: "업무", en: "Task" },
  "card.assignee": { ko: "담당자", en: "Assignee" },
  "card.deadline": { ko: "기한", en: "Deadline" },
  "card.expectedOutcome": { ko: "기대 결과", en: "Expected Outcome" },
  "card.status": { ko: "상태", en: "Status" },
  "card.needsCheck": { ko: "확인 필요", en: "Needs check" },
  "card.attachment": { ko: "첨부", en: "Attachment" },
  "card.showOriginal": { ko: "원문 보기", en: "View original" },
  "card.hideOriginal": { ko: "원문 접기", en: "Hide original" },

  // 카드 응답 버튼
  "resp.agree": { ko: "이해한 내용이 맞습니다.", en: "This understanding is correct." },
  "resp.requestDeadline": { ko: "기한 조정이 필요합니다.", en: "The deadline needs adjustment." },
  "resp.requestClarification": { ko: "요청 결과가 불명확합니다.", en: "The expected outcome is unclear." },
  "resp.agreed": { ko: "이해했습니다", en: "Understood" },
  "resp.deadlineRequested": { ko: "기한 조정 요청함", en: "Deadline change requested" },
  "resp.clarificationRequested": { ko: "설명 요청함", en: "Clarification requested" },
  "resp.agreeMessage": {
    ko: "이해한 내용이 맞습니다. 지금 바로 착수할게요.",
    en: "This understanding is correct. I'll get started right away.",
  },
  "resp.cannotRespondAgain": {
    ko: "· 이 revision에는 다시 응답할 수 없어요",
    en: "· You can't respond to this revision again",
  },

  // 합의 기록
  "log.title": { ko: "합의 기록", en: "Agreement Log" },
  "log.empty": { ko: "아직 합의 기록이 없어요.", en: "No agreement records yet." },
  "log.when": { ko: "언제", en: "When" },
  "log.what": { ko: "무엇에", en: "What" },
  "log.who": { ko: "누가", en: "Who" },
  "log.loadMore": { ko: "더 보기", en: "Load more" },
  "log.loading": { ko: "불러오는 중…", en: "Loading…" },
  "log.agreed": { ko: "합의 완료", en: "Agreed" },
  "log.pending": { ko: "확인 대기", en: "Pending" },
  "log.deadlineShort": { ko: "마감", en: "due" },

  // 상단 탭 / 사이드바
  "nav.conversations": { ko: "대화", en: "Conversations" },
  "nav.agreementLog": { ko: "합의 기록", en: "Agreement Log" },
  "nav.directMessages": { ko: "다이렉트 메시지", en: "Direct Messages" },
  "nav.workspace": { ko: "워크스페이스", en: "Workspace" },
  "nav.invite": { ko: "초대", en: "Invite" },
  "nav.menu": { ko: "메뉴 열기", en: "Open menu" },
  "nav.logout": { ko: "로그아웃", en: "Log out" },

  // 대화 입력/버블
  "input.placeholder": { ko: "메시지를 입력하세요.", en: "Type a message." },
  "input.aiReview": { ko: "AI 검토하기", en: "AI Review" },
  "input.send": { ko: "전송하기", en: "Send" },
  "input.attached": { ko: "첨부됨", en: "Attached" },
  "input.attachDocument": { ko: "문서 첨부", en: "Attach file" },
  "input.removeAttachment": { ko: "첨부 제거", en: "Remove attachment" },
  "bubble.notReviewed": {
    ko: "미확정 · AI 검토 없이 전송됨 · 합의로 기록되지 않음",
    en: "Draft · Sent without AI review · Not recorded as agreement",
  },
  "conv.loading": { ko: "불러오는 중...", en: "Loading..." },
  "conv.empty": { ko: "아직 대화가 없습니다.", en: "No conversations yet." },
  "conv.selectOne": { ko: "대화를 선택하세요.", en: "Select a conversation." },
  "conv.workHours": { ko: "근무 시간", en: "Work hours" },
  "conv.offHours": { ko: "근무 외 시간", en: "Off hours" },

  // 메시지 번역
  "msg.translate": { ko: "번역", en: "Translate" },
  "msg.showOriginal": { ko: "원문 보기", en: "Show original" },
  "msg.translating": { ko: "번역 중…", en: "Translating…" },
};

export function translate(key: string, lang: Lang): string {
  const entry = dict[key];
  if (!entry) return key; // 키 없으면 키 그대로 (누락돼도 안 깨짐)
  return entry[lang] ?? entry.ko;
}

// 컴포넌트에서: const t = useT(); t("aiReview.title")
export function useT() {
  const user = useAuthStore((s) => s.user);
  const lang: Lang = user?.preferredLanguage === "en" ? "en" : "ko";
  return (key: string) => translate(key, lang);
}

// 현재 언어만 필요할 때
export function useLang(): Lang {
  const user = useAuthStore((s) => s.user);
  return user?.preferredLanguage === "en" ? "en" : "ko";
}