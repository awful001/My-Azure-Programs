var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = 'HostName=myPiIoTHub.azure-devices.net;DeviceId=myPi;SharedAccessKey=X5uJf/+SYGPEA1Mlen5AwlclUBGr1Gnn1dXIZISZtCM=';

//Create a device client
var client = clientFromConnectionString(connectionString);

//Create a callback function
var connectCallback = function (err) {
	if (err) {
		console.error('Could not connect: ' + err);
	} else {
		console.log('Client connected');
		var message = new Message('some data from my device');
		client.sendEvent(message, function (err) {
			if (err) console.log(err.toString());
		});
		
		client.on('message', function (msg) {
			console.log(msg.data);
			client.complete(msg, function () {
				console.log('completed');
			});
		});
	}
};

//open connection
client.open(connectCallback);
