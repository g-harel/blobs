import {Animation} from "./animate";
import {BlobOptions, CanvasOptions} from "./blobs";
import {genFromOptions} from "../internal/gen";
import {noise} from "../internal/rand";

export interface WiggleOptions {
    speed: number;
    delay?: number;
}

export const wigglePreset = (
    animation: Animation,
    blobOptions: BlobOptions,
    canvasOptions: CanvasOptions,
    wiggleOptions: WiggleOptions,
) => {
    const leapSize = 0.01 * wiggleOptions.speed;

    // Interval at which a new sample is taken.
    // Multiple of 16 to do work every N frames.
    const intervalMs = 16 * 5;

    const noiseField = noise(String(blobOptions.seed));

    let count = 0;
    const loopAnimation = (first?: boolean, delay?: number) => {
        count++;
        animation.transition({
            duration: first ? 0 : intervalMs,
            delay: delay || 0,
            timingFunction: "linear",
            canvasOptions,
            points: genFromOptions(blobOptions, (index) => {
                return noiseField(leapSize * count, index);
            }),
            callback: loopAnimation,
        });
    };
    loopAnimation(true, wiggleOptions.delay);
};
