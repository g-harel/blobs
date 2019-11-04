import {loopAccess} from "./util";
import {Point, interpolate} from "./point";
import {xml, XmlElement} from "../../editable";

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

// Renders a shape made up of the input points to an editable data structure
// which can be rendered to svg.
export const renderEditable = (p: Point[], opt: RenderOptions): XmlElement => {
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

    // Render path data attribute from points and handles. Must loop more times
    // than the number of points in order to correctly close the path.
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

    const xmlRoot = xml("svg");
    xmlRoot.attributes.width = opt.width;
    xmlRoot.attributes.height = opt.height;
    xmlRoot.attributes.viewBox = `0 0 ${opt.width} ${opt.height}`;
    xmlRoot.attributes.xmlns = "http://www.w3.org/2000/svg";

    const xmlContentGroup = xml("g");
    xmlContentGroup.attributes.transform = opt.transform || "";

    const xmlBlobPath = xml("path");
    xmlBlobPath.attributes.stroke = stroke;
    xmlBlobPath.attributes["stroke-width"] = strokeWidth;
    xmlBlobPath.attributes.fill = opt.fill || "none";
    xmlBlobPath.attributes.d = path;

    xmlContentGroup.children.push(xmlBlobPath);
    xmlRoot.children.push(xmlContentGroup);

    // Render guides if configured to do so.
    if (opt.guides) {
        const color = opt.stroke || "black";
        const size = opt.strokeWidth || 1;

        // Bounding box.
        if (opt.boundingBox) {
            const xmlBoundingRect = xml("rect");
            xmlBoundingRect.attributes.x = 0;
            xmlBoundingRect.attributes.y = 0;
            xmlBoundingRect.attributes.width = opt.width;
            xmlBoundingRect.attributes.height = opt.height;
            xmlBoundingRect.attributes.fill = "none";
            xmlBoundingRect.attributes.stroke = color;
            xmlBoundingRect.attributes["stroke-width"] = 2 * size;
            xmlBoundingRect.attributes["stroke-dasharray"] = 2 * size;
            xmlContentGroup.children.push(xmlBoundingRect);
        }

        // Points and handles.
        for (let i = 0; i < points.length; i++) {
            const {x, y} = loopAccess(points)(i);
            const hands = loopAccess(handles)(i);
            const nextPoint = loopAccess(points)(i + 1);

            const xmlIncomingHandleLine = xml("line");
            xmlIncomingHandleLine.attributes.x1 = x;
            xmlIncomingHandleLine.attributes.y1 = y;
            xmlIncomingHandleLine.attributes.x2 = hands.x1;
            xmlIncomingHandleLine.attributes.y2 = hands.y1;
            xmlIncomingHandleLine.attributes["stroke-width"] = size;
            xmlIncomingHandleLine.attributes.stroke = color;

            const xmlOutgoingHandleLine = xml("line");
            xmlOutgoingHandleLine.attributes.x1 = nextPoint.x;
            xmlOutgoingHandleLine.attributes.y1 = nextPoint.y;
            xmlOutgoingHandleLine.attributes.x2 = hands.x2;
            xmlOutgoingHandleLine.attributes.y2 = hands.y2;
            xmlOutgoingHandleLine.attributes["stroke-width"] = size;
            xmlOutgoingHandleLine.attributes.stroke = color;
            xmlOutgoingHandleLine.attributes["stroke-dasharray"] = 2 * size;

            const xmlIncomingHandleCircle = xml("circle");
            xmlIncomingHandleCircle.attributes.cx = hands.x1;
            xmlIncomingHandleCircle.attributes.cy = hands.y1;
            xmlIncomingHandleCircle.attributes.r = size;
            xmlIncomingHandleCircle.attributes.fill = color;

            const xmlOutgoingHandleCircle = xml("circle");
            xmlOutgoingHandleCircle.attributes.cx = hands.x2;
            xmlOutgoingHandleCircle.attributes.cy = hands.y2;
            xmlOutgoingHandleCircle.attributes.r = size;
            xmlOutgoingHandleCircle.attributes.fill = color;

            const xmlPointCircle = xml("circle");
            xmlPointCircle.attributes.cx = x;
            xmlPointCircle.attributes.cy = y;
            xmlPointCircle.attributes.r = 2 * size;
            xmlPointCircle.attributes.fill = color;

            xmlContentGroup.children.push(xmlIncomingHandleLine);
            xmlContentGroup.children.push(xmlOutgoingHandleLine);
            xmlContentGroup.children.push(xmlIncomingHandleCircle);
            xmlContentGroup.children.push(xmlOutgoingHandleCircle);
            xmlContentGroup.children.push(xmlPointCircle);
        }
    }

    return xmlRoot;
};
