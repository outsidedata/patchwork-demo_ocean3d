// The kinds of open and the open.scene.json file next to this one: ocean3d's sea alone, open ocean
// under the fixed light of `world.ocean3d.light`, with no mods. The sea's clock is ocean3d's row; the
// buoys and the boat float on its waves through `floatAt`, each over a span of its own size; the sun
// lights them in the sea's own light; and the seat flies its `player` row, the eye, from its slot's
// start. Every number of the kinds that never changes is its definition in `assets/demo_ocean3d.json`.
import type { Scene, Sim } from '#engine/engine.ts'
import { scenemanager } from '#plugins/scenemanager/scenemanager.sim.ts'
import { loader } from '#plugins/loader/loader.sim.ts'
import { ocean3d } from '#plugins/ocean3d/ocean3d.sim.ts'
import { player } from './player.sim.ts'
import { start } from './start.sim.ts'
import { sun } from './sun.sim.ts'
import { buoy } from './buoy.sim.ts'
import { boat } from './boat.sim.ts'
import file from './open.scene.json' with { type: 'json' }

export const sim: Sim = { scenemanager, loader, ocean3d, player, start, sun, buoy, boat }

export const scene = file as Scene
