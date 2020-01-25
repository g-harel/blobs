import {Shape} from "../types";
import {loopAccess} from "./util";
import {distance} from "../math/geometry";
import {angleBetween} from "../shape/util";

// Smooths out the path made up of the given points.
// Existing handles are ignored.
export const smooth = (shape: Shape, strength: number): Shape => {
    if (shape.length < 3) throw new Error("not enough points to smooth shape");

    const out: Shape = [];

    for (let i = 0; i < shape.length; i++) {
        const curr = loopAccess(shape)(i);
        const before = loopAccess(shape)(i - 1);
        const after = loopAccess(shape)(i + 1);
        const angle = angleBetween(before, after);

        out.push({
            x: curr.x,
            y: curr.y,
            handleIn: {
                angle: angle + Math.PI,
                length: strength * (1 / 2) * distance(curr, before),
            },
            handleOut: {
                angle,
                length: strength * (1 / 2) * distance(curr, after),
            },
        });
    }

    return out;
};
