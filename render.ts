/*

TODO
- points relative to (bottom-right/center)? by default
- angles in degrees
- angle relative to horizontal (3 o'clock + positive is counterclockwise)
- draw path
- convert size to x/y

*/

interface Point {
    x: number;
    y: number;
    handles?: {
        angle: number;
        in: number;
        out: number;
    };
}

interface RenderOptions {
    size: number;
    center?: boolean;
    rotation?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    handles?: boolean;
}

const loop = <T>(arr: T[]) => (i: number): T => {
    return arr[((i%arr.length)+arr.length)%arr.length];
}

// Renders a closed shape made up of the input points.
const render = (points: Point[], opt: RenderOptions): string => {
    const count = points.length;
    const handles: {x1: number, y1: number, x2: number, y2: number}[] = [];

    for (let i = 0; i < count; i++) {
        const {x, y, handles: hands} = points[i];

        const next = loop(points)(i+1);
        const nextHandles = next.handles || {angle: 0, in: 0, out: 0};

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

    let path = "";
    for (let i = 0; i <= count; i++) {
        const point = loop(points)(i);
        const hands = loop(handles)(i-1);

        // Start at the first point's coordinates.
        if (i === 0) {
            path += `M${point.x},${point.y}`;
            continue;
        }

        // Add cubic bezier coordinates using the computed handle positions.
        path += `C${hands.x1},${hands.y1},${hands.x2},${hands.y2},${point.x},${point.y}`;
    }

    return `
        <svg width="${opt.size}" height="${opt.size}" viewBox="0 0 ${opt.size} ${opt.size}" xmlns="http://www.w3.org/2000/svg">
            <g transform="
                ${opt.center ? `translate(${opt.size / 2}, ${opt.size / 2})` : ""}
                rotate(${opt.rotation || 0})
            ">
                <path
                    stroke="${opt.stroke || "none"}"
                    stroke-width="${opt.strokeWidth || 0}"
                    fill="${opt.fill || "none"}"
                    d="${path}"
                />
                ${!opt.handles ? "" : points.map(({x, y}, i) => {
                    const color = i === 0 ? "red" : "grey";
                    const handle = handles[i];
                    const nextPoint = loop(points)(i+1);
                    return `
                        <g id="point-handle-${i}">
                            <line x1="${x}" y1="${y}" x2="${handle.x1}" y2="${handle.y1}" stroke-width="1" stroke="${color}" />
                            <line x1="${nextPoint.x}" y1="${nextPoint.y}" x2="${handle.x2}" y2="${handle.y2}" stroke-width="1" stroke="${color}" stroke-dasharray="2" />
                            <circle cx="${handle.x1}" cy="${handle.y1}" r="1" fill="${color}" />
                            <circle cx="${handle.x2}" cy="${handle.y2}" r="1" fill="${color}" />
                            <circle cx="${x}" cy="${y}" r="2" fill="${color}" />
                        </g>
                    `;
                }).join("")}
            </g>
        </svg>
    `;
};

console.log(render([
    {x: 200, y: 200, handles: {angle: -Math.PI* 7/4, in: 60, out: 80}},
    {x: -200, y: 200, handles: {angle: Math.PI* 7/4, in: 60, out: 80}},
    {x: -200, y: -200, handles: {angle: Math.PI* 5/4, in: 60, out: 80}},
    {x: 200, y: -200, handles: {angle: -Math.PI* 5/4, in: 60, out: 80}},
], {
    size: 1000,
    center: true,
    handles: true,
    stroke: "green",
    strokeWidth: 1,
}));
