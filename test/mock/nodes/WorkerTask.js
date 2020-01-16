const threads = require("threads/worker")

threads.expose({
  process(data, options) {
    console.log(data)
    return "Testtest"
  }
})