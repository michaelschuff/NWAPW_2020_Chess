function connectionSuccessful() {
    console.log('Connected to server sucessfully.');
}

function reconnectionSuccessful() {
    console.log('Successfully reconnected.');
}

function connectionFailed() {
    console.log('Failed to connect to server.');
}

function connectionTimeout() {
    console.log('Connection timed out.');
}

function attemptingReconnection() {
    console.log('Reconnecting...');
}

function reconnectionFailed() {
    console.log('Failed to reconnect');
}

function login_success(data) {
    document.cookie = 'username=' + data.username;
    document.cookie = 'sessionID=' + data.sessionID;
    window.location.href = data.redirectPath;
    console.log(document.cookie);
}

function login_failure(data) {
    alert(data);
}

function register_success(data) {
    document.cookie = 'username=' + data.username;
    document.cookie = 'sessionID=' + data.sessionID;
    window.location.href = data.redirectPath;
    console.log(document.cookie);
}

function register_failure(data) {
    alert(data);
}

function redirect(path) {
    window.location.href = path;
}