---
title: Hex grid
component: ./HexGridExample.tsx
priority: 5
keywords:
  [grid, hexagon, hex map, tabletop, game board, gridType, updateDocumentSettings, snapToHexCenter]
---

Show a hexagonal grid and snap shapes to the center of its cells.

---

Set the document's `gridType` to `hex-flat` or `hex-pointy` with `editor.updateDocumentSettings` to replace the square grid with hexagons. When grid mode is on, dragging a shape snaps its center to the middle of the nearest cell, which makes the canvas work as a hex map for tabletop games.

Use the buttons at the top to switch between the square grid and the two hex orientations.
