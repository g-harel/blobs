import {BlobOptions, svg, svgPath, canvasPath, SvgOptions, CanvasOptions} from "./blobs";

const genBlobOptions = (): BlobOptions => ({
    extraPoints: Math.floor(10 * Math.random()),
    randomness: Math.floor(10 * Math.random()),
    seed: Math.random(),
    size: 100 + 200 * Math.random(),
});

const genSvgOptions = (): SvgOptions => ({
    fill: String(Math.random()),
    stroke: String(Math.random()),
    strokeWidth: 4 * Math.random(),
});

const genCanvasOptions = (): CanvasOptions => ({
    offsetX: 100 * Math.random(),
    offsetY: 100 * Math.random(),
});

interface TestCase<T> {
    name: string;
    edit: (options: T) => void;
    error?: RegExp;
}

const runSuite = <T>(t: {
    optionsGenerator: () => T;
    functionBeingTested: (options: any) => void;
}) => (testCases: TestCase<T>[]) => {
    for (const testCase of testCases) {
        it(testCase.name, () => {
            const options = t.optionsGenerator();
            testCase.edit(options);

            if (testCase.error) {
                // Copy regexp because they are stateful.
                const pattern = new RegExp(testCase.error);
                expect(() => t.functionBeingTested(options)).toThrow(pattern);
            } else {
                expect(() => t.functionBeingTested(options)).not.toThrow();
            }
        });
    }
};

const testBlobOptions = (functionBeingTested: (options: any) => void) => {
    it("should accept generated blobOptions", () => {
        expect(() => svgPath(genBlobOptions())).not.toThrow();
    });

    it("should reject undefined blobOptions", () => {
        expect(() => svgPath(undefined as any)).toThrow(/blobOptions.*object.*undefined/g);
    });

    it("should reject invalid blobOptions", () => {
        expect(() => svgPath(null as any)).toThrow(/blobOptions.*object.*null/g);
    });

    runSuite<BlobOptions>({
        functionBeingTested,
        optionsGenerator: genBlobOptions,
    })([
        // seed
        {
            name: "should accept number blobOptions seed",
            edit: (blobOptions) => (blobOptions.seed = 123),
        },
        {
            name: "should accept string blobOptions seed",
            edit: (blobOptions) => (blobOptions.seed = "test"),
        },
        {
            name: "should reject undefined blobOptions seed",
            edit: (blobOptions) => delete blobOptions.seed,
            error: /seed.*string.*number.*undefined/g,
        },
        {
            name: "should reject broken blobOptions seed",
            edit: (blobOptions) => (blobOptions.seed = NaN),
            error: /seed.*string.*number.*NaN/g,
        },
        // extraPoints
        {
            name: "should accept valid blobOptions extraPoints",
            edit: (blobOptions) => (blobOptions.extraPoints = 4),
        },
        {
            name: "should reject undefined blobOptions extraPoints",
            edit: (blobOptions) => delete blobOptions.extraPoints,
            error: /blobOptions.*extraPoints.*number.*undefined/g,
        },
        {
            name: "should reject broken blobOptions extraPoints",
            edit: (blobOptions) => (blobOptions.extraPoints = NaN),
            error: /blobOptions.*extraPoints.*number.*NaN/g,
        },
        {
            name: "should reject negative blobOptions extraPoints",
            edit: (blobOptions) => (blobOptions.extraPoints = -2),
            error: /blobOptions.*extraPoints.*invalid/g,
        },
        // randomness
        {
            name: "should accept valid blobOptions randomness",
            edit: (blobOptions) => (blobOptions.randomness = 3),
        },
        {
            name: "should reject undefined blobOptions randomness",
            edit: (blobOptions) => delete blobOptions.randomness,
            error: /blobOptions.*randomness.*number.*undefined/g,
        },
        {
            name: "should reject broken blobOptions randomness",
            edit: (blobOptions) => (blobOptions.randomness = NaN),
            error: /blobOptions.*randomness.*number.*NaN/g,
        },
        {
            name: "should reject negative blobOptions randomness",
            edit: (blobOptions) => (blobOptions.randomness = -10),
            error: /blobOptions.*randomness.*invalid/g,
        },
        // size
        {
            name: "should accept valid blobOptions size",
            edit: (blobOptions) => (blobOptions.size = 40),
        },
        {
            name: "should reject undefined blobOptions size",
            edit: (blobOptions) => delete blobOptions.size,
            error: /blobOptions.*size.*number.*undefined/g,
        },
        {
            name: "should reject broken blobOptions size",
            edit: (blobOptions) => (blobOptions.size = NaN),
            error: /blobOptions.*size.*number.*NaN/g,
        },
        {
            name: "should reject negative blobOptions size",
            edit: (blobOptions) => (blobOptions.size = -1),
            error: /blobOptions.*size.*invalid/g,
        },
    ]);
};

describe("blobs", () => {
    describe("canvasPath", () => {
        describe("blobOptions", () => {
            testBlobOptions((blobOptions) => canvasPath(blobOptions, genCanvasOptions()));
        });
    });

    describe("svg", () => {
        describe("blobOptions", () => {
            testBlobOptions((blobOptions) => svg(blobOptions, genSvgOptions()));
        });
    });

    describe("svgPath", () => {
        describe("blobOptions", () => {
            testBlobOptions(svgPath);
        });
    });
});
