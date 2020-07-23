io = require("socket.io-client"),
ioClient = io.connect("http://localhost:8080");

socket.on('connect', function() {console.log('Connected to server sucessfully.');});
socket.on('connect_error', function() {console.log('Failed to connect to server.');});
socket.on('connect_timeout', function() {console.log('Connection timed out.');});
socket.on('reconnect', function() {console.log('Successfully reconnected.');});
socket.on('reconnect_attempt', function() {console.log('Reconnecting...');});
socket.on('reconnect_error', function() {console.log('Failed to reconnect');});