const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Datastore = require('nedb');
const legalmoves = require('./client/illegalMoveCheck.js');


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

    socket.on('disconnect', function() {
        // console.log('\nA client has disconnected');
    });


    /*  Whenever a new page connects to the server, check its session ID. If it was previously playing a game
        redirect it to game.html. Otherwise log them in.
    */
    socket.on('validation', function(data) {

        // check if they were just redirected from another page
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

        // check if they should be playing a game, and if so, give them the signal to start
        a = true;
        for (item of gamerooms) {
            if (item.p1sessionID == data.sessionID) {
                item.p1socketID = socket.id;
                if (!item.playing) {// if they weren't playing a game before
                    item.p1ready = true;
                    if (item.p1ready && item.p2ready) {
                        item.playing = true;

                        const wdata = {
                            yourMove: item.whitesTurn,
                            board: item.board,
                            rightCastle: true,
                            leftCastle: true,
                            color: 'white',
                            lastMove: item.lastMove,
                            opponent: item.p2username,
                            user: item.p1username,
                        }

                        const bdata = {
                            yourMove: !item.whitesTurn,
                            board: item.board,
                            rightCastle: true,
                            leftCastle: true,
                            color: 'black',
                            lastMove: item.lastMove,
                            opponent: item.p1username,
                            user: item.p2username,
                        }
                        io.to(item.p1socketID).emit('play_game', wdata);
                        io.to(item.p2socketID).emit('play_game', bdata);
                    }
                    break;
                } else { //if they disconnected while playing a game
                    if (socket.handshake.headers.referer.substring(socket.handshake.headers.referer.length - 9) != 'game.html') {
                        io.to(item.p1socketID).emit('redirect', '/client/game.html');
                    } else {
                        const data = {
                            yourMove: item.whitesTurn,
                            board: item.board,
                            rightCastle: item.p1RCastle,
                            leftCastle: item.p1LCastle,
                            color: 'white',
                            lastMove: item.lastMove,
                            opponent: item.p2username,
                            user: item.p1username
                        }
                        io.to(item.p1socketID).emit('play_game', data);
                    }
                    
                }
            }
                
            
            if (item.p2sessionID == data.sessionID) { //same checks for if they are player 2
                item.p2socketID = socket.id;
                if (!item.playing) {// if they weren't playing a game before
                    item.p2ready = true;
                    if (item.p1ready && item.p2ready) {
                        item.playing = true;
                        const wdata = {
                            yourMove: item.whitesTurn,
                            board: item.board,
                            rightCastle: true,
                            leftCastle: true,
                            color: 'white',
                            lastMove: item.lastMove,
                            opponent: item.p2username,
                            user: item.p1username,
                        }

                        const bdata = {
                            yourMove: !item.whitesTurn,
                            board: item.board,
                            rightCastle: true,
                            leftCastle: true,
                            color: 'black',
                            lastMove: item.lastMove,
                            opponent: item.p1username,
                            user: item.p2username
                        }
                        io.to(item.p1socketID).emit('play_game', wdata);
                        io.to(item.p2socketID).emit('play_game', bdata);
                    }
                    break;
                } else { //if they disconnected while playing a game
                    if (socket.handshake.headers.referer.substring(socket.handshake.headers.referer.length - 9) != 'game.html') {
                        io.to(item.p2socketID).emit('redirect', '/client/game.html');
                    } else {
                        const data = {
                            yourMove: !item.whitesTurn,
                            board: item.board,
                            rightCastle: item.p2RCastle,
                            leftCastle: item.p2LCastle,
                            color: 'black',
                            lastMove: item.lastMove,
                            opponent: item.p1username,
                            user: item.p2username
                        }
                        io.to(item.p2socketID).emit('play_game', data);
                    }
                }
                
            }
        }

        for (item of queue) {//if they disconnected while waiting in queue for a game
            if (item.sessionID == data.sessionID) {
                item.socketID = socket.id;
                break;
            }
        }
        
        if (queue.length >= 2) {//if a new match can be made
            queueFull();
        }
    });

    socket.on('new_login', function(data) {
        accounts.find({username: data.username}, function(err, docs) {
            if (docs.length == 0) {
                io.to(socket.id).emit('login_failure', 'No account with that username');
            } else if (docs[0].password != data.password) {
                io.to(socket.id).emit('login_failure','Incorrect password');
            } else {
                //check if they need a new session ID, and issue one if they do
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
            }
        });
    });

    socket.on('new_register', function(data) {
        accounts.find({username: data.username}, function(err, docs) {
            if (docs.length == 0) { // username is availiable
                accounts.insert({username: data.username, password: data.password});
                var SSID = generateUniqueSessionID();
                sessions.push({username: data.username, sessionID: SSID, socketID: socket.id})
                io.to(socket.id).emit('register_success', {username: data.username, sessionID: SSID});
            } else { //username already exists
                io.to(socket.id).emit('register_failure', 'Username already in use!');
            }
        });
    });

    socket.on('logout', function(data) {
        for (item of sessions) {//remove them from current sessions
            if (item.sessionID == data.sessionID) {
                sessions.splice(item, 1);
                break;
            }
        }

        for (var i = 0; i < gamerooms.length; i++) {//remove them from all games, and end the games
            if (gamerooms[i].p1sessionID == data.sessionID) {
                io.to(gamerooms[i].p2socketID).emit('gameover', {textResult: 'Your opponent disconnected', numResult: '0-1'});
                gamerooms.splice(gamerooms[i], 1);
                break;
            } else if (gamerooms[i].p2sessionID == data.sessionID) {
                io.to(gamerooms[i].p1socketID).emit('gameover', {textResult: 'Your opponent disconnected', numResult: '1-0'});
                gamerooms.splice(gamerooms[i], 1);
                break;
            }
        }



        for (item of queue) {//remove them from queue
            if (item.sessionID == data.sessionID) {
                queue.splice(item, 1);
                break;
            }
        }

        io.to(socket.id).emit('redirect', '/client/loginRegister.html');
    });

    socket.on('thisIsMySessionID', function(data) {//runs when client is attempting to connect
        if (data.sessionID.length != 20) {
            io.to(socket.id).emit('redirect', '/client/loginRegister.html');
        } else {
            io.to(socket.id).emit('redirect', '/client/home.html');
        }
    });

    socket.on('wish_to_play', function(data) {
        for (item of sessions) {
            if (item.sessionID == data.sessionID) {
                queue.push(item);
                break;
            }
        }

        io.to(socket.id).emit('redirect', '/client/queue.html');
    });

    //called after white makes a move. Update any server info about the game, and check if the game should end.
    socket.on('white_moved', function(data) {
        for (item of gamerooms) {
            if (item.p1sessionID == data.sessionID) {
                item.board = legalmoves.movepiece(item.board, data.move.from, data.move.to, data.move.piece);
                item.whitesTurn = false;
                if (data.move.from.x == 4 && data.move.from.y == 0) {
                    item.p1LCastle = false;
                    item.p1RCastle = false;
                }
                if (data.move.from.x == 0 && data.move.from.y == 0) {
                    item.p1LCastle = false;
                }
                if (data.move.from.x == 7 && data.move.from.y == 0) {
                    item.p1RCastle = false;
                }


                item.lastMove = data.move;
                io.to(item.p2socketID).emit('make_a_move', {lastMove: data.move});
                var lMoves = legalmoves.getLegalMoves(item.board, 'b', item.lastMove, item.p1LCastle, item.p1RCastle);
                if (lMoves.length == 0) {
                    if (legalmoves.kingInCheck(item.board, 'b')) {
                        io.to(item.p1socketID).emit('gameover', {textResult: 'You won!', numResult: '1-0'});
                        io.to(item.p2socketID).emit('gameover', {textResult: 'You lost.', numResult: '0-1'});
                    } else {
                        io.to(item.p1socketID).emit('gameover', {textResult: 'Stalemate.', numResult: '0.5-0.5'});
                        io.to(item.p2socketID).emit('gameover', {textResult: 'Stalemate.', numResult: '0.5-0.5'});
                    }
                    gamerooms.splice(item, 1);
                }
            }
        }
    });

    socket.on('black_moved', function(data) {
        for (item of gamerooms) {
            if (item.p2sessionID == data.sessionID) {
                item.board = legalmoves.movepiece(item.board, data.move.from, data.move.to, data.move.piece);
                item.whitesTurn = true;
                if (data.move.from.x == 4 && data.move.from.y == 7) {
                    item.p2LCastle = false;
                    item.p2RCastle = false;
                }
                if (data.move.from.x == 0 && data.move.from.y == 7) {
                    item.p2LCastle = false;
                }
                if (data.move.from.x == 7 && data.move.from.y == 7) {
                    item.p2RCastle = false;
                }


                item.lastMove = data.move;
                io.to(item.p1socketID).emit('make_a_move', {lastMove: data.move});

                var lMoves = legalmoves.getLegalMoves(item.board, 'w', item.lastMove, item.p1LCastle, item.p1RCastle);
                if (lMoves.length == 0) {
                    if (legalmoves.kingInCheck(item.board, 'w')) {
                        io.to(item.p1socketID).emit('gameover', {textResult: 'You lost.', numResult: '0-1'});
                        io.to(item.p2socketID).emit('gameover', {textResult: 'You win!', numResult: '1-0'});
                    } else {
                        io.to(item.p1socketID).emit('gameover', {textResult: 'Stalemate.', numResult: '0.5-0.5'});
                        io.to(item.p2socketID).emit('gameover', {textResult: 'Stalemate.', numResult: '0.5-0.5'});
                    }
                    gamerooms.splice(item, 1);
                }
            }
        }
    });
});

/*  Is called when length of queue > 2.
    When it is, setup a new game, add the players to a gameroom and remove them from the queue
*/
function queueFull() {
    var room = {
        p1username: queue[0].username,
        p1sessionID: queue[0].sessionID,
        p1socketID: queue[0].socketID,
        p1ready: false,
        p1LCastle: true,
        p1RCastle: true,

        p2username: queue[1].username,
        p2sessionID: queue[1].sessionID,
        p2socketID: queue[1].socketID,
        p2ready: false,
        p2LCastle: true,
        p2RCastle: true,

        // roomID: queue[0].sessionID + '-' + queue[1].sessionID,
        board: [['wr','wn','wb','wq','wk','wb','wn','wr'],
                ['wp','wp','wp','wp','wp','wp','wp','wp'],
                ['__','__','__','__','__','__','__','__'],
                ['__','__','__','__','__','__','__','__'],
                ['__','__','__','__','__','__','__','__'],
                ['__','__','__','__','__','__','__','__'],
                ['bp','bp','bp','bp','bp','bp','bp','bp'],
                ['br','bn','bb','bq','bk','bb','bn','br']],
        whitesTurn: true,
        playing: false,
        lastMove: {from: {x: 0, y: 0}, to: {x: 0, y: 0}},
    };
    gamerooms.push(room);

    io.to(room.p1socketID).emit('redirect', '/client/game.html');
    io.to(room.p2socketID).emit('redirect', '/client/game.html');

    queue.splice(queue[0], 1);
    queue.splice(queue[0], 1);
}


//generate random string of 20 characters until one is made that has not been taken
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