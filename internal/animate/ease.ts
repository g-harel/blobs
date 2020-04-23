import {InterpolationFunc} from "./types";

export const linear: InterpolationFunc = (percentage: number) => {
    return percentage;
};

export const ease: InterpolationFunc = (percentage: number) => {
    return 0.5 + 0.5 * Math.sin(Math.PI * (percentage + 1.5));
};

export const easeStart: InterpolationFunc = (percentage: number) => {
    return percentage ** 2;
};

export const easeEnd: InterpolationFunc = (percentage: number) => {
    return 1 - (percentage - 1) ** 2;
};

export const bounce: InterpolationFunc = (percentage: number) => {
    const p = 0.1;
    return Math.pow(2, -10 * percentage) * Math.sin(((percentage - p / 4) * (2 * Math.PI)) / p) + 1;
};
