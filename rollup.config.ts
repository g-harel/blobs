import typescript from "rollup-plugin-typescript2";
import {uglify} from "rollup-plugin-uglify";

export default {
    input: "./legacy/blobs.ts",
    output: {
        file: "index.js",
        format: "umd",
        name: "blobs",
        sourcemap: true,
    },
    plugins: [typescript({cacheRoot: "./node_modules/.cache/rpt2"}), uglify()],
};
