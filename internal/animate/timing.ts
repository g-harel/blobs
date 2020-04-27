export interface TimingFunc {
    (percentage: number): number;
}

const linear: TimingFunc = (percentage: number) => {
    return percentage;
};

const easeIn: TimingFunc = (percentage: number) => {
    return 1 - (percentage - 1) ** 2;
};

const easeOut: TimingFunc = (percentage: number) => {
    return 1 - easeIn(1 - percentage);
};

const easeInOut: TimingFunc = (percentage: number) => {
    return 0.5 + 0.5 * Math.sin(Math.PI * (percentage + 1.5));
};

const elastic = (): TimingFunc => (percentage: number) => {
    const p = 0.1;
    return Math.pow(2, -10 * percentage) * Math.sin(((percentage - p / 4) * (2 * Math.PI)) / p) + 1;
};

export const timingFunctions = {
    linear,
    easeIn,
    easeOut,
    easeInOut,
    elastic,
};
