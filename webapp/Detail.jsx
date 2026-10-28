import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TripMap from './TripMap.jsx'
import { DayIcon } from './art.jsx'
import { DaySwitcher, Header, Icons, ModeTag, TAG_COLOR, Title, kindsOf, trip, useDayIndex, useReducedMotion } from './shared.jsx'

export default function Detail() {
  const [index, pick] = useDayIndex()
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const day = trip.days[index]
  const stops = day.stops
  const scroller = useRef(null)
  const cards = useRef([])
  const lock = useRef(0)
  const raf = useRef(0)
  const drag = useRef(null)

  const scrollToCard = useCallback((i, instant) => {
    const sc = scroller.current
    const c = cards.current[i]
    if (!sc || !c) return
    lock.current = Date.now() + 700
    sc.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - sc.clientWidth / 2, behavior: instant || reduced ? 'auto' : 'smooth' })
  }, [reduced])

  const select = useCallback((i) => {
    setActive(i)
    scrollToCard(i)
  }, [scrollToCard])

  // New day: back to the first stop.
  useEffect(() => {
    setActive(0)
    scrollToCard(0, true)
  }, [index, scrollToCard])

  const onScroll = () => {
    if (Date.now() < lock.current) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const sc = scroller.current
      const mid = sc.scrollLeft + sc.clientWidth / 2
      let best = 0
      let bestD = Infinity
      cards.current.forEach((c, i) => {
        if (!c) return
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      setActive(best)
    })
  }

  // Mouse drag-to-scroll (touch already scrolls natively).
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { x: e.clientX, left: scroller.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    if (d.moved) {
      scroller.current.classList.add('dragging')
      scroller.current.scrollLeft = d.left - dx
    }
  }
  const endDrag = () => {
    const d = drag.current
    drag.current = null
    if (d?.moved) {
      scroller.current.classList.remove('dragging')
      lock.current = 0
      onScroll()
    }
  }

  const visible = useMemo(() => stops.map((s, i) => ({ s, i })), [stops])

  return (
    <>
      <Header>
        <Link to="/">首頁</Link>
        <span className="on">地圖</span>
      </Header>
      <main className="detail">
        <Title>行程地圖</Title>
        <DaySwitcher index={index} onPick={pick} />
        <div key={day.date} className="detail-head pop">
          <DayIcon name={day.icon} color={day.color} />
          <div>
            <small>Day {index + 1}・{day.date} {day.wd}</small>
            <h3>{day.title}</h3>
          </div>
        </div>

        <div
          className="cards"
          ref={scroller}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          tabIndex={0}
          aria-label="當日行程，可左右滑動"
        >
          {visible.map(({ s, i }) => {
            const prev = stops[i - 1]?.next
            const tags = [...(s.tags || [])]
            return (
              <article
                key={`${day.date}-${i}`}
                ref={(el) => (cards.current[i] = el)}
                className={`pcard ${i === active ? 'on' : ''} ${s.kind === 'hotel' ? 'hotel' : ''}`}
                onClick={() => !drag.current?.moved && select(i)}
              >
                <div className="pcard-top">
                  <span className="num">{s.kind === 'hotel' ? '宿' : i + 1}</span>
                  <b>{s.time}</b>
                  {prev && <ModeTag mode={prev.mode} min={prev.min} via={s.via} />}
                </div>
                {s.via && <small className="via"><Icons kinds={kindsOf(s.via)} />{s.via}</small>}
                <strong>{s.name}</strong>
                <div className="tags">
                  {s.must && <span className="tag must-tag">★ 必去</span>}
                  {tags.map((t) => <span key={t} className={`tag ${TAG_COLOR[t] || 'blue'}`}>{t}</span>)}
                </div>
                {s.note && <small>{s.note}</small>}
                {s.lat == null && <small>（此站不在關西地圖範圍）</small>}
              </article>
            )
          })}
        </div>
        <p className="hint">左右滑動切換站點，地圖會顯示前一站 → 這一站 → 下一站</p>

        <TripMap stops={stops} active={active} onSelect={select} color={day.color} reduced={reduced} />
        <p className="map-note">粗線＝前一站→這一站→下一站：綠色點線為步行路線，珊瑚色實線為車程路線。路線取自 OpenStreetMap 路徑規劃，「搭車」段是開車路線的示意，並非電車／巴士實際路線，搭乘請以 Google Maps 或乘換案內為準。</p>
      </main>
    </>
  )
}
