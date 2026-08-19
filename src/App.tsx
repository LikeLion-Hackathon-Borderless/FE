import { QueryProvider } from "@/app/providers/QueryProvider";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </QueryProvider>
  );
}