import { TLGridType } from '@tldraw/tlschema'
import { modulate } from '@tldraw/utils'
import { useEditor } from '../../hooks/useEditor'
import { suffixSafeId, useUniqueSafeId } from '../../hooks/useSafeId'

/** @public */
export interface TLGridProps {
	x: number
	y: number
	z: number
	size: number
	/** The shape of the grid cells. Defaults to `square`. */
	type?: TLGridType
}

/** @public @react */
export function DefaultGrid({ x, y, z, size, type = 'square' }: TLGridProps) {
	if (type !== 'square') {
		return <HexGrid x={x} y={y} z={z} size={size} type={type} />
	}
	return <DotGrid x={x} y={y} z={z} size={size} />
}

function DotGrid({ x, y, z, size }: TLGridProps) {
	const id = useUniqueSafeId('grid')
	const editor = useEditor()
	const { gridSteps } = editor.options
	return (
		<svg className="tl-grid" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<defs>
				{gridSteps.map(({ min, mid, step }, i) => {
					const s = step * size * z
					const xo = 0.5 + x * z
					const yo = 0.5 + y * z
					const gxo = xo > 0 ? xo % s : s + (xo % s)
					const gyo = yo > 0 ? yo % s : s + (yo % s)
					const opacity = z < mid ? modulate(z, [min, mid], [0, 1]) : 1

					return (
						<pattern
							key={i}
							id={suffixSafeId(id, `${step}`)}
							width={s}
							height={s}
							patternUnits="userSpaceOnUse"
						>
							<circle className="tl-grid-dot" cx={gxo} cy={gyo} r={1} opacity={opacity} />
						</pattern>
					)
				})}
			</defs>
			{gridSteps.map(({ step }, i) => (
				<rect key={i} width="100%" height="100%" fill={`url(#${id}_${step})`} />
			))}
		</svg>
	)
}

const SQRT3 = Math.sqrt(3)

// When hexes get this small on screen we fade them out. Otherwise the grid turns into a gray blur.
const HEX_FADE_RANGE = [8, 24]

function HexGrid({ x, y, z, size, type }: TLGridProps) {
	const id = useUniqueSafeId('grid')
	const editor = useEditor()

	// In screen pixels: d is the distance between two neighboring cell centers, radius is the
	// distance from a center to a corner.
	const d = size * editor.options.hexGridStep * z
	const radius = d / SQRT3
	const opacity = modulate(d, HEX_FADE_RANGE, [0, 1], true)
	if (opacity === 0) return null

	// For pointy-top hexes, the pattern tile is one cell wide and two rows tall. We draw the four
	// cells in its corners plus the one in the middle, which covers every edge. Edges on the
	// border of the tile are drawn half here and half in the next tile, so there are no gaps or
	// double lines. Flat-top hexes use the same tile with x and y swapped.
	const isFlat = type === 'hex-flat'
	const tileW = d
	const tileH = 3 * radius
	const centers = [
		[0, 0],
		[tileW, 0],
		[tileW / 2, tileH / 2],
		[0, tileH],
		[tileW, tileH],
	]
	const path = centers
		.map(([cx, cy]) => {
			const corners = []
			for (let i = 0; i < 6; i++) {
				const angle = Math.PI / 6 + (Math.PI / 3) * i
				const px = cx + radius * Math.cos(angle)
				const py = cy + radius * Math.sin(angle)
				corners.push(isFlat ? `${py},${px}` : `${px},${py}`)
			}
			return `M${corners.join('L')}Z`
		})
		.join('')

	return (
		<svg className="tl-grid" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<defs>
				<pattern
					id={id}
					x={0.5 + x * z}
					y={0.5 + y * z}
					width={isFlat ? tileH : tileW}
					height={isFlat ? tileW : tileH}
					patternUnits="userSpaceOnUse"
				>
					<path className="tl-grid-hex" d={path} opacity={opacity} />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${id})`} />
		</svg>
	)
}
