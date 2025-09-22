import { css, Global, useTheme } from '@emotion/react';

export default function GlobalStyle() {
  const t = useTheme();
  return (
    <Global
      styles={css`
        /* 1) Pretendard Variable 등록 */
        @font-face {
          font-family: 'Pretendard Variable';
          font-weight: 45 920;
          font-style: normal;
          font-display: swap;
          src: url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/woff2/PretendardVariable.woff2')
            format('woff2-variations');
        }

        /* 2) 전역 폰트 변수 */
        :root {
          --font-sans:
            'Pretendard Variable', ui-sans-serif, system-ui, -apple-system,
            Segoe UI, Roboto, 'Noto Sans KR', Helvetica, Arial,
            'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          height: 100%;
        }

        body {
          margin: 0;
          background: ${t.colors.bg};
          color: ${t.colors.text};
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font: inherit;
          background: none;
          border: none;
          cursor: pointer;
        }

        ::selection {
          background: rgba(255, 255, 255, 0.18);
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}
    />
  );
}
