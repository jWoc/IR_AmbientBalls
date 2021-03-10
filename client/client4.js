var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

var msg2 = "hello";
socket.on('requestID', function(data) {
    console.log(data);
    console.log("Request ID received");
    socket.emit('registerID', {id : "Framework2_Ball4"}, {isBall : true});
});

/*socket.on("go", () => {
    console.log("register changemod trigger")
    setInterval(() => {
        socket.emit('changeMode');
    }, 5000)
})*/
