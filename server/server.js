const io = require('socket.io')
const server = io.listen(8080);

server.on('connection', function(socket){
    console.log('A user has connected.');
    socket.on('disconnect', function() {
        console.log('A user has disconnected');
    }); 
});
