const express = require('express');
const app = express();
const port = 8002;
var server = require('http').Server(app);
const io = require('socket.io')(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
});
const users = require('./configs/users');
const cors = require('cors');

app.use(cors());

var clients = {};

io.on('connection', function (client) {
	console.log('new connection!, client: ', client, '***end***');
	client.on('sign-in', (e) => {
		console.log('someone signed in!', e);
		let user_id = e.id;
		if (!user_id) return;
		client.user_id = user_id;
		if (clients[user_id]) {
			clients[user_id].push(client);
		} else {
			clients[user_id] = [client];
		}
	});

	client.on('message', (e) => {
		console.log('new message!', e);
		let targetId = e.to;
		let sourceId = client.user_id;
		if (targetId && clients[targetId]) {
			clients[targetId].forEach((cli) => {
				console.log('emitted to 1!', e);
				cli.emit('message', e);
			});
		}

		if (sourceId && clients[sourceId]) {
			clients[sourceId].forEach((cli) => {
				console.log('emitted to 2!', e);
				cli.emit('message', e);
			});
		}
	});

	client.on('disconnect', function () {
		if (!client.user_id || !clients[client.user_id]) {
			return;
		}
		let targetClients = clients[client.user_id];
		for (let i = 0; i < targetClients.length; ++i) {
			if (targetClients[i] == client) {
				targetClients.splice(i, 1);
			}
		}
	});
});

app.get('/users', (req, res) => {
	res.send({ data: users });
});

server.listen(port, () =>
	console.log(`Example app listening on port ${port}!`)
);
