// Position in a coordinate system with an origin in the top left corner.
export interface Coord {
    x: number;
    y: number;
}

export interface Handle {
    // Angle in radians relative to the 3:00 position going clockwise.
    angle: number;
    // Length of the handle.
    length: number;
}

// TODO? use four coord instead of angles
export interface Point extends Coord {
    // Cubic bezier handles.
    handleIn: Handle;
    handleOut: Handle;
}

export type Shape = Point[];
