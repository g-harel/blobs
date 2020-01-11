// http://www.cad.zju.edu.cn/home/zhx/papers/PoissonMorphing.pdf
// https://medium.com/@adrian_cooney/bezier-interpolation-13b68563313a

import {Point} from "../internal/svg/point";

interface EasingFunc {
    (progress: number): number;
}

interface Keyframe {
    points: Point[];
    easeIn: EasingFunc;
    easeOut: EasingFunc;
}

const interpolate = (...keyframes: Keyframe[]) => {
    // - Make all have same number of points.
    //   - Add points along path to shape with least points.
    //     - Redistribute points as evenly as possible.
    //   - Keep points at sharp edges.
    //   - Add points to both shapes to make smoother.
    // - Match points using a (customizable?) heuristic.
    //   - Proximity + angle?
    // - Interpolate between both states
    //   - Output using generator?
};
