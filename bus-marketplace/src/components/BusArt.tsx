import { useId } from 'react';
import type { BodyType } from '../data/buses';

type View = 'side' | 'front' | 'interior';

type Props = {
  body: BodyType;
  livery: string;
  lengthM?: number;
  seats?: number;
  view?: View;
  className?: string;
  /** Backdrop tone: studio (default), dusk or depot. */
  tone?: 'studio' | 'dusk' | 'depot';
  title?: string;
};

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 0xff) + amount);
  const b = clamp((n & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
}

const tones = {
  studio: ['#f3f2ee', '#e4e2db'],
  dusk: ['#e9ecf2', '#d3d9e4'],
  depot: ['#ecebe6', '#d9d6cd'],
} as const;

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 3} fill="#1b1f27" />
      <circle cx={cx} cy={cy} r={r} fill="#2a2f39" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#b9bec7" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#6b717c" />
    </g>
  );
}

/** Stylised side-profile illustration of a bus, coloured by its livery. */
export function BusArt({ body, livery, lengthM = 12, seats = 50, view = 'side', className, tone = 'studio', title }: Props) {
  const uid = useId().replace(/:/g, '');
  const light = luminance(livery) > 0.78;
  const stroke = light ? '#c9c6bd' : 'none';
  const dark = shade(livery, light ? -40 : -35);
  const glass = '#1c2533';
  const glassHi = '#3a4a62';
  const [bg1, bg2] = tones[tone];

  if (view === 'interior') return <Interior seats={seats} body={body} className={className} bg={[bg1, bg2]} uid={uid} title={title} />;

  const threeAxle = lengthM >= 13 && (body === 'Coach' || body === 'Double-decker');
  const articulated = lengthM >= 17;

  // Geometry per body type (front faces right).
  const g = {
    Coach: { x: 26, w: 348, top: 44, bottom: 150, winTop: 58, winBottom: 100, nose: 22, wheelR: 15 },
    'Double-decker': { x: 26, w: 348, top: 14, bottom: 150, winTop: 26, winBottom: 62, nose: 14, wheelR: 15 },
    Intercity: { x: 26, w: 348, top: 52, bottom: 150, winTop: 64, winBottom: 106, nose: 10, wheelR: 14 },
    'City bus': { x: 26, w: 348, top: 56, bottom: 152, winTop: 66, winBottom: 118, nose: 6, wheelR: 13 },
    Minibus: { x: 84, w: 236, top: 64, bottom: 150, winTop: 74, winBottom: 104, nose: 34, wheelR: 13 },
  }[body];

  const right = g.x + g.w;
  const wheelY = g.bottom - 2;
  const wheels =
    body === 'Minibus'
      ? [g.x + 44, right - 52]
      : articulated
        ? [g.x + 58, g.x + 190, right - 62]
        : threeAxle
          ? [g.x + 70, g.x + 106, right - 64]
          : [g.x + 72, right - 66];

  const bodyPath = `M ${g.x + 8} ${g.bottom}
    L ${g.x + 2} ${g.bottom - 6}
    L ${g.x} ${g.top + 10}
    Q ${g.x} ${g.top} ${g.x + 12} ${g.top}
    L ${right - g.nose - 14} ${g.top}
    Q ${right - g.nose + 2} ${g.top} ${right - 4} ${g.top + g.nose + 18}
    L ${right} ${g.bottom - 10}
    Q ${right} ${g.bottom} ${right - 10} ${g.bottom} Z`;

  // Side windows.
  const winLeft = g.x + 14;
  const winRight = right - g.nose - (body === 'Minibus' ? 8 : 26);
  const panes = body === 'Minibus' ? 4 : body === 'City bus' || body === 'Intercity' ? 6 : 7;
  const paneW = (winRight - winLeft) / panes;

  const doors =
    body === 'City bus'
      ? articulated
        ? [right - 60, g.x + 250, g.x + 130]
        : [right - 56, g.x + 170]
      : body === 'Intercity'
        ? [right - 50, g.x + 180]
        : [];

  const crop = view === 'front' ? `${right - 170} ${g.top - 24} 200 ${g.bottom - g.top + 50}` : '-12 -40 424 265';

  return (
    <svg viewBox={crop} className={className} role="img" aria-label={title ?? `${body} illustration`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg1} />
          <stop offset="1" stopColor={bg2} />
        </linearGradient>
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={glassHi} />
          <stop offset="0.55" stopColor={glass} />
          <stop offset="1" stopColor="#121822" />
        </linearGradient>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(livery, 14)} />
          <stop offset="1" stopColor={shade(livery, -10)} />
        </linearGradient>
        <radialGradient id={`floor-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0e1726" stopOpacity="0.28" />
          <stop offset="1" stopColor="#0e1726" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-200" y="-200" width="800" height="600" fill={`url(#bg-${uid})`} />
      <rect x="-200" y="168" width="800" height="400" fill={bg2} opacity="0.6" />
      <ellipse cx={(g.x + right) / 2} cy={g.bottom + 12} rx={g.w / 2 + 16} ry="9" fill={`url(#floor-${uid})`} />

      <path d={bodyPath} fill={`url(#body-${uid})`} stroke={stroke} strokeWidth="1" />
      {/* Skirt */}
      <path d={`M ${g.x + 4} ${g.bottom - 18} L ${right - 2} ${g.bottom - 18} L ${right} ${g.bottom - 10} Q ${right} ${g.bottom} ${right - 10} ${g.bottom} L ${g.x + 8} ${g.bottom} L ${g.x + 2} ${g.bottom - 6} Z`} fill={dark} opacity="0.9" />

      {/* Livery stripe */}
      {body !== 'City bus' && (
        <path d={`M ${g.x + 2} ${g.winBottom + 16} L ${right - 6} ${g.winBottom + 4} L ${right - 4} ${g.winBottom + 12} L ${g.x + 2} ${g.winBottom + 26} Z`} fill={dark} opacity="0.55" />
      )}

      {/* Side windows */}
      {Array.from({ length: panes }).map((_, i) => (
        <rect key={i} x={winLeft + i * paneW + 1.5} y={g.winTop} width={paneW - 3} height={g.winBottom - g.winTop} rx="3" fill={`url(#glass-${uid})`} />
      ))}

      {/* Upper deck windows */}
      {body === 'Double-decker' &&
        Array.from({ length: 6 }).map((_, i) => {
          const w = (winRight - winLeft) / 6;
          return <rect key={`u${i}`} x={winLeft + i * w + 1.5} y={74} width={w - 3} height={34} rx="3" fill={`url(#glass-${uid})`} />;
        })}

      {/* Windscreen */}
      <path
        d={`M ${right - g.nose - 20} ${g.top + 6} Q ${right - g.nose} ${g.top + 6} ${right - 8} ${g.top + g.nose + 22} L ${right - 5} ${g.winBottom + (body === 'City bus' ? 6 : 14)} L ${right - g.nose - 20} ${g.winBottom + (body === 'City bus' ? 6 : 14)} Z`}
        fill={`url(#glass-${uid})`}
      />
      {/* Reflection */}
      <path d={`M ${winLeft + 10} ${g.winTop + 4} L ${winLeft + 70} ${g.winTop + 4} L ${winLeft + 40} ${g.winBottom - 4} L ${winLeft - 4} ${g.winBottom - 4} Z`} fill="#ffffff" opacity="0.06" />

      {/* Doors */}
      {doors.map((dx, i) => (
        <g key={`d${i}`}>
          <rect x={dx - 30} y={g.winTop - 2} width="30" height={g.bottom - g.winTop - 2} rx="2" fill={glass} />
          <line x1={dx - 15} y1={g.winTop} x2={dx - 15} y2={g.bottom - 4} stroke={glassHi} strokeWidth="1.2" />
        </g>
      ))}
      {body === 'Coach' || body === 'Double-decker' || body === 'Minibus' ? (
        <rect x={right - g.nose - 40} y={g.winBottom + 2} width="14" height={g.bottom - g.winBottom - 22} rx="2" fill={dark} opacity="0.5" />
      ) : null}

      {/* Lights */}
      <rect x={right - 14} y={g.bottom - 30} width="11" height="6" rx="2" fill="#f7f3e3" />
      <rect x={g.x + 1} y={g.bottom - 34} width="5" height="10" rx="1.5" fill="#c0392b" />

      {/* Wheel arches & wheels */}
      {wheels.map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy={wheelY} r={g.wheelR + 7} fill={dark} />
          <Wheel cx={wx} cy={wheelY} r={g.wheelR} />
        </g>
      ))}
      {articulated && <rect x={g.x + 222} y={g.top} width="10" height={g.bottom - g.top - 4} fill="#1b1f27" opacity="0.85" />}
    </svg>
  );
}

function Interior({ seats, body, className, bg, uid, title }: { seats: number; body: BodyType; className?: string; bg: readonly [string, string]; uid: string; title?: string }) {
  const rows = Math.min(16, Math.ceil(seats / 4));
  const city = body === 'City bus';
  return (
    <svg viewBox="0 0 400 200" className={className} role="img" aria-label={title ?? 'Seat layout'} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`ibg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#ibg-${uid})`} />
      <rect x="30" y="50" width="340" height="100" rx="18" fill="#ffffff" stroke="#d6d2c8" />
      <rect x="340" y="62" width="20" height="30" rx="4" fill="#0e1726" opacity="0.8" />
      {Array.from({ length: rows }).map((_, r) => {
        const x = 46 + r * (280 / rows);
        const w = 280 / rows - 4;
        const skip = city && (r === Math.floor(rows / 2) || r === rows - 2);
        return (
          <g key={r}>
            {[58, 76].map((y) => (
              <rect key={y} x={x} y={y} width={w} height="15" rx="3" fill={skip ? '#e8eefc' : '#1d4ed8'} opacity={skip ? 1 : 0.85} />
            ))}
            {[109, 127].map((y) => (
              <rect key={y} x={x} y={y} width={w} height="15" rx="3" fill="#1d4ed8" opacity="0.85" />
            ))}
          </g>
        );
      })}
      <text x="200" y="176" textAnchor="middle" fontSize="11" fill="#5d6676" fontFamily="Inter, sans-serif">
        Seat layout · {seats} seats
      </text>
    </svg>
  );
}
