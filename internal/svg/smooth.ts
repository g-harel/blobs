import {Point} from "./point";
import {loopAccess} from "./util";
import {angle, distance} from "../math/geometry";

export interface SmoothingOptions {
    // Declare whether the path is closed.
    // This option is currently always true.
    closed: true;

    // Smoothing strength as ration [0,1].
    strength: number;
}

// Smooths out the path made up of the given points. This will override the existing handles.
// https://math.stackexchange.com/questions/873224/calculate-control-points-of-cubic-bezier-curve-approximating-a-part-of-a-circle
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
