// A boat riding the sea. Its row carries `pos` [x, y, z] and `normal`, the way its deck faces. Each
// step it stays at its x and z and takes y and the normal from ocean3d's `floatAt` over a square of its
// definition's `span` (`assets/demo_ocean3d.json`), over water the scene's `world.depth` deep, so it
// pitches and rolls on the waves as long as itself and does not bob on the ripples.
import type { Kind } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import { floatAt } from '#plugins/ocean3d/ocean3d.sim.ts'

export const boat: Kind = {
  tick(me, _dt, w) {
    const d = me.data
    const [x, , z] = d.pos
    const { y, normal } = floatAt(w, x, z, def(w, me.kind).span, { depth: () => w.world.depth })
    d.pos = [x, y, z]
    d.normal = normal
  },
}
