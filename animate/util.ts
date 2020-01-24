import {Coord} from "./bezier/types";

export const distance = (a: Coord, b: Coord): number => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

export const split = (percentage: number, a: number, b: number): number => {
    return a + percentage * (b - a);
};

export const splitLine = (percentage: number, a: Coord, b: Coord): Coord => {
    return {
        x: split(percentage, a.x, b.x),
        y: split(percentage, a.y, b.y),
    };
};
