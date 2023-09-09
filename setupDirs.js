const path = require("path")
const fs = require("fs")

module.exports = () => {
	fs.mkdir(path.resolve("./testcases"), { recursive: false }, console.log)
	fs.mkdir(path.resolve("./temp"), { recursive: false }, console.log)
}
