export interface Coord {
    // Horizontal distance towards the right from the left edge of the canvas.
    x: number;
    // Vertical distance downwards from the top of the canvas.
    y: number;
}

export interface Handle {
    // Angle in radians relative to the 3:00 position going clockwise.
    angle: number;
    // Length of the handle.
    length: number;
}

export interface Point extends Coord {
    // Cubic bezier handles.
    handleIn: Handle;
    handleOut: Handle;
}

export type Shape = Point[];
