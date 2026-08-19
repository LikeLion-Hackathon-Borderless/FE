import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { WorkspaceHubPage } from "@/features/workspace/pages/WorkspaceHubPage";
import { ConversationListPage } from "@/features/conversation/pages/ConversationListPage";
import { ConversationPage } from "@/features/conversation/pages/ConversationPage";
import { AgreementLogPage } from "@/features/agreement-log/pages/AgreementLogPage";
import { RequireAuth } from "@/shared/ui/RequireAuth";
import { AppShell } from "@/shared/ui/AppShell";

const router = createBrowserRouter([
  // 셸 밖 (인증/온보딩)
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  {
    path: "/onboarding",
    element: (
      <RequireAuth>
        <OnboardingPage />
      </RequireAuth>
    ),
  },
  {
    path: "/workspaces",
    element: (
      <RequireAuth>
        <WorkspaceHubPage />
      </RequireAuth>
    ),
  },
  // 셸 안 (대화/합의기록) - AppShell이 사이드바+탭 제공, 각 페이지는 Outlet에 렌더
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <ConversationListPage /> },
      { path: "/conversations/:conversationId", element: <ConversationPage /> },
      { path: "/agreement-log", element: <AgreementLogPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}