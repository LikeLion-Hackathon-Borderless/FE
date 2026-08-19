/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "420px", // 초소형 폰에서 배지 등 일부 요소 숨김 처리용 (기본 tailwind엔 없어서 추가)
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Ditto 시안 민트 계열 (primary-500 = 시안에서 확인한 #32DDDB)
        primary: {
          50: "#E9FBFB",   // Blue/200 (입력창 배경)
          100: "#BAF3F2",  // Blue/400 (테두리)
          500: "#32DDDB",
          600: "#1AA2A0",  // Blue/600
        },
        // 시안 확정 토큰 (Figma에서 hex 확인)
        ink: "#323538",      // 검정 버튼 배경
        warn: "#FF4040",     // 경고 빨강 (미확정/근무충돌 글자)
        "block-gray": "#E1E7EE", // 질문블록 배경
        "pill-gray": "#F1F5F9",  // 안 선택된 pill 배경
        surface: "#F1F5F9",      // AI 패널 배경
      },
      borderRadius: {
        pill: "30px", // 시안 pill corner radius
      },
      width: {
        panel: "362px", // AI 검토 패널 고정 폭
      },
    },
  },
  plugins: [],
};