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
	})

	client.on('connect', () => {
		client.subscribe(config.topic)
	})

	const eventHandlers = {
		'message': messageHandler,
		'startGame': startGameHandler,
		'userRolled': userRolledHandler,
		'userScored': userScoredHandler,
		'userConnected': userConnectedHandler,
		'userDisconnected': userDisconnectedHandler,
	}

	client.on('message', (topic, payload) => {
		const data = JSON.parse(payload);
		if (eventHandlers.hasOwnProperty(data.event)) {
			eventHandlers[data.event](data);
		}
	})

	const scoreOptions = ['6s', '5s', '4s', '3s', '2s', '1s', 'Full House', '4 of a kind', '3 of a kind', '2 of a kind', '2 Pair', 'Bonus', 'Yahtzee']
	let user = 'ABC' + Math.floor(Math.random()*10)
	let users = [user]
	let messages = []
	let message = ''
	let scores = {}
	let turnOrder = []
	let currentPlayer = undefined;
	let dice = []

	function messageHandler(data) {
		messages = messages.concat(`${data.source}: ${data.message}`);
	}

	function startGameHandler(data) {
		const newScores = {}
		data.users.forEach(u => newScores[u] = [])
		turnOrder = data.users
		currentPlayer = data.users[0]
		scores = newScores
	}

	function userRolledHandler(data) {
		messages = messages.concat(`${data.source} rolled ${data.dice.join(' ')}`)
		dice = data.dice
	}

	function userScoredHandler(data) {
		messages = messages.concat(`${data.source} selected ${data.score} for ${data.points} points`)
		scores[data.source] = scores[data.source].concat(data.score)
		currentPlayer = turnOrder[(turnOrder.findIndex(x => currentPlayer === x) + 1) % turnOrder.length]
	}

	function userConnectedHandler(data) {
		messages = messages.concat(`${data.source} connected`)
	}

	function userDisconnectedHandler(data) {
		messages = messages.concat(`${data.source} disconnected`)
	}

	function handleSendMessage(event) {
		client.publish(config.topic, JSON.stringify({ event: 'message', source: user, message }))
		message = ''
	}

	function handleRoll() {
		let newDice = []
		for (let i = 0; i < 6; i++) {
			newDice.push(Math.floor(Math.random() * 6) + 1)
		}
		newDice.sort((a, b) => b - a)
		dice = newDice
		client.publish(config.topic, JSON.stringify({ event: 'userRolled', source: user, dice }))
	}

	function handleScore(event) {
		let score = 'nothing'
		let points = 0
		client.publish(config.topic, JSON.stringify({ event: 'userScored', source: user, score, points }))
	}

</script>

<style>
	h1 {
		color: purple;
	}
	.chatbox {
		border: 0.2em solid black;
		border-radius: 0.2em;
	}
	ul {
		height: 20vh;
		overflow-y: auto;
	}
</style>
<!--
<div class="chatbox">
	<ul>
		{#each messages as msg}
			<div>{msg}</div>
		{:else}
			<div>No messages</div>
		{/each}
	</ul>
	<form>
		<div>
			<label for="message">Message to send:</label>
			<input type="text" bind:value={message} />
			<button type="button" on:click={handleSendMessage}>Send!</button>
		</div>
	</form>
</div>

<button on:click={handleRoll}>Roll</button>

<div>
	{#each dice as d}
		<img height="20" width="20" alt={d} src={`/dice${d}.png`} />
	{/each}
</div>

{#each users as u}
	<div>{u} pts={scores[u]}</div>
	{#each scoreOptions, i as option (i)}
		<span className="scoring-option" on:click={handleScore}>{option}</span>
	{/each}
{/each}
-->
