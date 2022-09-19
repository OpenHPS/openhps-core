module.exports = {
  plugins: [
    ["babel-plugin-replace-imports", {
      test: /typedjson\/lib\/cjs\//g,
      replacer: "typedjson/lib/esm5/"
    }]
  ]
}