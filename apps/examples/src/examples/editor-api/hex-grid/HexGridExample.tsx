import {
	createShapeId,
	Editor,
	snapToHexCenter,
	TLComponents,
	Tldraw,
	TldrawUiButton,
	TLGridType,
	useEditor,
	useValue,
} from 'tldraw'
import 'tldraw/tldraw.css'
import './hex-grid.css'

// There's a guide at the bottom of this file!

const GRID_TYPES: { type: TLGridType; label: string }[] = [
	{ type: 'square', label: 'Square' },
	{ type: 'hex-flat', label: 'Flat top' },
	{ type: 'hex-pointy', label: 'Pointy top' },
]

// [1]
function GridTypePicker() {
	const editor = useEditor()
	const gridType = useValue('gridType', () => editor.getDocumentSettings().gridType, [editor])

	return (
		<div className="tlui-menu hex-grid-picker">
			{GRID_TYPES.map(({ type, label }) => (
				<TldrawUiButton
					key={type}
					type="normal"
					isActive={type === gridType}
					onClick={() => editor.updateDocumentSettings({ gridType: type })}
				>
					{label}
				</TldrawUiButton>
			))}
		</div>
	)
}

const components: TLComponents = {
	TopPanel: GridTypePicker,
}

const TOKEN_SIZE = 30
const TOKEN_COLORS = ['red', 'blue', 'green', 'orange', 'violet'] as const

function setUpBoard(editor: Editor) {
	// [2]
	editor.updateInstanceState({ isGridMode: true })
	editor.updateDocumentSettings({ gridType: 'hex-pointy' })

	// [3]
	const cellSize = editor.getDocumentSettings().gridSize * editor.options.hexGridStep
	editor.createShapes(
		TOKEN_COLORS.map((color, i) => {
			const center = snapToHexCenter({ x: i * cellSize * 2, y: 0 }, cellSize, 'pointy')
			return {
				id: createShapeId(),
				type: 'geo',
				x: center.x - TOKEN_SIZE / 2,
				y: center.y - TOKEN_SIZE / 2,
				props: { geo: 'ellipse', w: TOKEN_SIZE, h: TOKEN_SIZE, color, fill: 'solid' },
			}
		})
	)
	editor.zoomToFit()
}

export default function HexGridExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} onMount={setUpBoard} />
		</div>
	)
}

/*
[1]
The grid type is a document setting. It's saved with the document, and everyone in a
multiplayer room sees the same one. Reading it with `useValue` keeps the buttons up to date
when someone else changes it.

[2]
Grid mode is a per-user setting. It shows the grid and turns on snapping to it. The grid type
decides what the grid looks like: square dots, or hexes with a flat or pointy top.

[3]
Hex cells are `gridSize * editor.options.hexGridStep` apart, which is 40 by default.
`snapToHexCenter` gives you the center of the cell under a point. It's the same snapping you
get when you drag a shape on a hex grid. Try dragging a token: it jumps to the middle of the
nearest cell.
*/
