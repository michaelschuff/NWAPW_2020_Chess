var http = require("http");
var express = require('express');
var app = express();
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
  var html='';
  html +="<body>";
  html += "<form action='/loggedin'  method='post' name='login'>";
  html += "<p> Username: <input type= 'text' name='username'></p>";
  html += "<p> Password: <input type='text' name='password'></p>";
  html += "<p> <input type='submit' value='login'> </form>";
  html += "<form action='/registered'  method='post' name='register'>";
  html += "<INPUT type='submit' value='register'> </p>";
  html += "</form>";
  html += "</body>";
  res.send(html);
});
 
app.post('/registered', urlencodedParser, function (req, res){
  accounts.insert({
      username: req.body.username,
      password: req.body.password,
      rating: 400
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

 if (player1win){
    var p1rating;
    var p2rating;
    db.find({username: player1}, function (err, docs) {
      var p1rating = docs[2];
      db.update({username: player1}, {rating: p1rating}, { $inc rating: 10}, { returnUpdatedDocs: true}, function () { //add 10 rating points to player 1
      });
    });
    db.find({username: player2}, function (err, docs) {
      var p2rating = docs[2];
      db.update({username: player2}, {rating: p2rating}, { $inc rating: -10}, { returnUpdatedDocs: true}, function() { //subtract 10 rating points from player 2
      });
    })
  }
  else if (player2win){
    var p1rating;
    var p2rating;
    db.find({username: player1}, function (err, docs) {
      var p1rating = docs[2];
      db.update({username: player1}, {rating: p1rating}, { $inc rating: -10}, { returnUpdatedDocs: true}, function () { //subtract 10 rating points from player 1
      });
    });
    db.find({username: player2}, function (err, docs) {
      var p2rating = docs[2];
      db.update({username: player2}, {rating: p2rating}, { $inc rating: 10}, { returnUpdatedDocs: true}, function() { //add 10 rating points to player 2
      });
    })
  }
  else if (draw){
    var p1rating;
    var p2rating;
    db.find({username: player1}, function (err, docs) {
      var p1rating = docs[2];
      db.update({username: player1}, {rating: p1rating}, { $inc rating: 5}, { returnUpdatedDocs: true}, function () { //add 5 rating points to player 1
      });
    });
    db.find({username: player2}, function (err, docs) {
      var p2rating = docs[2];
      db.update({username: player2}, {rating: p2rating}, { $inc rating: -5}, { returnUpdatedDocs: true}, function() { //add 5 rating points to player 2
      });
    })
  }
