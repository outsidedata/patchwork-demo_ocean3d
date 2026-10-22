// The sun's look: a directional light from the way `world.ocean3d.light.sun` points, of its
// `sunColor` and the definition's `intensity`, and a hemisphere light of its `zenith` over its
// `horizon` at the definition's `sky` (`assets/demo_ocean3d.json`). Every frame it reads the light
// again, so what changes the sea's light changes the floats' with it.
import type * as THREE from 'three'
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

let key: THREE.DirectionalLight
let sky: THREE.HemisphereLight

export function setup(row: Row, plugins: Plugins) {
  const three = plugins.render3d.THREE as typeof THREE
  const k = def(plugins.wire, row.kind)
  key = new three.DirectionalLight('#ffffff', k.intensity)
  sky = new three.HemisphereLight('#ffffff', '#ffffff', k.sky)
  plugins.render3d.scene.add(key, key.target, sky)
}

export function tick(_row: Row, plugins: Plugins) {
  const light = plugins.wire.scene.world!.ocean3d.light
  key.position.fromArray(light.sun).normalize()
  key.color.set(light.sunColor)
  sky.color.set(light.zenith)
  sky.groundColor.set(light.horizon)
}

export function remove(plugins: Plugins) {
  plugins.render3d.scene.remove(key, key.target, sky)
  key.dispose()
  sky.dispose()
}
