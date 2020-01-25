import {Shape} from "../types";

export interface EasingFunc {
    (progress: number): number;
}

export interface Keyframe {
    shape: Shape;
    easeIn: EasingFunc;
    easeOut: EasingFunc;
}
