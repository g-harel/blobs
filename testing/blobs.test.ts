import blobs, {BlobOptions} from "..";

describe("blobs", () => {
    it("should return a different result when seed is not provided", () => {
        const options: BlobOptions = {size: 100, complexity: 1, contrast: 1, color: "red"};

        const a = blobs(options);
        const b = blobs(options);

        expect(a).not.toEqual(b);
    });

    it("should return the same result when the seed is provided", () => {
        const options: BlobOptions = {size: 200, complexity: 0.5, contrast: 0.5, color: "blue"};
        options.seed = "abcde";

        const a = blobs(options);
        const b = blobs(options);

        expect(a).toEqual(b);
    });
});
