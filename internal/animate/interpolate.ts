import {Shape} from "../types";
import {split, splitLine, mod, smooth, mapShape} from "../util";

// Interpolates between angles a and b. Angles are normalized to avoid unnecessary rotation.
// Direction is chosen to produce the smallest possible movement.
const interpolateAngle = (percentage: number, a: number, b: number): number => {
    const tau = Math.PI * 2;
    let aNorm = mod(a, tau);
    let bNorm = mod(b, tau);
    if (Math.abs(aNorm - bNorm) > Math.PI) {
        if (aNorm < bNorm) {
            aNorm += tau;
        } else {
            bNorm += tau;
        }
    }
    return split(percentage, aNorm, bNorm);
};

// Interpolates linearly between shapes a and b. Can only interpolate between shapes that have the
// same number of points. Easing effects can be applied to the percentage given to this function.
// Percentages outside the 0-1 range are supported.
export const interpolateBetween = (percentage: number, a: Shape, b: Shape): Shape => {
    if (a.length !== b.length) throw new Error("shapes have different number of points");

    // Clamped range for use in values that could look incorrect otherwise.
    // ex. Handles that invert if their value goes negative (creates loops at corners).
    const clamped = Math.min(1, Math.max(0, percentage));

    const shape: Shape = [];
    for (let i = 0; i < a.length; i++) {
        shape.push({
            ...splitLine(percentage, a[i], b[i]),
            handleIn: {
                angle: interpolateAngle(percentage, a[i].handleIn.angle, b[i].handleIn.angle),
                length: split(clamped, a[i].handleIn.length, b[i].handleIn.length),
            },
            handleOut: {
                angle: interpolateAngle(percentage, a[i].handleOut.angle, b[i].handleOut.angle),
                length: split(clamped, a[i].handleOut.length, b[i].handleOut.length),
            },
        });
    }
    return shape;
};

// Interpolates between shapes a and b while applying a smoothing effect. Smoothing effect's
// strength is relative to how far away the percentage is from either 0 or 1. It is strongest in the
// middle of the animation (percentage = 0.5) or when bounds are exceeded (percentage = 1.8).
export const interpolateBetweenSmooth = (strength: number, percentage: number, a: Shape, b: Shape): Shape => {
    strength *= Math.min(1, Math.min(Math.abs(0 - percentage), Math.abs(1 - percentage)));
    const interpolated = interpolateBetween(percentage, a, b);
    const smoothed = smooth(interpolated, Math.sqrt(strength + 0.25)/3);
    return mapShape(interpolated, ({index, curr}) => {
        const sp = smoothed[index];
        curr.handleIn.angle = interpolateAngle(strength, curr.handleIn.angle, sp.handleIn.angle);
        curr.handleIn.length = split(strength, curr.handleIn.length, sp.handleIn.length);
        curr.handleOut.angle = interpolateAngle(strength, curr.handleOut.angle, sp.handleOut.angle);
        curr.handleOut.length = split(strength, curr.handleOut.length, sp.handleOut.length);
        return curr;
    });
};
