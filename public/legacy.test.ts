import blobs, {BlobOptions} from "./legacy";

const genMinimalOptions = (): BlobOptions => ({
    size: 1000 * Math.random(),
    complexity: 1 - Math.random(),
    contrast: 1 - Math.random(),
    color: "#fff",
});

describe("legacy", () => {
    it("should return a different result when seed is not provided", () => {
        const options = genMinimalOptions();

        const a = blobs(options);
        const b = blobs(options);

        expect(a).not.toEqual(b);
    });

    it("should return the same result when the seed is provided", () => {
        const options = genMinimalOptions();

        options.seed = "abcde";
        const a = blobs(options);
        const b = blobs(options);

        expect(a).toEqual(b);
    });

    it("should require options be provided", () => {
        expect(() => (blobs as any)()).toThrow("options");
    });

    it("should require a size be provided", () => {
        const options = genMinimalOptions();

        delete (options as any).size;
        expect(() => blobs(options)).toThrow("size");
    });

    it("should reject out of range complexity values", () => {
        const options = genMinimalOptions();

        options.complexity = 1234;
        expect(() => blobs(options)).toThrow("complexity");

        options.complexity = 0;
        expect(() => blobs(options)).toThrow("complexity");
    });

    it("should reject out of range contrast values", () => {
        const options = genMinimalOptions();

        options.contrast = 999;
        expect(() => blobs(options)).toThrow("contrast");

        options.contrast = -1;
        expect(() => blobs(options)).toThrow("contrast");
    });

    it("should reject options without stroke or color", () => {
        const options = genMinimalOptions();

        delete options.stroke;
        delete options.color;
        expect(() => blobs(options)).toThrow("stroke");
        expect(() => blobs(options)).toThrow("color");
    });
});

describe("editable", () => {
    it("should reflect changes when edited", () => {
        const options = genMinimalOptions();

        const out = blobs.editable(options);
        const initial = out.render();
        out.attributes.id = "test";
        const modified = out.render();

        expect(modified).not.toBe(initial);
    });
});

// Sanity checks to ensure the output remains consistent
// across changes to the source.
const testCases: Record<string, BlobOptions> = {
    fill: {
        size: 109,
        complexity: 0.1,
        contrast: 0.331,
        color: "red",
        seed: "fill",
    },
    stroke: {
        size: 226,
        complexity: 0.91,
        contrast: 0.6,
        stroke: {
            color: "#ff00bb",
            width: 3.8,
        },
        seed: "stroke",
    },
    guides: {
        size: 781,
        complexity: 1,
        contrast: 0.331,
        color: "yellow",
        guides: true,
        seed: "guides",
    },
};

for (const testCase of Object.keys(testCases)) {
    test(testCase, () => {
        expect(blobs(testCases[testCase])).toMatchSnapshot();
    });
}
