const fs = require("fs")
const path = require("path")

/**
 *
 * @param {{problemId: String, testcases: String}} data
 * @param {(result: String) => void} callback
 */
module.exports = (data, callback) => {
	const filePath = path.resolve(`./testcases/${data.problemId}.json`)
	fs.writeFile(filePath, data.testcases, () => {
		console.log("Created testcase file for problem with id " + data.problemId)
	})

	callback(
		JSON.stringify({
			testcasePath: filePath,
			problemId,
		})
	)
}
