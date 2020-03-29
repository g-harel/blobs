import typescript from "rollup-plugin-typescript2";
import {uglify} from "rollup-plugin-uglify";

const bundles = [
    {
        name: "blobs",
        entry: "public/legacy.ts",
        output: "index.js",
    },
    {
        name: "blobs",
        entry: "public/legacy.ts",
        output: "v1/index.js",
    },
    {
        name: "blobs2",
        entry: "public/blobs.ts",
        output: "v2/index.js",
    },
];

export default bundles.map((bundle) => ({
    input: bundle.entry,
    output: {
        file: bundle.output,
        format: "umd",
        name: bundle.name,
        sourcemap: true,
    },
    plugins: [typescript({cacheRoot: "./node_modules/.cache/rpt2"}), uglify()],
}));
