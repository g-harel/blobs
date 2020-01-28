import {Shape} from "./types";
import {smooth} from "../internal/util";

export const genBlob = (points: number, offset: () => number): Shape => {
    const angle = (Math.PI * 2) / points;
    const boundingSize = 1;
    const boundingCenter = boundingSize / 2;

    const shape: Shape = [];
    for (let i = 0; i < points; i++) {
        const randPointOffset = offset();
        const pointX = Math.sin(i * angle);
        const pointY = Math.cos(i * angle);
        shape.push({
            x: boundingCenter + pointX * randPointOffset,
            y: boundingCenter + pointY * randPointOffset,
            handleIn: {angle: 0, length: 0},
            handleOut: {angle: 0, length: 0},
        });
    }

    // https://math.stackexchange.com/a/873589/235756
    const smoothingStrength = ((4 / 3) * Math.tan(angle / 4)) / Math.sin(angle / 2) / 2;

    return smooth(shape, smoothingStrength);
};
