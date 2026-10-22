// A buoy riding the sea. Its row carries `size`, the name of one of its definition's `sizes`
// (`assets/demo_ocean3d.json`), `pos` [x, y, z] and `normal`, the way its axis stands. Each step it
// stays at its x and z and takes y and the normal from ocean3d's `floatAt` over a square of its size's
// `span`, over water the scene's `world.depth` deep: the server's waves, the ones every page draws. A
// small buoy rides the short waves; a large one's span averages them out, and it rides only the long.
import type { Kind } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import { floatAt } from '#plugins/ocean3d/ocean3d.sim.ts'

export const buoy: Kind = {
  tick(me, _dt, w) {
    const d = me.data
    const { span } = def(w, me.kind).sizes[d.size]
    const [x, , z] = d.pos
    const { y, normal } = floatAt(w, x, z, span, { depth: () => w.world.depth })
    d.pos = [x, y, z]
    d.normal = normal
  },
}
