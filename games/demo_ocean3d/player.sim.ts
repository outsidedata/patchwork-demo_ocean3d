// The row one seat possesses, and the eye that seat flies: a point over the sea that the camera sits
// on (chasecamera3d, `dist` metres behind it), turned by the mouse and flown by the keys.
// `addons/player` spawns it and writes the slot it gave the connection into `seat`, and every seat is
// sent it. Every number is the player's definition in `assets/demo_ocean3d.json`.
//
// The row: `seat`, and `stood`, whether it stands yet. Its own:
//   pos       [x, y, z], the eye, in metres.
//   look      `{ yaw, pitch, dist }`: chasecamera3d's orbit; the eye looks along yaw and down by pitch.
//   lift      0: the camera's pivot is the eye itself.
//   stick     [x, z], the keys' way, right and forward; `up` and `down`, the climb keys held; `fast`,
//             the boost key held.
//   pace      the fly speed's multiplier, which the wheel moves, from `pace.min` to `pace.max`.
//
// `before` stands it once on the scene's `start` actor for its slot, `up` metres over the sea's
// surface at the start's `at`, looking along its `yaw` and down by its `pitch`. Each step after, it
// flies `speed`·pace metres a second along the way it looks, forward and back, and across it, level,
// right and left, and `climb`·pace straight up or down; all of it `boost` times faster while `fast`
// is held. It never comes nearer than `clear` metres to the sea's surface under it (`waveAt`, over
// water the scene's `world.depth` deep), nor goes higher than `ceiling`.
//
// The acts are the page's keys: `stick(x, y)` (y down, as a stick reads), `up`, `down` and `fast` (1
// held, 0 let go), `pace(d)` the wheel, and `look(dyaw, dpitch)`. A seat's message arrives from
// outside the program, so each act refuses arguments of the wrong kind and writes nothing.
import type { Kind, Row, W } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import { waveAt } from '#plugins/ocean3d/ocean3d.sim.ts'
import * as math from '#plugins/math/math.sim.ts'

const wrap = (a: number) => a - 2 * Math.PI * Math.ceil((a - Math.PI) / (2 * Math.PI))
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const finite = (...v: unknown[]) => v.every(x => typeof x === 'number' && Number.isFinite(x))
const held = (v: unknown) => v === 0 || v === 1
const way = (v: unknown) => typeof v === 'number' && Math.abs(v) <= 1

// The lowest the eye may be at x, z: `clear` over the sea's surface.
const floorAt = (w: W, k: any, x: number, z: number) => waveAt(w, x, z, { depth: () => w.world.depth }) + k.clear

function fly(me: Row, w: W, dt: number) {
  const d = me.data
  const k = def(w, me.kind)
  const { yaw, pitch } = d.look
  const cy = math.cos(yaw), sy = math.sin(yaw), cp = math.cos(pitch), sp = math.sin(pitch)
  const forward = [sy * cp, -sp, cy * cp]
  const right = [-cy, 0, sy]
  const boost = d.fast ? k.boost : 1
  const run = k.speed * d.pace * boost, rise = k.climb * d.pace * boost * ((d.up ? 1 : 0) - (d.down ? 1 : 0))
  const [sx, sz] = d.stick
  const x = d.pos[0] + (forward[0] * sz + right[0] * sx) * run * dt
  const z = d.pos[2] + (forward[2] * sz + right[2] * sx) * run * dt
  const y = d.pos[1] + (forward[1] * sz * run + rise) * dt
  d.pos = [x, clamp(y, floorAt(w, k, x, z), k.ceiling), z]
}

export const player: Kind = {
  before(me, _dt, w) {
    const d = me.data
    if (d.stood) return
    const start = w.find('start', s => s.data.slot === d.seat).data
    const [x, z] = start.at
    d.pos = [x, floorAt(w, def(w, me.kind), x, z) + start.up, z]
    d.look = { ...d.look, yaw: start.yaw, pitch: start.pitch }
    d.stood = true
  },
  tick(me, dt, w) {
    if (me.data.stood) fly(me, w, dt)
  },
  acts: {
    stick(me, _w, _seat, x: unknown, y: unknown) {
      if (way(x) && way(y)) me.data.stick = [x, 0 - (y as number)]
    },
    up(me, _w, _seat, v: unknown) { if (held(v)) me.data.up = !!v },
    down(me, _w, _seat, v: unknown) { if (held(v)) me.data.down = !!v },
    fast(me, _w, _seat, v: unknown) { if (held(v)) me.data.fast = !!v },
    pace(me, w, _seat, by: unknown) {
      if (!finite(by)) return
      const p = def(w, me.kind).pace
      me.data.pace = clamp(me.data.pace * math.exp(-(by as number) * p.step), p.min, p.max)
    },
    look(me, w, _seat, dyaw: unknown, dpitch: unknown) {
      if (!finite(dyaw, dpitch)) return
      const c = def(w, me.kind).camera
      const l = me.data.look
      me.data.look = { ...l, yaw: wrap(l.yaw + (dyaw as number)), pitch: clamp(l.pitch + (dpitch as number), c.minPitch, c.maxPitch) }
    },
  },
}
