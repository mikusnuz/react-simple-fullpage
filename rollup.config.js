import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: false,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: false,
    },
  ],
  plugins: [
    postcss({
      extract: false,
      modules: false,
      minimize: true,
      inject: true,
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist/types",
    }),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-react", "@babel/preset-typescript"],
    }),
    resolve(),
    commonjs(),
    terser(),
  ],
  external: ["react", "react-dom"],
};
