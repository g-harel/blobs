// https://www.blobmaker.app/
// https://math.stackexchange.com/questions/873224/calculate-control-points-of-cubic-bezier-curve-approximating-a-part-of-a-circle

import {rad, smooth} from "./util";
import {render} from "./render";
import {Point, BlobOptions} from "./types";

export {BlobOptions} from "./types";

// Generates a random rounded shape.
export const blob = (opt: BlobOptions): string => {
    opt = Object.assign({}, opt);

    if (!opt.stroke && !opt.color) {
        throw new Error("no color or stroke specified")
    }

    if (opt.complexity <= 0 || opt.complexity > 1) {
        throw new Error("complexity out of range ]0,1]");
    }

    if (opt.contrast < 0 || opt.contrast > 1) {
        throw new Error("contrast out of range [0,1]");
    }

    const count = 3 + Math.floor(14 * opt.complexity);
    const angle = 360 / count;
    const radius = opt.size / Math.E;

    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
        const rand = 1 - 0.8 * opt.contrast * Math.random();

        points.push({
            x: Math.sin(rad(i * angle)) * radius * rand + opt.size / 2,
            y: Math.cos(rad(i * angle)) * radius * rand + opt.size / 2,
        });
    }

    const smoothed = smooth(points, {
        closed: true,
        strength: (4/3) * Math.tan(rad(angle/4)) / Math.sin(rad(angle/2)),
    });

    return render(smoothed, {
        closed: true,
        width: opt.size,
        height: opt.size,
        fill: opt.color,
        transform: `rotate(${Math.random() * angle},${opt.size / 2},${opt.size / 2})`,
        stroke: (opt.stroke && opt.stroke.color),
        strokeWidth: (opt.stroke && opt.stroke.width),
        guides: opt.guides,
    });
};

console.log(
    blob({
        color: "pink",
        complexity: 0.2,
        contrast: 1,
        size: 600,
        guides: true,
        stroke: {
            color: "red",
            width: 1.8,
        },
    }),
);
