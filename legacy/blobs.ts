// https://www.blobmaker.app/

import {rand} from "../internal/rand";
import {renderEditable} from "../internal/render/svg";
import {XmlElement} from "../editable";
import {genBlob} from "../internal/blobs";

export interface PathOptions {
    // Bounding box dimensions.
    size: number;

    // Shape complexity.
    complexity: number;

    // Shape contrast.
    contrast: number;

    // Value to seed random number generator.
    seed?: string;
}

export interface BlobOptions extends PathOptions {
    // Fill color.
    color?: string;

    stroke?: {
        // Stroke color.
        color: string;

        // Stroke width.
        width: number;
    };

    // Render points, handles and stroke.
    guides?: boolean;
}

// Generates an svg document string containing a randomized rounded shape.
const blobs = (opt: BlobOptions): string => {
    return blobs.editable(opt).render();
};

// Generates an editable data structure which can be rendered to an svg document
// containing a randomized rounded shape.
blobs.editable = (opt: BlobOptions): XmlElement => {
    if (!opt) {
        throw new Error("no options specified");
    }

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
    const offset = (): number => (1 - 0.8 * opt.contrast * rgen()) / Math.E;

    const shape = genBlob(count, offset);
    for (let i = 0; i < shape.length; i++) {
        shape[i].x *= opt.size;
        shape[i].y *= opt.size;
        shape[i].handleIn.length *= opt.size;
        shape[i].handleOut.length *= opt.size;
    }
    for (let i = 0; i < shape.length; i++) {
        shape[i].y = opt.size - shape[i].y;
        shape[i].handleIn.angle *= -1;
        shape[i].handleOut.angle *= -1;
    }

    return renderEditable(shape, {
        closed: true,
        width: opt.size,
        height: opt.size,
        fill: opt.color,
        transform: `rotate(${rgen() * (360 / count)},${opt.size / 2},${opt.size / 2})`,
        stroke: opt.stroke && opt.stroke.color,
        strokeWidth: opt.stroke && opt.stroke.width,
        guides: opt.guides,
    });
};

export default blobs;
