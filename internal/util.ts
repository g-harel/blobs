import {Coord, Handle, Point, Shape} from "./types";

export const copyPoint = (p: Point): Point => ({
    x: p.x,
    y: p.y,
    handleIn: {...p.handleIn},
    handleOut: {...p.handleOut},
});

// TODO shape iterators

export const coordEqual = (a: Coord, b: Coord): boolean => {
    return a.x === b.x && a.y === b.y;
};

export const angleOf = (a: Coord, b: Coord): number => {
    const dx = b.x - a.x;
    const dy = -b.y + a.y;
    const angle = Math.atan2(dy, dx);
    if (angle < 0) {
        return Math.abs(angle);
    } else {
        return 2 * Math.PI - angle;
    }
};

export const expandHandle = (point: Coord, handle: Handle): Coord => ({
    x: point.x + handle.length * Math.cos(handle.angle),
    y: point.y + handle.length * Math.sin(handle.angle),
});

const collapseHandle = (point: Coord, handle: Coord): Handle => ({
    angle: angleOf(point, handle),
    length: Math.sqrt((handle.x - point.x) ** 2 + (handle.y - point.y) ** 2),
});

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
        out.push(shape[mod(i + offset, shape.length)]);
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
export const insertAt = (percentage: number, a: Point, b: Point): [Point, Point, Point] => {
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

export const insertCount = (count: number, a: Point, b: Point): Shape => {
    if (count < 2) return [a, b];
    const percentage = 1 / count;
    const [c, d, e] = insertAt(percentage, a, b);
    if (count === 2) return [c, d, e];
    return [c, ...insertCount(count - 1, d, e)];
};

// Smooths out the path made up of the given points.
// Existing handles are ignored.
export const smooth = (shape: Shape, strength: number): Shape => {
    const out: Shape = [];
    for (let i = 0; i < shape.length; i++) {
        const curr = shape[i];
        const before = shape[mod(i - 1, shape.length)];
        const after = shape[mod(i + 1, shape.length)];
        const angle = angleOf(before, after);

        out.push({
            x: curr.x,
            y: curr.y,
            handleIn: {
                angle: angle + Math.PI,
                length: strength * distance(curr, before),
            },
            handleOut: {
                angle,
                length: strength * distance(curr, after),
            },
        });
    }
    return out;
};

// Modulo operation that always produces a positive result.
// https://stackoverflow.com/q/4467539/3053361
export const mod = (a: number, n: number): number => {
    return ((a % n) + n) % n;
};

// Converts degrees to radians.
export const rad = (deg: number) => {
    return (deg / 360) * 2 * Math.PI;
};

// Converts radians to degrees.
export const deg = (rad: number) => {
    return (((rad / Math.PI) * 1) / 2) * 360;
};

// Calculates distance between two points.
export const distance = (a: Coord, b: Coord): number => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

// Calculates the angle of the line from a to b in degrees.
export const angle = (a: Coord, b: Coord): number => {
    return deg(Math.atan2(b.y - a.y, b.x - a.x));
};

export const split = (percentage: number, a: number, b: number): number => {
    return a + percentage * (b - a);
};

export const splitLine = (percentage: number, a: Coord, b: Coord): Coord => {
    return {
        x: split(percentage, a.x, b.x),
        y: split(percentage, a.y, b.y),
    };
};
