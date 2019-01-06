import {distance, rad, loopAccess} from "./util";
import {Point, renderClosed} from "./render";

export interface BlobOptions {
    size: number;
    color: string;
    complexity: number;
    contrast: number;
}

// Generates a random rounded shape.
export const blob = (opt: BlobOptions): string => {
    opt = Object.assign({}, opt);

    if (opt.complexity <= 0 || opt.complexity > 1) {
        throw new Error("complexity out of range ]0,1]");
    }

    if (opt.contrast < 0 || opt.contrast > 1) {
        throw new Error("contrast out of range [0,1]");
    }

    const count = 3 + Math.floor(14 * opt.complexity);
    const angle = 360 / count;
    const radius = opt.size / 3;
    const handle = radius * (4 / 3) * Math.tan(rad(angle / 4));

    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
        const rand = 1 - 0.8 * opt.contrast * Math.random();

        points.push({
            x: Math.sin(rad(i * angle)) * radius * rand + opt.size / 2,
            y: Math.cos(rad(i * angle)) * radius * rand + opt.size / 2,
            handles: {
                angle: -i * angle,
                in: handle,
                out: handle,
            },
        });
    }

    // Adjust handle lengths according to proximity with adjacent points.
    const expected = 2 * radius * Math.sin(rad(angle / 2));
    for (let i = 0; i < count; i++) {
        const point = loopAccess(points)(i);
        if (!point.handles) continue; // Should not happen.

        const {handles} = point;
        handles.in = (handles.in * distance(point, loopAccess(points)(i - 1))) / expected;
        handles.out = (handles.out * distance(point, loopAccess(points)(i + 1))) / expected;
    }

    return renderClosed(points, {
        width: opt.size,
        height: opt.size,
        fill: opt.color,
        transform: `rotate(${Math.random() * angle},${opt.size / 2},${opt.size / 2})`,
        stroke: "red",
        strokeWidth: 2,
        guides: true,
    });
};

console.log(
    blob({
        color: "pink",
        complexity: 0.2,
        contrast: 1,
        size: 600,
    }),
);

// console.log(
//     renderClosed(
//         [
//             {x: 700, y: 200, handles: {angle: -135, out: 80, in: 80}},
//             {x: 300, y: 200, handles: {angle: 135, out: 80, in: 80}},
//             {x: 300, y: 600, handles: {angle: 45, out: 80, in: 80}},
//             {x: 700, y: 600, handles: {angle: -45, out: 80, in: 80}},
//         ],
//         {
//             width: 1000,
//             height: 800,
//             fill: "pink",
//             stroke: "red",
//             strokeWidth: 2,
//             guides: true,
//         },
//     ),
// );
