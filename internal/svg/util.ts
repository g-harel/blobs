// Safe array access at any index using a modulo operation that will always be positive.
export const loopAccess = <T>(arr: T[]) => (i: number): T => {
    return arr[((i % arr.length) + arr.length) % arr.length];
};
