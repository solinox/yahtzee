<script>
	import AWS from 'aws-sdk/global'
	import AWSMqttClient from 'aws-mqtt'
	import { tick } from 'svelte'
	import { fade } from "svelte/transition";
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
		} else {
			console.error('invalid message', payload)
		}
	})

	client.on('connect', (topic, payload) => {
		client.publish(config.topic, JSON.stringify({ event: 'userConnected', source: user }))
	})

	client.on('disconnect', (topic, payload) => {
		client.publish(config.topic, JSON.stringify({ event: 'userDisconnected', source: user }))
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
	let chat;
	async function messageHandler(data) {
		messages = messages.concat(data.message)
		await tick()
		if (!chat) chat = document.getElementById('chat')
		chat.scrollTop = chat.scrollHeight
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
		client.publish(config.topic, JSON.stringify({ event: 'message', message: `${user}: ${message}`}))
		message = ''
	}

	function handleRoll() {
		let newDice = []
		for (let i = 0; i < 6; i++) {
			newDice.push(Math.floor(Math.random() * 6) + 1)
		}
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
	#chat {
		border: 0.2em solid rgb(61, 61, 61);
		border-radius: 0.2em;
		height: 30vh;
		overflow-y: auto;
	}
	#chat div {
		padding: 0.5vh 1vw 0.5vh 1vw;
		margin: 0;
		background: rgb(61, 61, 61);
		color: white;
	}
	#chat div:nth-child(odd) {
		background: white;
		color: rgb(61, 61, 61);;
	}
	img {
		padding: 1vw;
		height: 10vw;
		width: 10vw;
	}
</style>

<div id="chat">
	{#each messages as msg}
		<div transition:fade>{msg}</div>
	{/each}
</div>

<div>
	<input type="text" bind:value={message} />
	<button type="button" on:click|preventDefault={handleSendMessage}>Send</button>
</div>

<div>
	<button on:click={handleRoll}>Roll</button>
</div>
<div>
	{#each dice as d}
		<img alt={d} src={`/static/dice${d}.png`} />
	{/each}
</div>
<!--
{#each users as u}
	<div>{u} pts={scores[u]}</div>
	{#each scoreOptions, i as option (i)}
		<span className="scoring-option" on:click={handleScore}>{option}</span>
	{/each}
{/each}
-->
