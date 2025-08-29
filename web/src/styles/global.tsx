import { css, Global, useTheme } from '@emotion/react';

export default function GlobalStyle() {
  const t = useTheme();
  return (
    <Global
      styles={css`
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
          font-family:
            ui-sans-serif,
            system-ui,
            -apple-system,
            Segoe UI,
            Roboto,
            'Noto Sans KR',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
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
      `}
    />
  );
}
