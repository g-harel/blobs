import {InterpolationFunc} from "./types";

export const linear: InterpolationFunc = (progress: number) => {
    return progress;
}

export const ease: InterpolationFunc = (progress: number) => {
    return 0.5 + 0.5 * Math.sin(Math.PI * (progress + 1.5));
};

export const easeStart: InterpolationFunc = (progress: number) => {
    return progress ** 2;
};

export const easeEnd: InterpolationFunc = (progress: number) => {
    return 1 - (progress - 1) ** 2;
};
