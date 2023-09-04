const fs = require("fs")
const path = require("path")

module.exports = async (problemId, testcases) => {
	const filePath = path.resolve(`./testcases/${problemId}.json`)
	fs.writeFile(filePath, testcases, () => {
		console.log("Created testcase file for problem with id " + problemId)
	})
	return JSON.stringify({
		testcasePath: filePath,
	})
}
