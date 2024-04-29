const jsdoc = require("eslint-plugin-jsdoc");
const pluginImport = require("eslint-plugin-import");
const typescript = require("@typescript-eslint/eslint-plugin");
const prettier = require("eslint-plugin-prettier");
const deprecation = require("eslint-plugin-deprecation");
const parser = require("@typescript-eslint/parser");

module.exports = [{
    files: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
    ],
    ignores: [
        "**/three/",
        "*.js",
        "*.d.ts",
    ],
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        globals: {
            browser: true,
            es6: true,
            node: true
        },
        parser,
        parserOptions: {
            project: "tsconfig/tsconfig.lint.json",
            sourceType: "module",
            tsconfigRootDir: __dirname,
        },
    },
    plugins: {
        "@typescript-eslint": typescript,
        "import": pluginImport,
        jsdoc,
        prettier,
    },
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-empty-interface": "off",
        "import/no-cycle": ["error", { "maxDepth": 15 }],
        "import/no-unresolved": "off",
        "prettier/prettier": ["error"],
        "jsdoc/check-tag-names": ["error", { "definedTags": ["category"] }],
    },
    // extends: [
    //     "eslint:recommended",
    //     "plugin:@typescript-eslint/eslint-recommended",
    //     "plugin:@typescript-eslint/recommended",
    //     "plugin:eslint-plugin-jsdoc/recommended",
    //     "plugin:eslint-plugin-import/recommended",
    //     "plugin:import/typescript",
    //     "prettier",
    //     "plugin:compat/recommended"
    // ]
}];
