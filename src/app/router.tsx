import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { WorkspaceHubPage } from "@/features/workspace/pages/WorkspaceHubPage";
import { ConversationListPage } from "@/features/conversation/pages/ConversationListPage";
import { ConversationPage } from "@/features/conversation/pages/ConversationPage";
import { AgreementLogPage } from "@/features/agreement-log/pages/AgreementLogPage";
import { RequireAuth } from "@/shared/ui/RequireAuth";

const router = createBrowserRouter([
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
  {
    path: "/",
    element: (
      <RequireAuth>
        <ConversationListPage />
      </RequireAuth>
    ),
  },
  {
    path: "/conversations/:conversationId",
    element: (
      <RequireAuth>
        <ConversationPage />
      </RequireAuth>
    ),
  },
  {
    path: "/agreement-log",
    element: (
      <RequireAuth>
        <AgreementLogPage />
      </RequireAuth>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
