import {Shape} from "../types";
import {split, splitLine} from "../util";

const interpolateAngle = (percentage: number, a: number, b: number): number => {
    const tau = Math.PI * 2;
    let aNorm = ((a % tau) + tau) % tau;
    let bNorm = ((b % tau) + tau) % tau;
    if (Math.abs(aNorm - bNorm) > Math.PI) {
        if (aNorm < bNorm) {
            aNorm += tau;
        } else {
            bNorm += tau;
        }
    }
    return split(percentage, aNorm, bNorm);
};

const interpolateBetween = (percentage: number, a: Shape, b: Shape): Shape => {
    if (a.length !== b.length) throw new Error("shapes have different number of points");
    const shape: Shape = [];
    for (let i = 0; i < a.length; i++) {
        shape.push({
            ...splitLine(percentage, a[i], b[i]),
            handleIn: {
                angle: interpolateAngle(percentage, a[i].handleIn.angle, b[i].handleIn.angle),
                length: split(percentage, a[i].handleIn.length, b[i].handleIn.length),
            },
            handleOut: {
                angle: interpolateAngle(percentage, a[i].handleOut.angle, b[i].handleOut.angle),
                length: split(percentage, a[i].handleOut.length, b[i].handleOut.length),
            },
        });
    }
    return shape;
};

export const interpolateBetweenLoop = (percentage: number, a: Shape, b: Shape): Shape => {
    if (percentage < 0.5) {
        return interpolateBetween(2 * percentage, a, b);
    } else {
        return interpolateBetween(2 * percentage - 1, b, a);
    }
};
