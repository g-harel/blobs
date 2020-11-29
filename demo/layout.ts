import {debug, debugColor, onDebugStateChange} from "./debug";

enum RowType {
    CANVAS,
    TEXT,
}

interface Text {
    text: string;
    title: boolean;
}

interface Cell {
    aspectRatio: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    painter: CellPainter;
}

interface Row {
    type: RowType;
    cells?: Cell[];
    text?: Text;
}

export interface CellPainter {
    (ctx: CanvasRenderingContext2D, width: number, height: number): void | number;
}

const rows: Row[] = [];
const containerElement = document.querySelector(".container");
if (!containerElement) throw "missing container";

export const getTotalWidth = () => {
    const rowStyle = window.getComputedStyle((containerElement.firstChild as any) || document.body);
    const rowWidth = Number(rowStyle.getPropertyValue("width").slice(0, -2));
    return rowWidth * window.devicePixelRatio;
};

// Adds a new row of text to the bottom of the stack.
export const addTextRow = (title: boolean, text: string) => {
    const rowElement = document.createElement("div");
    rowElement.classList.add("row", "text");
    containerElement.appendChild(rowElement);

    const textElement = document.createTextNode(text);
    rowElement.appendChild(textElement);

    rows.push({
        type: RowType.TEXT,
        text:{text, title},
    });
};

// Adds a new row of cells to the bottom of the stack.
export const addCanvasRow = (aspectRatio: number, ...painters: CellPainter[]) => {
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
    rows.push({
        type: RowType.CANVAS,
        cells,
    });

    redraw();
};

// Lazily redraw canvas cells to match window resolution.
let redrawTimeout: undefined | number = undefined;
const redraw = () => {
    window.clearTimeout(redrawTimeout);
    redrawTimeout = window.setTimeout(() => {
        for (const row of rows) {
            if (row.type !== RowType.CANVAS || !row.cells) continue;
            const cellWidth = getTotalWidth() / row.cells.length;
            for (const cell of row.cells) {
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
