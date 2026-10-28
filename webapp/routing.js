// Road routes from the public OpenStreetMap routing servers (no API key). Cached per session.
// Only foot and car profiles exist there: train/bus legs are drawn as a car route (a sketch, not the rail line).
const BASE = { walk: 'routed-foot', ride: 'routed-car' }
const cache = new Map()

export function getRoute(a, b, mode) {
  const svc = BASE[mode]
  if (!svc) return Promise.resolve(null)
  const key = `${mode}:${a.lat},${a.lng}:${b.lat},${b.lng}`
  if (!cache.has(key)) {
    const url = `https://routing.openstreetmap.de/${svc}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`
    const p = fetch(url, { signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const r = j?.routes?.[0]
        return r ? { coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]), km: r.distance / 1000 } : null
      })
      .catch(() => null)
    cache.set(key, p)
    p.then((v) => v || cache.delete(key))
  }
  return cache.get(key)
}
