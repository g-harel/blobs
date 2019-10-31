import {loopAccess} from "./util";
import {Point, interpolate} from "./point";
import {Xml} from "../xml";

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

// Renders a shape made up of the input points.
export const render = (p: Point[], opt: RenderOptions): string => {
    const points = p.map((point) => interpolate(point, opt.height));

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

    const stroke = opt.stroke || (opt.guides ? "black" : "none");
    const strokeWidth = opt.strokeWidth || (opt.guides ? 1 : 0);

    const xmlRoot = new Xml("svg", {
        width: opt.width,
        height: opt.height,
        viewBox: `0 0 ${opt.width} ${opt.height}`,
        xmlns: "http://www.w3.org/2000/svg",
    });

    const xmlContent = new Xml("g", {
        transform: opt.transform || "",
    });

    xmlRoot.children.push(xmlContent);

    xmlContent.children.push(
        new Xml("path", {
            stroke,
            "stroke-width": strokeWidth,
            fill: opt.fill || "none",
            d: path,
        }),
    );

    // Render guides if configured to do so.
    if (opt.guides) {
        const color = opt.stroke || "black";
        const size = opt.strokeWidth || 1;

        // Bounding box.
        if (opt.boundingBox) {
            xmlContent.children.push(
                new Xml("rect", {
                    x: 0,
                    y: 0,
                    width: opt.width,
                    height: opt.height,
                    fill: "none",
                    stroke: color,
                    "stroke-width": 2 * size,
                    "stroke-dasharray": 2 * size,
                }),
            );
        }

        // Points and handles.
        for (let i = 0; i < points.length; i++) {
            const {x, y} = loopAccess(points)(i);
            const hands = loopAccess(handles)(i);
            const nextPoint = loopAccess(points)(i + 1);

            xmlContent.children.push(
                new Xml("line", {
                    x1: x,
                    y1: y,
                    x2: hands.x1,
                    y2: hands.y1,
                    "stroke-width": size,
                    stroke: color,
                }),
                new Xml("line", {
                    x1: nextPoint.x,
                    y1: nextPoint.y,
                    x2: hands.x2,
                    y2: hands.y2,
                    "stroke-width": size,
                    stroke: color,
                    "stroke-dasharray": 2 * size,
                }),
                new Xml("circle", {
                    cx: hands.x1,
                    cy: hands.y1,
                    r: size,
                    fill: color,
                }),
                new Xml("circle", {
                    cx: hands.x2,
                    cy: hands.y2,
                    r: size,
                    fill: color,
                }),
                new Xml("circle", {
                    cx: x,
                    cy: y,
                    r: 2 * size,
                    fill: color,
                }),
            );
        }
    }

    return xmlRoot.render();
};
