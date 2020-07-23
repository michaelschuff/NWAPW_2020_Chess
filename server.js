var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Datastore = require('nedb');
const { allowedNodeEnvironmentFlags } = require('process');
var port = process.env.PORT || 8080;

const accounts = new Datastore('accounts.db')
accounts.loadDatabase();

// app.get('/client/home.html', function(req, res) {
//     res.sendFile(__dirname + '/client/home.html');
// });

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/loginRegister.html');
});

app.use(express.static('client'));
var clients = [];
var onlineUsers = [];


io.on('connection', function(socket) {
    clients.push(socket.id);
    console.log('A client has connected.');
    socket.on('disconnect', function() {
        console.log('A client has disconnected');
        clients.splice(socket.id, 1);
        for (user in onlineUsers) {
            if (user.socketid == socket.id) {
                onlineUsers.splice(user, 1);
                break;
            }
        }
    });

    socket.on('new login', function(data) {
        console.log('Client attempting to login...');
        accounts.find({username: data.username, password: data.password}, function(err, docs) {
            if (docs == []) { // account doesnt exist, return to login with error message
                io.to(socket.id).emit('login failure','No account with that username and password combination');
                console.log('login failed');
            } else { //continue to home screen
                io.to(socket.id).emit('login success', data.username);
                onlineUsers.push(data);
                console.log('login success');
            }
        });
    });

    socket.on('new register', function(data) {
        console.log('Client attempting to register...');
        accounts.find({username: data.username}, function(err, docs) {
            console.log(docs)
            if (docs.length == 0) { // username is availiable
                accounts.insert({username: data.username, password: data.password});
                io.to(socket.id).emit('register success', data.username);
                onlineUsers.push({'username': data.username, 'ip': data.ip, 'socketid': socket.socketid});
                console.log('register success');
            } else { //username already exists
                io.to(socket.id).emit('register failure', 'Username already in use!');
                console.log('register failed');
            }
        });
    });
});


http.listen(port, function(){
    console.log('listening on http://localhost:' + port);
  });