import { useState } from "react";
import { useInviteByEmail, useCreateInvitationLink } from "../hooks/useInvitations";
import type { InviteEmailResult } from "@/types/workspace";

const STATUS_LABEL: Record<string, string> = {
  SENT: "발송됨",
  ALREADY_INVITED: "이미 초대됨",
  ALREADY_MEMBER: "이미 멤버",
  FAILED: "실패",
};

export function InviteMembersModal({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"email" | "link">("email");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">멤버 초대</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="mb-3 flex gap-1 rounded-md bg-gray-50 p-0.5 text-xs">
          <button
            onClick={() => setTab("email")}
            className={`flex-1 rounded px-2 py-1.5 ${tab === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            이메일로 초대
          </button>
          <button
            onClick={() => setTab("link")}
            className={`flex-1 rounded px-2 py-1.5 ${tab === "link" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            공유 링크
          </button>
        </div>

        {tab === "email" ? (
          <EmailInviteTab workspaceId={workspaceId} />
        ) : (
          <LinkInviteTab workspaceId={workspaceId} />
        )}
      </div>
    </div>
  );
}

function EmailInviteTab({ workspaceId }: { workspaceId: string }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const inviteByEmail = useInviteByEmail();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const addDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setInputError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (emails.includes(trimmed)) {
      setDraft("");
      return;
    }
    // 최대 20개 (API.md 7.5절)
    if (emails.length >= 20) {
      setInputError("한 번에 최대 20개까지 초대할 수 있습니다.");
      return;
    }
    setEmails((prev) => [...prev, trimmed]);
    setDraft("");
    setInputError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 쉼표/Enter로 이메일 확정 (API.md 7.5절)
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDraft();
    }
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSend = () => {
    if (emails.length === 0) return;
    inviteByEmail.mutate({ workspaceId, emails });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded border border-gray-200 p-2">
        {emails.map((email) => (
          <span
            key={email}
            className="flex items-center gap-1 rounded bg-primary-50 px-2 py-1 text-xs text-gray-700"
          >
            {email}
            <button onClick={() => removeEmail(email)} aria-label={`${email} 제거`}>
              ✕
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setInputError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={addDraft}
          placeholder={emails.length === 0 ? "이메일 입력 후 Enter" : ""}
          className="min-w-[120px] flex-1 text-sm outline-none"
        />
      </div>

      {inputError && <p className="text-xs text-red-500">{inputError}</p>}

      <button
        onClick={handleSend}
        disabled={emails.length === 0 || inviteByEmail.isPending}
        className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
      >
        {inviteByEmail.isPending ? "보내는 중..." : `${emails.length || ""} 명 초대하기`}
      </button>

      {inviteByEmail.data && <InviteResultList result={inviteByEmail.data} />}
    </div>
  );
}

function InviteResultList({ result }: { result: InviteEmailResult }) {
  return (
    <div className="mt-2 space-y-1 rounded border border-gray-100 bg-gray-50 p-2">
      {result.results.map((r) => (
        <div key={r.email} className="flex items-center justify-between text-xs">
          <span className="truncate text-gray-600">{r.email}</span>
          <span
            className={
              r.status === "SENT"
                ? "text-primary-600"
                : r.status === "FAILED"
                  ? "text-red-500"
                  : "text-gray-400"
            }
          >
            {STATUS_LABEL[r.status] ?? r.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function LinkInviteTab({ workspaceId }: { workspaceId: string }) {
  const createLink = useCreateInvitationLink();
  const [copied, setCopied] = useState(false);

  const handleGenerate = (regenerate: boolean) => {
    setCopied(false);
    createLink.mutate({ workspaceId, expiresInDays: 7, regenerate });
  };

  const handleCopy = async () => {
    if (!createLink.data) return;
    await navigator.clipboard.writeText(createLink.data.inviteUrl);
    setCopied(true);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        링크를 받은 사람은 로그인 후 워크스페이스에 자동으로 합류합니다. 기본 7일간 유효합니다.
      </p>

      {!createLink.data ? (
        <button
          onClick={() => handleGenerate(false)}
          disabled={createLink.isPending}
          className="w-full rounded bg-primary-500 py-2 text-sm text-white disabled:opacity-50"
        >
          {createLink.isPending ? "생성 중..." : "초대 링크 생성"}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded border border-gray-200 p-2">
            <input
              readOnly
              value={createLink.data.inviteUrl}
              className="flex-1 truncate text-xs text-gray-600 outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
          <button
            onClick={() => handleGenerate(true)}
            disabled={createLink.isPending}
            className="w-full rounded border border-gray-200 py-2 text-xs text-gray-500 hover:bg-gray-50"
          >
            링크 재발급 (기존 링크 무효화)
          </button>
        </>
      )}
    </div>
  );
}
