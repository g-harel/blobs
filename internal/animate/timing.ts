export interface TimingFunc {
    (percentage: number): number;
}

const linear: TimingFunc = (p) => {
    return p;
};

const easeIn: TimingFunc = (p) => {
    return 1 - (p - 1) ** 2;
};

const easeOut: TimingFunc = (p) => {
    return 1 - easeIn(1 - p);
};

const easeInOut: TimingFunc = (p) => {
    return 0.5 + 0.5 * Math.sin(Math.PI * (p + 1.5));
};

const elasticIn = (s: number): TimingFunc => (p) => {
    return Math.pow(2, -10 * p) * Math.sin(((p - s / 4) * (2 * Math.PI)) / s) + 1;
};

const elasticOut = (s: number): TimingFunc => (p) => {
    return 1 - elasticIn(s)(1 - p);
};

// https://www.desmos.com/calculator/fqisoq1kuw
// TODO lower magnitude/amount of bounce.
// TODO Rename in/out to avoid confusion (out is out from point before).
export const timingFunctions = {
    linear,
    easeIn,
    easeOut,
    easeInOut,
    elasticIn0: elasticIn(1),
    elasticIn1: elasticIn(0.16),
    elasticIn2: elasticIn(0.09),
    elasticIn3: elasticIn(0.05),
    elasticOut0: elasticOut(1),
    elasticOut1: elasticOut(0.16),
    elasticOut2: elasticOut(0.09),
    elasticOut3: elasticOut(0.05),
};

// Type assertion.
const _: Record<string, TimingFunc> = timingFunctions;
