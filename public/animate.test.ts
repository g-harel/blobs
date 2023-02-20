import {canvasPath, CanvasKeyframe} from "./animate";

const genKeyframe = (): CanvasKeyframe => ({
    duration: 1000 * Math.random(),
    delay: 1000 * Math.random(),
    timingFunction: "linear",
    callback: () => {},
    blobOptions: {
        extraPoints: Math.floor(10 * Math.random()),
        randomness: Math.floor(10 * Math.random()),
        seed: Math.random(),
        size: 100 + 200 * Math.random(),
    },
    canvasOptions: {
        offsetX: 100 * Math.random(),
        offsetY: 100 * Math.random(),
    },
});

describe("animate", () => {
    describe("canvasPath", () => {
        describe("transition", () => {
            describe("keyframe", () => {
                it("should accept generated keyframe", () => {
                    const animation = canvasPath();
                    const keyframe = genKeyframe();

                    expect(() => animation.transition(keyframe)).not.toThrow();
                });

                it("should indicate the rejected frame index", () => {
                    const animation = canvasPath();
                    const keyframes = [genKeyframe(), null as any, genKeyframe()];

                    expect(() => animation.transition(...keyframes)).toThrow(/keyframe.*1/g);
                });

                interface TestCase {
                    name: string;
                    edit: (keyframe: CanvasKeyframe) => void;
                    error?: RegExp;
                }

                const testCases: Array<TestCase> = [
                    // duration
                    {
                        name: "should accept valid duration",
                        edit: (keyframe) => (keyframe.duration = 100),
                    },
                    {
                        name: "should accept zero duration",
                        edit: (keyframe) => (keyframe.duration = 0),
                    },
                    {
                        name: "should reject undefined duration",
                        edit: (keyframe) => delete (keyframe as any).duration,
                        error: /duration.*number.*undefined/g,
                    },
                    {
                        name: "should reject negative duration",
                        edit: (keyframe) => (keyframe.duration = -10),
                        error: /duration.*invalid/g,
                    },
                    {
                        name: "should reject broken duration",
                        edit: (keyframe) => (keyframe.duration = NaN),
                        error: /duration.*number.*NaN/g,
                    },
                    {
                        name: "should reject invalid duration",
                        edit: (keyframe) => (keyframe.duration = "123" as any),
                        error: /duration.*number.*string/g,
                    },
                    // delay
                    {
                        name: "should accept valid delay",
                        edit: (keyframe) => (keyframe.delay = 200),
                    },
                    {
                        name: "should accept zero delay",
                        edit: (keyframe) => (keyframe.delay = 0),
                    },
                    {
                        name: "should accept undefined delay",
                        edit: (keyframe) => delete keyframe.delay,
                    },
                    {
                        name: "should reject negative delay",
                        edit: (keyframe) => (keyframe.delay = -10),
                        error: /delay.*invalid/g,
                    },
                    {
                        name: "should reject broken delay",
                        edit: (keyframe) => (keyframe.delay = NaN),
                        error: /delay.*number.*NaN/g,
                    },
                    {
                        name: "should reject invalid delay",
                        edit: (keyframe) => (keyframe.delay = "123" as any),
                        error: /delay.*number.*string/g,
                    },
                    // timingFunction
                    {
                        name: "should accept known timingFunction",
                        edit: (keyframe) => (keyframe.timingFunction = "ease"),
                    },
                    {
                        name: "should accept undefined timingFunction",
                        edit: (keyframe) => delete keyframe.timingFunction,
                    },
                    {
                        name: "should reject invalid timingFunction",
                        edit: (keyframe) => (keyframe.timingFunction = (() => 0) as any),
                        error: /timingFunction.*string.*function/g,
                    },
                    {
                        name: "should reject unknown timingFunction",
                        edit: (keyframe) => (keyframe.timingFunction = "unknown" as any),
                        error: /timingFunction.*not recognized.*unknown/g,
                    },
                    // callback
                    {
                        name: "should accept valid callback",
                        edit: (keyframe) => (keyframe.callback = () => console.log("test")),
                    },
                    {
                        name: "should accept undefined callback",
                        edit: (keyframe) => delete keyframe.callback,
                    },
                    {
                        name: "should reject invalid callback",
                        edit: (keyframe) => (keyframe.callback = {} as any),
                        error: /callback.*function.*object/g,
                    },
                    // blobOptions
                    {
                        name: "should reject undefined blobOptions",
                        edit: (keyframe) => delete (keyframe as any).blobOptions,
                        error: /blobOptions.*object.*undefined/g,
                    },
                    {
                        name: "should reject invalid blobOptions",
                        edit: (keyframe) => (keyframe.blobOptions = null as any),
                        error: /blobOptions.*object.*null/g,
                    },
                    // blobOptions.seed
                    {
                        name: "should accept number blobOptions seed",
                        edit: (keyframe) => (keyframe.blobOptions.seed = 123),
                    },
                    {
                        name: "should accept string blobOptions seed",
                        edit: (keyframe) => (keyframe.blobOptions.seed = "test"),
                    },
                    {
                        name: "should reject undefined blobOptions seed",
                        edit: (keyframe) => delete (keyframe as any).blobOptions.seed,
                        error: /seed.*string.*number.*undefined/g,
                    },
                    {
                        name: "should reject broken blobOptions seed",
                        edit: (keyframe) => (keyframe.blobOptions.seed = NaN),
                        error: /seed.*string.*number.*NaN/g,
                    },
                    // blobOptions.extraPoints
                    {
                        name: "should accept valid blobOptions extraPoints",
                        edit: (keyframe) => (keyframe.blobOptions.extraPoints = 4),
                    },
                    {
                        name: "should reject undefined blobOptions extraPoints",
                        edit: (keyframe) => delete (keyframe as any).blobOptions.extraPoints,
                        error: /blobOptions.*extraPoints.*number.*undefined/g,
                    },
                    {
                        name: "should reject broken blobOptions extraPoints",
                        edit: (keyframe) => (keyframe.blobOptions.extraPoints = NaN),
                        error: /blobOptions.*extraPoints.*number.*NaN/g,
                    },
                    {
                        name: "should reject negative blobOptions extraPoints",
                        edit: (keyframe) => (keyframe.blobOptions.extraPoints = -2),
                        error: /blobOptions.*extraPoints.*invalid/g,
                    },
                    // blobOptions.randomness
                    {
                        name: "should accept valid blobOptions randomness",
                        edit: (keyframe) => (keyframe.blobOptions.randomness = 3),
                    },
                    {
                        name: "should reject undefined blobOptions randomness",
                        edit: (keyframe) => delete (keyframe as any).blobOptions.randomness,
                        error: /blobOptions.*randomness.*number.*undefined/g,
                    },
                    {
                        name: "should reject broken blobOptions randomness",
                        edit: (keyframe) => (keyframe.blobOptions.randomness = NaN),
                        error: /blobOptions.*randomness.*number.*NaN/g,
                    },
                    {
                        name: "should reject negative blobOptions randomness",
                        edit: (keyframe) => (keyframe.blobOptions.randomness = -10),
                        error: /blobOptions.*randomness.*invalid/g,
                    },
                    // blobOptions.size
                    {
                        name: "should accept valid blobOptions size",
                        edit: (keyframe) => (keyframe.blobOptions.size = 40),
                    },
                    {
                        name: "should reject undefined blobOptions size",
                        edit: (keyframe) => delete (keyframe as any).blobOptions.size,
                        error: /blobOptions.*size.*number.*undefined/g,
                    },
                    {
                        name: "should reject broken blobOptions size",
                        edit: (keyframe) => (keyframe.blobOptions.size = NaN),
                        error: /blobOptions.*size.*number.*NaN/g,
                    },
                    {
                        name: "should reject negative blobOptions size",
                        edit: (keyframe) => (keyframe.blobOptions.size = -1),
                        error: /blobOptions.*size.*invalid/g,
                    },
                    // canvasOptions
                    {
                        name: "should accept empty canvasOptions",
                        edit: (keyframe) => (keyframe.canvasOptions = {}),
                    },
                    {
                        name: "should accept undefined canvasOptions",
                        edit: (keyframe) => delete keyframe.canvasOptions,
                    },
                    {
                        name: "should reject invalid canvasOptions",
                        edit: (keyframe) => (keyframe.canvasOptions = null as any),
                        error: /canvasOptions.*object.*null/g,
                    },
                    // canvasOptions.offsetX
                    {
                        name: "should accept valid canvasOptions offsetX",
                        edit: (keyframe) => (keyframe.canvasOptions = {offsetX: 100}),
                    },
                    {
                        name: "should accept undefined canvasOptions offsetX",
                        edit: (keyframe) => delete keyframe.canvasOptions?.offsetX,
                    },
                    {
                        name: "should reject broken canvasOptions offsetX",
                        edit: (keyframe) => (keyframe.canvasOptions = {offsetX: NaN}),
                        error: /canvasOptions.*offsetX.*number.*NaN/g,
                    },
                    // canvasOptions.offsetY
                    {
                        name: "should accept valid canvasOptions offsetY",
                        edit: (keyframe) => (keyframe.canvasOptions = {offsetY: 222}),
                    },
                    {
                        name: "should accept undefined canvasOptions offsetY",
                        edit: (keyframe) => delete keyframe.canvasOptions?.offsetY,
                    },
                    {
                        name: "should reject broken canvasOptions offsetY",
                        edit: (keyframe) => (keyframe.canvasOptions = {offsetY: NaN}),
                        error: /canvasOptions.*offsetY.*number.*NaN/g,
                    },
                ];

                // Run all test cases with a configurable amount of keyframes
                // and index of the keyframe being edited for the tests.
                const runSuite = (keyframeCount: number, editIndex: number) => {
                    for (const testCase of testCases) {
                        it(testCase.name, () => {
                            // Create blank animation.
                            const animation = canvasPath();

                            // Create keyframes to call transition with.
                            const keyframes: CanvasKeyframe[] = [];
                            for (let i = 0; i < keyframeCount; i++) {
                                keyframes.push(genKeyframe());
                            }

                            // Modify selected keyframe.
                            testCase.edit(keyframes[editIndex]);

                            if (testCase.error) {
                                // Copy regexp because they are stateful.
                                const pattern = new RegExp(testCase.error);
                                expect(() => animation.transition(...keyframes)).toThrow(pattern);
                            } else {
                                expect(() => animation.transition(...keyframes)).not.toThrow();
                            }
                        });
                    }
                };

                // Run all cases when given a single test frame and asserting on it.
                describe("first", () => runSuite(1, 0));

                // Run all cases when given more than one frame, asserting on last one.
                const lastLength = 2 + Math.floor(4 * Math.random());
                describe("last", () => runSuite(lastLength, lastLength - 1));

                // Run all cases when given more than one frame, asserting on a random one.
                const nthLength = 2 + Math.floor(16 * Math.random());
                const nthIndex = Math.floor(nthLength * Math.random());
                describe(`nth (${nthIndex + 1}/${nthLength})`, () => runSuite(nthLength, nthIndex));
            });
        });
    });
});
