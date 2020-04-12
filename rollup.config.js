import typescript from "rollup-plugin-typescript2";
import {uglify} from "rollup-plugin-uglify";
import copy from "rollup-plugin-copy";

const bundles = [
    {
        name: "blobs",
        entry: "public/legacy.ts",
        types: "public/legacy.d.ts",
        output: ".",
    },
    {
        name: "blobs",
        entry: "public/legacy.ts",
        types: "public/legacy.d.ts",
        output: "v1",
    },
    {
        name: "blobs2",
        entry: "public/blobs.ts",
        types: "public/blobs.d.ts",
        output: "v2",
    },
];

export default bundles.map((bundle) => ({
    input: bundle.entry,
    output: {
        file: bundle.output + "/index.js",
        format: "umd",
        name: bundle.name,
        sourcemap: true,
    },
    plugins: [
        typescript({cacheRoot: "./node_modules/.cache/rpt2"}),
        uglify(),
        copy({
            hook: "writeBundle",
            targets: [{src: bundle.types, dest: bundle.output, rename: "index.d.ts"}],
            verbose: true,
        }),
    ],
}));