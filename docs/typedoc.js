/** @type { import('typedoc').TypeDocOptionMap & import('typedoc-umlclass').Config } */

module.exports = {
    "entryPoints": ["../src/index.ts"],
    "out": "out",
    "exclude": ["**/_internal/**/*"],
    "excludePrivate": true,
    "hideGenerator": true,
    "categorizeByGroup": true,
    "tsconfig": "../tsconfig/tsconfig.app.json",
    "media": "media",
    "plugin": ["typedoc-umlclass"],
    "entryPointStrategy": "expand",
    excludeNotDocumented: false,
    excludeExternals: true,
    "umlClassDiagram": {
        methodParameterOutput: "none",
        "type": "detailed",
        "location": "local",
        "format": "svg",
        "legendType": "only-included",
        "hideShadow": false,
        "createPlantUmlFiles": true,
        verboseOutput: true,
    }
}
