var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;


var board = [
  ['WR','WN','WB','WQ','WK','WB','WN','WR'],
  ['WP','WP','WP','WP','WP','WP','WP','WP'],
  ['__','__','__','__','__','__','__','__'],
  ['__','__','__','__','__','__','__','__'],
  ['__','__','__','__','__','__','__','__'],
  ['__','__','__','__','__','__','__','__'],
  ['BP','BP','BP','BP','BP','BP','BP','BP'],
  ['BR','BN','BB','BQ','BK','BB','BN','BR'],
];
flippedBoard = [[]];

wTurn = true;
playing = false;
var clients;
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function(socket){
  if (!playing) {
    socket.join('game1');
    clients = Object.keys(socket.adapter.rooms['game1'].sockets);
    console.log("user ", clients.length, " has connected");
  }
  if (clients.length == 2) {
    playing = true;
    wTurn = !wTurn;
    flippedBoard = [];
    for (i = 7; i >= 0; i--) { 
      var arr = [];
      for (j = 7; j >= 0; j--) {
        arr.push(board[i][j]);
      }
      flippedBoard.push(arr);
    }
    io.to(clients[0]).emit('board update', board);
    io.to(clients[1]).emit('board update', flippedBoard);
  }
  socket.on('move', function(move) {
    if (playing) {
      alphabet = ['a','b','c','d','e','f','g','h']
      from = [alphabet.indexOf(move[0]), parseInt(move[1])-1]
      to = [alphabet.indexOf(move[2]), parseInt(move[3])-1]
      var temp = board[from[1]][from[0]]
      board[from[1]][from[0]] = board[to[1]][to[0]]
      board[to[1]][to[0]] = temp;
    }



    wTurn = !wTurn;
    flippedBoard = [];
    for (i = 7; i >= 0; i--) { 
      var arr = [];
      for (j = 7; j >= 0; j--) {
        arr.push(board[i][j]);
      }
      flippedBoard.push(arr);
    }
    io.to(clients[0]).emit('board update', board);
    io.to(clients[1]).emit('board update', flippedBoard);
    // io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});