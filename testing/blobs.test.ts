import blobs, {BlobOptions} from "..";

const genMinimalOptions = (): BlobOptions => ({
    size: 1000 * Math.random(),
    complexity: 1 - Math.random(),
    contrast: 1 - Math.random(),
    color: "#fff",
});

describe("blobs", () => {
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

    it("should require a size be provided", () => {
        const options = genMinimalOptions();

        delete options.size;
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
