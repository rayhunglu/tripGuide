import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayIcon, Hero } from './art.jsx'
import { DaySwitcher, Header, ModeTag, TAG_COLOR, Title, load, save, trip, useDayIndex } from './shared.jsx'

const SECTIONS = [
  ['flights', '航班'],
  ['days', '行程'],
  ['prep', '準備'],
  ['stay', '住宿'],
]

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

function Flights() {
  return (
    <section id="flights" className="sec">
      <Title>航班</Title>
      {trip.flights.map((f) => (
        <article key={f.label} className={`card flight ${f.color}`}>
          <header><span>{f.label}</span>{f.no && <span>{f.no}</span>}</header>
          <div className="flight-row">
            <div><b>{f.dep}</b><small>{f.from}</small></div>
            <div className="flight-line" aria-hidden="true"><i /></div>
            <div><b>{f.arr}</b><small>{f.to}</small></div>
          </div>
          <p>{f.note}</p>
        </article>
      ))}
    </section>
  )
}

// Stops shown on the home timeline: hotels/airports only when flagged `show`.
function homeItems(day) {
  return day.stops
    .map((s, i) => ({ ...s, incoming: i > 0 ? day.stops[i - 1].next : null }))
    .filter((s) => (s.kind !== 'hotel' && s.kind !== 'airport') || s.show)
}

function Days() {
  const [index, pick] = useDayIndex()
  const day = trip.days[index]
  const items = useMemo(() => homeItems(day), [day])

  return (
    <section id="days" className="sec">
      <Title>每日行程</Title>
      <DaySwitcher index={index} onPick={pick} />
      <article key={day.date} className={`card day-head ${day.color} pop`}>
        <DayIcon name={day.icon} color={day.color} />
        <div>
          <small>Day {index + 1}</small>
          <h3>{day.title}</h3>
          {day.stay && <small>住 {day.stay}</small>}
        </div>
      </article>
      <div key={`t-${day.date}`} className="timeline pop">
        {items.map((it, i) => {
          const tags = it.tags || []
          const showMode = it.incoming && (it.incoming.mode === 'plane' || !tags.length)
          return (
            <div className="slot" key={i}>
              <span className="slot-label">{it.time}</span>
              <ul>
                <li>
                  <span className="node" aria-hidden="true" />
                  <div className={`stop-card ${it.must ? 'must' : ''}`}>
                    {(showMode || tags.length > 0 || it.must) && (
                      <div className="tags">
                        {showMode && <ModeTag mode={it.incoming.mode} via={it.via} />}
                        {tags.map((t) => <span key={t} className={`tag ${TAG_COLOR[t] || 'blue'}`}>{t}</span>)}
                        {it.must && <span className="tag must-tag">★ 必去</span>}
                      </div>
                    )}
                    <strong>{it.name}</strong>
                    {it.note && <small>{it.note}</small>}
                  </div>
                </li>
              </ul>
            </div>
          )
        })}
      </div>
      <div className="day-nav">
        <button disabled={index === 0} onClick={() => pick(index - 1)}>← 前一天</button>
        <Link to="/detail" className="map-link">地圖路線 →</Link>
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

export default function Home() {
  const days = useCountdown(trip.departure)
  const ids = useMemo(() => ['top', ...SECTIONS.map(([id]) => id)], [])
  const active = useScrollSpy(ids)
  return (
    <>
      <Header>
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}>{label}</a>
        ))}
        <Link to="/detail">地圖</Link>
      </Header>
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
