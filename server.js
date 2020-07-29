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


http.listen(port, function(){
    console.log('listening on ' + port);
});


var sessions = [];
var gamerooms = [];
var queue = [];

io.on('connection', function(socket) {
    // console.log('\nA client has connected.');

    socket.on('disconnect', function() {
        // console.log('\nA client has disconnected');
    });

    socket.on('validation', function(data) {
        var a = true;
        for (item of sessions) {
            if (item.sessionID == data.sessionID) {
                item.socketID = socket.id;
                io.to(socket.id).emit('validation_success', {username: item.username});
                a = false;
                break;
            }
        }
      
        if (a) {
            io.to(socket.id).emit('validation_failed');
        }

        a = true;
        for (item of gamerooms) {
            if (item.p1sessionID == data.sessionID) {
                item.p1socketID = socket.id;
                item.p1ready = true;
                if (item.p1ready && item.p2ready) {
                    io.to(item.p1socketID).emit('play_game', {color: 'white'});
                    io.to(item.p2socketID).emit('play_game', {color: 'black'});
                }
                break;
            }
            
            if (item.p2sessionID == data.sessionID) {
                item.p2socketID = socket.id;
                item.p2ready = true;
                if (item.p1ready && item.p2ready) {
                    io.to(item.p1socketID).emit('play_game', {color: 'white'});
                    io.to(item.p2socketID).emit('play_game', {color: 'black'});
                }
                break;
            }
        }

        for (item of queue) {
            if (item.sessionID == data.sessionID) {
                item.socketID = socket.id;
                break;
            }
        }
        
        if (queue.length >= 2) {
            queueFull();
        }
    });

    socket.on('new_login', function(data) {
        console.log('\nClient attempting to login...');
        accounts.find({username: data.username, password: data.password}, function(err, docs) {
            if (docs == []) {
                io.to(socket.id).emit('login_failure','No account with that username and password combination');
                console.log('login failed');
            } else {
                var SSID;
                var needSSID = true;
                for (item of sessions) {
                    if (item.username == data.username) {
                        SSID = item.sessionID;
                        needSSID = false;
                        break;
                    }
                }
                if (needSSID) {
                    SSID = generateUniqueSessionID();
                    sessions.push({username: data.username, sessionID: SSID, socketID: socket.id})
                }
                io.to(socket.id).emit('login_success', {username: data.username, sessionID: SSID});
                console.log('login success');
            }
        });
    });

    socket.on('new_register', function(data) {
        console.log('\nClient attempting to register...');
        accounts.find({username: data.username}, function(err, docs) {
            if (docs.length == 0) { // username is availiable
                accounts.insert({username: data.username, password: data.password});
                var SSID = generateUniqueSessionID();
                sessions.push({username: data.username, sessionID: SSID, socketID: socket.id})
                io.to(socket.id).emit('register_success', {username: data.username, sessionID: SSID});
                console.log('register success');
            } else { //username already exists
                io.to(socket.id).emit('register_failure', 'Username already in use!');
                console.log('register failed');
            }
        });
        console.log();
    });

    socket.on('logout', function(data) {
        for (item of sessions) {
            if (item.sessionID == data.sessionID) {
                sessions.splice(item, 1);
                break;
            }
        }

        io.to(socket.id).emit('redirect', '/client/loginRegister.html');
    });

    socket.on('thisIsMySessionID', function(data) {
        console.log('\nreceived session id: ' + data.sessionID);
        if (data.sessionID.length != 20) {
            io.to(socket.id).emit('redirect', '/client/loginRegister.html');
            console.log('null session id, redirecting to login/register');
        } else {
            io.to(socket.id).emit('redirect', '/client/home.html');
            console.log('valid session id, redirecting to home');
        }
    });

    socket.on('wish_to_play', function(data) {
        for (item of sessions){
            if (item.sessionID == data.sessionID) {
                queue.push(item);
                // sessions.splice(item, 1);
                break;
            }
        }

        io.to(socket.id).emit('redirect', '/client/queue.html');
    });

    socket.on('white_moved', function(data) {
        for (item of gamerooms) {
            if (item.p1sessionID == data.sessionID) {
                io.to(item.p2socketID).emit('make_a_move', {to: data.to, fro: data.fro})
            }
        }
    });

    socket.on('black_moved', function(data) {
        for (item of gamerooms) {
            if (item.p2sessionID == data.sessionID) {
                io.to(item.p1socketID).emit('make_a_move', {to: data.to, fro: data.fro})
            }
        }
    });
});

function queueFull() {
    var room = {
        p1username: queue[0].username,
        p1sessionID: queue[0].sessionID,
        p1socketID: queue[0].socketID,
        p1ready: false,

        p2username: queue[1].username,
        p2sessionID: queue[1].sessionID,
        p2socketID: queue[1].socketID,
        p2ready: false,
        roomID: queue[0].sessionID + '-' + queue[1].sessionID
    };
    gamerooms.push(room);

    io.to(room.p1socketID).emit('redirect', '/client/game.html');
    io.to(room.p2socketID).emit('redirect', '/client/game.html');

    queue.splice(queue[0], 1);
    queue.splice(queue[0], 1);
    

}

function generateUniqueSessionID() {
    while (true) {
        var temp = makeid();
        if (!sessions.find(row => row.sessionID == temp)) {
            break;
        };
    }

  return temp;
}

function makeid() {
    var result = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * 62));
    }
    return result;
}