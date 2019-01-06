import {Point, RenderOptions, SVGPoint, SmoothingOptions} from "./types";

// Safe array access at any index using a modulo operation that will always be positive.
export const loopAccess = <T>(arr: T[]) => (i: number): T => {
    return arr[((i % arr.length) + arr.length) % arr.length];
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
export const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

// Calculates the angle of the line from p1 to p2 in degrees.
export const angle = (p1: Point, p2: Point): number => {
    return deg(Math.atan2(p2.y - p1.y, p2.x - p1.x));
};

// Translates a point's [x,y] cartesian coordinates into values relative to the viewport.
// Translates the angle from degrees to radians and moves the start angle a half rotation.
export const interpolate = (point: Point, opt: RenderOptions): SVGPoint => {
    const handles = point.handles || {angle: 0, out: 0, in: 0};
    handles.angle = Math.PI + rad(handles.angle);
    return {
        x: point.x,
        y: opt.height - point.y,
        handles,
    };
};

// Smooths out the path made up of the given points. This will override the existing handles.
export const smooth = (points: Point[], opt: SmoothingOptions): Point[] => {
    if (points.length === 2) return points;

    const out: Point[] = [];

    for (let i = 0; i < points.length; i++) {
        const point = loopAccess(points)(i);
        const before = loopAccess(points)(i - 1);
        const after = loopAccess(points)(i + 1);

        out.push({
            x: point.x,
            y: point.y,
            handles: {
                angle: angle(before, after),
                in: opt.strength * (1 / 2) * distance(point, before),
                out: opt.strength * (1 / 2) * distance(point, after),
            },
        });
    }

    return out;
};

// Seeded random number generator.
// https://stackoverflow.com/a/47593316/3053361
export const rand = (seed: string) => {
    const xfnv1a = (str: string) => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        }
        return () => {
            h += h << 13;
            h ^= h >>> 7;
            h += h << 3;
            h ^= h >>> 17;
            return (h += h << 5) >>> 0;
        };
    };

    const sfc32 = (a: number, b: number, c: number, d: number) => () => {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        var t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };

    const seedGenerator = xfnv1a(seed);
    return sfc32(seedGenerator(), seedGenerator(), seedGenerator(), seedGenerator());
};
