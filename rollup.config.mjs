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
    {
        name: "blobs2Animate",
        entry: "public/animate.ts",
        types: "public/animate.d.ts",
        output: "v2/animate",
    },
];

export default ["es", "umd"].flatMap((format) =>
    bundles.map((bundle) => ({
        input: bundle.entry,
        output: {
            file: bundle.output + `/index${format == "es" ? ".module" : ""}.js`,
            format: format,
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
    })),
);
