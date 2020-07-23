const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Datastore = require('nedb');


const accounts = new Datastore('accounts.db')
accounts.loadDatabase();

// app.get('/client/home.html', function(req, res) {
//     res.sendFile(__dirname + '/client/home.html');
// });




app.listen(8080, function() {
    console.log('listening to http://localhost:8080');
});

app.use(express.static('client'));
// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/client/loginRegister.html');
// });
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

io.on('new login', function(data) {
    console.log('Client attempting to login...');
    accounts.find({username: data.username, password: data.password}, function(err, docs) {
        if (docs == []) { // account doesnt exist, return to login with error message
            io.to(socket.id).emit('login failure','No account with that username and password combination');
        } else { //continue to home screen
            io.to(socket.id).emit('login success', data.username);
            onlineUsers.push(data);
        }
    });
});

io.on('new register', function(data) {
    console.log('Client attempting to register...');
    accounts.find({username: data.username}, function(err, docs) {
        if (docs == []) { // username is availiable
            accounts.insert({username: data.username, password: data.password});
            io.to(socket.id).emit('register success', data.username);
            onlineUsers.push(data);
        } else { //username already exists
            io.to(socket.id).emit('register failure', 'Username already in use!');
        }
    });
});