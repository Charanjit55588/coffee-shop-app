// Flat illustrations for each product, drawn as inline SVG so the app needs no
// image files. To use a real photo instead, give the product an `image` URL in
// server/seed.js (for example "/images/ceramic-mug.jpg" served from public/).

const INK = '#3b2f28';

const ART = {
  'ethiopia-yirgacheffe': { kind: 'bag', bg: '#f1e7dc', main: '#c8a27a', label: '#f7efe3' },
  'colombia-supremo': { kind: 'bag', bg: '#f3e4de', main: '#8c3b2e', label: '#f7efe3' },
  'sumatra-mandheling': { kind: 'bag', bg: '#e9e4e0', main: '#2b2522', label: '#e9d8c4' },
  'house-espresso-blend': { kind: 'bag', bg: '#e1ece9', main: '#2f5d57', label: '#f1e9da' },
  'brazil-santos-green': { kind: 'beans', bg: '#e8eedd', main: '#a3b46f', sack: '#cdb48c' },
  'guatemala-huehuetenango-green': { kind: 'beans', bg: '#e3ead8', main: '#7f9a5a', sack: '#bfa47a' },
  'insulated-tumbler': { kind: 'tumbler', bg: '#e2eaf0', main: '#3f6e8c' },
  'travel-tumbler': { kind: 'tumbler', bg: '#f3e3dd', main: '#c0563b', slim: true },
  'ceramic-mug': { kind: 'mug', bg: '#e6e9ed', main: '#faf8f5' },
  'double-wall-glass-mug': { kind: 'glassMug', bg: '#ede7e1' },
  'paper-coffee-cups': { kind: 'paperCup', bg: '#f0e8df', main: '#b88a5e' },
  'espresso-cup-set': { kind: 'espressoCups', bg: '#e4e7eb', main: '#ffffff' },
  'pour-over-dripper': { kind: 'dripper', bg: '#eee7df', main: '#e4dccf' },
  'hand-grinder': { kind: 'grinder', bg: '#e6e8ea', main: '#6b7178', wood: '#a0704c' },
};

const CATEGORY_DEFAULT = {
  roasted: { kind: 'bag', bg: '#f1e7dc', main: '#c8a27a', label: '#f7efe3' },
  unroasted: { kind: 'beans', bg: '#e8eedd', main: '#a3b46f', sack: '#cdb48c' },
  tumblers: { kind: 'tumbler', bg: '#e2eaf0', main: '#3f6e8c' },
  mugs: { kind: 'mug', bg: '#e6e9ed', main: '#faf8f5' },
  cups: { kind: 'paperCup', bg: '#f0e8df', main: '#b88a5e' },
  brewing: { kind: 'dripper', bg: '#eee7df', main: '#e4dccf' },
};

const stroke = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' };

function Bean({ x, y, r = 0, fill, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <ellipse rx="9" ry="6" fill={fill} {...stroke} strokeWidth={1.6} />
      <path d="M -6 0.5 Q 0 -3 6 0.5" fill="none" {...stroke} strokeWidth={1.4} />
    </g>
  );
}

function Steam({ x }) {
  return (
    <g fill="none" {...stroke} strokeWidth={1.8} opacity="0.55">
      <path d={`M ${x} 32 q -5 -6 0 -12 q 5 -6 0 -12`} />
      <path d={`M ${x + 12} 34 q -5 -6 0 -12 q 5 -6 0 -12`} />
    </g>
  );
}

const DRAW = {
  bag: (a) => (
    <>
      <path d="M50 38 L110 38 L117 106 L43 106 Z" fill={a.main} {...stroke} />
      <path d="M50 24 L110 24 L110 38 L50 38 Z" fill={a.main} {...stroke} />
      <path d="M56 24 v14 M64 24 v14 M72 24 v14 M80 24 v14 M88 24 v14 M96 24 v14 M104 24 v14" {...stroke} strokeWidth={1} opacity="0.35" />
      <rect x="58" y="56" width="44" height="34" rx="4" fill={a.label} {...stroke} />
      <Bean x={80} y={70} r={-20} fill={a.main} />
      <path d="M66 82 h28" {...stroke} strokeWidth={1.6} opacity="0.6" />
      <circle cx="80" cy="46" r="3" fill={a.label} {...stroke} strokeWidth={1.4} />
    </>
  ),
  beans: (a) => (
    <>
      <path d="M36 74 Q36 106 80 106 Q124 106 124 74 Z" fill={a.sack} {...stroke} />
      <path d="M36 74 Q80 60 124 74" fill="none" {...stroke} />
      {[
        [56, 68, -15], [72, 62, 20], [90, 63, -30], [106, 68, 10], [64, 74, 40],
        [82, 72, -5], [98, 75, 30], [74, 52, 70], [90, 52, -50], [82, 42, 10],
      ].map(([x, y, r]) => (
        <Bean key={`${x}-${y}`} x={x} y={y} r={r} fill={a.main} />
      ))}
      <path d="M48 90 l6 4 M68 96 l6 -3 M92 96 l6 3 M110 88 l-5 5" {...stroke} strokeWidth={1.2} opacity="0.4" />
    </>
  ),
  tumbler: (a) => {
    const w = a.slim ? 28 : 36;
    const l = 80 - w / 2;
    return (
      <>
        <rect x={l - 3} y="20" width={w + 6} height="12" rx="5" fill="#2f2a27" {...stroke} />
        <rect x={l + w / 2 - 6} y="16" width="12" height="6" rx="2" fill="#2f2a27" {...stroke} strokeWidth={1.6} />
        <path d={`M${l} 32 L${l + w} 32 L${l + w - 4} 106 L${l + 4} 106 Z`} fill={a.main} {...stroke} />
        <path d={`M${l + 1} 48 L${l + w - 1} 48`} {...stroke} strokeWidth={1.4} opacity="0.5" />
        <path d={`M${l + 7} 56 L${l + 6} 96`} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      </>
    );
  },
  mug: (a) => (
    <>
      <Steam x={70} />
      <path d="M102 58 q22 0 22 18 q0 18 -22 18" fill="none" {...stroke} strokeWidth={10} />
      <path d="M102 58 q22 0 22 18 q0 18 -22 18" fill="none" stroke={a.main} strokeWidth="6" strokeLinecap="round" />
      <rect x="46" y="44" width="58" height="60" rx="10" fill={a.main} {...stroke} />
      <ellipse cx="75" cy="47" rx="25" ry="3" fill="#6f4e37" opacity="0.9" />
    </>
  ),
  glassMug: () => (
    <>
      <path d="M102 56 q20 0 20 18 q0 18 -20 18" fill="none" {...stroke} strokeWidth={8} opacity="0.6" />
      <rect x="46" y="40" width="58" height="66" rx="8" fill="#ffffff" fillOpacity="0.55" {...stroke} />
      <rect x="52" y="74" width="46" height="26" rx="4" fill="#6f4e37" />
      <rect x="52" y="60" width="46" height="14" fill="#d9b48f" />
      <rect x="52" y="52" width="46" height="8" rx="3" fill="#f6efe6" />
      <path d="M58 48 L58 98" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  paperCup: (a) => (
    <>
      <g transform="translate(-14 4)">
        <rect x="68" y="32" width="46" height="9" rx="4" fill="#f5f2ee" {...stroke} />
        <path d="M70 41 L112 41 L105 102 L77 102 Z" fill="#ffffff" {...stroke} />
        <path d="M72 58 L110 58 L107 80 L75 80 Z" fill={a.main} {...stroke} />
      </g>
      <g transform="translate(22 -4)" opacity="0.92">
        <rect x="68" y="32" width="46" height="9" rx="4" fill="#f5f2ee" {...stroke} />
        <path d="M70 41 L112 41 L105 102 L77 102 Z" fill="#ffffff" {...stroke} />
        <path d="M72 58 L110 58 L107 80 L75 80 Z" fill={a.main} {...stroke} />
      </g>
    </>
  ),
  espressoCups: (a) => (
    <>
      {[54, 106].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="90" rx="24" ry="6" fill={a.main} {...stroke} />
          <path d={`M${cx + 14} 70 q10 0 10 7 q0 7 -10 7`} fill="none" {...stroke} strokeWidth={3} />
          <path d={`M${cx - 16} 62 L${cx + 16} 62 L${cx + 13} 84 Q${cx} 90 ${cx - 13} 84 Z`} fill={a.main} {...stroke} />
          <ellipse cx={cx} cy="63" rx="14" ry="2.5" fill="#6f4e37" />
        </g>
      ))}
      <Steam x={48} />
    </>
  ),
  dripper: (a) => (
    <>
      <rect x="58" y="80" width="44" height="26" rx="6" fill="#ffffff" {...stroke} />
      <path d="M44 72 L116 72" {...stroke} strokeWidth={4} />
      <path d="M48 30 L112 30 L94 70 L66 70 Z" fill={a.main} {...stroke} />
      <path d="M58 36 L102 36 L90 62 L70 62 Z" fill="#f7f1e8" {...stroke} strokeWidth={1.4} opacity="0.9" />
      <path d="M68 44 L92 44" {...stroke} strokeWidth={1.2} opacity="0.4" />
      <path d="M80 72 L80 82" stroke="#6f4e37" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  grinder: (a) => (
    <>
      <path d="M80 34 L80 24 L114 18" fill="none" {...stroke} strokeWidth={4} />
      <circle cx="116" cy="18" r="6" fill={a.wood} {...stroke} />
      <rect x="62" y="34" width="36" height="16" rx="4" fill={a.main} {...stroke} />
      <rect x="64" y="50" width="32" height="40" rx="3" fill={a.main} {...stroke} />
      <path d="M64 62 h32 M64 66 h32" {...stroke} strokeWidth={1} opacity="0.4" />
      <rect x="60" y="90" width="40" height="16" rx="4" fill={a.wood} {...stroke} />
    </>
  ),
};

export default function ProductArt({ product }) {
  const art = ART[product.id] || CATEGORY_DEFAULT[product.category] || CATEGORY_DEFAULT.roasted;
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" className="product-art" aria-hidden="true">
      <rect width="160" height="120" fill={art.bg} />
      <ellipse cx="80" cy="108" rx="48" ry="5" fill={INK} opacity="0.08" />
      {DRAW[art.kind](art)}
    </svg>
  );
}
