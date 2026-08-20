import { useT } from "@/shared/i18n/i18n";
import { useNavigate } from "react-router-dom";
import { useConversationList } from "../hooks/useConversations";
import dayjs from "dayjs";

export function ConversationList() {
  const t = useT();
  const { data: conversations, isLoading } = useConversationList();
  const navigate = useNavigate();

  if (isLoading) return <p className="p-4 text-sm text-gray-400">{t("conv.loading")}</p>;

  if (!conversations || conversations.length === 0) {
    // 빈 상태: GET /conversations가 [] (API.md 13.3절)
    return <p className="p-4 text-sm text-gray-400">{t("conv.empty")}</p>;
  }

  return (
    <div className="divide-y divide-gray-50">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => navigate(`/conversations/${c.id}`)}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{c.otherParticipant.displayName}</p>
            {c.latestMessage && (
              <p className="mt-0.5 truncate text-xs text-gray-400">{c.latestMessage.content}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {c.latestMessage && (
              <span className="text-[11px] text-gray-300">
                {dayjs(c.latestMessage.sentAt).format("M/D HH:mm")}
              </span>
            )}
            {c.unreadCount > 0 && (
              <span className="rounded-full bg-primary-500 px-1.5 text-[11px] text-white">
                {c.unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}