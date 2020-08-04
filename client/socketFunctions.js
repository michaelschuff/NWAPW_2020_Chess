
/*
    Is called when sockets get connected. Once that happends, get the sessionID if it
    exists and send it to the server. The server will redirect us based on our sessionID
*/
function connection_successful(socket) {
    console.log('Connected to server sucessfully.');
    var row = document.cookie.split(';').find(row => row.startsWith('sessionID='));ie
    const SSID = row ? row.split('=')[1] : 'null';
    socket.emit('validation', {sessionID: SSID});
}

//same as connection successful
function reconnection_successful(socket) {
    console.log('Connected to server sucessfully.');
    var row = document.cookie.split(';').find(row => row.startsWith('sessionID='));
    const SSID = row ? row.split('=')[1] : 'null';
    socket.emit('validation', {sessionID: SSID, socketID: socket.id});
}

function connection_failed() {
    console.log('Failed to connect to server.');
}

function connection_timeout() {
    console.log('Connection timed out.');
}

function attempting_reconnection() {
    console.log('Reconnecting...');
}

function reconnection_failed() {
    console.log('Failed to reconnect');
}

function login_success(data) {
    document.cookie = 'sessionID=' + data.sessionID + '; expires=Fri, 1 Jan 2021 12:00:00 UTC; path=/';
    redirect('/client/home.html');
}

function login_failure(data) {
    alert(data);
}

function register_success(data) {
    document.cookie = 'sessionID=' + data.sessionID + '; expires=Fri, 1 Jan 2021 12:00:00 UTC; path=/';
    redirect('/client/home.html');
}

function register_failure(data) {
    alert(data);
}

function validation_success(data) {
    document.getElementById('currentuser').innerText = data.username;
}

function validation_failed() {
    redirect('/client/loginRegister.html');
}

function redirect(path) {
    window.location.href = path;
}

/*
    delete the session ID cookie if logout is pressed
*/
function logoutPressed() {
    document.cookie = 'sessionID=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    socket.emit('logout', {sessionID: SSID});
}