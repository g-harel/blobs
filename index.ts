// https://www.blobmaker.app/

import {rand} from "./internal/math/rand";
import {Point} from "./internal/math/geometry";
import {rad} from "./internal/math/unit";
import {smooth} from "./internal/svg/smooth";
import {renderEditable} from "./internal/svg/render";
import {XmlElement} from "./internal/xml";

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

// Generates an svg document string containing a randomized rounded shape.
const blobs = (opt: BlobOptions): string => {
    return editable(opt).render();
};

// Generates an editable data structure which can be rendered to an svg document
// containing a randomized rounded shape.
export const editable = (opt: BlobOptions): XmlElement => {
    // Random number generator.
    const rgen = rand(opt.seed || String(Date.now()));

    if (!opt.size) {
        throw new Error("no size specified");
    }

    if (!opt.stroke && !opt.color) {
        throw new Error("no color or stroke specified");
    }

    if (opt.complexity <= 0 || opt.complexity > 1) {
        throw new Error("complexity out of range ]0,1]");
    }

    if (opt.contrast < 0 || opt.contrast > 1) {
        throw new Error("contrast out of range [0,1]");
    }

    const count = 3 + Math.floor(14 * opt.complexity);
    const angle = 360 / count;
    const radius = opt.size / Math.E;

    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
        const rand = 1 - 0.8 * opt.contrast * rgen();

        points.push({
            x: Math.sin(rad(i * angle)) * radius * rand + opt.size / 2,
            y: Math.cos(rad(i * angle)) * radius * rand + opt.size / 2,
        });
    }

    const smoothed = smooth(points, {
        closed: true,
        strength: ((4 / 3) * Math.tan(rad(angle / 4))) / Math.sin(rad(angle / 2)),
    });

    return renderEditable(smoothed, {
        closed: true,
        width: opt.size,
        height: opt.size,
        fill: opt.color,
        transform: `rotate(${rgen() * angle},${opt.size / 2},${opt.size / 2})`,
        stroke: opt.stroke && opt.stroke.color,
        strokeWidth: opt.stroke && opt.stroke.width,
        guides: opt.guides,
    });
};

export default blobs;
export {IXml, XmlElement} from "./internal/xml";
