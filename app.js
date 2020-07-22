var http = require("http");
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
const Datastore = require('nedb')

// Running Server Details.
var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Listening at %s:%s Port", host, port)
});
 
const accounts = new Datastore('accounts.db')
accounts.loadDatabase();

app.get('/', function (req, res) {
  res.sendFile("index.html");
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

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.get('/', function (req, res) {
  res.sendFile()
})

app.post('/', function (req, res) {
  res.send('Got a POST request')
})

/*http.get('move', function(res){
  console.log(res);
})*/
