import {genBlob} from "../internal/blobs";
import {rand} from "../internal/rand";
import {Point} from "../internal/types";

export interface GenOptions {
    seed: string | number;
    extraPoints: number;
    randomness: number;
}

export interface Blob {
    points: Point[];
}

export const gen = (options: GenOptions): Blob => {
    const rgen = rand(String(options.seed));

    // Scale of random movement increases as randomness approaches infinity.
    // randomness = 0   -> rangeStart = 1
    // randomness = 2   -> rangeStart = 0.8333
    // randomness = 5   -> rangeStart = 0.6667
    // randomness = 10  -> rangeStart = 0.5
    // randomness = 20  -> rangeStart = 0.3333
    // randomness = 50  -> rangeStart = 0.1667
    // randomness = 100 -> rangeStart = 0.0909
    const rangeStart = 1 / (1 + Math.abs(options.randomness) / 10);

    return {
        points: genBlob(
            3 + Math.abs(options.extraPoints),
            () => rangeStart + rgen() * (1 - rangeStart),
        ),
    };
};
