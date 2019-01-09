import typescript from "rollup-plugin-typescript2";

export default {
    input: "./index.ts",
    output: {
        file: "index.js",
        format: "umd",
        name: "blobs",
    },
    plugins: [typescript({cacheRoot: "./node_modules/.cache/rpt2"})],
};
