// Hand-drawn SVG illustrations. Colours come from CSS variables so the palette lives in index.css.
const S = { stroke: 'var(--ink)', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }

export function Hero() {
  return (
    <svg viewBox="0 0 360 230" role="img" aria-label="京都插圖：五重塔、鳥居、楓葉與嵐山小火車" className="hero-art">
      <rect x="2" y="2" width="356" height="226" rx="28" fill="var(--blue)" {...S} />
      <g className="sun"><circle cx="294" cy="56" r="26" fill="var(--yellow)" {...S} /></g>
      <g className="cloud c1"><path d="M30 70q0-16 16-16 6-14 22-8 12-6 20 6 14 2 14 16z" fill="#fff" {...S} /></g>
      <g className="cloud c2"><path d="M196 40q0-12 12-12 5-10 17-6 9-4 15 5 10 1 10 13z" fill="#fff" {...S} /></g>
      {/* hills */}
      <path d="M3 170q50-60 110-24t110-14q60 6 134 44v50H3z" fill="var(--green)" {...S} />
      {/* pagoda */}
      <g>
        <rect x="104" y="96" width="30" height="76" fill="var(--paper)" {...S} />
        <path d="M92 112h54l-8-12H100z" fill="var(--coral)" {...S} />
        <path d="M96 138h46l-7-11h-32z" fill="var(--coral)" {...S} />
        <path d="M88 172h62l-9-14H97z" fill="var(--coral)" {...S} />
        <path d="M110 96h18l-9-22z" fill="var(--coral)" {...S} />
        <path d="M119 74V62" {...S} />
      </g>
      {/* torii */}
      <g>
        <path d="M200 176V118M262 176V118" fill="none" stroke="var(--ink)" strokeWidth="9" strokeLinecap="round" />
        <path d="M200 176V118M262 176V118" fill="none" stroke="var(--coral)" strokeWidth="3" strokeLinecap="round" />
        <path d="M188 114q43 12 86 0l-4-12q-39 8-78 0z" fill="var(--coral)" {...S} />
        <path d="M204 132h54" {...S} />
      </g>
      {/* maple tree */}
      <g>
        <path d="M312 190v-34" {...S} />
        <circle cx="312" cy="140" r="24" fill="var(--coral)" {...S} />
        <circle cx="292" cy="154" r="14" fill="var(--yellow)" {...S} />
      </g>
      {/* train */}
      <g className="train">
        <rect x="6" y="190" width="62" height="24" rx="8" fill="var(--yellow)" {...S} />
        <rect x="14" y="196" width="12" height="9" rx="2" fill="#fff" {...S} />
        <rect x="32" y="196" width="12" height="9" rx="2" fill="#fff" {...S} />
        <circle cx="20" cy="216" r="5" fill="var(--paper)" {...S} />
        <circle cx="54" cy="216" r="5" fill="var(--paper)" {...S} />
      </g>
      <path d="M3 218h354" stroke="var(--ink)" strokeWidth="3" />
      {/* falling leaves */}
      <path className="leaf l1" d="M60 20l5 9 9 2-7 7 2 10-9-5-9 5 2-10-7-7 9-2z" fill="var(--coral)" {...S} />
      <path className="leaf l2" d="M160 10l4 7 7 2-5 6 1 8-7-4-7 4 1-8-5-6 7-2z" fill="var(--yellow)" {...S} />
      <path className="leaf l3" d="M250 14l4 7 7 2-5 6 1 8-7-4-7 4 1-8-5-6 7-2z" fill="var(--coral)" {...S} />
    </svg>
  )
}

const PAL = { coral: 'var(--coral)', yellow: 'var(--yellow)', blue: 'var(--blue)', green: 'var(--green)' }

// Small 64x64 day icons.
export function DayIcon({ name, color }) {
  const c = PAL[color]
  const body = {
    tower: (<>
      <path d="M32 6v10M24 54l5-30h6l5 30M22 54h22" {...S} fill="none" />
      <rect x="22" y="16" width="20" height="10" rx="3" fill="var(--paper)" {...S} />
      <path d="M26 54l6-24 6 24z" fill="var(--coral)" {...S} />
    </>),
    crab: (<>
      <ellipse cx="32" cy="38" rx="18" ry="12" fill="var(--coral)" {...S} />
      <path d="M12 30q-8-4-4-14 6 2 8 10M52 30q8-4 4-14-6 2-8 10M16 46l-6 6M48 46l6 6M24 50l-2 7M40 50l2 7" {...S} fill="none" />
      <circle cx="26" cy="32" r="3" fill="var(--paper)" {...S} /><circle cx="38" cy="32" r="3" fill="var(--paper)" {...S} />
    </>),
    train: (<>
      <rect x="8" y="14" width="48" height="32" rx="10" fill="var(--paper)" {...S} />
      <rect x="14" y="20" width="14" height="12" rx="3" fill={c} {...S} /><rect x="36" y="20" width="14" height="12" rx="3" fill={c} {...S} />
      <path d="M8 38h48M16 54l6-8M48 54l-6-8" {...S} fill="none" />
    </>),
    tea: (<>
      <path d="M10 26h40v10q0 16-20 16T10 36z" fill="var(--green)" {...S} />
      <path d="M50 30h4q6 0 6 6t-10 8" fill="none" {...S} />
      <path d="M22 18q-4-6 0-10M34 18q-4-6 0-10" fill="none" {...S} />
    </>),
    pagoda: (<>
      <rect x="22" y="22" width="20" height="30" fill="var(--paper)" {...S} />
      <path d="M12 28h40l-6-9H18zM8 52h48l-6-10H14zM22 19h20l-10-14z" fill="var(--coral)" {...S} />
    </>),
    maple: (<>
      <path d="M32 6l7 14 15-4-7 14 11 8-15 3 1 15-12-9-12 9 1-15-15-3 11-8-7-14 15 4z" fill="var(--coral)" {...S} />
      <path d="M32 34v22" {...S} fill="none" />
    </>),
    bamboo: (<>
      <rect x="14" y="6" width="12" height="52" rx="5" fill="var(--green)" {...S} />
      <rect x="38" y="12" width="12" height="46" rx="5" fill="var(--green)" {...S} />
      <path d="M14 22h12M14 40h12M38 28h12M38 46h12" {...S} fill="none" />
    </>),
    deer: (<>
      <path d="M22 18l-8-10M22 18l-2-8M42 18l8-10M42 18l2-8" {...S} fill="none" />
      <path d="M18 24q14-10 28 0v14q0 16-14 18-14-2-14-18z" fill="var(--yellow)" {...S} />
      <circle cx="26" cy="34" r="2.5" fill="var(--ink)" /><circle cx="38" cy="34" r="2.5" fill="var(--ink)" />
      <ellipse cx="32" cy="47" rx="6" ry="4" fill="var(--paper)" {...S} />
    </>),
    plane: (<>
      <path d="M6 36l50-22-14 38-12-12-12 6z" fill="var(--paper)" {...S} />
      <path d="M30 40l26-26" {...S} fill="none" />
    </>),
  }[name]
  return (
    <svg viewBox="0 0 64 64" className="day-icon" aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" fill={c} stroke="none" opacity="0" />
      {body}
    </svg>
  )
}

export function Lantern() {
  return (
    <svg viewBox="0 0 40 44" aria-hidden="true" className="lantern">
      <path d="M20 2v6" {...S} fill="none" />
      <rect x="6" y="8" width="28" height="30" rx="12" fill="var(--coral)" {...S} />
      <path d="M12 8q-4 15 0 30M28 8q4 15 0 30" {...S} fill="none" />
    </svg>
  )
}

export function Torii({ size = 28 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M14 26v30M50 26v30" {...S} fill="none" />
      <path d="M6 22q26 8 52 0l-3-10Q32 18 9 12z" fill="var(--coral)" {...S} />
      <path d="M16 34h32" {...S} fill="none" />
    </svg>
  )
}
