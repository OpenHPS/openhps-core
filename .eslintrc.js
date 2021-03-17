module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "eslint-plugin-import",
        "eslint-plugin-jsdoc",
        "prettier"
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "import/no-cycle": ["error", { "maxDepth": 10 }],
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
