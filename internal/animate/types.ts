import {Shape} from "../shape/types";

export interface EasingFunc {
    (progress: number): number;
}

export interface Keyframe {
    shape: Shape;
    easeIn: EasingFunc;
    easeOut: EasingFunc;
}
