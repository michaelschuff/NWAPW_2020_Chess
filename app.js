var http = require("http");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
 
// Running Server Details.
var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Listening at %s:%s Port", host, port)
});
 
 
app.get('/', function (req, res) {
  var html='';
  html +="<body>";
  html += "<form action='/loggedin'  method='post' name='login'>";
  html += "<p> Username: <input type= 'text' name='name'></p>";
  html += "<p> Password: <input type='text' name='email'></p>";
  html += "<p> <input type='submit' value='submit'>";
  html += "</form>";
  html += "<form action='/registered'  method='post' name='register'>";
  html += "<INPUT type='submit' value='register'> </p>";
  html += "</form>";
  html += "</body>";
  res.send(html);
});
 
app.post('/loggedin', urlencodedParser, function (req, res){
  var reply='';
  reply += "<body>";
  reply += "<p>Your username is ";
  reply += req.body.name;
  reply += "</p><p>Your email is"
  reply += req.body.email;
  reply += "</p>";
  reply += "</body>";
  res.send(reply);
 });