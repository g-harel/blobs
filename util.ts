interface Point {
    x: number;
    y: number;
}

// Safe array access at any index using a modulo operation that will always be positive.
export const loopAccess = <T>(arr: T[]) => (i: number): T => {
    return arr[((i % arr.length) + arr.length) % arr.length];
};

// Converts degrees to radians.
export const rad = (deg: number) => {
    return (deg / 360) * 2 * Math.PI;
};

// Calculates distance between two points.
export const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};
