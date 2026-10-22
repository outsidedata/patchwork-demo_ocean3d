// demo_ocean3d: the manager booted as its page boots it and open loaded; a seat joins, its eye stands
// `up` over the sea at its slot's start and flies forward on the stick, and every buoy and the boat
// ride the server's waves, at `floatAt` over their own span.
import { expect, test } from 'vitest'
import { boot, type Scene, type W } from '#engine/engine.ts'
import { connection, load, manager, type Down } from '#addons/scenemanager/scenemanager.addon.ts'
import { floatAt, waveAt } from '#plugins/ocean3d/ocean3d.sim.ts'
import { sim } from './demo_ocean3d.sim.ts'
import file from './demo_ocean3d.scene.json' with { type: 'json' }
import defs from './assets/demo_ocean3d.json' with { type: 'json' }

const DT = file.prefabs.engine.dt

test('a seat joins open, its eye stands over the sea on its start, the stick flies it, and the floats ride floatAt', async () => {
  const truth = boot(file as Scene, sim)
  const room = (await load(truth, import.meta.url)).get('open')!
  const heard: Down[] = []
  const seat = connection(manager(truth), d => heard.push(d))
  truth.step(DT)
  const ground = { depth: () => room.world.depth }
  // The rows of open as a rule reads them, for the sea's queries: its world and its ocean3d row.
  const w = { world: room.world, find: (kind: string) => room.rows.find(r => r.kind === kind)! } as unknown as W
  const start = room.rows.find(r => r.kind === 'start' && r.data.slot === 0)!.data
  const eye = () => room.rows.find(r => r.kind === 'player')!.data
  const [x, z] = start.at
  expect(eye().pos[0]).toBe(x)
  expect(eye().pos[2]).toBe(z)
  expect(eye().pos[1]).toBeGreaterThan(waveAt(w, x, z, ground) + defs.player.clear)

  const last = heard[heard.length - 1]
  const me = last.packet.rows.find(r => r.kind === 'player')!
  seat.take({ scene: last.scene, seat: last.seat, msg: { seq: 1, n: last.packet.n, id: me.id, action: 'stick', args: [0, -1] } })
  for (let i = 0; i < 60; i++) truth.step(DT)
  expect(eye().pos[2]).toBeGreaterThan(z + defs.player.speed * 0.5)

  for (const r of room.rows.filter(r => r.kind === 'buoy' || r.kind === 'boat')) {
    const span = r.kind === 'buoy' ? defs.buoy.sizes[r.data.size as 'small' | 'mid' | 'large'].span : defs.boat.span
    const { y, normal } = floatAt(w, r.data.pos[0], r.data.pos[2], span, ground)
    expect(r.data.pos[1]).toBe(y)
    expect(r.data.normal).toEqual(normal)
  }
})
