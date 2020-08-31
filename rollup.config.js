import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "lib/mem/jsongo.mem.ts",
  output: {
    file: "build/jsongo.min.js",
    name: "Jsongo",
    format: "iife",
    globals: {},
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.browser.json" }),
    terser(),
  ],
};
