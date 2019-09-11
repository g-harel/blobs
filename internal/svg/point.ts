import {rad} from "../math/unit";

export interface Point {
    // Cartesian coordinates (starting at [0,0] in the bottom left).
    x: number;
    y: number;

    // Optional cubic bezier handle configuration.
    handles?: {
        // Direction of the outgoing path in degrees. Value is relative to the 3:00 position
        // on a clock and the positive direction is counter-clockwise.
        angle: number;

        // Distance between each handle and the point.
        out: number;
        in: number;
    };
}

export interface SVGPoint {
    // Coordinates of the point in the SVG viewport.
    x: number;
    y: number;

    // Cubic bezier handle configuration.
    handles: {
        // Direction of the outgoing path in radians. Value is relative to the 9:00 position
        // on a clock and the positive direction is counter-clockwise.
        angle: number;

        // Distance between each handle and the point.
        out: number;
        in: number;
    };
}

// Translates a point's [x,y] cartesian coordinates into values relative to the viewport.
// Translates the angle from degrees to radians and moves the start angle a half rotation.
export const interpolate = (point: Point, height: number): SVGPoint => {
    const handles = point.handles || {angle: 0, out: 0, in: 0};
    handles.angle = Math.PI + rad(handles.angle);
    return {
        x: point.x,
        y: height - point.y,
        handles,
    };
};
