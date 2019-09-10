import blobs, {BlobOptions} from "..";

// Sanity checks to ensure the output remains consistent
// across changes to the source.
const testCases: Record<string, BlobOptions> = {
    "fill": {
        size: 109,
        complexity: 0.1,
        contrast: 0.331,
        color: "red",
        seed: "fill",
    },
    "stroke": {
        size: 226,
        complexity: 0.91,
        contrast: 0.6,
        stroke: {
            color: "#ff00bb",
            width: 3.8,
        },
        seed: "stroke",
    },
    "guides": {
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
