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
