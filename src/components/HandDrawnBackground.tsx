'use client';

import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';

const W = 900;
const H = 520;
const GROUND_Y = 410;
const SCROLL_SPEED = 18;
const BOIL_MS = 100;

export default function HandDrawnBackground() {
  const bgRef     = useRef<SVGSVGElement>(null);
  const dskSunRef = useRef<SVGSVGElement>(null);
  const sunRef    = useRef<SVGSVGElement>(null);
  const cloudRef  = useRef<SVGSVGElement>(null);
  const fgRef     = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!bgRef.current || !dskSunRef.current || !sunRef.current || !cloudRef.current || !fgRef.current) return;

    const bg     = bgRef.current;
    const dskSun = dskSunRef.current;
    const sun    = sunRef.current;
    const cloud  = cloudRef.current;
    const fg     = fgRef.current;

    const rcBg     = rough.svg(bg);
    const rcDskSun = rough.svg(dskSun);
    const rcSun    = rough.svg(sun);
    const rcCloud  = rough.svg(cloud);
    const rcFg     = rough.svg(fg);

    let frame = 0;
    const start = performance.now();
    let lastBoil = start;
    let boilTick = 1;

    const draw = () => {
      const now = performance.now();
      const t   = (now - start) / 1000;
      if (now - lastBoil > BOIL_MS) {
        boilTick = (boilTick % 6) + 1;
        lastBoil = now;
      }
      renderBackground(bg, rcBg, t, boilTick);
      renderDesktopSun(dskSun, rcDskSun, boilTick);
      renderMobileSun(sun, rcSun, boilTick);
      renderClouds(cloud, rcCloud, t, boilTick);
      renderForeground(fg, rcFg, t, boilTick);
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, background: 'linear-gradient(180deg, #f5e8cf 0%, #ecd7ad 55%, #d9c290 100%)' }}
    >
      <svg ref={bgRef}     viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full block" />
      <svg ref={dskSunRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full block hidden md:block" />
      <svg ref={sunRef}    viewBox="0 0 200 200"      className="absolute top-3 left-3 sm:top-5 sm:left-5 w-20 sm:w-24 h-auto md:hidden" />
      <svg ref={cloudRef}  viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full block" />
      <svg ref={fgRef}     viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full block" />
    </div>
  );
}

function makeMirror(rootSvg: SVGSVGElement) {
  while (rootSvg.firstChild) rootSvg.removeChild(rootSvg.firstChild);
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${W}, 0) scale(-1, 1)`);
  rootSvg.appendChild(g);
  return g;
}

function renderBackground(rootSvg: SVGSVGElement, rc: RoughSVG, t: number, boilTick: number) {
  const svg  = makeMirror(rootSvg);
  const seed = (offset = 0) => ((boilTick + offset) % 6) + 1;

  svg.appendChild(rc.rectangle(0, 0, W, GROUND_Y, {
    stroke: 'none', fill: '#f7eed5', fillStyle: 'solid', roughness: 0,
  }));

  const farScroll = (t * SCROLL_SPEED * 0.18) % 320;
  for (let i = -1; i < 5; i++) {
    const x = i * 320 + farScroll;
    svg.appendChild(rc.path(
      `M ${x} ${GROUND_Y} Q ${x + 160} ${GROUND_Y - 95} ${x + 320} ${GROUND_Y}`,
      { stroke: '#9aa888', strokeWidth: 2, roughness: 2.2, seed: seed(i + 10) },
    ));
  }
}

function renderDesktopSun(rootSvg: SVGSVGElement, rc: RoughSVG, boilTick: number) {
  const svg  = makeMirror(rootSvg);
  const seed = (offset = 0) => ((boilTick + offset) % 6) + 1;

  const sunX = 180, sunY = 110;
  svg.appendChild(rc.circle(sunX, sunY, 100, {
    stroke: '#c97a3a', strokeWidth: 2.5,
    fill: '#f5b258', fillStyle: 'zigzag', fillWeight: 1.5, hachureGap: 6,
    roughness: 2.2, seed: seed(0),
  }));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    svg.appendChild(rc.line(
      sunX + Math.cos(a) * 58, sunY + Math.sin(a) * 58,
      sunX + Math.cos(a) * 78, sunY + Math.sin(a) * 78,
      { stroke: '#c97a3a', strokeWidth: 2.5, roughness: 2, seed: seed(i + 1) },
    ));
  }
}

function renderClouds(rootSvg: SVGSVGElement, rc: RoughSVG, t: number, boilTick: number) {
  const svg  = makeMirror(rootSvg);
  const seed = (offset = 0) => ((boilTick + offset) % 6) + 1;

  const cloudScroll = (t * SCROLL_SPEED * 0.12) % 1300;
  const clouds: Array<[number, number, number, number]> = [
    [120, 70, 110, 30], [420, 95, 140, 38],
    [720, 60, 95, 28],  [1010, 100, 125, 34],
  ];
  clouds.forEach(([bx, y, w, h], i) => {
    const x = ((bx + cloudScroll) % 1300 + 1300) % 1300 - 200;
    svg.appendChild(rc.ellipse(x, y, w, h, {
      stroke: '#7a6a5a', strokeWidth: 1.5,
      fill: '#fdf6e6', fillStyle: 'solid',
      roughness: 1.8, seed: seed(i + 20),
    }));
  });
}

function renderForeground(rootSvg: SVGSVGElement, rc: RoughSVG, t: number, boilTick: number) {
  const svg  = makeMirror(rootSvg);
  const seed = (offset = 0) => ((boilTick + offset) % 6) + 1;

  const midScroll = (t * SCROLL_SPEED * 0.4) % 270;
  for (let i = -1; i < 6; i++) {
    const x = i * 270 + midScroll;
    svg.appendChild(rc.path(
      `M ${x} ${GROUND_Y} Q ${x + 135} ${GROUND_Y - 60} ${x + 270} ${GROUND_Y}`,
      { stroke: '#6a7a52', strokeWidth: 2, fill: '#a8b682', fillStyle: 'hachure', fillWeight: 1, hachureGap: 8, roughness: 1.8, seed: seed(i + 30) },
    ));
  }

  const treeScroll = (t * SCROLL_SPEED * 0.55) % 200;
  for (let i = -1; i < 7; i++) {
    const x = i * 200 + treeScroll + 50;
    svg.appendChild(rc.line(x, GROUND_Y, x, GROUND_Y - 65, {
      stroke: '#4a3018', strokeWidth: 2.2, roughness: 1.5, seed: seed(i + 40),
    }));
    svg.appendChild(rc.circle(x, GROUND_Y - 80, 48, {
      stroke: '#3a5018', strokeWidth: 2,
      fill: '#7aa048', fillStyle: 'cross-hatch', fillWeight: 1, hachureGap: 7,
      roughness: 2, seed: seed(i + 50),
    }));
  }

  svg.appendChild(rc.line(0, GROUND_Y, W, GROUND_Y, {
    stroke: '#3a2818', strokeWidth: 2.5, roughness: 1.5, seed: 60,
  }));

  const grassScroll = (t * SCROLL_SPEED * 0.55) % 55;
  for (let i = -1; i < 19; i++) {
    const x = i * 55 + grassScroll;
    const h = 7 + ((i * 11) % 9);
    svg.appendChild(rc.line(x, GROUND_Y, x + 3, GROUND_Y - h, {
      stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: i + 70,
    }));
    svg.appendChild(rc.line(x + 8, GROUND_Y, x + 6, GROUND_Y - h + 2, {
      stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: i + 80,
    }));
    svg.appendChild(rc.line(x + 14, GROUND_Y, x + 12, GROUND_Y - h - 1, {
      stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: i + 90,
    }));
  }
}

function renderMobileSun(svg: SVGSVGElement, rc: RoughSVG, boilTick: number) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const seed = (offset = 0) => ((boilTick + offset) % 6) + 1;

  const cx = 100, cy = 100;
  svg.appendChild(rc.circle(cx, cy, 90, {
    stroke: '#c97a3a', strokeWidth: 2.5,
    fill: '#f5b258', fillStyle: 'zigzag', fillWeight: 1.5, hachureGap: 6,
    roughness: 2.2, seed: seed(0),
  }));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    svg.appendChild(rc.line(
      cx + Math.cos(a) * 52, cy + Math.sin(a) * 52,
      cx + Math.cos(a) * 72, cy + Math.sin(a) * 72,
      { stroke: '#c97a3a', strokeWidth: 2.5, roughness: 2, seed: seed(i + 1) },
    ));
  }
}

