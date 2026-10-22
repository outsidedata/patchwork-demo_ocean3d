// Where a seat's eye starts: a `start` actor of the scene, one per slot, at `at` [x, z], `up` metres
// over the sea's surface there, looking along `yaw` and down by `pitch`. The `player` row stands on
// the start of its slot. It has no rule and is not drawn.
import type { Kind } from '#engine/engine.ts'

export const start: Kind = {}
