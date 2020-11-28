import {debug, debugColor, onDebugStateChange} from "./debug";

interface Cell {
    aspectRatio: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    painter: CellPainter;
}

export interface CellPainter {
    (ctx: CanvasRenderingContext2D, width: number, height: number): void | number;
}

const rows: Cell[][] = [];
const containerElement = document.querySelector(".container");
if (!containerElement) throw "missing container";

// Adds a new row of cells to the bottom of the stack.
export const newRow = (aspectRatio: number, ...painters: CellPainter[]) => {
    const rowElement = document.createElement("div");
    rowElement.classList.add("row");
    containerElement.appendChild(rowElement);

    if (painters.length == 0) {
        painters = [() => {}];
    }

    const cells: Cell[] = [];
    for (const painter of painters) {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        rowElement.appendChild(cellElement);

        const canvas = document.createElement("canvas");
        cellElement.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) throw "missing canvas context";

        const cell = {aspectRatio, canvas, ctx, painter};
        cells.push(cell);
    }
    rows.push(cells);

    redraw();
};

export const getTotalWidth = () => {
    // Compute new size from element width.
    const rowStyle = window.getComputedStyle(
        rows[0]?.[0]?.canvas?.parentElement?.parentElement || document.body,
    );
    const rowWidth = Number(rowStyle.getPropertyValue("width").slice(0, -2));
    return rowWidth * window.devicePixelRatio;
};

// Lazily redraw canvas to match window resolution.
let redrawTimeout: undefined | number = undefined;
const redraw = () => {
    window.clearTimeout(redrawTimeout);
    redrawTimeout = window.setTimeout(() => {
        for (const row of rows) {
            const cellWidth = getTotalWidth() / row.length;
            for (const cell of row) {
                const cellHeight = cellWidth / cell.aspectRatio;

                // Resize canvas;
                cell.canvas.width = cellWidth;
                cell.canvas.height = cellHeight;

                // Draw canvas outline.
                if (debug) {
                    const backup = cell.ctx.strokeStyle;
                    cell.ctx.strokeStyle = debugColor;
                    cell.ctx.strokeRect(0, 0, cellWidth, cellHeight - 1);
                    cell.ctx.strokeStyle = backup;
                }

                // Redraw canvas contents.
                cell.painter(cell.ctx, cellWidth, cellHeight);
            }
        }
    }, 100);
};

window.addEventListener("load", redraw);
window.addEventListener("resize", redraw);
onDebugStateChange(redraw);
