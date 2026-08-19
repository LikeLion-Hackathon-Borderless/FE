import { ConversationList } from "../components/ConversationList";

// 이전엔 mx-auto max-w-md라서 넓은 화면에서 사이드바 옆 빈 공간 한가운데
// 둥둥 떠보이는 문제가 있었음. 목록형 UI는 좌측부터 채워지는 게 자연스러워서
// 중앙정렬을 빼고 왼쪽 정렬 + 적당한 최대폭으로 바꿈 (초광폭 화면에서 항목이
// 과하게 늘어나 이름-시각 사이 간격이 어색해지는 것도 같이 방지).
export function ConversationListPage() {
  return (
    <div className="w-full max-w-2xl">
      <header className="border-b border-gray-100 px-4 py-3 sm:px-6">
        <h1 className="text-sm font-medium text-gray-900">대화</h1>
      </header>
      <ConversationList />
    </div>
  );
}
