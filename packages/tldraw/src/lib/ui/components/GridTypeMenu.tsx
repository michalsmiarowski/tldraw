import { TLGridType, useEditor, useValue } from '@tldraw/editor'
import { useUiEvents } from '../context/events'
import { TldrawUiMenuCheckboxItem } from './primitives/menus/TldrawUiMenuCheckboxItem'
import { TldrawUiMenuGroup } from './primitives/menus/TldrawUiMenuGroup'
import { TldrawUiMenuSubmenu } from './primitives/menus/TldrawUiMenuSubmenu'

const GRID_TYPES: { gridType: TLGridType; label: string }[] = [
	{ gridType: 'square', label: 'grid-type.square' },
	{ gridType: 'hex-flat', label: 'grid-type.hex-flat' },
	{ gridType: 'hex-pointy', label: 'grid-type.hex-pointy' },
]

/** @public @react */
export function GridTypeMenu() {
	const editor = useEditor()
	const trackEvent = useUiEvents()
	const currentGridType = useValue('gridType', () => editor.getDocumentSettings().gridType, [
		editor,
	])

	return (
		<TldrawUiMenuSubmenu id="grid-type" label="menu.grid-type">
			<TldrawUiMenuGroup id="grid-type">
				{GRID_TYPES.map(({ gridType, label }) => (
					<TldrawUiMenuCheckboxItem
						id={`grid-type-${gridType}`}
						key={gridType}
						label={label}
						checked={gridType === currentGridType}
						onSelect={() => {
							// Everyone in the document shares the grid type. If the grid is hidden,
							// picking a type would look like it did nothing, so we turn the grid on too.
							editor.updateDocumentSettings({ gridType })
							editor.updateInstanceState({ isGridMode: true })
							trackEvent('grid-type', { source: 'menu', value: gridType })
						}}
					/>
				))}
			</TldrawUiMenuGroup>
		</TldrawUiMenuSubmenu>
	)
}
