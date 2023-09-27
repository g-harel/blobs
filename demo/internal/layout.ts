import {tempStyles} from "./canvas";
import {isDebug, onDebugStateChange} from "./debug";

export const colors = {
    debug: "green",
    highlight: "#ec576b",
    secondary: "#555",
};

interface Cell {
    aspectRatio: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    painter: CellPainter;
    animationID: number;
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

// Global cell state.
const cells = ((window as any).cells as Cell[][]) || [];
((window as any).cells as Cell[][]) = cells;

const containerElement = document.querySelector(".container");
if (!containerElement) throw "missing container";

const howItWorksElement = document.querySelector(".how-it-works");
if (!howItWorksElement) throw "missing container";

let animating = false;
const reveal = () => {
    containerElement.classList.add("open");
    howItWorksElement.classList.add("hidden");
    animating = true;
    redraw();
};
howItWorksElement.addEventListener("click", reveal);
if (document.location.hash || isDebug()) setTimeout(reveal);

export const sizes = (): {width: number; pt: number} => {
    const sectionStyle = window.getComputedStyle(
        (containerElement.lastChild as any) || document.body,
    );
    const sectionWidth = Number(sectionStyle.getPropertyValue("width").slice(0, -2));
    const width = sectionWidth * window.devicePixelRatio;
    return {width, pt: width * 0.002};
};

const createSection = (): HTMLElement => {
    const numberLabel = ("000" + cells.length).substr(-3);

    const sectionElement = document.createElement("div");
    sectionElement.classList.add("section");
    sectionElement.setAttribute("id", numberLabel);
    containerElement.appendChild(sectionElement);

    const numberElement = document.createElement("a");
    numberElement.classList.add("number");
    numberElement.setAttribute("href", "#" + numberLabel);
    numberElement.appendChild(document.createTextNode(numberLabel));
    sectionElement.appendChild(numberElement);

    return sectionElement;
};

// Adds a section of text to the bottom of the layout.
export const addTitle = (heading: number, text: string) => {
    const wrapperElement = document.createElement(`h${heading}`);
    wrapperElement.classList.add("title");
    containerElement.appendChild(wrapperElement);

    const textWrapperElement = document.createElement("div");
    textWrapperElement.classList.add("text");
    wrapperElement.appendChild(textWrapperElement);

    text = text.replace("\n", " ").replace(/\s+/g, " ").trim();
    const textElement = document.createTextNode(text);
    textWrapperElement.appendChild(textElement);
};

const handleIntersection = (entries: any) => {
    entries.map((entry: any) => {
        entry.target.setAttribute("data-visible", entry.isIntersecting);
    });
};

// Adds a row of cells to the bottom of the layout.
export const addCanvas = (aspectRatio: number, ...painters: CellPainter[]) => {
    const sectionElement = createSection();

    if (painters.length == 0) {
        painters = [() => {}];
    }

    const cellRow: Cell[] = [];
    for (const painter of painters) {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        sectionElement.appendChild(cellElement);

        const canvas = document.createElement("canvas");
        cellElement.appendChild(canvas);

        const labelElement = document.createElement("div");
        labelElement.classList.add("label");
        cellElement.appendChild(labelElement);

        const ctx = canvas.getContext("2d");
        if (!ctx) throw "missing canvas context";

        const cell = {aspectRatio, canvas, ctx, painter, animationID: -1};
        cellRow.push(cell);

        new IntersectionObserver(handleIntersection, {
            threshold: 0.1,
        }).observe(canvas);
    }
    cells.push(cellRow);

    redraw();
};

// Lazily redraw canvas cells to match window resolution.
let redrawTimeout: undefined | number = undefined;
const redraw = () => {
    window.clearTimeout(redrawTimeout);
    redrawTimeout = window.setTimeout(() => {
        for (const cellRow of cells) {
            const cellWidth = sizes().width / cellRow.length;
            for (const cell of cellRow) {
                const cellHeight = cellWidth / cell.aspectRatio;

                // Resize canvas;
                cell.canvas.width = cellWidth;
                cell.canvas.height = cellHeight;

                // Draw canvas debug info.
                const drawDebug = () => {
                    if (isDebug()) {
                        tempStyles(
                            cell.ctx,
                            () => (cell.ctx.strokeStyle = colors.debug),
                            () => cell.ctx.strokeRect(0, 0, cellWidth, cellHeight - 1),
                        );
                    }
                };
                drawDebug();

                // Keep track of paused state.
                let pausedAt = 0;
                let pauseOffset = 0;
                cell.canvas.onclick = () => {
                    if (pausedAt === 0) {
                        pausedAt = Date.now();
                    } else {
                        pauseOffset += Date.now() - pausedAt;
                        pausedAt = 0;
                    }
                };

                // Cell-specific callback for providing an animation painter.
                const animate = (painter: AnimationPainter) => {
                    if (!animating) return;

                    const animationID = Math.random();
                    const startTime = Date.now();
                    cell.animationID = animationID;

                    const drawFrame = () => {
                        // Stop animating if cell is redrawn.
                        if (cell.animationID !== animationID) return;

                        const visible = cell.canvas.getAttribute("data-visible") === "true";
                        if (pausedAt === 0 && visible) {
                            const frameTime = Date.now() - startTime - pauseOffset;
                            cell.ctx.clearRect(0, 0, cellWidth, cellHeight);
                            drawDebug();
                            if (isDebug()) {
                                tempStyles(
                                    cell.ctx,
                                    () => (cell.ctx.fillStyle = colors.debug),
                                    () => cell.ctx.fillText(String(frameTime), 10, 15),
                                );
                            }
                            painter(frameTime);
                        }

                        requestAnimationFrame(drawFrame);
                    };
                    drawFrame();
                };

                // Redraw canvas contents and replace label if changed.
                const label = cell.painter(cell.ctx, cellWidth, cellHeight, animate);
                if (label) {
                    const cellElement = cell.canvas.parentElement;
                    if (cellElement) {
                        cellElement.style.width = `${100 / cellRow.length}%`;
                        const labelElement = cellElement.querySelector(".label");
                        if (labelElement && labelElement.innerHTML !== label) {
                            labelElement.innerHTML = "";
                            labelElement.innerHTML = label;
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
