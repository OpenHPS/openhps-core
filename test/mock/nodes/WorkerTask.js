const threads = require("threads/worker")

threads.expose({
  process(data, options) {
    return "Testtest"
  }
})