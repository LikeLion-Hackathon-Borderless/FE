import { useState } from "react";

interface Props {
  onSendAsIs: (content: string) => void;
  onRequestAIReview: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendAsIs, onRequestAIReview, disabled }: Props) {
  const [content, setContent] = useState("");

  return (
    <div className="border-t border-gray-100 bg-primary-50 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="메시지를 입력하세요."
        rows={2}
        className="w-full resize-none rounded border border-gray-200 bg-white p-3 text-sm"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          disabled={disabled || !content.trim()}
          onClick={() => onRequestAIReview(content)}
          className="rounded border border-primary-500 px-4 py-2 text-sm text-primary-600 disabled:opacity-50"
        >
          AI 검토하기
        </button>
        <button
          disabled={disabled || !content.trim()}
          onClick={() => {
            onSendAsIs(content);
            setContent("");
          }}
          className="rounded bg-primary-500 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          전송하기
        </button>
      </div>
    </div>
  );
}
