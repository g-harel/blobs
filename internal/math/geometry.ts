import {deg} from "./unit";

export interface Point {
    x: number;
    y: number;
}

// Calculates distance between two points.
export const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

// Calculates the angle of the line from p1 to p2 in degrees.
export const angle = (p1: Point, p2: Point): number => {
    return deg(Math.atan2(p2.y - p1.y, p2.x - p1.x));
};
