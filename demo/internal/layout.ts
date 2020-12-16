import {tempStyles} from "./canvas";
import {debug, debugColor, onDebugStateChange} from "./debug";

export const highlightColor = "#ec576b";

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
    animationID: number;
}

interface Row {
    type: RowType;
    cells?: Cell[];
    text?: Text;
}

export interface CellPainter {
    (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        animate: (painter: AnimationPainter) => void,
    ): void;
}

export interface AnimationPainter {
    (timestamp: number): void;
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
export const addText = (text: string) => {
    const rowElement = document.createElement("div");
    rowElement.classList.add("row", "text");
    containerElement.appendChild(rowElement);

    text = text.replace("\n", " ").replace(/\s+/g, " ").trim();
    const textElement = document.createTextNode(text);
    rowElement.appendChild(textElement);

    rows.push({
        type: RowType.TEXT,
        text: {text, title: false},
    });
};

// Adds a new row of cells to the bottom of the stack.
export const addCanvas = (aspectRatio: number, ...painters: CellPainter[]) => {
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

        const cell = {aspectRatio, canvas, ctx, painter, animationID: -1};
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
                const drawDebug = () => {
                    if (debug) {
                        tempStyles(cell.ctx, () => {
                            cell.ctx.strokeStyle = debugColor;
                            cell.ctx.strokeRect(0, 0, cellWidth, cellHeight - 1);
                        });
                    }
                };
                drawDebug();

                const animate = (painter: AnimationPainter) => {
                    const animationID = Math.random();
                    const startTime = Date.now();
                    cell.animationID = animationID;

                    const drawFrame = () => {
                        // Stop animating if cell is redrawn.
                        if (cell.animationID !== animationID) {
                            return;
                        }

                        const frameTime = Date.now() - startTime;
                        cell.ctx.clearRect(0, 0, cellWidth, cellHeight);
                        drawDebug();
                        if (debug) {
                            tempStyles(cell.ctx, () => {
                                cell.ctx.fillStyle = debugColor;
                                cell.ctx.fillText(String(frameTime), 10, 15);
                            });
                        }

                        painter(frameTime);
                        requestAnimationFrame(drawFrame);
                    };
                    drawFrame();
                };

                // Redraw canvas contents.
                cell.painter(cell.ctx, cellWidth, cellHeight, animate);
            }
        }
    }, 100);
};

window.addEventListener("load", redraw);
window.addEventListener("resize", redraw);
onDebugStateChange(redraw);
