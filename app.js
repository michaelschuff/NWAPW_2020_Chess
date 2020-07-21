var http = require('http');
var url = require('url');
var fs = require('fs');
var ip = require("ip");

http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var filename = "." + q.pathname;
  fs.readFile(filename, function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    } 
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    
    return res.end();
  });

  console.log(req.method)
  if (req.method == 'POST') {
    var body = ''
    req.on('data', function(data) {
      body += data
    })
    req.on('end', function() {
      console.log('Body: ' + body)
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end('post received')
      console.log('post received')
    })
  }

}).listen(8080);