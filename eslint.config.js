import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineFlatConfig } from "eslint-define-config";

export default defineFlatConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  plugins: {
    react: pluginReact,
    "@typescript-eslint": tseslint.plugin,
  },
  settings: {
    react: {
      version: "18",
    },
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-require-imports": "off",
  },
});
