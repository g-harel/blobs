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
                // TODO test for errors in the nth keyframe.
                it("should accept minimal generated keyframe", () => {
                    const animation = canvasPath();
                    const keyframe = genKeyframe();

                    expect(() => animation.transition(keyframe)).not.toThrow();
                });

                interface TestCase {
                    test: string;
                    edit: (keyframe: CanvasKeyframe) => void;
                    error?: RegExp;
                }

                const testCases: Array<TestCase> = [
                    {
                        test: "should accept valid duration",
                        edit: (keyframe) => (keyframe.duration = 100),
                    },
                    {
                        test: "should accept zero duration",
                        edit: (keyframe) => (keyframe.duration = 0),
                    },
                    {
                        test: "should reject undefined duration",
                        edit: (keyframe) => delete keyframe.duration,
                        error: /duration.*number.*undefined/g,
                    },
                    {
                        test: "should reject negative duration",
                        edit: (keyframe) => (keyframe.duration = -10),
                        error: /duration.*invalid/g,
                    },
                    {
                        test: "should reject broken duration",
                        edit: (keyframe) => (keyframe.duration = NaN),
                        error: /duration.*number.*NaN/g,
                    },
                    {
                        test: "should reject invalid duration",
                        edit: (keyframe) => (keyframe.duration = "123" as any),
                        error: /duration.*number.*string/g,
                    },
                    {
                        test: "should accept valid delay",
                        edit: (keyframe) => (keyframe.delay = 200),
                    },
                    {
                        test: "should accept zero delay",
                        edit: (keyframe) => (keyframe.delay = 0),
                    },
                    {
                        test: "should accept undefined delay",
                        edit: (keyframe) => delete keyframe.delay,
                    },
                    {
                        test: "should reject negative delay",
                        edit: (keyframe) => (keyframe.delay = -10),
                        error: /delay.*invalid/g,
                    },
                    {
                        test: "should reject broken delay",
                        edit: (keyframe) => (keyframe.delay = NaN),
                        error: /delay.*number.*NaN/g,
                    },
                    {
                        test: "should reject invalid delay",
                        edit: (keyframe) => (keyframe.delay = "123" as any),
                        error: /delay.*number.*string/g,
                    },
                    {
                        test: "should accept known timingFunction",
                        edit: (keyframe) => (keyframe.timingFunction = "ease"),
                    },
                    {
                        test: "should accept undefined timingFunction",
                        edit: (keyframe) => delete keyframe.timingFunction,
                    },
                    {
                        test: "should reject invalid timingFunction",
                        edit: (keyframe) => (keyframe.timingFunction = (() => 0) as any),
                        error: /timingFunction.*string.*function/g,
                    },
                    {
                        test: "should reject unknown timingFunction",
                        edit: (keyframe) => (keyframe.timingFunction = "unknown" as any),
                        error: /timingFunction.*not recognized.*unknown/g,
                    },
                    {
                        test: "should accept valid callback",
                        edit: (keyframe) => (keyframe.callback = () => console.log("test")),
                    },
                    {
                        test: "should accept undefined callback",
                        edit: (keyframe) => delete keyframe.callback,
                    },
                    {
                        test: "should reject invalid callback",
                        edit: (keyframe) => (keyframe.callback = {} as any),
                        error: /callback.*function.*object/g,
                    },
                    // TODO complete blobOptions type tests, should be the same as non-animated.
                    {
                        test: "should reject undefined blobOptions",
                        edit: (keyframe) => delete keyframe.blobOptions,
                        error: /blobOptions.*object.*undefined/g,
                    },
                    {
                        test: "should accept empty canvasOptions",
                        edit: (keyframe) => (keyframe.canvasOptions = {}),
                    },
                    {
                        test: "should accept undefined canvasOptions",
                        edit: (keyframe) => delete keyframe.canvasOptions,
                    },
                    {
                        test: "should accept undefined canvasOptions offsetX",
                        edit: (keyframe) => delete keyframe.canvasOptions?.offsetX,
                    },
                    {
                        test: "should reject broken canvasOptions offsetX",
                        edit: (keyframe) => (keyframe.canvasOptions = {offsetX: NaN}),
                        error: /canvasOptions.*offsetX.*number.*NaN/g,
                    },
                    {
                        test: "should accept undefined canvasOptions offsetY",
                        edit: (keyframe) => delete keyframe.canvasOptions?.offsetY,
                    },
                    {
                        test: "should reject broken canvasOptions offsetY",
                        edit: (keyframe) => (keyframe.canvasOptions = {offsetY: NaN}),
                        error: /canvasOptions.*offsetY.*number.*NaN/g,
                    },
                ];

                for (const testCase of testCases) {
                    it(testCase.test, () => {
                        const animation = canvasPath();
                        const keyframe = genKeyframe();
                        testCase.edit(keyframe);
                        if (testCase.error) {
                            expect(() => animation.transition(keyframe)).toThrow(testCase.error);
                        } else {
                            expect(() => animation.transition(keyframe)).not.toThrow();
                        }
                    });
                }
            });
        });
    });
});
