'use strict'

var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = '[Your Device Connection String]';
var client = clientFromConnectionString(connectionString);

//display output
function printResultFor(op) {
	return function printResult(err, res) {
		if (err) console.log(op + ' error: ' + err.toString());
		if (res) console.log(op + ' status: ' + res.constructor.name);
	};
}

//send new message to IoT hub every second
var connectCallback = function (err) {
	if (err) {
		console.log('Could not connect: ' + err);
	} else {
		console.log('Client connected');
		
		//create and send every second
		setInterval(function() {
			var windSpeed = 10 + (Math.random() * 4);
			var data = JSON.stringify({ deviceId: 'myPi', windSpeed: windSpeed});
			var message = new Message(data);
			console.log('Sending message: ' + message.getData());
			client.sendEvent(message, printResultFor('send'));
		}, 2000);
	}
};

//connect and send
client.open(connectCallback);
