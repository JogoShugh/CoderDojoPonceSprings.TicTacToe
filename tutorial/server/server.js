var io = require('socket.io').listen(8090);

io.sockets.on('connection', function(socket) {
	socket.on('msg', function(msg) {
		console.log('here is the message from a client:')
		console.log(msg);
		socket.broadcast.emit("msg", msg);
	});
});