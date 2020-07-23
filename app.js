var http = require("http");
const express = require('express'); 
const path = require('path');
const app = express();
const io = require('socket.io')(http);
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
const Datastore = require('nedb')

// Running Server Details.
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})
 
const accounts = new Datastore('accounts.db')
accounts.loadDatabase();

app.get('/', function (req, res) {
 res.sendFile("/index.html", {root: path.join(__dirname, 'public')});
});
 
app.post('/registered', urlencodedParser, function (req, res){
  accounts.insert({
      username: req.body.username,
      password: req.body.password
  });
  var reply='';
  reply += "<body>";
  reply += "<p>Your username is ";
  reply += req.body.username;
  reply += "</p><p>Your password is "
  reply += req.body.password;
  reply += "</p>";
  reply += "</body>";
  res.send(reply);
 });

 app.post('/loggedin', urlencodedParser, function (req, res){
  var reply='';
  accounts.count({username: req.body.username, password: req.body.password}, function(err, num) {
    var reply='';
    if (num == 0) { // account doesnt exist, return to login with error message
      reply +="<body>";
      reply += "<p> No account with that username and password </p>";
      reply += "<form action='/loggedin'  method='post' name='login'>";
      reply += "<p> Username: <input type= 'text' name='username'></p>";
      reply += "<p> Password: <input type='text' name='password'></p>";
      reply += "<p> <input type='submit' value='login'> </form>";
      reply += "<form action='/registered'  method='post' name='register'>";
      reply += "<INPUT type='submit' value='register'> </p>";
      reply += "</form>";
      reply += "</body>";
    } else { //continue to home screen
      reply += "<body>";
      reply += "<p>Login successful </p>";
      reply += "</body>";
    }
    res.send(reply);
  });
 });

io.on('connection', (socket) => {
  socket.emit({piece: king, startingx: 2, startingy: 2, endingx: 3, endingy: 3});
});



