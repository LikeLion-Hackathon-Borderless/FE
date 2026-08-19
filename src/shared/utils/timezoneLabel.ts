// 3개 파일(ConversationPage, UnderstandingCard, AIReviewPanel)에 중복 정의되어 있던 걸 통합함.
export function zoneShort(zone: string): string {
  if (zone === "America/Los_Angeles") return "LA";
  if (zone === "Asia/Seoul") return "Seoul";
  return zone.split("/").pop() ?? zone;
}
