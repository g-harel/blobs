import {tempStyles} from "./canvas";
import {debug, onDebugStateChange} from "./debug";

export const colors = {
    debug: "green",
    highlight: "#ec576b",
    secondary: "#555",
};

enum RowType {
    CANVAS,
    TEXT,
}

interface Text {
    text: string;
    title: boolean;
}

// TODO remove things that don't need to be re-rendered.
interface Cell {
    aspectRatio: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    painter: CellPainter;
    animationID: number;
}

interface Row {
    type: RowType;
    element: HTMLElement;
    cells?: Cell[];
    // TODO rename to title
    text?: Text;
}

export interface CellPainter {
    (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        animate: (painter: AnimationPainter) => void,
    ): string | void;
}

export interface AnimationPainter {
    (timestamp: number): void;
}

const rows: Row[] = [];
const containerElement = document.querySelector(".container");
if (!containerElement) throw "missing container";

export const sizes = (): {width: number; pt: number} => {
    const rowStyle = window.getComputedStyle((containerElement.firstChild as any) || document.body);
    const rowWidth = Number(rowStyle.getPropertyValue("width").slice(0, -2));
    const width = rowWidth * window.devicePixelRatio;
    return {width, pt: width * 0.002};
};

const createRow = (classes: string[] = []): HTMLElement => {
    const numberLabel = ("000" + rows.length).substr(-3);

    const rowElement = document.createElement("div");
    rowElement.classList.add("row", ...classes);
    rowElement.setAttribute("id", numberLabel);
    containerElement.appendChild(rowElement);

    const numberElement = document.createElement("a");
    numberElement.classList.add("number");
    numberElement.setAttribute("href", "#" + numberLabel);
    numberElement.appendChild(document.createTextNode(numberLabel));
    rowElement.appendChild(numberElement);

    return rowElement;
};

// Adds a new row of text to the bottom of the stack.
export const addText = (text: string) => {
    const rowElement = createRow();

    const textWrapperElement = document.createElement("div");
    textWrapperElement.classList.add("text");
    rowElement.appendChild(textWrapperElement);

    text = text.replace("\n", " ").replace(/\s+/g, " ").trim();
    const textElement = document.createTextNode(text);
    textWrapperElement.appendChild(textElement);

    rows.push({
        type: RowType.TEXT,
        element: rowElement,
        text: {text, title: false},
    });
};

// Adds a new row of cells to the bottom of the stack.
export const addCanvas = (aspectRatio: number, ...painters: CellPainter[]) => {
    const rowElement = createRow();

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

        const labelElement = document.createElement("div");
        labelElement.classList.add("label");
        cellElement.appendChild(labelElement);

        const ctx = canvas.getContext("2d");
        if (!ctx) throw "missing canvas context";

        const cell = {aspectRatio, canvas, ctx, painter, animationID: -1};
        cells.push(cell);
    }
    rows.push({
        type: RowType.CANVAS,
        element: rowElement,
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
            const cellWidth = sizes().width / row.cells.length;
            for (const cell of row.cells) {
                const cellHeight = cellWidth / cell.aspectRatio;

                // Resize canvas;
                cell.canvas.width = cellWidth;
                cell.canvas.height = cellHeight;

                // Draw canvas outline.
                const drawDebug = () => {
                    if (debug) {
                        tempStyles(cell.ctx, () => {
                            cell.ctx.strokeStyle = colors.debug;
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
                                cell.ctx.fillStyle = colors.debug;
                                cell.ctx.fillText(String(frameTime), 10, 15);
                            });
                        }

                        painter(frameTime);
                        requestAnimationFrame(drawFrame);
                    };
                    drawFrame();
                };

                // Redraw canvas contents and label.
                const label = cell.painter(cell.ctx, cellWidth, cellHeight, animate);
                if (label) {
                    const cellElement = cell.canvas.parentElement;
                    if (cellElement) {
                        cellElement.style.width = `${100 / row.cells.length}%`;
                        const labelElement = cellElement.querySelector(".label");
                        if (labelElement) {
                            // TODO only replace if changed.
                            labelElement.innerHTML = "";
                            labelElement.appendChild(document.createTextNode(label));
                        }
                    }
                }
            }
        }
    }, 100);
};

window.addEventListener("load", redraw);
window.addEventListener("resize", redraw);
onDebugStateChange(redraw);