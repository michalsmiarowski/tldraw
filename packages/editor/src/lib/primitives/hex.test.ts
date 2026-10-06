import { snapToHexCenter, TLHexOrientation } from './hex'
import { Vec } from './Vec'

const SIZE = 40
const SQRT3 = Math.sqrt(3)
const orientations: TLHexOrientation[] = ['flat', 'pointy']

// Centers of the six cells around the origin.
const neighbors: Record<TLHexOrientation, Vec[]> = {
	pointy: [
		new Vec(SIZE, 0),
		new Vec(-SIZE, 0),
		new Vec(SIZE / 2, (SIZE * SQRT3) / 2),
		new Vec(-SIZE / 2, (SIZE * SQRT3) / 2),
		new Vec(SIZE / 2, (-SIZE * SQRT3) / 2),
		new Vec(-SIZE / 2, (-SIZE * SQRT3) / 2),
	],
	flat: [
		new Vec(0, SIZE),
		new Vec(0, -SIZE),
		new Vec((SIZE * SQRT3) / 2, SIZE / 2),
		new Vec((-SIZE * SQRT3) / 2, SIZE / 2),
		new Vec((SIZE * SQRT3) / 2, -SIZE / 2),
		new Vec((-SIZE * SQRT3) / 2, -SIZE / 2),
	],
}

function expectVecCloseTo(actual: Vec, expected: Vec) {
	expect(actual.x).toBeCloseTo(expected.x)
	expect(actual.y).toBeCloseTo(expected.y)
}

// Every cell center is some mix of two neighbor offsets, so checking a few cells in each
// direction is enough to find the right answer by brute force.
function bruteForceNearestCenter(point: Vec, orientation: TLHexOrientation) {
	const [a, , b] = neighbors[orientation]
	let best = new Vec(0, 0)
	for (let i = -6; i <= 6; i++) {
		for (let j = -6; j <= 6; j++) {
			const center = Vec.Mul(a, i).add(Vec.Mul(b, j))
			if (Vec.Dist(point, center) < Vec.Dist(point, best)) best = center
		}
	}
	return best
}

describe('snapToHexCenter', () => {
	describe.each(orientations)('%s orientation', (orientation) => {
		it('keeps the origin cell center in place', () => {
			expectVecCloseTo(snapToHexCenter({ x: 0, y: 0 }, SIZE, orientation), new Vec(0, 0))
		})

		it('keeps every neighbor center in place', () => {
			for (const center of neighbors[orientation]) {
				expectVecCloseTo(snapToHexCenter(center, SIZE, orientation), center)
			}
		})

		it('snaps points inside the origin cell to the origin', () => {
			// Anything closer than half the size is inside the cell, in any direction.
			for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
				const point = Vec.FromAngle(angle, SIZE * 0.49)
				expectVecCloseTo(snapToHexCenter(point, SIZE, orientation), new Vec(0, 0))
			}
		})

		it('snaps points past an edge to the neighboring cell', () => {
			for (const center of neighbors[orientation]) {
				const justPastEdge = Vec.Mul(center, 0.51)
				expectVecCloseTo(snapToHexCenter(justPastEdge, SIZE, orientation), center)
			}
		})

		it('matches the nearest cell center for points in every direction', () => {
			// Fixed pseudo-random points, so the test gives the same result every time. They
			// include negative coordinates and points near corners, where simple rounding fails.
			let seed = 1
			const random = () => {
				seed = (seed * 16807) % 2147483647
				return seed / 2147483647
			}
			for (let i = 0; i < 2000; i++) {
				const point = new Vec((random() - 0.5) * SIZE * 8, (random() - 0.5) * SIZE * 8)
				expectVecCloseTo(
					snapToHexCenter(point, SIZE, orientation),
					bruteForceNearestCenter(point, orientation)
				)
			}
		})
	})
})
