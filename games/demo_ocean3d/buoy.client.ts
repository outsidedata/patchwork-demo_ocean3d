// A buoy's look: a `colour` drum with a `band` round its middle and a cone on top, of its size's
// `radius` and `height` (`assets/demo_ocean3d.json`), sunk `draft` of its height under its row's
// `pos`, which is the sea's surface, and stood along its row's `normal`. Lit by the sun's lights.
import type * as THREE from 'three'
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

let group: THREE.Group
let up: THREE.Vector3
let along: THREE.Vector3

export function setup(row: Row, plugins: Plugins) {
  const three = plugins.render3d.THREE as typeof THREE
  const k = def(plugins.wire, row.kind)
  const { radius, height } = k.sizes[row.data.size]
  const n = k.segments
  const paint = (colour: string) => plugins.render3d.dress(new three.MeshStandardMaterial({ color: colour, roughness: 0.6 }))
  const sunk = -k.draft * height
  const drum = new three.Mesh(new three.CylinderGeometry(radius, radius * 0.8, height * 0.6, n), paint(k.colour))
  drum.position.y = sunk + height * 0.3
  const band = new three.Mesh(new three.CylinderGeometry(radius * 1.02, radius * 1.02, height * 0.12, n), paint(k.band))
  band.position.y = sunk + height * 0.42
  const cone = new three.Mesh(new three.ConeGeometry(radius, height * 0.4, n), paint(k.colour))
  cone.position.y = sunk + height * 0.8
  group = new three.Group()
  group.add(drum, band, cone)
  up = new three.Vector3(0, 1, 0)
  along = new three.Vector3()
  plugins.render3d.scene.add(group)
}

export function tick(row: Row) {
  group.position.fromArray(row.data.pos)
  group.quaternion.setFromUnitVectors(up, along.fromArray(row.data.normal))
}

export function remove(plugins: Plugins) {
  plugins.render3d.scene.remove(group)
  group.traverse(o => {
    const mesh = o as THREE.Mesh<THREE.BufferGeometry, THREE.Material>
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    mesh.material.dispose()
  })
}
