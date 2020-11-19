interface Cell {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    painter: CellPainter;
}

export interface CellPainter {
    (ctx: CanvasRenderingContext2D, size: number): void;
}

const rows: Cell[][] = [];
const containerElement = document.querySelector(".container");
if (!containerElement) throw "missing container";

// Adds a new row of cells to the bottom of the stack.
export const newRow = (...painters: CellPainter[]) => {
    const rowElement = document.createElement("div");
    rowElement.classList.add("row");
    containerElement.appendChild(rowElement);

    const cells: Cell[] = [];
    for (const painter of painters) {
        const canvas = document.createElement("canvas");
        rowElement.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) throw "missing canvas context";

        const cell = {canvas, ctx, painter};
        cells.push(cell);
    }
    rows.push(cells);

    redraw();
};

// Lazily redraw canvas to match window resolution.
let redrawTimeout: undefined | number = undefined;
const redraw = () => {
    window.clearTimeout(redrawTimeout);
    redrawTimeout = window.setTimeout(() => {
        for (const row of rows) {
            // Compute new size from width;
            const rowStyle = window.getComputedStyle(row[0].canvas.parentElement || document.body);
            const rowWidth = Number(rowStyle.getPropertyValue("width").slice(0, -2));
            const rowSize = rowWidth * window.devicePixelRatio;

            const cellSize = rowSize / row.length;
            console.log(cellSize);
            for (const cell of row) {
                // Resize canvas;
                cell.canvas.width = cellSize;
                cell.canvas.height = cellSize;

                // Redraw canvas contents.
                cell.painter(cell.ctx, cellSize);
            }
        }
    }, 100);
};

window.addEventListener("load", redraw);
window.addEventListener("resize", redraw);
