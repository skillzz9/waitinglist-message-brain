'use client';

import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';

const VB_W = 400;
const VB_H = 500;

export default function KiteLogoPage() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const rc = rough.svg(svg);
    drawStaticKite(svg, rc);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-8">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full max-w-[420px] h-auto"
      />
    </main>
  );
}

function drawStaticKite(svg: SVGSVGElement, rc: RoughSVG) {
  const cx = 200;
  const cy = 165;
  const rot = -0.12; // slight tilt for personality
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  // Diamond body — bigger than the animated version so it reads as a logo
  const diamond: Array<[number, number]> = (
    [
      [0, -90],
      [65, 0],
      [0, 90],
      [-65, 0],
    ] as Array<[number, number]>
  ).map(([x, y]) => [
    cx + x * cos - y * sin,
    cy + x * sin + y * cos,
  ]);

  // Kite face
  svg.appendChild(
    rc.polygon(diamond, {
      stroke: '#5a2818',
      strokeWidth: 4,
      fill: '#e84548',
      fillStyle: 'hachure',
      fillWeight: 3,
      hachureGap: 11,
      roughness: 2,
      seed: 3,
    }),
  );

  // Cross brace — vertical
  svg.appendChild(
    rc.line(diamond[0][0], diamond[0][1], diamond[2][0], diamond[2][1], {
      stroke: '#5a2818',
      strokeWidth: 2.8,
      roughness: 1.2,
      seed: 5,
    }),
  );
  // Cross brace — horizontal
  svg.appendChild(
    rc.line(diamond[1][0], diamond[1][1], diamond[3][0], diamond[3][1], {
      stroke: '#5a2818',
      strokeWidth: 2.8,
      roughness: 1.2,
      seed: 7,
    }),
  );

  // Static tail — gentle frozen wave, no animation
  let tx = diamond[2][0];
  let ty = diamond[2][1];
  for (let i = 1; i <= 8; i++) {
    const wave = Math.sin(i * 0.95) * 18;
    const nx = tx + 14 + wave * 0.5;
    const ny = ty + 22;
    svg.appendChild(
      rc.line(tx, ty, nx, ny, {
        stroke: '#e84548',
        strokeWidth: 3.5,
        roughness: 2,
        seed: 10 + i,
      }),
    );
    // Decorative bows every other segment
    if (i % 2 === 1) {
      svg.appendChild(
        rc.line(nx - 10, ny - 5, nx + 12, ny - 2, {
          stroke: '#f0c548',
          strokeWidth: 3.2,
          roughness: 1.8,
          seed: 30 + i,
        }),
      );
    }
    tx = nx;
    ty = ny;
  }
}
