import { useState } from "react";

interface Props {
  onSendAsIs: (content: string) => void;
  onRequestAIReview: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendAsIs, onRequestAIReview, disabled }: Props) {
  const [content, setContent] = useState("");

  return (
    // 시안: bg Blue/200, border-top Blue/400, padding 20 20 40 20, gap 16
    <div className="flex flex-shrink-0 flex-col items-end gap-4 border-t border-primary-100 bg-primary-50 px-5 pb-10 pt-5">
      {/* 흰색 박스: 텍스트 + 문서첨부(+칩)가 한 박스 안에 (시안 card_text) */}
      <div className="w-full self-stretch rounded-lg border border-gray-200 bg-white p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메시지를 입력하세요."
          rows={2}
          className="w-full resize-none text-sm placeholder:text-gray-400 focus:outline-none"
        />
        <div className="mt-1 flex items-center gap-2">
          {/* 문서 첨부 - 실제 업로드는 첨부 배치(29). 지금은 UI만 */}
          <button
            type="button"
            title="첨부 기능 준비 중"
            className="flex items-center gap-1.5 rounded-md bg-pill-gray px-3 py-2 text-sm text-gray-500 hover:brightness-95"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M0.714294 16.7858V3.21433C0.714294 2.83545 0.864804 2.47209 1.13271 2.20418C1.40062 1.93627 1.76399 1.78576 2.14287 1.78576H7.41429C7.74063 1.77625 8.06038 1.87881 8.3203 2.07635C8.58023 2.2739 8.76465 2.55451 8.84287 2.87148L9.28572 4.64291H17.8572C18.236 4.64291 18.5994 4.79342 18.8673 5.06132C19.1352 5.32923 19.2857 5.6926 19.2857 6.07148V16.7858C19.2857 17.1646 19.1352 17.528 18.8673 17.7959C18.5994 18.0638 18.236 18.2143 17.8572 18.2143H2.14287C1.76399 18.2143 1.40062 18.0638 1.13271 17.7959C0.864804 17.528 0.714294 17.1646 0.714294 16.7858Z" stroke="#9299A3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.1857 8.92859V13.9286" stroke="#9299A3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.68573 11.4286H12.6857" stroke="#9299A3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            문서 첨부
          </button>
        </div>
      </div>

      {/* 버튼 (흰 박스 밖, 민트 배경 위) */}
      <div className="flex gap-2">
        <button
          disabled={disabled || !content.trim()}
          onClick={() => onRequestAIReview(content)}
          className="rounded-md border border-primary-500 px-4 py-2 text-sm font-medium text-primary-600 disabled:opacity-50"
        >
          AI 검토하기
        </button>
        <button
          disabled={disabled || !content.trim()}
          onClick={() => {
            onSendAsIs(content);
            setContent("");
          }}
          className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          전송하기
        </button>
      </div>
    </div>
  );
}