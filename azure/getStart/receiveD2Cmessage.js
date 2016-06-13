'use strict';

var AMQPClient = require('amqp10').Client;
var Policy = require('amqp10').Policy;
var translator = require('amqp10').translator;
var Promise = require('bluebird');

var protocol = 'amqps';
var eventHubHost = '[Your IoT hub compatible endpoint]';
var sasName = 'iothubowner';
var sasKey = '[Your IoT hub SharedAccessKey]';
var eventHubName = '[Your IoT hub compatible name]';
var numPartitions = 4; //set according to the number of your IoT hub Partitions

//Create a filter that the receiver only reads messages sent to IoT Hub after the receiver starts running
var filterOffset = new Date().getTime();
var filterOption;
if (filterOffset) {
	filterOption = {
		attach: { source: { filter: {
			'apache.org:selector-filter:string': translator(
			['described', ['symbol', 'apache.org:selector-filter:string'], ['string', "amqp.annotation.x-opt-enqueuedtimeutc > " + filterOffset + ""]])
		} } }
	};
}

//Create the receive address and AMQP client
var uri = protocol + '://' + encodeURIComponent(sasName) + ':' + encodeURIComponent(sasKey) + '@' + eventHubHost;
var recvAddr = eventHubName + '/ConsumerGroups/$default/Partitions/';
var client = new AMQPClient(Policy.EventHub);

//Print output to the console
var messageHandler = function (partitionId, message) {
	console.log('Received(' + partitionId + '): ', message.body);
};

var errorHandler = function (partitionId, err) {
	console.warn('** Receive error: ', err);
};

//Create a receiver for a given partition
var createPartitionReceiver = function(partitionId, receiveAddress, filterOption) {
	return client.createReceiver(receiveAddress, filterOption)
	.then(function (receiver) {
		console.log('Listening on partition: ' + partitionId);
		receiver.on('message', messageHandler.bind(null, partitionId));
		receiver.on('errorReceiverd', errorHandler.bind(null, partitionId));
	});
};

//Connect to the Event Hub and start the receivers
client.connect(uri)
.then(function () {
	var partitions = [];
	for (var i = 0; i < numPartitions; i++) {
		partitions.push(createPartitionReceiver(i, recvAddr + i, filterOption));
	}
	return Promise.all(partitions);
})
.error(function (e) {
	console.warn('Connection error: ', e);
});
