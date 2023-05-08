import {BlobOptions, svg, svgPath, canvasPath, SvgOptions, CanvasOptions} from "./blobs";

// @ts-ignore
import {polyfillPath2D, Path2D} from "path2d-polyfill";
global.Path2D = Path2D;

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
            edit: (blobOptions) => delete (blobOptions as any).seed,
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
            edit: (blobOptions) => delete (blobOptions as any).extraPoints,
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
            edit: (blobOptions) => delete (blobOptions as any).randomness,
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
            edit: (blobOptions) => delete (blobOptions as any).size,
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

        describe("canvasOptions", () => {
            it("should accept generated canvasOptions", () => {
                expect(() => canvasPath(genBlobOptions(), genCanvasOptions())).not.toThrow();
            });

            it("should accept undefined canvasOptions", () => {
                expect(() => canvasPath(genBlobOptions(), undefined as any)).not.toThrow();
            });

            it("should reject invalid canvasOptions", () => {
                expect(() => canvasPath(genBlobOptions(), null as any)).toThrow(
                    /canvasOptions.*object.*null/g,
                );
            });

            runSuite<CanvasOptions>({
                functionBeingTested: (canvasOptions) => canvasPath(genBlobOptions(), canvasOptions),
                optionsGenerator: genCanvasOptions,
            })([
                // offsetX
                {
                    name: "should accept valid canvasOptions offsetX",
                    edit: (canvasOptions) => (canvasOptions.offsetX = 100),
                },
                {
                    name: "should accept undefined canvasOptions offsetX",
                    edit: (canvasOptions) => delete canvasOptions?.offsetX,
                },
                {
                    name: "should reject broken canvasOptions offsetX",
                    edit: (canvasOptions) => (canvasOptions.offsetX = NaN),
                    error: /canvasOptions.*offsetX.*number.*NaN/g,
                },
                // offsetY
                {
                    name: "should accept valid canvasOptions offsetY",
                    edit: (canvasOptions) => (canvasOptions.offsetY = 222),
                },
                {
                    name: "should accept undefined canvasOptions offsetY",
                    edit: (canvasOptions) => delete canvasOptions?.offsetY,
                },
                {
                    name: "should reject broken canvasOptions offsetY",
                    edit: (canvasOptions) => (canvasOptions.offsetY = NaN),
                    error: /canvasOptions.*offsetY.*number.*NaN/g,
                },
            ]);
        });
    });

    describe("svg", () => {
        describe("blobOptions", () => {
            testBlobOptions((blobOptions) => svg(blobOptions, genSvgOptions()));
        });

        describe("svgOptions", () => {
            it("should accept generated svgOptions", () => {
                expect(() => svg(genBlobOptions(), genSvgOptions())).not.toThrow();
            });

            it("should accept undefined svgOptions", () => {
                expect(() => svg(genBlobOptions(), undefined as any)).not.toThrow();
            });

            it("should reject invalid svgOptions", () => {
                expect(() => svg(genBlobOptions(), null as any)).toThrow(
                    /svgOptions.*object.*null/g,
                );
            });

            runSuite<SvgOptions>({
                functionBeingTested: (svgOptions) => svg(genBlobOptions(), svgOptions),
                optionsGenerator: genSvgOptions,
            })([
                // fill
                {
                    name: "should accept valid svgOptions fill",
                    edit: (svgOptions) => (svgOptions.fill = "red"),
                },
                {
                    name: "should accept undefined svgOptions fill",
                    edit: (svgOptions) => delete svgOptions?.fill,
                },
                {
                    name: "should reject broken svgOptions fill",
                    edit: (svgOptions) => (svgOptions.fill = null as any),
                    error: /svgOptions.*fill.*string.*null/g,
                },
                // stroke
                {
                    name: "should accept valid svgOptions stroke",
                    edit: (svgOptions) => (svgOptions.stroke = "red"),
                },
                {
                    name: "should accept undefined svgOptions stroke",
                    edit: (svgOptions) => delete svgOptions?.stroke,
                },
                {
                    name: "should reject broken svgOptions stroke",
                    edit: (svgOptions) => (svgOptions.stroke = null as any),
                    error: /svgOptions.*stroke.*string.*null/g,
                },
                // strokeWidth
                {
                    name: "should accept valid svgOptions strokeWidth",
                    edit: (svgOptions) => (svgOptions.strokeWidth = 222),
                },
                {
                    name: "should accept undefined svgOptions strokeWidth",
                    edit: (svgOptions) => delete svgOptions?.strokeWidth,
                },
                {
                    name: "should reject broken svgOptions strokeWidth",
                    edit: (svgOptions) => (svgOptions.strokeWidth = NaN),
                    error: /svgOptions.*strokeWidth.*number.*NaN/g,
                },
            ]);
        });
    });

    describe("svgPath", () => {
        describe("blobOptions", () => {
            testBlobOptions(svgPath);
        });
    });
});
