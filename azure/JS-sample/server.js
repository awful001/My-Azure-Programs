var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var events = require('events');
var port = 8080;

var eventEmitter = new events.EventEmitter();
var connectionString = '[Your connection string]';

//Create a device client
var client = clientFromConnectionString(connectionString);

//Create a callback function
var connectCallback = function (err) {
	if (err) {
		console.error('Could not connect: ' + err);
	} else {
		console.log('Client connected');
		var message = new Message('Hello from Pi');
		client.sendEvent(message, function (err) {
			if (err) console.log(err.toString());
		});
		
		eventEmitter.on('azure', function (data) {
			console.log('sending to azure...');
			var temp = new Message(data);
			client.sendEvent(temp, function (err) {
				if (err) {
					console.log(err.toString());
				} else {
					console.log('sent');
					eventEmitter.emit('socket', data + ' sent');
				}
			});
		});
		
		client.on('message', function (msg) {
			var data = msg.data;
			data = data.slice(data.indexOf('{'), data.indexOf('}') + 1);
			console.log(data);
			eventEmitter.emit('socket', data + ' received');
			client.complete(msg, function () {
				console.log('completed');
			});
		});
	}
};

//open connection
client.open(connectCallback);

//start server
app.listen(port);
console.log('Start listening at port ' + port);

function handler (req, res) {
	fs.readFile('index.html', function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		
		res.writeHead(200);
		res.end(data);
	});
}

io.sockets.on('connection', function (socket) {
	console.log('Connected');
	socket.emit('message', 'Connected');
	
	eventEmitter.on('socket', function (data) {
		socket.emit('message', data);
	});
	
	socket.on('button', function (data) {
		console.log('Received: ' + data);
		eventEmitter.emit('azure', data);
	});
});
