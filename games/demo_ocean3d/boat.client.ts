// The boat's look: a `hull` of its definition's `length`, `beam` and `height`, its bow a wedge, a
// `deck` on top and a `cabin` aft of the middle (`assets/demo_ocean3d.json`), sunk `draft` metres under
// its row's `pos`, which is the sea's surface, its deck facing its row's `normal`, and its bow turned to
// `yaw` about that. Lit by the sun's lights.
import type * as THREE from 'three'
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'

let group: THREE.Group
let up: THREE.Vector3
let along: THREE.Vector3
let heading: THREE.Quaternion

export function setup(row: Row, plugins: Plugins) {
  const three = plugins.render3d.THREE as typeof THREE
  const k = def(plugins.wire, row.kind)
  const paint = (colour: string) => plugins.render3d.dress(new three.MeshStandardMaterial({ color: colour, roughness: 0.7 }))
  const { length, beam, height, draft } = k
  // The hull's outline seen from above, stern at −z and the bow's point at +z, raised `height`.
  const outline = new three.Shape()
  outline.moveTo(-beam / 2, -length / 2)
  outline.lineTo(beam / 2, -length / 2)
  outline.lineTo(beam / 2, length / 6)
  outline.lineTo(0, length / 2)
  outline.lineTo(-beam / 2, length / 6)
  outline.closePath()
  const shape = new three.ExtrudeGeometry(outline, { depth: height, bevelEnabled: false })
  shape.rotateX(Math.PI / 2)
  shape.translate(0, height - draft, 0)
  const hull = new three.Mesh(shape, paint(k.hull))
  const deck = new three.Mesh(new three.BoxGeometry(beam * 0.9, 0.08, length * 0.6), paint(k.deck))
  deck.position.set(0, height - draft + 0.04, -length * 0.1)
  const cabin = new three.Mesh(new three.BoxGeometry(beam * 0.6, height, length * 0.25), paint(k.cabin))
  cabin.position.set(0, height - draft + height / 2, -length * 0.2)
  group = new three.Group()
  group.add(hull, deck, cabin)
  up = new three.Vector3(0, 1, 0)
  along = new three.Vector3()
  heading = new three.Quaternion().setFromAxisAngle(up, k.yaw)
  plugins.render3d.scene.add(group)
}

export function tick(row: Row) {
  group.position.fromArray(row.data.pos)
  group.quaternion.setFromUnitVectors(up, along.fromArray(row.data.normal)).multiply(heading)
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
