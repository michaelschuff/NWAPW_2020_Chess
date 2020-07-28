//load/setup modules
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

//redirect player to index.html page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function(socket){
  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});