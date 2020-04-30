<script>
	import AWS from 'aws-sdk/global'
	import AWSMqttClient from 'aws-mqtt'
	import config from '../../config' // NOTE: make sure to copy config.example.js to config.js and fill in your values

	// Initialize the Amazon Cognito credentials provider
	AWS.config.region = config.aws.region
	AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	IdentityPoolId: config.aws.cognito.identityPoolId
	})

	const client = new AWSMqttClient({
	region: AWS.config.region,
	credentials: AWS.config.credentials,
	endpoint: config.aws.iot.endpoint,
	clientId: 'mqtt-client-' + (Math.floor((Math.random() * 100000) + 1)),
	// clientId: 'mqtt-client-browser',
	})

	client.on('connect', () => {
		client.subscribe(config.topic)
	})

	let messages = [];
	client.on('message', (topic, message) => {
		console.log(topic, message)
		messages = messages.concat(JSON.parse(message).message)
	})

	let message = '';
	function handleSend(event) {
		client.publish(config.topic, JSON.stringify({ message }))
		message = ''
	}
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>AWS IoT Pub/Sub Demo</h1>
<form>
	<div>
		<label for="message">Message to send:</label>
		<input type="text" bind:value={message} />
		<button type="button" on:click={handleSend}>Send!</button>
	</div>
</form>

{#each messages as msg}
	<div>{msg}</div>
{:else}
	<div>No messages</div>
{/each}
