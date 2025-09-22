// src/hooks/useConstellation.ts
import { useEffect, useRef } from 'react';

export function useConstellation() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const stars: { x: number; y: number; vx: number; vy: number; r: number }[] =
      [];

    const gen = () => {
      stars.length = 0;
      const { clientWidth: w, clientHeight: h } = canvas;
      const count = Math.floor((w * h) / 14000); // 화면 크기에 따른 밀도
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    };

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * DPR);
      canvas.height = Math.floor(clientHeight * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      gen();
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // 별
      ctx.save();
      for (const s of stars) {
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      // 연결선
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.hypot(dx, dy);
          const max = 120;
          if (dist < max) {
            const a = 1 - dist / max;
            ctx.globalAlpha = a * 0.5;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 이동
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;
      }

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => resize();

    resize();
    draw();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return ref;
}
