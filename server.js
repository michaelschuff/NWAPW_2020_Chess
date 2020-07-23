const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Datastore = require('nedb');
var os = require('os');


const accounts = new Datastore('accounts.db')
accounts.loadDatabase();


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/home.html');
});

http.listen(8080, function() {
    console.log('listening to http:/localhost:8080');
});

var clients = [];
var onlineUsers = [];

io.on('connection', function(socket) {
    clients.push(socket.id);
    console.log('A client has connected.');
    socket.on('disconnect', function() {
        console.log('A client has disconnected');
        clients.splice(socket.id, 1);
    }); 
});

io.on('new login', function(req, res) {
    console.log('Client attempting to login...');
    accounts.count({username: req.body.username, password: req.body.password}, function(err, num) {
        if (num == 0) { // account doesnt exist, return to login with error message
            io.to(socket.id).emit('login failure','failure');
        } else { //continue to home screen
            io.to(socket.id).emit('login success', accounts.find({username: req.body.username, password: req.body.password}));
            onlineUsers.push()
        }
    });
});