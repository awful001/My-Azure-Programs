var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = '[Your device connection string]';

//Create a device client
var client = clientFromConnectionString(connectionString);

//Create a callback function
var connectCallback = function (err) {
	if (err) {
		console.error('Could not connect: ' + err);
	} else {
		console.log('Client connected\nNow listening...');
		
		client.on('message', function (msg) {
			var data = msg.data;
			//data = data.slice(data.indexOf('{'), data.indexOf('}') + 1);
			console.log(data);
			client.complete(msg, function () {
				console.log('completed');
			});
		});
	}
};

//open connection
client.open(connectCallback);
