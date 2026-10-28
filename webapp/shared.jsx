import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import trip from '../src/data/trip.json'
import { Lantern, TIcon, Torii } from './art.jsx'

export { trip }

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

export function useDayIndex() {
  const [index, setIndex] = useState(() => {
    const i = Number(load('kansai-day', 0))
    return i >= 0 && i < trip.days.length ? i : 0
  })
  const pick = (i) => {
    setIndex(i)
    save('kansai-day', i)
  }
  return [index, pick]
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export const MODE_LABEL = { walk: '步行', ride: '搭車', plane: '飛機', boat: '乘船' }
export const MODE_COLOR = { walk: 'green', ride: 'blue', plane: 'blue', boat: 'blue' }
export const TAG_COLOR = { 小火車: 'yellow', 遊船: 'blue', 需預約: 'coral', 已預約: 'green' }

export function fmtMin(m) {
  const h = Math.floor(m / 60)
  const r = m % 60
  return h ? `${h} 小時${r ? ` ${r} 分` : ''}` : `${r} 分`
}

export function Title({ children }) {
  return <h2 className="sec-title"><Torii size={34} /><span>{children}</span></h2>
}

export function Header({ children }) {
  return (
    <header className="nav">
      <Link to="/" className="nav-logo" aria-label="回首頁"><Torii size={34} /></Link>
      <nav>{children}</nav>
    </header>
  )
}

export function DaySwitcher({ index, onPick }) {
  const days = trip.days
  const pct = ((index + 0.5) / days.length) * 100
  return (
    <div className="switcher" role="tablist" aria-label="選擇日期">
      <div className="rail" aria-hidden="true">
        <span className="rail-line" />
        <span className="lantern-wrap" style={{ left: `${pct}%` }}><Lantern /></span>
      </div>
      <div className="stops">
        {days.map((d, i) => (
          <button key={d.date} role="tab" aria-selected={i === index} className={`stop ${i === index ? 'on' : ''}`} onClick={() => onPick(i)}>
            <b>{d.date}</b>
            <small>{d.wd}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

// Transport kinds mentioned in a "via" description, in order of appearance (e.g. 巴士 → 叡山電車 → train).
const KIND_RE = /(巴士)|(JR|地鐵|阪急|京阪|近鐵|嵐電|叡山電車|小火車|はるか|新快速|環狀線)|(遊船)|(步行)/g
export function kindsOf(via) {
  const out = []
  for (const m of (via || '').matchAll(KIND_RE)) {
    const k = m[1] ? 'bus' : m[2] ? 'train' : m[3] ? 'boat' : 'walk'
    if (out[out.length - 1] !== k) out.push(k)
  }
  return out
}

export function Icons({ kinds }) {
  return <span className="ticons">{kinds.map((k, i) => <TIcon key={i} kind={k} />)}</span>
}

// "搭車 25 分" style tag with the matching icon (train/bus taken from the via text).
export function ModeTag({ mode, min, via }) {
  const icon = mode === 'ride' ? kindsOf(via).find((k) => k !== 'walk') || 'train' : mode
  return (
    <span className={`tag ${MODE_COLOR[mode]}`}>
      <TIcon kind={icon} size={14} /> {MODE_LABEL[mode]}{min != null ? ` ${fmtMin(min)}` : ''}
    </span>
  )
}
