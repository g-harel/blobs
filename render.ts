import {loopAccess, rad} from "./util";

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

interface InternalPoint {
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

export interface RenderOptions {
    // Viewport size.
    width: number;
    height: number;

    // Transformation applied to all drawn points.
    transform?: string;

    // Output path styling.
    fill?: string;
    stroke?: string;
    strokeWidth?: number;

    // Option to render guides (points, handles and viewport).
    guides?: boolean;
    boundingBox?: boolean;
}

// Translates a point's [x,y] cartesian coordinates into values relative to the viewport.
// Translates the angle from degrees to radians and moves the start angle a half rotation.
const cleanupPoint = (point: Point, opt: RenderOptions): InternalPoint => {
    const handles = point.handles || {angle: 0, out: 0, in: 0};
    handles.angle = Math.PI + rad(handles.angle);
    return {
        x: point.x,
        y: opt.height - point.y,
        handles,
    };
};

// Renders a closed shape made up of the input points.
export const renderClosed = (p: Point[], opt: RenderOptions): string => {
    const points = p.map((point) => cleanupPoint(point, opt));

    // Compute guides from input point data.
    const handles: {x1: number; y1: number; x2: number; y2: number}[] = [];
    for (let i = 0; i < points.length; i++) {
        const {x, y, handles: hands} = loopAccess(points)(i);

        const next = loopAccess(points)(i + 1);
        const nextHandles = next.handles;

        if (hands === undefined) {
            handles.push({x1: x, y1: y, x2: next.x, y2: next.y});
            continue;
        }

        handles.push({
            x1: x - Math.cos(hands.angle) * hands.out,
            y1: y + Math.sin(hands.angle) * hands.out,
            x2: next.x + Math.cos(nextHandles.angle) * nextHandles.in,
            y2: next.y - Math.sin(nextHandles.angle) * nextHandles.in,
        });
    }

    // Render path data attribute from points and handles. Must loop more times than the
    // number of points in order to correctly close the path.
    let path = "";
    for (let i = 0; i <= points.length; i++) {
        const point = loopAccess(points)(i);
        const hands = loopAccess(handles)(i - 1);

        // Start at the first point's coordinates.
        if (i === 0) {
            path += `M${point.x},${point.y}`;
            continue;
        }

        // Add cubic bezier coordinates using the computed handle positions.
        path += `C${hands.x1},${hands.y1},${hands.x2},${hands.y2},${point.x},${point.y}`;
    }

    // Render guides if configured to do so.
    let guides = "";
    if (opt.guides) {
        const color = opt.stroke || "black";
        const size = opt.strokeWidth || 1;

        // Bounding box.
        if (opt.boundingBox) {
            guides += `
                <rect x="0" y="0" width="${opt.width}" height="${opt.height}" fill="none"
                    stroke="${color}" stroke-width="${2 * size}" stroke-dasharray="${2 * size}" />`;
        }

        // Points and handles.
        for (let i = 0; i < points.length; i++) {
            const {x, y} = loopAccess(points)(i);
            const hands = loopAccess(handles)(i);
            const nextPoint = loopAccess(points)(i + 1);

            guides += `
                <line x1="${x}" y1="${y}" x2="${hands.x1}" y2="${hands.y1}"
                    stroke-width="${size}" stroke="${color}" />
                <line x1="${nextPoint.x}" y1="${nextPoint.y}" x2="${hands.x2}" y2="${hands.y2}"
                    stroke-width="${size}" stroke="${color}" stroke-dasharray="${2 * size}" />
                <circle cx="${hands.x1}" cy="${hands.y1}" r="${size}"
                    fill="${color}" />
                <circle cx="${hands.x2}" cy="${hands.y2}" r="${size}"
                    fill="${color}" />
                <circle cx="${x}" cy="${y}" r="${2 * size}" fill="${color}" />`;
        }
    }

    const stroke = opt.stroke || (opt.guides ? "black" : "none");
    const strokeWidth = opt.strokeWidth || (opt.guides ? 1 : 0);

    return `
        <svg
            width="${opt.width}"
            height="${opt.height}"
            viewBox="0 0 ${opt.width} ${opt.height}"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g transform="${opt.transform || ""}">
                <path
                    stroke="${stroke}"
                    stroke-width="${strokeWidth}"
                    fill="${opt.fill || "none"}"
                    d="${path}"
                />
                ${guides}
            </g>
        </svg>
    `.replace(/\s+/g, " ");
};
