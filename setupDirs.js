const path = require("path")
const fs = require("fs")

module.exports = () => {
	fs.mkdir(path.resolve("./testcases"), { recursive: false }, (err) => {
		console.log(err)
	})
}
