import {Coord, Handle, Point} from "./types";

export const copyPoint = (p: Point): Point => ({
    x: p.x,
    y: p.y,
    handleIn: {...p.handleIn},
    handleOut: {...p.handleOut},
});

export interface PointIteratorArgs {
    curr: Point;
    index: number;
    sibling: (pos: number) => Point;
    prev: () => Point;
    next: () => Point;
}

export const coordPoint = (coord: Coord): Point => {
    return {
        ...coord,
        handleIn: {angle: 0, length: 0},
        handleOut: {angle: 0, length: 0},
    };
};

export const forPoints = (points: Point[], callback: (args: PointIteratorArgs) => void) => {
    for (let i = 0; i < points.length; i++) {
        const sibling = (pos: number) => copyPoint(points[mod(pos, points.length)]);
        callback({
            curr: copyPoint(points[i]),
            index: i,
            sibling,
            prev: () => sibling(i - 1),
            next: () => sibling(i + 1),
        });
    }
};

export const mapPoints = (
    points: Point[],
    callback: (args: PointIteratorArgs) => Point,
): Point[] => {
    const out: Point[] = [];
    forPoints(points, (args) => {
        out.push(callback(args));
    });
    return out;
};

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

export const reverse = (points: Point[]): Point[] => {
    return mapPoints(points, ({index, sibling}) => {
        const point = sibling(points.length - index - 1);
        point.handleIn.angle += Math.PI;
        point.handleOut.angle += Math.PI;
        return point;
    });
};

export const shift = (offset: number, points: Point[]): Point[] => {
    return mapPoints(points, ({index, sibling}) => {
        return sibling(index + offset);
    });
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

export const insertCount = (count: number, a: Point, b: Point): Point[] => {
    if (count < 2) return [a, b];
    const percentage = 1 / count;
    const [c, d, e] = insertAt(percentage, a, b);
    if (count === 2) return [c, d, e];
    return [c, ...insertCount(count - 1, d, e)];
};

// Smooths out the path made up of the given points.
// Existing handles are ignored.
export const smooth = (points: Point[], strength: number): Point[] => {
    return mapPoints(points, ({curr, next, prev}) => {
        const angle = angleOf(prev(), next());
        return {
            x: curr.x,
            y: curr.y,
            handleIn: {
                angle: angle + Math.PI,
                length: strength * distance(curr, prev()),
            },
            handleOut: {
                angle,
                length: strength * distance(curr, next()),
            },
        };
    });
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
