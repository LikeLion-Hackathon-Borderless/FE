import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useConversationList } from "@/features/conversation/hooks/useConversations";
import { DittoLogo } from "./DittoLogo";

// 앱 셸: 상단(Ditto 로고 + 대화/합의기록 탭) + 좌측 사이드바 + 본문(Outlet)
// 인증/온보딩 화면은 셸 밖. 채널·워크스페이스명은 데모용 정적값(실배포는 워크스페이스 API에서).
export function AppShell() {
  const conversationsQuery = useConversationList();
  const dms = conversationsQuery.data ?? [];
  const { pathname } = useLocation();
  // 합의기록 경로만 그쪽 탭, 나머지(대화목록·대화상세)는 "대화" 탭 활성
  const onAgreementLog = pathname.startsWith("/agreement-log");

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* 상단 바 */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-3">
        <DittoLogo />
        <nav className="flex gap-1">
          <TopTab to="/" active={!onAgreementLog}>대화</TopTab>
          <TopTab to="/agreement-log" active={onAgreementLog}>합의 기록</TopTab>
        </nav>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 좌측 사이드바 */}
        <aside className="flex w-60 flex-shrink-0 flex-col gap-5 border-r border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-200" />
            <span className="text-sm font-medium text-gray-900">Likelion Global</span>
          </div>

          <Section title="채널">
            <SidebarItem>#project-orbit</SidebarItem>
            <SidebarItem>#design-review</SidebarItem>
          </Section>

          <Section title="다이렉트 메시지">
            {dms.map((c) => (
              <NavLink
                key={c.id}
                to={`/conversations/${c.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <div className="h-5 w-5 rounded-full bg-gray-200" />
                {c.otherParticipant.displayName}
              </NavLink>
            ))}
          </Section>
        </aside>

        {/* 본문 */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function TopTab({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={`rounded px-3 py-1.5 text-sm font-medium ${
        active
          ? "border border-primary-500 bg-[#DEF9F9] text-primary-600"
          : "bg-pill-gray text-[#9299A3] hover:brightness-95"
      }`}
    >
      {children}
    </NavLink>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-2 text-xs text-gray-400">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function SidebarItem({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md px-2 py-1.5 text-sm text-gray-600">{children}</div>;
}