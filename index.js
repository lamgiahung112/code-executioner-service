const amqp = require("amqplib")
const testcaseHandler = require("./testcaseHandler")

const host = process.argv[2]
const port = process.argv[3]
const username = process.argv[4]
const password = process.argv[5]
const vhost = process.argv[6]
const exchange = process.argv[7]
const routingKey = process.argv[8]

const connectionString = `amqp://${username}:${password}@${host}:${port}/${vhost}`
console.log(connectionString)

async function consume() {
	const connection = await amqp.connect(connectionString)

	const channel = await connection.createChannel()

	await channel.assertQueue(exchange, { durable: true })
	channel.bindQueue(exchange, exchange, routingKey)

	console.log(`Waiting for message in exchange ${exchange}`)
	channel.publish(exchange, routingKey, Buffer.from("Service started"))

	channel.consume(
		exchange,
		(msg) => {
			handleIncomingMessages(msg).then((result) => {
				console.log(msg.content.toString())
				channel.publish(exchange, routingKey, Buffer.from(result))
			})
		},
		{ noAck: false }
	)
}

async function handleIncomingMessages(message) {
	const data = JSON.parse(message.content.toString())

	if (
		Object.keys(data).includes("problemId") &&
		Object.keys(data).includes("testcases")
	) {
		console.log(JSON.stringify(data.testcases))
		return await testcaseHandler(data.problemId, JSON.stringify(data.testcases))
	}
	return "alo 123"
}

consume().catch(console.log)
