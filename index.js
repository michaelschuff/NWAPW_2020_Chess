//load/setup modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.use(express.static(__dirname));//let client use files

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');//redirect to index.html
});

io.on('connection', function(socket){//when communication is established
  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});