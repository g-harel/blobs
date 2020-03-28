import {Point} from "./types";
import {smooth} from "./util";

export const genBlob = (pointCount: number, offset: () => number): Point[] => {
    const angle = (Math.PI * 2) / pointCount;

    const points: Point[] = [];
    for (let i = 0; i < pointCount; i++) {
        const randPointOffset = offset();
        const pointX = Math.sin(i * angle);
        const pointY = Math.cos(i * angle);
        points.push({
            x: 0.5 + pointX * randPointOffset,
            y: 0.5 + pointY * randPointOffset,
            handleIn: {angle: 0, length: 0},
            handleOut: {angle: 0, length: 0},
        });
    }

    // https://math.stackexchange.com/a/873589/235756
    const smoothingStrength = ((4 / 3) * Math.tan(angle / 4)) / Math.sin(angle / 2) / 2;

    return smooth(points, smoothingStrength);
};
