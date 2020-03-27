import typescript from "rollup-plugin-typescript2";
import {uglify} from "rollup-plugin-uglify";

const bundles = [
    {
        entry: "legacy/blobs.ts",
        output: "index.js",
    },
    {
        entry: "legacy/blobs.ts",
        output: "v1/index.js",
    },
    {
        entry: "public/gen.ts",
        output: "v2/gen.js",
    },
];

export default bundles.map((bundle) => ({
    input: bundle.entry,
    output: {
        file: bundle.output,
        format: "umd",
        name: "blobs",
        sourcemap: true,
    },
    plugins: [typescript({cacheRoot: "./node_modules/.cache/rpt2"}), uglify()],
}));
