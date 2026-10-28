import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MODE_LABEL, fmtMin } from './shared.jsx'
import { getRoute } from './routing.js'

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const hasPos = (s) => s && s.lat != null && s.lng != null
const ll = (s) => [s.lat, s.lng]

function pinIcon(stop, n) {
  const label = stop.kind === 'hotel' ? '宿' : n
  return L.divIcon({ className: `pin ${stop.kind === 'hotel' ? 'hotel' : ''}`, html: `<span>${label}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] })
}

export default function TripMap({ stops, active, onSelect, color, reduced }) {
  const el = useRef(null)
  const map = useRef(null)
  const base = useRef(null)
  const hi = useRef(null)
  const markers = useRef([])
  const run = useRef(0)
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    const m = L.map(el.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false })
    L.tileLayer(TILES, { attribution: ATTR, maxZoom: 19 }).addTo(m)
    L.control.zoom({ position: 'topright' }).addTo(m)
    base.current = L.layerGroup().addTo(m)
    hi.current = L.layerGroup().addTo(m)
    map.current = m
    m.setView([34.9, 135.6], 9)
    return () => {
      m.remove()
      map.current = null
    }
  }, [])

  // Day changed: redraw every pin and the faint overall route.
  useEffect(() => {
    const m = map.current
    base.current.clearLayers()
    markers.current = []
    const pts = []
    stops.forEach((s, i) => {
      if (!hasPos(s)) {
        markers.current[i] = null
        return
      }
      pts.push(ll(s))
      const mk = L.marker(ll(s), { icon: pinIcon(s, i + 1), keyboard: false }).on('click', () => select.current(i))
      mk.addTo(base.current)
      markers.current[i] = mk
    })
    if (pts.length > 1) L.polyline(pts, { color: '#3E3A39', weight: 3, opacity: 0.35, dashArray: '2 8', lineCap: 'round' }).addTo(base.current)
    if (pts.length) m.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15, animate: false })
    setTimeout(() => m.invalidateSize(), 0)
  }, [stops])

  // Active stop changed: emphasise prev → stop → next and move the view there.
  useEffect(() => {
    const m = map.current
    hi.current.clearLayers()
    markers.current.forEach((mk, i) => {
      const node = mk?.getElement()
      if (node) node.classList.toggle('on', i === active)
      mk?.setZIndexOffset(i === active ? 1000 : 0)
    })
    const cur = stops[active]
    if (!hasPos(cur)) return
    const prev = hasPos(stops[active - 1]) ? stops[active - 1] : null
    const next = hasPos(stops[active + 1]) ? stops[active + 1] : null
    const legs = []
    if (prev) legs.push([prev, cur, stops[active - 1].next])
    if (next) legs.push([cur, next, cur.next])
    const token = ++run.current
    const legLayers = legs.map(([a, b, info]) => {
      const g = L.layerGroup().addTo(hi.current)
      const draw = (line, km) => {
        g.clearLayers()
        const walk = info?.mode === 'walk'
        L.polyline(line, { color: '#3E3A39', weight: 9, lineCap: 'round', lineJoin: 'round' }).addTo(g)
        L.polyline(line, { color: walk ? '#B9DAA5' : '#F2A497', weight: 5, lineCap: 'round', lineJoin: 'round', dashArray: walk ? '1 9' : null }).addTo(g)
        if (info) {
          const at = line[Math.floor(line.length / 2)]
          const dist = km ? `・${km < 10 ? km.toFixed(1) : Math.round(km)} km` : ''
          L.marker(at, {
            interactive: false,
            icon: L.divIcon({ className: 'leg-wrap', html: `<span class="leg">${MODE_LABEL[info.mode]} ${fmtMin(info.min)}${dist}</span>`, iconSize: [0, 0] }),
          }).addTo(g)
        }
      }
      draw([ll(a), ll(b)])
      return { a, b, info, draw }
    })
    Promise.all(legLayers.map((l) => getRoute(l.a, l.b, l.info?.mode))).then((routes) => {
      if (token !== run.current) return
      const all = []
      routes.forEach((r, i) => {
        if (!r) return
        legLayers[i].draw(r.coords, r.km)
        all.push(...r.coords)
      })
      if (all.length) {
        const rb = L.latLngBounds(all)
        if (!m.getBounds().contains(rb)) m.fitBounds(rb, { padding: [60, 60], maxZoom: 16, animate: !reduced })
      }
    })
    const pts = [ll(cur), ...(prev ? [ll(prev)] : []), ...(next ? [ll(next)] : [])]
    const opts = { padding: [60, 60], maxZoom: 16 }
    if (pts.length === 1) m.setView(pts[0], 16, { animate: !reduced })
    else if (reduced) m.fitBounds(L.latLngBounds(pts), { ...opts, animate: false })
    else m.flyToBounds(L.latLngBounds(pts), { ...opts, duration: 0.7 })
  }, [stops, active, reduced])

  return <div ref={el} className="trip-map" style={{ '--pin': `var(--${color})` }} role="application" aria-label="行程地圖" />
}
