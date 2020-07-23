const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const nedb = require('nedb');
var os = require('os');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/home.html');
});

http.listen(8080, function() {
    console.log('listening to http:/localhost:8080');
});

var clients = [];

io.on('connection', function(socket) {
    clients.push(socket.id);
    console.log('A client has connected.');
    socket.on('disconnect', function() {
        console.log('A client has disconnected');
        clients.splice(socket.id, 1);
    }); 
});

io.on('new login', function(socket) {
    console.log('Client attempting to login...');

});