import {xml, XmlElement} from "../../editable";
import {Point} from "../types";
import {expandHandle, forPoints} from "../util";

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

export const renderPath = (points: Point[]): string => {
    // Render path data attribute from points and handles.
    let path = `M${points[0].x},${points[0].y}`;
    forPoints(points, ({curr, next: getNext}) => {
        const next = getNext();
        const currControl = expandHandle(curr, curr.handleOut);
        const nextControl = expandHandle(next, next.handleIn);
        path += `C${currControl.x},${currControl.y},${nextControl.x},${nextControl.y},${next.x},${next.y}`;
    });
    return path;
};

// Renders the input points to an editable data structure which can be rendered to svg.
export const renderEditable = (points: Point[], opt: RenderOptions): XmlElement => {
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
    xmlBlobPath.attributes.d = renderPath(points);

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
        forPoints(points, ({curr, next: getNext}) => {
            const next = getNext();
            const currControl = expandHandle(curr, curr.handleOut);
            const nextControl = expandHandle(next, next.handleIn);

            const xmlOutgoingHandleLine = xml("line");
            xmlOutgoingHandleLine.attributes.x1 = curr.x;
            xmlOutgoingHandleLine.attributes.y1 = curr.y;
            xmlOutgoingHandleLine.attributes.x2 = currControl.x;
            xmlOutgoingHandleLine.attributes.y2 = currControl.y;
            xmlOutgoingHandleLine.attributes["stroke-width"] = size;
            xmlOutgoingHandleLine.attributes.stroke = color;

            const xmlIncomingHandleLine = xml("line");
            xmlIncomingHandleLine.attributes.x1 = next.x;
            xmlIncomingHandleLine.attributes.y1 = next.y;
            xmlIncomingHandleLine.attributes.x2 = nextControl.x;
            xmlIncomingHandleLine.attributes.y2 = nextControl.y;
            xmlIncomingHandleLine.attributes["stroke-width"] = size;
            xmlIncomingHandleLine.attributes.stroke = color;
            xmlIncomingHandleLine.attributes["stroke-dasharray"] = 2 * size;

            const xmlOutgoingHandleCircle = xml("circle");
            xmlOutgoingHandleCircle.attributes.cx = currControl.x;
            xmlOutgoingHandleCircle.attributes.cy = currControl.y;
            xmlOutgoingHandleCircle.attributes.r = size;
            xmlOutgoingHandleCircle.attributes.fill = color;

            const xmlIncomingHandleCircle = xml("circle");
            xmlIncomingHandleCircle.attributes.cx = nextControl.x;
            xmlIncomingHandleCircle.attributes.cy = nextControl.y;
            xmlIncomingHandleCircle.attributes.r = size;
            xmlIncomingHandleCircle.attributes.fill = color;

            const xmlPointCircle = xml("circle");
            xmlPointCircle.attributes.cx = curr.x;
            xmlPointCircle.attributes.cy = curr.y;
            xmlPointCircle.attributes.r = 2 * size;
            xmlPointCircle.attributes.fill = color;

            xmlContentGroup.children.push(xmlOutgoingHandleLine);
            xmlContentGroup.children.push(xmlIncomingHandleLine);
            xmlContentGroup.children.push(xmlOutgoingHandleCircle);
            xmlContentGroup.children.push(xmlIncomingHandleCircle);
            xmlContentGroup.children.push(xmlPointCircle);
        });
    }

    return xmlRoot;
};
