//load/setup modules
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

//vars
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

//redirect player to index.html page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/home.html');
});

io.on('connect', function(socket){
  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});