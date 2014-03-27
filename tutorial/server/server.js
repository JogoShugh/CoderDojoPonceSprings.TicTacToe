var mongo = require('mongodb').MongoClient;
var _ = require('underscore');

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
		socket.on('query', function(query, callback) {
			console.log('query is:');
			console.log(query);
			 msgs.find(query).toArray(function(err, items) {
			 	if (err) {
			 		console.log('Error:');
			 		console.log(err);
			 	} else {
			 		callback(items);
			 	}
			 });
		});
		socket.on('queryMissionUsersNow', function(mission, callback) {
			console.log('queryMissionUsersNow is:');
			console.log(mission);

			var now = new Date();
			var since = new Date(now - 1*60*1000);

			// TODO: better to aggregate or reduce in mongo than in underscore
			var query = {
				$or: [
					{
						mission: mission,
						type: 'mission.join',
						timestamp:{	$gte:since}
					},
					{
						mission: mission,
						type: 'mission.leave',
						timestamp:{	$gte:since}
					}
				]
			};

			msgs.find(query).sort({timestamp:-1}).toArray(function(err, items) {
			 	if (err) {
			 		console.log('Error:');
			 		console.log(err);
			 	} else {
			 		var userGroups = _.groupBy(items, function(item) { return item.userName; });
			 		var mostRecents = _.map(userGroups, function(item) { return item[0] });
			 		var joins = _.chain(mostRecents).where({type:'mission.join'}).pluck('userName').value();
			 		var leaves = _.chain(mostRecents).where({type:'mission.leave'}).pluck('userName').value();
			 		var keeps = _.difference(joins, leaves);
					var missionUsersNow = _.filter(mostRecents, function(item) { return _.contains(keeps, item.userName) } );
			 		var response = {
			 			mission: mission,
			 			items: missionUsersNow
			 		};
			 		callback(response);
			 	}
			 });
		});		

		
	});	
});
