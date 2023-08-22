const amqp = require("amqplib")

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

	channel.consume(
		exchange,
		(msg) => {
			const message = msg.content.toString()
			console.log(message)
			channel.publish(exchange, routingKey, Buffer.from("alo alo"))
		},
		{ noAck: true }
	)
}

consume().catch(console.log)
