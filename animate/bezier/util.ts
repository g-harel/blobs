import {Coord, Handle, Point, Shape} from "./types";
import {distance, splitLine} from "../util";

export const copyPoint = (p: Point): Point => ({
    x: p.x,
    y: p.y,
    handleIn: {...p.handleIn},
    handleOut: {...p.handleOut},
});

export const expandHandle = (point: Coord, handle: Handle): Coord => {
    return {
        x: point.x + handle.length * Math.cos(handle.angle),
        y: point.y + handle.length * Math.sin(handle.angle),
    };
};

const collapseHandle = (point: Coord, handle: Coord): Handle => {
    const dx = handle.x - point.x;
    const dy = -handle.y + point.y;
    let angle = Math.atan2(dy, dx);
    return {
        angle: angle < 0 ? Math.abs(angle) : 2 * Math.PI - angle,
        length: Math.sqrt(dx ** 2 + dy ** 2),
    };
};

export const length = (a: Point, b: Point): number => {
    const aHandle = expandHandle(a, a.handleOut);
    const bHandle = expandHandle(b, b.handleIn);
    const ab = distance(a, b);
    const abHandle = distance(aHandle, bHandle);
    return (ab + abHandle + a.handleOut.length + b.handleIn.length) / 2;
};

export const reverse = (shape: Shape): Shape => {
    const inverted: Shape = [];
    for (let i = 0; i < shape.length; i++) {
        const j = shape.length - i - 1;
        const p = copyPoint(shape[j]);
        p.handleIn.angle += Math.PI;
        p.handleOut.angle += Math.PI;
        inverted.push(p);
    }
    return inverted;
};

export const shift = (offset: number, shape: Shape): Shape => {
    if (offset === 0) return shape;
    const out: Shape = [];
    for (let i = 0; i < shape.length; i++) {
        out.push(shape[(i + offset) % shape.length]);
    }
    return out;
};

// Add a control point to the curve between a and b.
// Percentage [0, 1] from a to b.
// a: original first point.
// b: original last point.
// c: new first point.
// d: new added point.
// e: new last point.
// f: split point between a and b's handles.
// g: split point between c's handle and f.
// h: split point between e's handle and f.
export const split = (percentage: number, a: Point, b: Point): [Point, Point, Point] => {
    const c = copyPoint(a);
    c.handleOut.length *= percentage;

    const e = copyPoint(b);
    e.handleIn.length *= 1 - percentage;

    const aHandle = expandHandle(a, a.handleOut);
    const bHandle = expandHandle(b, b.handleIn);
    const cHandle = expandHandle(c, c.handleOut);
    const eHandle = expandHandle(e, e.handleIn);
    const f = splitLine(percentage, aHandle, bHandle);
    const g = splitLine(percentage, cHandle, f);
    const h = splitLine(1 - percentage, eHandle, f);
    const dCoord = splitLine(percentage, g, h);

    const d: Point = {
        x: dCoord.x,
        y: dCoord.y,
        handleIn: collapseHandle(dCoord, g),
        handleOut: collapseHandle(dCoord, h),
    };
    return [c, d, e];
};
