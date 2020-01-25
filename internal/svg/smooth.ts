import {Point} from "./point";
import {loopAccess} from "./util";
import {angle, distance} from "../math/geometry";

export interface SmoothingOptions {
    // Declare whether the path is closed.
    // This option is currently always true.
    closed: true;

    // Smoothing strength as ratio [0,1].
    strength: number;
}

// Smooths out the path made up of the given points.
// Existing handles are ignored.
export const smooth = (points: Point[], opt: SmoothingOptions): Point[] => {
    if (points.length < 3) throw new Error("not enough points to smooth shape");

    const out: Point[] = [];

    for (let i = 0; i < points.length; i++) {
        const curr = loopAccess(points)(i);
        const before = loopAccess(points)(i - 1);
        const after = loopAccess(points)(i + 1);

        out.push({
            x: curr.x,
            y: curr.y,
            handles: {
                angle: angle(before, after),
                in: opt.strength * (1 / 2) * distance(curr, before),
                out: opt.strength * (1 / 2) * distance(curr, after),
            },
        });
    }

    return out;
};
