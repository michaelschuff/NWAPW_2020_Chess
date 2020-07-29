//load/setup modules
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

//vars


let wTurn = true;
var clients;

//redirect player to index.html page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

let waitingUser = false;
io.on('connection', function(socket){
  let room;
  if(waitingUser){ //if somebody is waiting to be paired...
    socket.join(waitingUser);
    room = waitingUser;
    waitingUser = false;
  } else {
    waitingUser = socket.id;
    socket.join(socket.id);
    return;
  }
  //create a room with two clients
  let clients = Object.keys(socket.adapter.rooms[room].sockets);
  var board = [ //keep as var, closures are tricky
    ['WR','WN','WB','WQ','WK','WB','WN','WR'],
    ['WP','WP','WP','WP','WP','WP','WP','WP'],
    ['__','__','__','__','__','__','__','__'],
    ['__','__','__','__','__','__','__','__'],
    ['__','__','__','__','__','__','__','__'],
    ['__','__','__','__','__','__','__','__'],
    ['BP','BP','BP','BP','BP','BP','BP','BP'],
    ['BR','BN','BB','BQ','BK','BB','BN','BR'],
  ];
  let flippedBoard = [[]];
  if (clients.length == 2) {
   playing = true; 
    wTurn = !wTurn;
    flippedBoard = [];//create a board that is rotated 180 degrees, so black is on the bottom. will be sent to black player
    for (i = 7; i >= 0; i--) { 
      var arr = [];
      for (j = 7; j >= 0; j--) {
        arr.push(board[i][j]);
      }
      flippedBoard.push(arr);
    }
    //send boards to clients
    io.to(clients[0]).emit('board update', board);
    io.to(clients[1]).emit('board update', flippedBoard);
  }
  socket.on('move', function(move) {
    if (playing) {
      alphabet = ['a','b','c','d','e','f','g','h']//convert game move (e2e4) into two arrays, each with an x,y coord
      from = [alphabet.indexOf(move[0]), parseInt(move[1])-1]
      to = [alphabet.indexOf(move[2]), parseInt(move[3])-1]

      //swap the from square and the to square
      var temp = board[from[1]][from[0]]
      board[from[1]][from[0]] = board[to[1]][to[0]]
      board[to[1]][to[0]] = temp;
    }

    wTurn = !wTurn;
    flippedBoard = [];//create a board that is rotated 180 degrees, so black is on the bottom. will be sent to black player
    for (i = 7; i >= 0; i--) { 
      var arr = [];
      for (j = 7; j >= 0; j--) {
        arr.push(board[i][j]);
      }
      flippedBoard.push(arr);
    }
    //send boards to clients
    io.to(clients[0]).emit('board update', board);
    io.to(clients[1]).emit('board update', flippedBoard);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});