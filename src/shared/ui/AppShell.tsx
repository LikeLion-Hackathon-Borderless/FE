import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useConversationList } from "@/features/conversation/hooks/useConversations";
import { useWorkspaceDetail } from "@/features/workspace/hooks/useWorkspace";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { useWorkspaceStore } from "@/shared/hooks/useWorkspaceStore";
import { useHydrateAuth } from "@/shared/hooks/useHydrateAuth";
import { InviteMembersModal } from "@/features/workspace/components/InviteMembersModal";
import { DittoLogo } from "./DittoLogo";

// 앱 셸: 상단(Ditto 로고 + 대화/합의기록 탭) + 좌측 사이드바 + 본문(Outlet)
// 인증/온보딩 화면은 셸 밖. 워크스페이스명은 GET /workspaces/{id}(useWorkspaceDetail)로 실시간 조회.
// 채널/그룹채팅은 MVP 범위에서 제외됨(API.md 1.1절) - 사이드바에 채널 섹션 없음.
//
// 반응형 전략: md(768px) 이상은 사이드바가 항상 보이는 기존 레이아웃 그대로.
// md 미만(태블릿 세로/폰)에서는 사이드바를 화면 밖으로 숨기고, 상단 햄버거 버튼으로
// 슬라이드인 드로어로 열고 닫는다. 대화방 이동 시 자동으로 드로어를 닫는다.
export function AppShell() {
  // 새로고침 시 토큰은 남아있는데 user(표시용 이름 등)가 비어보이는 문제 방지
  useHydrateAuth();

  const conversationsQuery = useConversationList();
  const dms = conversationsQuery.data ?? [];
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);
  const clearWorkspace = useWorkspaceStore((s) => s.clearWorkspaceId);
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const workspaceDetail = useWorkspaceDetail(workspaceId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // 합의기록 경로만 그쪽 탭, 나머지(대화목록·대화상세)는 "대화" 탭 활성
  const onAgreementLog = pathname.startsWith("/agreement-log");

  const handleLogout = () => {
    clearAuth();
    clearWorkspace();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* 상단 바 */}
      <header className="flex flex-shrink-0 items-center gap-2 border-b border-gray-100 px-3 py-3 sm:px-6">
        {/* 햄버거: md 미만에서만 노출 */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="메뉴 열기"
          className="-ml-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-w-0 flex-shrink">
          <DittoLogo />
        </div>

        <nav className="ml-auto flex gap-1">
          <TopTab to="/" active={!onAgreementLog}>대화</TopTab>
          <TopTab to="/agreement-log" active={onAgreementLog}>합의 기록</TopTab>
        </nav>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* md 미만: 드로어 열렸을 때만 뒤 어둡게 깔리는 배경. 클릭하면 닫힘 */}
        {sidebarOpen && (
          <div
            onClick={closeSidebar}
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            aria-hidden="true"
          />
        )}

        {/* 좌측 사이드바 - md 이상: 항상 표시(정적). md 미만: 화면 위에 슬라이드인 */}
        <aside
          className={`z-30 flex w-60 flex-shrink-0 flex-col gap-5 border-r border-gray-100 bg-white p-4 transition-transform duration-200 ease-out
            fixed inset-y-0 left-0 md:static md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gray-200" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
              {workspaceDetail.data?.name ?? "워크스페이스"}
            </span>
            {workspaceId && (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="flex-shrink-0 rounded px-1.5 py-1 text-xs text-primary-600 hover:bg-primary-50"
              >
                초대
              </button>
            )}
          </div>

          <Section title="다이렉트 메시지">
            {dms.map((c) => (
              <NavLink
                key={c.id}
                to={`/conversations/${c.id}`}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <div className="h-5 w-5 flex-shrink-0 rounded-full bg-gray-200" />
                <span className="truncate">{c.otherParticipant.displayName}</span>
              </NavLink>
            ))}
          </Section>
        </aside>

        {/* 본문 */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 하단 유저 정보 + 로그아웃 */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="min-w-0 truncate text-sm text-gray-600">{user?.displayName ?? user?.email}</span>
        <button
          onClick={handleLogout}
          className="flex-shrink-0 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600"
        >
          로그아웃
        </button>
      </div>

      {inviteModalOpen && workspaceId && (
        <InviteMembersModal workspaceId={workspaceId} onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  );
}

function TopTab({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={`whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:text-sm ${
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
