module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "ignorePatterns": ["**/three/*"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module",
    },
    "plugins": [
        "@typescript-eslint",
        "eslint-plugin-import",
        "eslint-plugin-jsdoc",
        "prettier",
        "deprecation"
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "deprecation/deprecation": "warn",
        "import/no-cycle": ["error", { "maxDepth": 15 }],
        "import/no-unresolved": "off",
        "prettier/prettier": ["error"],
        "jsdoc/check-tag-names": ["error", { "definedTags": ["category"] }],
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:eslint-plugin-jsdoc/recommended",
        "plugin:eslint-plugin-import/recommended",
        "plugin:import/typescript",
        "prettier"
    ]
};
