const amqp = require("amqplib")

const setupDirs = require("./setupDirs")
const testcaseHandler = require("./testcaseHandler")

const host = process.argv[2]
const port = process.argv[3]
const username = process.argv[4]
const password = process.argv[5]
const vhost = process.argv[6]
const routingKey = process.argv[7]

const connectionString = `amqp://${username}:${password}@${host}:${port}/${vhost}`
console.log(connectionString)

const exchanges = {
	CONSUME: "CONSUMER-EXCHANGE",
	"CODE-EXECUTION": "CODE-EXECUTION-SERVICE",
	"TESTCASE-SAVING": "TESTCASE-SAVING-SERVICE",
}

async function consume() {
	const connection = await amqp.connect(connectionString)

	const channel = await connection.createChannel()

	await channel.assertQueue(exchanges.CONSUME, { durable: true })
	channel.bindQueue(exchanges.CONSUME, exchanges.CONSUME, routingKey)

	console.log(`Waiting for message in exchange ${exchanges.CONSUME}`)

	channel.consume(
		exchanges.CONSUME,
		(msg) => {
			handleIncomingMessages(msg).then((result) => {
				channel.publish(
					exchanges["TESTCASE-SAVING"],
					routingKey,
					Buffer.from(result)
				)
			})
		},
		{ noAck: false }
	)
}

async function handleIncomingMessages(message) {
	try {
		const data = JSON.parse(message.content.toString())

		if (
			Object.keys(data).includes("problemId") &&
			Object.keys(data).includes("testcases")
		) {
			return await testcaseHandler(data.problemId, JSON.stringify(data.testcases))
		}
	} catch {
		return ""
	}
}

setupDirs()
consume().catch(console.log)
