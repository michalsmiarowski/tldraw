import { Vec, VecLike } from './Vec'

/**
 * Which way the hexes in a hex grid face. `flat` hexes have a flat edge at the top and line up
 * in columns. `pointy` hexes have a corner at the top and line up in rows.
 *
 * @public
 */
export type TLHexOrientation = 'flat' | 'pointy'

const SQRT3 = Math.sqrt(3)

/**
 * Find the center of the hex cell that a point falls into. The grid has one cell centered on
 * (0, 0).
 *
 * @example
 * ```ts
 * const center = snapToHexCenter({ x: 12, y: 3 }, 40, 'pointy')
 * ```
 *
 * @param size - Distance between the centers of two neighboring cells. This is also the width of
 * a cell, measured between two opposite flat edges.
 *
 * @public
 */
export function snapToHexCenter(point: VecLike, size: number, orientation: TLHexOrientation): Vec {
	const radius = size / SQRT3

	// Convert to axial coordinates (with fractions). See https://www.redblobgames.com/grids/hexagons/
	let q: number, r: number
	if (orientation === 'pointy') {
		q = ((SQRT3 / 3) * point.x - (1 / 3) * point.y) / radius
		r = ((2 / 3) * point.y) / radius
	} else {
		q = ((2 / 3) * point.x) / radius
		r = ((-1 / 3) * point.x + (SQRT3 / 3) * point.y) / radius
	}

	// If we round each axial coordinate on its own, points near a corner can end up in the wrong
	// cell. So we round in cube coordinates and fix the one that changed the most.
	const s = -q - r
	let rq = Math.round(q)
	let rr = Math.round(r)
	const rs = Math.round(s)
	const dq = Math.abs(rq - q)
	const dr = Math.abs(rr - r)
	const ds = Math.abs(rs - s)
	if (dq > dr && dq > ds) {
		rq = -rr - rs
	} else if (dr > ds) {
		rr = -rq - rs
	}

	if (orientation === 'pointy') {
		return new Vec(radius * (SQRT3 * rq + (SQRT3 / 2) * rr), radius * (3 / 2) * rr)
	}
	return new Vec(radius * (3 / 2) * rq, radius * ((SQRT3 / 2) * rq + SQRT3 * rr))
}
