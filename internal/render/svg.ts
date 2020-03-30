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
export const renderEditable = (points: Point[], options: RenderOptions): XmlElement => {
    const stroke = options.stroke || (options.guides ? "black" : "none");
    const strokeWidth = options.strokeWidth || (options.guides ? 1 : 0);

    const xmlRoot = new XmlElement("svg");
    xmlRoot.attributes.width = options.width;
    xmlRoot.attributes.height = options.height;
    xmlRoot.attributes.viewBox = `0 0 ${options.width} ${options.height}`;
    xmlRoot.attributes.xmlns = "http://www.w3.org/2000/svg";

    const xmlContentGroup = new XmlElement("g");
    xmlContentGroup.attributes.transform = options.transform || "";

    const xmlBlobPath = new XmlElement("path");
    xmlBlobPath.attributes.stroke = stroke;
    xmlBlobPath.attributes["stroke-width"] = strokeWidth;
    xmlBlobPath.attributes.fill = options.fill || "none";
    xmlBlobPath.attributes.d = renderPath(points);

    xmlContentGroup.children.push(xmlBlobPath);
    xmlRoot.children.push(xmlContentGroup);

    // Render guides if configured to do so.
    if (options.guides) {
        const color = options.stroke || "black";
        const size = options.strokeWidth || 1;

        // Bounding box.
        if (options.boundingBox) {
            const xmlBoundingRect = new XmlElement("rect");
            xmlBoundingRect.attributes.x = 0;
            xmlBoundingRect.attributes.y = 0;
            xmlBoundingRect.attributes.width = options.width;
            xmlBoundingRect.attributes.height = options.height;
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

            const xmlOutgoingHandleLine = new XmlElement("line");
            xmlOutgoingHandleLine.attributes.x1 = curr.x;
            xmlOutgoingHandleLine.attributes.y1 = curr.y;
            xmlOutgoingHandleLine.attributes.x2 = currControl.x;
            xmlOutgoingHandleLine.attributes.y2 = currControl.y;
            xmlOutgoingHandleLine.attributes["stroke-width"] = size;
            xmlOutgoingHandleLine.attributes.stroke = color;

            const xmlIncomingHandleLine = new XmlElement("line");
            xmlIncomingHandleLine.attributes.x1 = next.x;
            xmlIncomingHandleLine.attributes.y1 = next.y;
            xmlIncomingHandleLine.attributes.x2 = nextControl.x;
            xmlIncomingHandleLine.attributes.y2 = nextControl.y;
            xmlIncomingHandleLine.attributes["stroke-width"] = size;
            xmlIncomingHandleLine.attributes.stroke = color;
            xmlIncomingHandleLine.attributes["stroke-dasharray"] = 2 * size;

            const xmlOutgoingHandleCircle = new XmlElement("circle");
            xmlOutgoingHandleCircle.attributes.cx = currControl.x;
            xmlOutgoingHandleCircle.attributes.cy = currControl.y;
            xmlOutgoingHandleCircle.attributes.r = size;
            xmlOutgoingHandleCircle.attributes.fill = color;

            const xmlIncomingHandleCircle = new XmlElement("circle");
            xmlIncomingHandleCircle.attributes.cx = nextControl.x;
            xmlIncomingHandleCircle.attributes.cy = nextControl.y;
            xmlIncomingHandleCircle.attributes.r = size;
            xmlIncomingHandleCircle.attributes.fill = color;

            const xmlPointCircle = new XmlElement("circle");
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

// Structured element with tag, attributes and children.
export class XmlElement {
    public attributes: Record<string, string | number> = {};
    public children: any[] = [];

    public constructor(public tag: string) {}

    public render(): string {
        const attributes = this.renderAttributes();
        const content = this.renderChildren();
        if (content === "") {
            return `<${this.tag}${attributes}/>`;
        }
        return `<${this.tag}${attributes}>${content}</${this.tag}>`;
    }

    private renderAttributes(): string {
        const attributes = Object.keys(this.attributes);
        if (attributes.length === 0) return "";
        let out = "";
        for (const attribute of attributes) {
            out += ` ${attribute}="${this.attributes[attribute]}"`;
        }
        return out;
    }

    private renderChildren(): string {
        let out = "";
        for (const child of this.children) {
            out += child.render();
        }
        return out;
    }
}
