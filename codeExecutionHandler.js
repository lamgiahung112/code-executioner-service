const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const vm = require("vm")
/**
 *
 * @param {{code: String, problemId: String, userId: String}} data
 * @param {(result: String) => void} callback
 */
module.exports = async (data, callback) => {
	const testcasePath = path.resolve(`./testcases/${data.problemId}.json`)
	fs.readFile(testcasePath, (_, testData) => {
		const parsedTestData = JSON.parse(testData.toString())
		const uuid = crypto.randomUUID().replaceAll("-", "")
		const uniqueStartTimeVar = `starttime${uuid}`
		const uniqueEndTimeVar = `endtime${uuid}`
		const uniqueStartMemVar = `startmem${uuid}`
		const uniqueEndMemVar = `endmem${uuid}`
		const uniqueResultVar = `res${uuid}`

		Promise.all(
			parsedTestData.map(async (test) => {
				const appendix = `const ${uniqueStartMemVar}=memnow();const ${uniqueStartTimeVar}=perfnow();const ${uniqueResultVar}=${test.test};const ${uniqueEndTimeVar}=perfnow();const ${uniqueEndMemVar}=memnow();done([${uniqueEndTimeVar}-${uniqueStartTimeVar},${uniqueResultVar},(${uniqueEndMemVar}.heapUsed-${uniqueStartMemVar}.heapUsed)/1024/1024])`
				const codeResult = await _runWithTimeout(
					`try{${data.code};${appendix};}catch(err){done([0,err.message,0])}`,
					1000
				)
				const isPassed = JSON.stringify(codeResult[1]) === test.expected
				const time = codeResult[0]
				const result = codeResult[1]
				const memory = codeResult[2]

				return {
					time,
					output: JSON.stringify(result),
					memory,
					isPassed,
				}
			})
		).then((result) => {
			callback(
				JSON.stringify({
					result,
					problemId: data.problemId,
					userId: data.userId,
					completedAt: new Date().getTime(),
				})
			)
		})
	})
}

/**
 *
 * @param {String} jsCode
 * @param {Number} timeout
 * @returns {Promise<[Number, String, Number]>}
 */
async function _runWithTimeout(jsCode, timeoutMs) {
	return new Promise((resolve, _) => {
		const script = new vm.Script(jsCode)
		const sandbox = {
			fs: null,
			require: null,
			path: null,
			exec: null,
			execFile: null,
			vm: null,
			crypto: null,
			memnow: process.memoryUsage,
			perfnow: performance.now,
			done: (result) => {
				if (!executionCompleted) {
					executionCompleted = true
					resolve(result)
				}
			},
		}
		const context = vm.createContext(sandbox)
		let executionCompleted = false

		try {
			script.runInContext(context, {
				displayErrors: true, // Prevent unhandled errors from being displayed
				timeout: timeoutMs, // Set a timeout for the code execution
			})
		} catch {
			if (!executionCompleted) {
				executionCompleted = true
				resolve([0, "Time Limit Exceeded", 0])
			}
		}
	})
}
