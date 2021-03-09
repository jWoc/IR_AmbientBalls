var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

var msg2 = "hello";
socket.on('requestID', function(data) {
    console.log(data);
    console.log("Request ID received");
    socket.emit('registerID', {id : "Framework2_Ball3"}, {isBall : true});
});

// 