import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const extensions = [".ts"];

export default {
  input: "lib/jsongo.mem.ts",
  output: {
    file: "build/jsongo.min.js",
    name: "Jsongo",
    format: "umd",
  },
  plugins: [
    nodeResolve({
      extensions,
    }),
    commonjs(),
    typescript({ module: "ESNext" }),
    terser(),
  ],
};
