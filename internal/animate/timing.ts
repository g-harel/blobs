export interface TimingFunc {
    (percentage: number): number;
}

const linear: TimingFunc = (p) => {
    return p;
};

const easeEnd: TimingFunc = (p) => {
    return 1 - (p - 1) ** 2;
};

const easeStart: TimingFunc = (p) => {
    return 1 - easeEnd(1 - p);
};

const ease: TimingFunc = (p) => {
    return 0.5 + 0.5 * Math.sin(Math.PI * (p + 1.5));
};

const elasticEnd = (s: number): TimingFunc => (p) => {
    return Math.pow(2, -10 * p) * Math.sin(((p - s / 4) * (2 * Math.PI)) / s) + 1;
};

// https://www.desmos.com/calculator/fqisoq1kuw
export const timingFunctions = {
    linear,
    easeEnd,
    easeStart,
    ease,
    elasticEnd0: elasticEnd(1),
    elasticEnd1: elasticEnd(0.64),
    elasticEnd2: elasticEnd(0.32),
    elasticEnd3: elasticEnd(0.16),
};

// @ts-ignore: Type assertion.
const _: Record<string, TimingFunc> = timingFunctions;
