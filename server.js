var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Datastore = require('nedb');

var port = process.env.PORT || 8080;

const accounts = new Datastore('accounts.db')
accounts.loadDatabase();

app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/communicationSetup.html');
});

app.get('/client/game.html', function(req, res){
  res.sendFile(__dirname + '/client/game.html');
  
});

http.listen(port, function(){
    console.log('listening on ' + port);
});


var clients = [{}];

io.on('connection', function(socket) {
    console.log('A client has connected.');

    socket.on('disconnect', function() {
        console.log('A client has disconnected');
    });

    socket.on('new_login', function(data) {
        console.log('Client attempting to login...');
        accounts.find({username: data.username, password: data.password}, function(err, docs) {
            if (docs == []) { // account doesnt exist, return to login with error message
                io.to(socket.id).emit('login_failure','No account with that username and password combination');
                console.log('login failed');
            } else { //continue to home screen
                var SSID = generateUniqueSessionID();
                clients.push({username: data.username, sessionID: SSID})
                io.to(socket.id).emit('login_success', {username: data.username, sessionID: SSID, redirectPath: '/client/home.html'});
                console.log('login success');
            }
        });
    });

    socket.on('new_register', function(data) {
        console.log('Client attempting to register...');
        accounts.find({username: data.username}, function(err, docs) {
            console.log(docs)
            if (docs.length == 0) { // username is availiable
                accounts.insert({username: data.username, password: data.password});
                var SSID = generateUniqueSessionID();
                clients.push({username: data.username, sessionID: SSID})
                io.to(socket.id).emit('register_success', {username: data.username, sessionID: SSID, redirectPath: '/client/home.html'});
                console.log('register success');
            } else { //username already exists
                io.to(socket.id).emit('register_failure', 'Username already in use!');
                console.log('register failed');
            }
        });
        console.log();
    });

    socket.on('logout', function(data) {
      for (item in clients) {
        if (item.sessionID == data.sessionID) {
          clients.splice(item, 1);
          break;
        }
      }
      io.to(socket.id).emit('redirect', '/client/loginRegister.html');
    });

    socket.on('thisIsMySessionID', function(data) {
      console.log('received session id: ' + data.sessionID);
      if (data.sessionID.length != 20) {
        io.to(socket.id).emit('redirect', '/client/loginRegister.html');
        console.log('null session id, redirecting to login/register');
      } else {
        io.to(socket.id).emit('redirect', '/client/home.html');
        console.log('valid session id, redirecting to home');
      }
    });
});

function generateUniqueSessionID() {
  while (true) {
    var temp = makeid();
    if (!clients.find(row => row.sessionID == temp)) {
      break;
    };
  }

  return temp;
}

function makeid() {
  var result = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 20; i++ ) {
     result += chars.charAt(Math.floor(Math.random() * 62));
  }
  return result;
}