import { useEffect, useMemo, useState } from 'react'
import trip from '../src/data/trip.json'
import { DayIcon, Hero, Lantern, Torii } from './art.jsx'

const SECTIONS = [
  ['flights', '航班'],
  ['days', '行程'],
  ['prep', '準備'],
  ['stay', '住宿'],
]
const SLOT_ORDER = ['早上', '午餐', '下午', '晚上', '晚餐']
const TAG_COLOR = { 電車: 'blue', 地鐵: 'green', 巴士: 'yellow', 步行: 'green', 飛機: 'blue', 遊船: 'blue', 小火車: 'yellow', 需預約: 'coral' }

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  return Math.ceil((new Date(target).getTime() - now) / 86_400_000)
}

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids])
  return active
}

function Nav({ active }) {
  return (
    <header className="nav">
      <a href="#top" className="nav-logo" aria-label="回到頂端"><Torii size={34} /></a>
      <nav>
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}>{label}</a>
        ))}
      </nav>
    </header>
  )
}

function Title({ children }) {
  return <h2 className="sec-title"><Torii size={34} /><span>{children}</span></h2>
}

function Flights() {
  return (
    <section id="flights" className="sec">
      <Title>航班</Title>
      {trip.flights.map((f) => (
        <article key={f.label} className={`card flight ${f.color}`}>
          <header><span>{f.label}</span><span>{f.no}</span></header>
          <div className="flight-row">
            <div><b>{f.dep}</b><small>{f.from}</small></div>
            <div className="flight-line" aria-hidden="true"><i /></div>
            <div><b>{f.arr}</b><small>{f.to}</small></div>
          </div>
          <p>{f.note}</p>
        </article>
      ))}
      <p className="hint">航班編號與時間尚未填入，請編輯 <code>src/data/trip.json</code>。</p>
    </section>
  )
}

function DaySwitcher({ days, index, onPick }) {
  const pct = ((index + 0.5) / days.length) * 100
  return (
    <div className="switcher" role="tablist" aria-label="選擇日期">
      <div className="rail" aria-hidden="true">
        <span className="rail-line" />
        <span className="lantern-wrap" style={{ left: `${pct}%` }}><Lantern /></span>
      </div>
      <div className="stops">
        {days.map((d, i) => (
          <button
            key={d.date}
            role="tab"
            aria-selected={i === index}
            className={`stop ${i === index ? 'on' : ''}`}
            onClick={() => onPick(i)}
          >
            <span className="dot" />
            <b>{d.date}</b>
            <small>{d.wd}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

function Days() {
  const [index, setIndex] = useState(() => {
    const i = Number(load('kansai-day', 0))
    return i >= 0 && i < trip.days.length ? i : 0
  })
  const day = trip.days[index]

  const pick = (i) => {
    setIndex(i)
    save('kansai-day', i)
  }

  const groups = useMemo(
    () => SLOT_ORDER.map((slot) => [slot, day.items.filter((it) => it.slot === slot)]).filter(([, a]) => a.length),
    [day],
  )

  return (
    <section id="days" className="sec">
      <Title>每日行程</Title>
      <DaySwitcher days={trip.days} index={index} onPick={pick} />
      <article key={day.date} className={`card day-head ${day.color} pop`}>
        <DayIcon name={day.icon} color={day.color} />
        <div>
          <small>Day {index + 1}</small>
          <h3>{day.title}</h3>
          {day.stay && <small>住 {day.stay}</small>}
        </div>
      </article>
      <div key={`t-${day.date}`} className="timeline pop">
        {groups.map(([slot, items]) => (
          <div className="slot" key={slot}>
            <span className="slot-label">{slot}</span>
            <ul>
              {items.map((it, i) => (
                <li key={i}>
                  <span className="node" aria-hidden="true" />
                  <div className={`stop-card ${it.must ? 'must' : ''}`}>
                    {(it.tags || it.must) && (
                      <div className="tags">
                        {(it.tags || []).map((t) => <span key={t} className={`tag ${TAG_COLOR[t] || 'blue'}`}>{t}</span>)}
                        {it.must && <span className="tag must-tag">★ 必去</span>}
                      </div>
                    )}
                    <strong>{it.title}</strong>
                    {it.note && <small>{it.note}</small>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="day-nav">
        <button disabled={index === 0} onClick={() => pick(index - 1)}>← 前一天</button>
        <button disabled={index === trip.days.length - 1} onClick={() => pick(index + 1)}>後一天 →</button>
      </div>
    </section>
  )
}

function Prep() {
  const [done, setDone] = useState(() => load('kansai-todos', []))
  const toggle = (t) => {
    const next = done.includes(t) ? done.filter((x) => x !== t) : [...done, t]
    setDone(next)
    save('kansai-todos', next)
  }
  return (
    <section id="prep" className="sec">
      <Title>出發前準備</Title>
      <div className="card">
        <p className="hint left">已完成 {done.filter((t) => trip.todos.includes(t)).length} / {trip.todos.length}</p>
        <ul className="todos">
          {trip.todos.map((t) => (
            <li key={t}>
              <label className={done.includes(t) ? 'done' : ''}>
                <input type="checkbox" checked={done.includes(t)} onChange={() => toggle(t)} />
                <span className="box" aria-hidden="true" />
                <span>{t}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Stay() {
  return (
    <section id="stay" className="sec">
      <Title>住宿</Title>
      <div className="card">
        {trip.stays.map((s) => (
          <div className="stay-row" key={s.name}>
            <div><b>{s.city}</b><small>{s.name}</small></div>
            <span>{s.dates}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const days = useCountdown(trip.departure)
  const ids = useMemo(() => ['top', ...SECTIONS.map(([id]) => id)], [])
  const active = useScrollSpy(ids)
  return (
    <>
      <Nav active={active} />
      <main>
        <section id="top" className="hero">
          <Hero />
          <h1>{trip.title}</h1>
          <p className="sub">{trip.subtitle}</p>
          <p className="count">
            {days > 0 ? <>出發倒數 <b>{days}</b> 天</> : days === 0 ? <>就是今天出發！</> : <>旅程進行中／已結束</>}
          </p>
        </section>
        <Flights />
        <Days />
        <Prep />
        <Stay />
      </main>
      <footer>おつかれさま · 旅途愉快</footer>
    </>
  )
}
