var mongo = require('mongodb').MongoClient;

var msgs = null;

function decorateMessage(msg) {
	msg.timestamp = new Date();
	return msg;
}

mongo.connect("mongodb://localhost:27017/learnlocity", function(err, db) {
	msgs = db.collection('msg');

	var io = require('socket.io').listen(8090);
	io.sockets.on('connection', function(socket) {
		socket.on('msg', function(msg) {
			var decoratedMessage = decorateMessage(msg);
			socket.broadcast.emit("msg", decoratedMessage);
			msgs.insert(decoratedMessage, function(err, result) {
				if (err) {
					console.log('Error:');
					console.log(err);
				}
			});
		});
		socket.on('query', function(query) {
			console.log('query is:');
			console.log(query);
			 msgs.find(query).toArray(function(err, items) {
			 	if (err) {
			 		console.log('Error:');
			 		console.log(err);
			 	} else {
			 		socket.emit('queryResult', items);
			 	}
			 });
		});
		socket.on('queryMissionUsersNow', function(mission) {
			console.log('queryMissionUsersNow is:');
			console.log(mission);

			var now = new Date();
			var since = new Date(now - 1*60*1000);

			var query = {
				mission: mission,
				timestamp:{	$gte:since}
			};

			msgs.find(query).toArray(function(err, items) {
			 	if (err) {
			 		console.log('Error:');
			 		console.log(err);
			 	} else {
			 		console.log('queryMissionUsersNowResponse:');
			 		console.log(items);
			 		var response = {
			 			mission: mission,
			 			items: items
			 		};
			 		socket.emit('queryMissionUsersNowResponse', response);
			 	}
			 });
		});		

		
	});	
});
