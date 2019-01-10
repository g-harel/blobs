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

export interface BlobOptions {
    // Bounding box dimensions.
    size: number;

    // Shape complexity.
    complexity: number;

    // Shape contrast.
    contrast: number;

    // Fill color.
    color?: string;

    stroke?: {
        // Stroke color.
        color: string;

        // Stroke width.
        width: number;
    };

    // Value to seed random number generator.
    seed?: string;

    // Render points, handles and stroke.
    guides?: boolean;
}

export interface SmoothingOptions {
    // Declare whether the path is closed.
    // This option is currently always true.
    closed: true;

    // Smoothing strength as ration [0,1].
    strength: number;
}

export interface RenderOptions {
    // Viewport size.
    width: number;
    height: number;

    // Transformation applied to all drawn points.
    transform?: string;

    // Declare whether the path should be closed.
    // This option is currently always true.
    closed: true;

    // Output path styling.
    fill?: string;
    stroke?: string;
    strokeWidth?: number;

    // Option to render guides (points, handles and viewport).
    guides?: boolean;
    boundingBox?: boolean;
}
