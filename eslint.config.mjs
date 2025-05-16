import { FlatCompat } from "@eslint/eslintrc";
import boundariesPlugin from "eslint-plugin-boundaries";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "airbnb",
    "next/core-web-vitals",
    "next/typescript",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@next/next/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ),
  {
    plugins: {
      "simple-import-sort": simpleImportSortPlugin,
      boundaries: boundariesPlugin,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "app/*" },
        { type: "components", pattern: "components/*" },
        { type: "lib", pattern: "lib/*" },
      ],
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      // Simple import sort
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "simple-import-sort/extensions": [
        "warn",
        { js: "never", ts: "never", jsx: "never", tsx: "never" },
      ],
      "import/prefer-default-export": [
        "off",
        { target: "single" }, // default is "single"
      ],
      // Allow JSX in .tsx files
      "react/jsx-filename-extension": [
        "error",
        { extensions: [".tsx", ".jsx"] },
      ],
      // Boundaries plugin example rule (customize as needed)
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["components"] },
            { from: "components", allow: ["lib"] },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
